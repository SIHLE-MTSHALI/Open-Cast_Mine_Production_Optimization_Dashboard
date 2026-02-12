"""
Planning Horizon Entities — Phase 2 Issue #14

Supports multi-horizon planning with configurable granularity:
  - Annual  → quarterly → monthly → weekly → shift
  - Parent-child horizon hierarchy for target propagation
  - Targets per horizon-period for tonnes, quality, stripping ratio
"""

from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from ..database import Base
import uuid
from datetime import datetime


class PlanningHorizon(Base):
    """
    A named planning horizon with a specific time granularity.

    Examples:
        - "Annual Plan 2026" (granularity=year)
        - "Q1 2026 Short-Range Plan" (granularity=week)
        - "January Shift Plan" (granularity=shift)

    Horizons may be linked in a parent-child hierarchy so that
    long-range annual targets can be drilled down into monthly or
    shift-level plans.
    """
    __tablename__ = "planning_horizons"

    horizon_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id = Column(String, ForeignKey("sites.site_id"), nullable=False)

    name = Column(String, nullable=False)
    description = Column(String, nullable=True)

    # Granularity: shift | day | week | month | quarter | year
    granularity = Column(String, nullable=False, default="month")

    # Time range this horizon covers
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)

    # Hierarchy — optional parent for target propagation
    parent_horizon_id = Column(
        String, ForeignKey("planning_horizons.horizon_id"), nullable=True
    )

    # Status: Draft | Active | Closed
    status = Column(String, default="Draft")

    # Reference to the calendar whose periods are used
    calendar_id = Column(String, ForeignKey("calendars.calendar_id"), nullable=True)

    # Audit
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)
    created_by = Column(String, nullable=True)

    # Relationships
    site = relationship("Site")
    parent_horizon = relationship("PlanningHorizon", remote_side=[horizon_id])
    targets = relationship(
        "HorizonTarget",
        back_populates="horizon",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<PlanningHorizon {self.name} [{self.granularity}]>"


class HorizonTarget(Base):
    """
    Production/quality targets for a single period within a horizon.

    Stores the planned tonnes, quality bounds, and stripping ratio
    targets that guide the scheduling engine.
    """
    __tablename__ = "horizon_targets"

    target_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    horizon_id = Column(
        String,
        ForeignKey("planning_horizons.horizon_id"),
        nullable=False,
    )

    # Which period this target applies to
    period_id = Column(String, ForeignKey("periods.period_id"), nullable=True)

    # For convenience when period doesn't exist yet — label like "2026-Q1"
    period_label = Column(String, nullable=True)

    # Sequence within the horizon
    sequence = Column(Integer, nullable=True)

    # Tonnage targets
    target_total_tonnes = Column(Float, nullable=True)
    target_ore_tonnes = Column(Float, nullable=True)
    target_waste_tonnes = Column(Float, nullable=True)

    # Stripping ratio target
    target_stripping_ratio = Column(Float, nullable=True)

    # Quality targets (JSON dict of field → {min, max, target})
    # e.g. {"cv": {"min": 20, "max": 25, "target": 22.5},
    #        "ash": {"min": 8, "max": 14, "target": 11}}
    quality_targets = Column(JSON, nullable=True)

    # Actual values (filled after schedule runs or actuals import)
    actual_total_tonnes = Column(Float, nullable=True)
    actual_ore_tonnes = Column(Float, nullable=True)
    actual_waste_tonnes = Column(Float, nullable=True)
    actual_stripping_ratio = Column(Float, nullable=True)
    actual_quality = Column(JSON, nullable=True)

    # Audit
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)

    # Relationships
    horizon = relationship("PlanningHorizon", back_populates="targets")

    def __repr__(self):
        return f"<HorizonTarget {self.period_label or self.period_id}>"
