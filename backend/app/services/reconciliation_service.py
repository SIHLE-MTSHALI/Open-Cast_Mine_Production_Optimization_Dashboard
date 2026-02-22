"""
Planned vs Actual Reconciliation — Issue #25

Domain models and service for reconciliation:
 - Actuals import (tonnes, quality, equipment hours)
 - Variance calculation at shift/day/week level
 - Root cause categorization
 - Reconciliation factor trending
"""

import uuid
import logging
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Session

from ..database import Base

logger = logging.getLogger(__name__)


# ── Domain Models ────────────────────────────────────────────────────

class ActualProduction(Base):
    """Imported actual production data."""
    __tablename__ = "actual_production"

    actual_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id = Column(String, ForeignKey("sites.site_id"), nullable=False)
    period_id = Column(String, nullable=False)
    resource_id = Column(String, nullable=True)
    resource_name = Column(String, nullable=True)
    activity_area_id = Column(String, nullable=True)
    actual_tonnes = Column(Float, default=0)
    actual_hours = Column(Float, default=0)
    actual_quality = Column(JSON, nullable=True)  # {Ash: 12.5, CV: 28.1, ...}
    delay_hours = Column(Float, default=0)
    delay_reason = Column(String, nullable=True)  # weather, breakdown, geological, planning
    notes = Column(String, nullable=True)
    imported_at = Column(DateTime, default=datetime.utcnow)


class ReconciliationRecord(Base):
    """Planned vs actual comparison per period per resource."""
    __tablename__ = "reconciliation_records"

    recon_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id = Column(String, ForeignKey("sites.site_id"), nullable=False)
    schedule_version_id = Column(String, nullable=False)
    period_id = Column(String, nullable=False)
    resource_id = Column(String, nullable=True)
    
    planned_tonnes = Column(Float, default=0)
    actual_tonnes = Column(Float, default=0)
    variance_tonnes = Column(Float, default=0)  # actual - planned
    variance_pct = Column(Float, default=0)
    
    planned_quality = Column(JSON, nullable=True)
    actual_quality = Column(JSON, nullable=True)
    quality_variance = Column(JSON, nullable=True)  # {field: variance}
    
    planned_hours = Column(Float, default=0)
    actual_hours = Column(Float, default=0)
    utilisation_pct = Column(Float, default=0)
    
    recon_factor = Column(Float, default=1.0)  # actual/planned ratio
    root_cause = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ── Service ──────────────────────────────────────────────────────────

@dataclass
class ReconSummary:
    """Aggregated reconciliation summary."""
    total_planned_tonnes: float
    total_actual_tonnes: float
    overall_recon_factor: float
    tonnage_variance_pct: float
    periods_over_plan: int
    periods_under_plan: int
    avg_utilisation: float
    quality_compliance: Dict[str, float]
    root_cause_breakdown: Dict[str, int]
    trending: List[Dict]  # [{period, recon_factor, variance_pct}]


