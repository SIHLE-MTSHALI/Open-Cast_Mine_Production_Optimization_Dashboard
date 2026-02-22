"""
Precedence Router — Phase 2 Issue #17

CRUD for precedence rules, template management, and validation.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from sqlalchemy.orm import Session

from ..database import get_db
from ..domain.models_precedence import PrecedenceRule, PrecedenceTemplate

router = APIRouter(prefix="/precedence", tags=["Precedence"])


# ── Schemas ─────────────────────────────────────────────────────────────────

class RuleCreate(BaseModel):
    site_id: str
    rule_type: str = Field("activity_sequence", pattern="^(activity_sequence|bench_sequence|custom)$")
    name: Optional[str] = None
    description: Optional[str] = None
    predecessor_activity_id: Optional[str] = None
    predecessor_area_id: Optional[str] = None
    successor_activity_id: Optional[str] = None
    successor_area_id: Optional[str] = None
    lag_periods: int = 0
    min_completion_pct: float = 100.0


class RuleResponse(BaseModel):
    rule_id: str
    site_id: str
    rule_type: str
    name: Optional[str]
    predecessor_activity_id: Optional[str]
    predecessor_area_id: Optional[str]
    successor_activity_id: Optional[str]
    successor_area_id: Optional[str]
    lag_periods: int
    min_completion_pct: float
    is_active: bool
    created_at: datetime


class TemplateResponse(BaseModel):
    template_id: str
    name: str
    description: Optional[str]
    template_rules: List[Dict[str, Any]]
    is_builtin: bool


class ApplyTemplateRequest(BaseModel):
    site_id: str
    template_id: str


# ── Rule endpoints ──────────────────────────────────────────────────────────

@router.post("/rules", response_model=RuleResponse)
async def create_rule(req: RuleCreate, db: Session = Depends(get_db)):
    """Create a precedence rule."""
    rule = PrecedenceRule(
        site_id=req.site_id,
        rule_type=req.rule_type,
        name=req.name,
        description=req.description,
        predecessor_activity_id=req.predecessor_activity_id,
        predecessor_area_id=req.predecessor_area_id,
        successor_activity_id=req.successor_activity_id,
        successor_area_id=req.successor_area_id,
        lag_periods=req.lag_periods,
        min_completion_pct=req.min_completion_pct,
    )
    db.add(rule)
    db.commit()
    return _rule_resp(rule)


@router.get("/rules/site/{site_id}", response_model=List[RuleResponse])
async def list_rules(site_id: str, db: Session = Depends(get_db)):
    """List all precedence rules for a site."""
    rules = (
        db.query(PrecedenceRule)
        .filter(PrecedenceRule.site_id == site_id, PrecedenceRule.is_active == True)
        .all()
    )
    return [_rule_resp(r) for r in rules]


@router.delete("/rules/{rule_id}")
async def delete_rule(rule_id: str, db: Session = Depends(get_db)):
    """Deactivate a precedence rule."""
    rule = db.query(PrecedenceRule).filter(PrecedenceRule.rule_id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    rule.is_active = False
    db.commit()
    return {"deleted": True}


# ── Validation endpoint ────────────────────────────────────────────────────

@router.get("/validate/site/{site_id}")
async def validate_precedence(site_id: str, db: Session = Depends(get_db)):
    """
    Check all active precedence rules for a site and report violations.

    Returns list of violations found in the latest schedule version.
    """
    from ..domain.models_scheduling import ScheduleVersion, Task

    rules = (
        db.query(PrecedenceRule)
        .filter(PrecedenceRule.site_id == site_id, PrecedenceRule.is_active == True)
        .all()
    )

    # Get latest schedule version
    version = (
        db.query(ScheduleVersion)
        .filter(ScheduleVersion.site_id == site_id)
        .order_by(ScheduleVersion.created_at.desc())
        .first()
    )
    if not version:
        return {"violations": [], "message": "No schedule version found"}

    tasks = (
        db.query(Task)
        .filter(Task.schedule_version_id == version.version_id)
        .all()
    )

    violations = []
    for rule in rules:
        # Find predecessor tasks
        pred_tasks = [
            t for t in tasks
            if (rule.predecessor_activity_id and t.activity_id == rule.predecessor_activity_id)
            or (rule.predecessor_area_id and t.activity_area_id == rule.predecessor_area_id)
        ]
        # Find successor tasks
        succ_tasks = [
            t for t in tasks
            if (rule.successor_activity_id and t.activity_id == rule.successor_activity_id)
            or (rule.successor_area_id and t.activity_area_id == rule.successor_area_id)
        ]

        # Check: successor should not appear in a period before predecessor completes
        for st in succ_tasks:
            if not st.period_id:
                continue
            for pt in pred_tasks:
                if not pt.period_id:
                    continue
                # Simple check: if predecessor and successor share an area,
                # successor must be in a later or same period
                if st.activity_area_id == pt.activity_area_id:
                    if st.start_datetime and pt.end_datetime:
                        if st.start_datetime < pt.end_datetime:
                            violations.append({
                                "rule_id": rule.rule_id,
                                "rule_name": rule.name,
                                "predecessor_task_id": pt.task_id,
                                "successor_task_id": st.task_id,
                                "message": (
                                    f"Successor task starts before predecessor completes "
                                    f"(rule: {rule.name or rule.rule_type})"
                                ),
                            })

    return {
        "schedule_version_id": version.version_id,
        "rules_checked": len(rules),
        "violations": violations,
        "valid": len(violations) == 0,
    }


# ── Templates ───────────────────────────────────────────────────────────────

@router.get("/templates", response_model=List[TemplateResponse])
async def list_templates(db: Session = Depends(get_db)):
    """List available precedence templates."""
    templates = db.query(PrecedenceTemplate).all()

    # Add built-in templates if table is empty
    if not templates:
        _seed_builtin_templates(db)
        templates = db.query(PrecedenceTemplate).all()

    return [_template_resp(t) for t in templates]


@router.post("/templates/apply")
async def apply_template(req: ApplyTemplateRequest, db: Session = Depends(get_db)):
    """Apply a precedence template to a site, creating rules from the template."""
    template = (
        db.query(PrecedenceTemplate)
        .filter(PrecedenceTemplate.template_id == req.template_id)
        .first()
    )
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    from ..domain.models_resource import Activity

    activities = db.query(Activity).filter(Activity.site_id == req.site_id).all()
    activity_map = {a.name.lower(): a.activity_id for a in activities}

    created = 0
    for rule_def in template.template_rules:
        pred_name = rule_def.get("predecessor_activity", "").lower()
        succ_name = rule_def.get("successor_activity", "").lower()
        lag = rule_def.get("lag", 0)

        pred_id = activity_map.get(pred_name)
        succ_id = activity_map.get(succ_name)

        if pred_id and succ_id:
            rule = PrecedenceRule(
                site_id=req.site_id,
                rule_type="activity_sequence",
                name=f"{rule_def.get('predecessor_activity')} → {rule_def.get('successor_activity')}",
                predecessor_activity_id=pred_id,
                successor_activity_id=succ_id,
                lag_periods=lag,
            )
            db.add(rule)
            created += 1

    db.commit()
    return {"template": template.name, "rules_created": created}


# ── Helpers ──────────────────────────────────────────────────────────────────

def _seed_builtin_templates(db: Session):
    """Seed the built-in drill→blast→mine template."""
    t = PrecedenceTemplate(
        name="Drill → Blast → Mine",
        description="Standard open-cut coal mining activity sequence",
        is_builtin=True,
        template_rules=[
            {"predecessor_activity": "Drilling", "successor_activity": "Blasting", "lag": 0},
            {"predecessor_activity": "Blasting", "successor_activity": "Mining", "lag": 1},
        ],
    )
    db.add(t)
    t2 = PrecedenceTemplate(
        name="Bench Sequence (Top-Down)",
        description="Upper bench must be mined before lower bench",
        is_builtin=True,
        template_rules=[
            {"predecessor_activity": "Mining", "successor_activity": "Mining", "lag": 0},
        ],
    )
    db.add(t2)
    db.commit()


def _rule_resp(r) -> RuleResponse:
    return RuleResponse(
        rule_id=r.rule_id,
        site_id=r.site_id,
        rule_type=r.rule_type,
        name=r.name,
        predecessor_activity_id=r.predecessor_activity_id,
        predecessor_area_id=r.predecessor_area_id,
        successor_activity_id=r.successor_activity_id,
        successor_area_id=r.successor_area_id,
        lag_periods=r.lag_periods,
        min_completion_pct=r.min_completion_pct,
        is_active=r.is_active,
        created_at=r.created_at,
    )


def _template_resp(t) -> TemplateResponse:
    return TemplateResponse(
        template_id=t.template_id,
        name=t.name,
        description=t.description,
        template_rules=t.template_rules or [],
        is_builtin=t.is_builtin,
    )
