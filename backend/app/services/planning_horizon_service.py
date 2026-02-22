"""
Planning Horizon Service — Phase 2 Issue #14

Manages multi-horizon planning: creation, period generation, target
propagation between parent/child horizons, and variance calculation.
"""

from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import uuid
import logging

from ..domain.models_planning_horizon import PlanningHorizon, HorizonTarget
from ..domain.models_calendar import Calendar, Period

logger = logging.getLogger(__name__)

# ─── Granularity helpers ────────────────────────────────────────────────────

GRANULARITY_ORDER = ["shift", "day", "week", "month", "quarter", "year"]

_GRANULARITY_HOURS = {
    "shift": 12,
    "day": 24,
    "week": 168,
    "month": 730,       # average
    "quarter": 2190,
    "year": 8760,
}

_GRANULARITY_DELTA = {
    "shift": timedelta(hours=12),
    "day": timedelta(days=1),
    "week": timedelta(weeks=1),
    "month": timedelta(days=30),      # approximate
    "quarter": timedelta(days=91),
    "year": timedelta(days=365),
}


class PlanningHorizonService:
    """Business logic for multi-horizon planning."""

    def __init__(self, db: Session):
        self.db = db

    # ── CRUD ────────────────────────────────────────────────────────────────

    def create_horizon(
        self,
        site_id: str,
        name: str,
        granularity: str,
        start_date: datetime,
        end_date: datetime,
        parent_horizon_id: Optional[str] = None,
        calendar_id: Optional[str] = None,
        description: Optional[str] = None,
        auto_generate_periods: bool = True,
    ) -> PlanningHorizon:
        """Create a planning horizon and optionally generate its periods."""

        if granularity not in GRANULARITY_ORDER:
            raise ValueError(
                f"Invalid granularity '{granularity}'. "
                f"Must be one of {GRANULARITY_ORDER}"
            )

        horizon = PlanningHorizon(
            site_id=site_id,
            name=name,
            granularity=granularity,
            start_date=start_date,
            end_date=end_date,
            parent_horizon_id=parent_horizon_id,
            calendar_id=calendar_id,
            description=description,
            status="Draft",
        )
        self.db.add(horizon)
        self.db.flush()  # get horizon_id

        if auto_generate_periods:
            self.generate_target_periods(horizon)

        self.db.commit()
        return horizon

    def get_horizon(self, horizon_id: str) -> Optional[PlanningHorizon]:
        return (
            self.db.query(PlanningHorizon)
            .filter(PlanningHorizon.horizon_id == horizon_id)
            .first()
        )

    def list_horizons(self, site_id: str) -> List[PlanningHorizon]:
        return (
            self.db.query(PlanningHorizon)
            .filter(PlanningHorizon.site_id == site_id)
            .order_by(PlanningHorizon.start_date)
            .all()
        )

    def delete_horizon(self, horizon_id: str) -> bool:
        h = self.get_horizon(horizon_id)
        if not h:
            return False
        self.db.delete(h)
        self.db.commit()
        return True

    # ── Period / target generation ──────────────────────────────────────────

    def generate_target_periods(self, horizon: PlanningHorizon) -> List[HorizonTarget]:
        """
        Auto-generate HorizonTarget rows for every period bucket
        within the horizon's date range at its granularity.
        """
        delta = _GRANULARITY_DELTA.get(horizon.granularity, timedelta(days=30))
        targets: List[HorizonTarget] = []
        cursor = horizon.start_date
        seq = 1

        while cursor < horizon.end_date:
            period_end = min(cursor + delta, horizon.end_date)
            label = self._make_period_label(cursor, horizon.granularity)

            target = HorizonTarget(
                horizon_id=horizon.horizon_id,
                period_label=label,
                sequence=seq,
            )
            self.db.add(target)
            targets.append(target)

            cursor = period_end
            seq += 1

        return targets

    # ── Target propagation ──────────────────────────────────────────────────

    def propagate_targets(self, parent_horizon_id: str) -> Dict[str, Any]:
        """
        Split parent-horizon targets evenly into child-horizon periods.

        Returns summary dict with counts.
        """
        parent = self.get_horizon(parent_horizon_id)
        if not parent:
            raise ValueError("Parent horizon not found")

        children = (
            self.db.query(PlanningHorizon)
            .filter(PlanningHorizon.parent_horizon_id == parent_horizon_id)
            .all()
        )
        if not children:
            raise ValueError("No child horizons linked to this parent")

        parent_targets = (
            self.db.query(HorizonTarget)
            .filter(HorizonTarget.horizon_id == parent_horizon_id)
            .order_by(HorizonTarget.sequence)
            .all()
        )

        updated = 0
        for child in children:
            child_targets = (
                self.db.query(HorizonTarget)
                .filter(HorizonTarget.horizon_id == child.horizon_id)
                .order_by(HorizonTarget.sequence)
                .all()
            )
            if not child_targets:
                continue

            # Simple even split of parent totals across child periods
            n_child = len(child_targets)
            for pt in parent_targets:
                for ct in child_targets:
                    if pt.target_total_tonnes is not None:
                        ct.target_total_tonnes = (
                            pt.target_total_tonnes / n_child
                        )
                    if pt.target_ore_tonnes is not None:
                        ct.target_ore_tonnes = pt.target_ore_tonnes / n_child
                    if pt.target_waste_tonnes is not None:
                        ct.target_waste_tonnes = pt.target_waste_tonnes / n_child
                    if pt.target_stripping_ratio is not None:
                        ct.target_stripping_ratio = pt.target_stripping_ratio
                    if pt.quality_targets is not None:
                        ct.quality_targets = pt.quality_targets
                    updated += 1

        self.db.commit()
        return {"parent_horizon_id": parent_horizon_id, "children": len(children), "targets_updated": updated}

    # ── Variance calculation ────────────────────────────────────────────────

    def calculate_variance(self, horizon_id: str) -> List[Dict[str, Any]]:
        """
        Calculate planned-vs-actual variance for every target in a horizon.
        """
        targets = (
            self.db.query(HorizonTarget)
            .filter(HorizonTarget.horizon_id == horizon_id)
            .order_by(HorizonTarget.sequence)
            .all()
        )
        results = []
        for t in targets:
            row: Dict[str, Any] = {
                "target_id": t.target_id,
                "period_label": t.period_label,
                "sequence": t.sequence,
            }

            # Tonnage variance
            if t.target_total_tonnes is not None and t.actual_total_tonnes is not None:
                row["total_tonnes_variance"] = round(
                    t.actual_total_tonnes - t.target_total_tonnes, 2
                )
                row["total_tonnes_variance_pct"] = (
                    round(
                        (t.actual_total_tonnes - t.target_total_tonnes)
                        / t.target_total_tonnes
                        * 100,
                        1,
                    )
                    if t.target_total_tonnes != 0
                    else None
                )
            else:
                row["total_tonnes_variance"] = None
                row["total_tonnes_variance_pct"] = None

            # Stripping ratio variance
            if (
                t.target_stripping_ratio is not None
                and t.actual_stripping_ratio is not None
            ):
                row["stripping_ratio_variance"] = round(
                    t.actual_stripping_ratio - t.target_stripping_ratio, 2
                )
            else:
                row["stripping_ratio_variance"] = None

            results.append(row)

        return results

    # ── Helpers ──────────────────────────────────────────────────────────────

    @staticmethod
    def _make_period_label(dt: datetime, granularity: str) -> str:
        if granularity == "shift":
            shift = "Day" if dt.hour < 12 else "Night"
            return f"{dt.strftime('%Y-%m-%d')} {shift}"
        elif granularity == "day":
            return dt.strftime("%Y-%m-%d")
        elif granularity == "week":
            return f"{dt.isocalendar()[0]}-W{dt.isocalendar()[1]:02d}"
        elif granularity == "month":
            return dt.strftime("%Y-%m")
        elif granularity == "quarter":
            q = (dt.month - 1) // 3 + 1
            return f"{dt.year}-Q{q}"
        elif granularity == "year":
            return str(dt.year)
        return dt.isoformat()


# Factory
def get_planning_horizon_service(db: Session) -> PlanningHorizonService:
    return PlanningHorizonService(db)