class ReconciliationService:
    """Service for computing and storing reconciliation data."""

    def __init__(self, db: Session):
        self.db = db

    def compute_reconciliation(
        self,
        site_id: str,
        schedule_version_id: str,
        planned_data: List[Dict],
        actuals: List[ActualProduction],
    ) -> List[ReconciliationRecord]:
        """
        Compute reconciliation records from planned vs actual data.

        Args:
            site_id: Site identifier
            schedule_version_id: The planned schedule version
            planned_data: List of planned task dicts
            actuals: List of actual production records
        """
        # Index actuals by (period, resource)
        actual_map = {}
        for a in actuals:
            key = (a.period_id, a.resource_id or 'all')
            if key not in actual_map:
                actual_map[key] = {
                    'tonnes': 0, 'hours': 0, 'quality': {},
                    'delay_hours': 0, 'delay_reasons': [],
                }
            actual_map[key]['tonnes'] += a.actual_tonnes or 0
            actual_map[key]['hours'] += a.actual_hours or 0
            if a.delay_reason:
                actual_map[key]['delay_reasons'].append(a.delay_reason)
            if a.actual_quality:
                for field, val in a.actual_quality.items():
                    if field not in actual_map[key]['quality']:
                        actual_map[key]['quality'][field] = []
                    actual_map[key]['quality'][field].append(val)

        # Index planned by (period, resource)
        planned_map = {}
        for p in planned_data:
            key = (p.get('period_id', ''), p.get('resource_id', 'all'))
            if key not in planned_map:
                planned_map[key] = {'tonnes': 0, 'hours': 0, 'quality': {}}
            planned_map[key]['tonnes'] += p.get('planned_quantity', 0) or p.get('tonnes', 0)
            planned_map[key]['hours'] += p.get('duration_hours', 0) or 0

        # Compute records
        records = []
        all_keys = set(list(planned_map.keys()) + list(actual_map.keys()))
        for key in all_keys:
            period_id, resource_id = key
            p = planned_map.get(key, {'tonnes': 0, 'hours': 0, 'quality': {}})
            a = actual_map.get(key, {'tonnes': 0, 'hours': 0, 'quality': {}, 'delay_reasons': []})

            variance = a['tonnes'] - p['tonnes']
            variance_pct = (variance / p['tonnes'] * 100) if p['tonnes'] > 0 else 0
            recon_factor = a['tonnes'] / p['tonnes'] if p['tonnes'] > 0 else 0

            # Average actual quality
            avg_quality = {}
            for field, vals in a.get('quality', {}).items():
                avg_quality[field] = sum(vals) / len(vals) if vals else 0

            # Dominant root cause
            reasons = a.get('delay_reasons', [])
            root_cause = max(set(reasons), key=reasons.count) if reasons else None

            record = ReconciliationRecord(
                site_id=site_id,
                schedule_version_id=schedule_version_id,
                period_id=period_id,
                resource_id=resource_id if resource_id != 'all' else None,
                planned_tonnes=p['tonnes'],
                actual_tonnes=a['tonnes'],
                variance_tonnes=variance,
                variance_pct=variance_pct,
                actual_quality=avg_quality or None,
                planned_hours=p['hours'],
                actual_hours=a['hours'],
                utilisation_pct=(a['hours'] / p['hours'] * 100) if p['hours'] > 0 else 0,
                recon_factor=recon_factor,
                root_cause=root_cause,
            )
            records.append(record)

        return records

    def get_summary(self, site_id: str, schedule_version_id: str) -> ReconSummary:
        """Get aggregated reconciliation summary."""
        records = self.db.query(ReconciliationRecord).filter(
            ReconciliationRecord.site_id == site_id,
            ReconciliationRecord.schedule_version_id == schedule_version_id,
        ).all()

        if not records:
            return ReconSummary(
                total_planned_tonnes=0, total_actual_tonnes=0,
                overall_recon_factor=0, tonnage_variance_pct=0,
                periods_over_plan=0, periods_under_plan=0,
                avg_utilisation=0, quality_compliance={},
                root_cause_breakdown={}, trending=[],
            )

        total_planned = sum(r.planned_tonnes for r in records)
        total_actual = sum(r.actual_tonnes for r in records)
        overall_rf = total_actual / total_planned if total_planned > 0 else 0

        root_causes = {}
        for r in records:
            if r.root_cause:
                root_causes[r.root_cause] = root_causes.get(r.root_cause, 0) + 1

        trending = sorted([
            {
                'period': r.period_id,
                'recon_factor': r.recon_factor,
                'variance_pct': r.variance_pct,
            }
            for r in records
        ], key=lambda x: x['period'])

        return ReconSummary(
            total_planned_tonnes=total_planned,
            total_actual_tonnes=total_actual,
            overall_recon_factor=overall_rf,
            tonnage_variance_pct=((total_actual - total_planned) / total_planned * 100) if total_planned > 0 else 0,
            periods_over_plan=sum(1 for r in records if r.variance_tonnes > 0),
            periods_under_plan=sum(1 for r in records if r.variance_tonnes < 0),
            avg_utilisation=sum(r.utilisation_pct for r in records) / len(records) if records else 0,
            quality_compliance={},
            root_cause_breakdown=root_causes,
            trending=trending,
        )


def create_reconciliation_service(db: Session) -> ReconciliationService:
    """Factory function."""
    return ReconciliationService(db)
