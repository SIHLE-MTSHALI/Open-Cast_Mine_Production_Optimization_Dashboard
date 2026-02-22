"""
Precedence Rule Entities — Phase 2 Issue #17

Enforces physical sequencing constraints in mine planning:
  - Activity sequence: drill → blast → mine
  - Bench sequence: slice N before slice N+1
  - Custom user-defined precedence links
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from ..database import Base
import uuid
from datetime import datetime


class PrecedenceRule(Base):
    """
    A directed constraint: predecessor must complete before successor starts.

    rule_type values:
        activity_sequence — e.g. drill → blast → mine (global)
        bench_sequence    — sequential bench stripping
        custom            — user-defined link between specific areas
    """
    __tablename__ = "precedence_rules"

    rule_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id = Column(String, ForeignKey("sites.site_id"), nullable=False)

    # Rule classification
    rule_type = Column(String, nullable=False, default="activity_sequence")
    name = Column(String, nullable=True)
    description = Column(String, nullable=True)

    # Predecessor activity / area
    predecessor_activity_id = Column(
        String, ForeignKey("activities.activity_id"), nullable=True
    )
    predecessor_area_id = Column(
        String, ForeignKey("activity_areas.area_id"), nullable=True
    )

    # Successor activity / area
    successor_activity_id = Column(
        String, ForeignKey("activities.activity_id"), nullable=True
    )
    successor_area_id = Column(
        String, ForeignKey("activity_areas.area_id"), nullable=True
    )

    # Timing lag (number of periods successor must wait after predecessor)
    lag_periods = Column(Integer, default=0)

    # Percentage of predecessor that must be complete (0-100)
    min_completion_pct = Column(Float, default=100.0)

    # Active flag
    is_active = Column(Boolean, default=True)

    # Audit
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String, nullable=True)

    # Relationships
    site = relationship("Site")

    def __repr__(self):
        return f"<PrecedenceRule {self.rule_type}: {self.name}>"


class PrecedenceTemplate(Base):
    """
    Pre-built precedence template that can be applied to a site.

    template_rules is a JSON list, e.g.:
    [
        {"predecessor_activity": "Drilling", "successor_activity": "Blasting", "lag": 0},
        {"predecessor_activity": "Blasting", "successor_activity": "Mining", "lag": 1}
    ]
    """
    __tablename__ = "precedence_templates"

    template_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    template_rules = Column(JSON, nullable=False, default=list)

    # Built-in templates are not editable
    is_builtin = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<PrecedenceTemplate {self.name}>"
