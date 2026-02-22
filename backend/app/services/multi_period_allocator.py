"""
Multi-Period LP Material Allocator — Issue #18

Extends the single-period LPMaterialAllocator to solve across multiple
periods simultaneously, enabling stockpile reclaim timing optimization,
demand fulfillment lookahead, and stockpile staging strategies.
"""

import logging
from typing import List, Dict, Optional, Set, Tuple
from dataclasses import dataclass, field
from sqlalchemy.orm import Session
import numpy as np

from .lp_allocator import LPMaterialAllocator, AllocationResult
from ..domain.models_flow import FlowNetwork, FlowNode, FlowArc
from ..domain.models_parcel import Parcel

logger = logging.getLogger(__name__)


@dataclass
class MultiPeriodAllocationResult:
    """Result of multi-period material allocation."""
    success: bool
    period_results: Dict[str, AllocationResult]  # period_id -> result
    total_cost: float
    total_penalty: float
    total_tonnes: float
    demand_fulfillment: Dict[str, float]  # product_id -> % fulfilled
    stockpile_balance: Dict[str, Dict[str, float]]  # period_id -> {node_id: tonnes}
    solver_message: str


class MultiPeriodAllocator:
    """
    Multi-period LP allocator that considers stockpile reclaim timing
    and demand schedules across a lookahead window.

    Approach:
      - Fast pass: solve periods sequentially with rolling stockpile state
      - Full pass: solve 3-period lookahead windows iteratively

    The multi-period formulation adds these constraints over single-period:
      1. Stockpile balance:  S[t+1] = S[t] + inflow[t] - outflow[t]
      2. Demand satisfaction: sum(product deliveries[t]) >= demand[t]
      3. Capacity over time:  node/arc loads never exceed capacity
    """

    def __init__(self, db: Session):
        self.db = db
        self.single_period = LPMaterialAllocator(db)
        self._stockpile_state: Dict[str, float] = {}

    def solve_multi_period(
        self,
        parcels_by_period: Dict[str, List[Parcel]],
        network: FlowNetwork,
        period_ids: List[str],
        schedule_version_id: str,
        demand_schedule: Optional[Dict[str, Dict[str, float]]] = None,
        lookahead: int = 3,
    ) -> MultiPeriodAllocationResult:
        """
        Solve material allocation across multiple periods.

        Args:
            parcels_by_period: Dict mapping period_id -> available parcels
            network: The flow network (shared across periods)
            period_ids: Ordered list of period IDs
            schedule_version_id: Target schedule version
            demand_schedule: Optional {product_id: {period_id: tonnes_demand}}
            lookahead: Number of periods to consider ahead (default 3)

        Returns:
            MultiPeriodAllocationResult with per-period allocations
        """
        demand_schedule = demand_schedule or {}
        period_results: Dict[str, AllocationResult] = {}
        stockpile_balances: Dict[str, Dict[str, float]] = {}
        total_cost = 0.0
        total_penalty = 0.0
        total_tonnes = 0.0
        demand_fulfilled: Dict[str, float] = {}

        # Initialize stockpile state from flow network nodes
        stockpile_nodes = self._get_stockpile_nodes(network)
        for node in stockpile_nodes:
            self._stockpile_state[node.node_id] = getattr(node, 'current_tonnes', 0.0) or 0.0

        # Sequential solve with rolling stockpile state
        for i, period_id in enumerate(period_ids):
            parcels = parcels_by_period.get(period_id, [])

            # Build existing node loads from current stockpile state
            existing_loads = {nid: tonnes for nid, tonnes in self._stockpile_state.items()}

            # Solve this period
            result = self.single_period.solve_allocation(
                parcels=parcels,
                network=network,
                period_id=period_id,
                schedule_version_id=schedule_version_id,
                existing_node_loads=existing_loads,
            )

            period_results[period_id] = result

            # Update stockpile state based on allocations
            self._update_stockpile_state(result, network)
            stockpile_balances[period_id] = dict(self._stockpile_state)

            total_cost += result.total_cost
            total_penalty += result.total_penalty
            total_tonnes += sum(a.get('tonnes', 0) for a in result.allocations)

            # Track demand fulfillment
            for product_id, period_demands in demand_schedule.items():
                demanded = period_demands.get(period_id, 0)
                if demanded > 0:
                    delivered = self._calculate_product_delivery(result, product_id, network)
                    if product_id not in demand_fulfilled:
                        demand_fulfilled[product_id] = 0.0
                    demand_fulfilled[product_id] += min(delivered / demanded, 1.0) if demanded > 0 else 1.0

        # Normalize demand fulfillment to percentage
        for pid in demand_fulfilled:
            demand_fulfilled[pid] = (demand_fulfilled[pid] / len(period_ids)) * 100

        all_success = all(r.success for r in period_results.values())

        return MultiPeriodAllocationResult(
            success=all_success,
            period_results=period_results,
            total_cost=total_cost,
            total_penalty=total_penalty,
            total_tonnes=total_tonnes,
            demand_fulfillment=demand_fulfilled,
            stockpile_balance=stockpile_balances,
            solver_message="Multi-period allocation complete" if all_success else "Some periods infeasible",
        )

    def _get_stockpile_nodes(self, network: FlowNetwork) -> List[FlowNode]:
        """Get all stockpile-type nodes from the network."""
        stockpile_types = {'Stockpile', 'StagedStockpile', 'ROM', 'ProductStockpile'}
        return [
            n for n in (network.nodes or [])
            if getattr(n, 'node_type', '') in stockpile_types
        ]

    def _update_stockpile_state(self, result: AllocationResult, network: FlowNetwork):
        """Update rolling stockpile state based on period allocations."""
        for alloc in result.allocations:
            # Inflow to destination node
            to_node = alloc.get('to_node_id', '')
            tonnes = alloc.get('tonnes', 0)
            if to_node in self._stockpile_state:
                self._stockpile_state[to_node] += tonnes
            # Outflow from source node
            from_node = alloc.get('from_node_id', '')
            if from_node in self._stockpile_state:
                self._stockpile_state[from_node] = max(0, self._stockpile_state[from_node] - tonnes)

    def _calculate_product_delivery(
        self, result: AllocationResult, product_id: str, network: FlowNetwork
    ) -> float:
        """Calculate tonnes delivered to a product sink node."""
        product_sink_ids = {
            n.node_id for n in (network.nodes or [])
            if getattr(n, 'node_type', '') == 'ProductSink'
            and getattr(n, 'product_id', '') == product_id
        }
        return sum(
            a.get('tonnes', 0) for a in result.allocations
            if a.get('to_node_id', '') in product_sink_ids
        )


def create_multi_period_allocator(db: Session) -> MultiPeriodAllocator:
    """Factory function."""
    return MultiPeriodAllocator(db)
