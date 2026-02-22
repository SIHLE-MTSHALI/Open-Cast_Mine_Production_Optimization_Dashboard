"""
Haulage Modeling & Optimization — Issue #38

Cycle time estimation, fleet sizing, and cost calculation:
 - Route definition with distance, grade, and surface condition
 - Cycle time = load + haul + dump + return (considers speed on grade)
 - Fleet sizing from cycle time and required throughput
 - Fuel consumption estimation
 - Cost-per-tonne calculation
"""

import logging
from typing import List, Dict, Optional
from dataclasses import dataclass
import math
import uuid
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Session
from datetime import datetime

from ..database import Base

logger = logging.getLogger(__name__)


class HaulRoute(Base):
    """A defined haulage route between two points."""
    __tablename__ = "haul_routes"

    route_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id = Column(String, ForeignKey("sites.site_id"), nullable=False)
    name = Column(String, nullable=False)
    from_node_id = Column(String, nullable=True)  # pit, stockpile, etc
    to_node_id = Column(String, nullable=True)
    distance_km = Column(Float, default=1.0)
    avg_grade_pct = Column(Float, default=0)  # positive = uphill loaded
    return_grade_pct = Column(Float, default=0)
    surface_condition = Column(String, default="good")  # good, fair, poor
    speed_loaded_kph = Column(Float, default=25)
    speed_empty_kph = Column(Float, default=40)
    load_time_min = Column(Float, default=5)
    dump_time_min = Column(Float, default=3)
    spot_time_min = Column(Float, default=2)
    queue_time_min = Column(Float, default=1)
    segments = Column(JSON, nullable=True)  # [{distance, grade, speed_limit}]
    created_at = Column(DateTime, default=datetime.utcnow)


@dataclass
class CycleTimeResult:
    """Result of cycle time calculation."""
    haul_time_min: float
    return_time_min: float
    loading_time_min: float
    dumping_time_min: float
    total_cycle_min: float
    trips_per_shift: int
    payload_tonnes: float
    tonnes_per_shift: float


@dataclass
class FleetSizeResult:
    """Result of fleet sizing calculation."""
    required_trucks: int
    effective_trucks: float
    trucks_hauling: float
    trucks_loading: float
    utilisation_pct: float
    cycle_time_min: float
    tonnes_per_shift: float
    cost_per_tonne: float
    fuel_litres_per_shift: float


class HaulageOptimizer:
    """Haulage cycle time, fleet sizing, and cost optimization."""

    # Typical truck specs (CAT 789D class)
    DEFAULT_PAYLOAD = 177  # tonnes
    DEFAULT_FUEL_RATE = 160  # litres/hour
    DEFAULT_COST_PER_HOUR = 850  # R/hour (fuel + maintenance + operator)

    def __init__(self, db: Session):
        self.db = db

    def calculate_cycle_time(
        self,
        route: HaulRoute,
        payload_tonnes: float = None,
    ) -> CycleTimeResult:
        """Calculate cycle time for a given route."""
        payload = payload_tonnes or self.DEFAULT_PAYLOAD
        distance = route.distance_km or 1.0

        # Haul time (loaded, typically uphill)
        loaded_speed = self._adjust_speed_for_grade(
            route.speed_loaded_kph or 25,
            route.avg_grade_pct or 0,
            loaded=True
        )
        haul_min = (distance / max(loaded_speed, 5)) * 60

        # Return time (empty, typically downhill)
        empty_speed = self._adjust_speed_for_grade(
            route.speed_empty_kph or 40,
            route.return_grade_pct or 0,
            loaded=False
        )
        return_min = (distance / max(empty_speed, 10)) * 60

        # Fixed times
        load_min = route.load_time_min or 5
        dump_min = route.dump_time_min or 3
        spot_min = route.spot_time_min or 2
        queue_min = route.queue_time_min or 1

        total = haul_min + return_min + load_min + dump_min + spot_min + queue_min

        # Shifts typically 12 hours, ~10.5 productive hours
        productive_hours = 10.5
        trips_per_shift = max(1, int((productive_hours * 60) / total))
        tonnes_per_shift = trips_per_shift * payload

        return CycleTimeResult(
            haul_time_min=round(haul_min, 1),
            return_time_min=round(return_min, 1),
            loading_time_min=load_min,
            dumping_time_min=dump_min,
            total_cycle_min=round(total, 1),
            trips_per_shift=trips_per_shift,
            payload_tonnes=payload,
            tonnes_per_shift=round(tonnes_per_shift, 0),
        )

    def calculate_fleet_size(
        self,
        route: HaulRoute,
        required_tonnes_per_shift: float,
        payload_tonnes: float = None,
        availability: float = 0.85,
    ) -> FleetSizeResult:
        """Calculate required fleet size for a target throughput."""
        cycle = self.calculate_cycle_time(route, payload_tonnes)
        payload = cycle.payload_tonnes

        if cycle.tonnes_per_shift <= 0:
            return FleetSizeResult(
                required_trucks=0, effective_trucks=0, trucks_hauling=0,
                trucks_loading=0, utilisation_pct=0, cycle_time_min=cycle.total_cycle_min,
                tonnes_per_shift=0, cost_per_tonne=0, fuel_litres_per_shift=0,
            )

        effective_trucks = required_tonnes_per_shift / cycle.tonnes_per_shift
        required_trucks = math.ceil(effective_trucks / availability)

        trucks_hauling = effective_trucks * (cycle.haul_time_min + cycle.return_time_min) / cycle.total_cycle_min
        trucks_loading = effective_trucks * cycle.loading_time_min / cycle.total_cycle_min

        # Cost calculation
        shift_hours = 12
        fuel_per_shift = self.DEFAULT_FUEL_RATE * shift_hours * required_trucks
        cost_per_shift = self.DEFAULT_COST_PER_HOUR * shift_hours * required_trucks
        cost_per_tonne = cost_per_shift / required_tonnes_per_shift if required_tonnes_per_shift > 0 else 0

        return FleetSizeResult(
            required_trucks=required_trucks,
            effective_trucks=round(effective_trucks, 1),
            trucks_hauling=round(trucks_hauling, 1),
            trucks_loading=round(trucks_loading, 1),
            utilisation_pct=round((effective_trucks / required_trucks) * 100, 1) if required_trucks > 0 else 0,
            cycle_time_min=cycle.total_cycle_min,
            tonnes_per_shift=required_tonnes_per_shift,
            cost_per_tonne=round(cost_per_tonne, 2),
            fuel_litres_per_shift=round(fuel_per_shift, 0),
        )

    def _adjust_speed_for_grade(self, base_speed: float, grade_pct: float, loaded: bool) -> float:
        """Adjust speed for road grade. Uphill reduces speed, downhill is capped."""
        if grade_pct >= 0:
            # Uphill: speed decreases with grade
            reduction = grade_pct * (3.0 if loaded else 1.5)  # km/h per % grade
            return max(base_speed - reduction, 5)
        else:
            # Downhill: speed increases but capped for safety
            return min(base_speed * 1.1, base_speed + 10)

    def get_routes_for_site(self, site_id: str) -> List[HaulRoute]:
        """Get all haul routes for a site."""
        return self.db.query(HaulRoute).filter(HaulRoute.site_id == site_id).all()


def create_haulage_optimizer(db: Session) -> HaulageOptimizer:
    """Factory function."""
    return HaulageOptimizer(db)
