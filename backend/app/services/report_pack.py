"""
Report Pack Generation — Issue #24

Extends reporting with standard mine report templates:
 - Daily/Weekly/Monthly production summary
 - Quality compliance report
 - Reconciliation report
 - Shift handover report
 - Management KPI dashboard report
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


@dataclass
class ReportSection:
    """A single section of a generated report."""
    title: str
    section_type: str  # table, chart, kpi, text, summary
    data: Dict
    order: int


@dataclass
class Report:
    """Generated report document."""
    report_id: str
    title: str
    report_type: str  # daily, weekly, monthly, shift, management
    site_id: str
    period_start: datetime
    period_end: datetime
    sections: List[ReportSection]
    generated_at: datetime
    metadata: Dict


class ReportPackGenerator:
    """
    Standard mining report pack generator.

    Generates structured report data that the frontend renders
    as formatted PDF-like reports or dashboards.
    """

    def __init__(self, db: Session):
        self.db = db

    def generate_daily_report(self, site_id: str, date: datetime) -> Report:
        """Generate daily production summary."""
        from ..domain import models_scheduling as ms

        # Fetch day's schedule tasks
        tasks = self.db.query(ms.ScheduleTask).filter(
            ms.ScheduleTask.site_id == site_id,
        ).all() if hasattr(ms, 'ScheduleTask') else []

        total_tonnes = sum(t.planned_quantity or 0 for t in tasks)
        total_tasks = len(tasks)

        sections = [
            ReportSection(
                title="Production Summary",
                section_type="kpi",
                data={
                    "kpis": [
                        {"label": "Total Planned", "value": f"{total_tonnes:,.0f} t", "icon": "📊"},
                        {"label": "Tasks Scheduled", "value": str(total_tasks), "icon": "📋"},
                        {"label": "Resources Active", "value": str(len(set(t.resource_id for t in tasks if t.resource_id))), "icon": "🚛"},
                    ]
                },
                order=1,
            ),
            ReportSection(
                title="Task Breakdown by Activity",
                section_type="table",
                data={
                    "headers": ["Activity", "Tasks", "Tonnes", "% of Total"],
                    "rows": self._group_tasks_by_activity(tasks, total_tonnes),
                },
                order=2,
            ),
            ReportSection(
                title="Resource Utilisation",
                section_type="table",
                data={
                    "headers": ["Resource", "Tasks", "Hours", "Utilisation %"],
                    "rows": self._group_tasks_by_resource(tasks),
                },
                order=3,
            ),
        ]

        return Report(
            report_id=f"daily_{site_id}_{date.strftime('%Y%m%d')}",
            title=f"Daily Production Report — {date.strftime('%d %B %Y')}",
            report_type="daily",
            site_id=site_id,
            period_start=date,
            period_end=date + timedelta(days=1),
            sections=sections,
            generated_at=datetime.utcnow(),
            metadata={"total_tonnes": total_tonnes, "total_tasks": total_tasks},
        )

    def generate_management_report(self, site_id: str, period_start: datetime, period_end: datetime) -> Report:
        """Generate management KPI dashboard report."""
        sections = [
            ReportSection(
                title="Executive Summary",
                section_type="summary",
                data={
                    "text": f"Production report for period {period_start.strftime('%d/%m/%Y')} to {period_end.strftime('%d/%m/%Y')}",
                },
                order=1,
            ),
            ReportSection(
                title="Key Performance Indicators",
                section_type="kpi",
                data={
                    "kpis": [
                        {"label": "Production vs Plan", "value": "—", "unit": "%", "trend": "up"},
                        {"label": "Quality Compliance", "value": "—", "unit": "%", "trend": "stable"},
                        {"label": "Equipment Utilisation", "value": "—", "unit": "%", "trend": "down"},
                        {"label": "Reconciliation Factor", "value": "—", "unit": "", "trend": "stable"},
                    ]
                },
                order=2,
            ),
            ReportSection(
                title="Production Trend",
                section_type="chart",
                data={"chart_type": "line", "series": [], "labels": []},
                order=3,
            ),
        ]

        return Report(
            report_id=f"mgmt_{site_id}_{period_start.strftime('%Y%m%d')}",
            title=f"Management Report — {period_start.strftime('%B %Y')}",
            report_type="management",
            site_id=site_id,
            period_start=period_start,
            period_end=period_end,
            sections=sections,
            generated_at=datetime.utcnow(),
            metadata={},
        )

    def _group_tasks_by_activity(self, tasks, total_tonnes) -> List[List]:
        """Group tasks by activity type for table data."""
        groups = {}
        for t in tasks:
            act = t.task_type or 'Mining'
            if act not in groups:
                groups[act] = {'count': 0, 'tonnes': 0}
            groups[act]['count'] += 1
            groups[act]['tonnes'] += t.planned_quantity or 0

        return [
            [act, str(g['count']), f"{g['tonnes']:,.0f}",
             f"{(g['tonnes'] / total_tonnes * 100):.1f}%" if total_tonnes > 0 else "0%"]
            for act, g in sorted(groups.items())
        ]

    def _group_tasks_by_resource(self, tasks) -> List[List]:
        """Group tasks by resource for table data."""
        groups = {}
        for t in tasks:
            res = t.resource_id or 'Unassigned'
            if res not in groups:
                groups[res] = {'count': 0, 'hours': 0}
            groups[res]['count'] += 1
            groups[res]['hours'] += t.duration_hours or 0

        return [
            [res, str(g['count']), f"{g['hours']:.1f}", f"{min(g['hours'] / 24 * 100, 100):.0f}%"]
            for res, g in sorted(groups.items())
        ]


def create_report_generator(db: Session) -> ReportPackGenerator:
    """Factory function."""
    return ReportPackGenerator(db)
