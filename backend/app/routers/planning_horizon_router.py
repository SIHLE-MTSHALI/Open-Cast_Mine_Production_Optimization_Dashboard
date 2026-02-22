"""
Planning Horizon Router — Phase 2 Issue #14

CRUD endpoints for planning horizons + target propagation and variance.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.planning_horizon_service import get_planning_horizon_service

router = APIRouter(prefix="/planning-horizons", tags=["Planning Horizons"])


# ── Request / Response Models ───────────────────────────────────────────────

class HorizonCreate(BaseModel):
    site_id: str
    name: str
    granularity: str = Field(
        "month",
        pattern="^(shift|day|week|month|quarter|year)$",
    )
    start_date: datetime
    end_date: datetime
    parent_horizon_id: Optional[str] = None
    calendar_id: Optional[str] = None
    description: Optional[str] = None
    auto_generate_periods: bool = True


class TargetUpdate(BaseModel):
    target_total_tonnes: Optional[float] = None
    target_ore_tonnes: Optional[float] = None
    target_waste_tonnes: Optional[float] = None
    target_stripping_ratio: Optional[float] = None
    quality_targets: Optional[Dict[str, Any]] = None


class TargetActualsUpdate(BaseModel):
    actual_total_tonnes: Optional[float] = None
    actual_ore_tonnes: Optional[float] = None
    actual_waste_tonnes: Optional[float] = None
    actual_stripping_ratio: Optional[float] = None
    actual_quality: Optional[Dict[str, Any]] = None


class HorizonResponse(BaseModel):
    horizon_id: str
    site_id: str
    name: str
    granularity: str
    start_date: datetime
    end_date: datetime
    parent_horizon_id: Optional[str]
    status: str
    target_count: int
    created_at: datetime


class TargetResponse(BaseModel):
    target_id: str
    period_label: Optional[str]
    sequence: Optional[int]
    target_total_tonnes: Optional[float]
    target_ore_tonnes: Optional[float]
    target_waste_tonnes: Optional[float]
    target_stripping_ratio: Optional[float]
    quality_targets: Optional[Dict[str, Any]]
    actual_total_tonnes: Optional[float]
    actual_ore_tonnes: Optional[float]
    actual_waste_tonnes: Optional[float]
    actual_stripping_ratio: Optional[float]
    actual_quality: Optional[Dict[str, Any]]


# ── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/", response_model=HorizonResponse)
async def create_horizon(req: HorizonCreate, db: Session = Depends(get_db)):
    """Create a planning horizon with auto-generated target periods."""
    svc = get_planning_horizon_service(db)
    try:
        h = svc.create_horizon(
            site_id=req.site_id,
            name=req.name,
            granularity=req.granularity,
            start_date=req.start_date,
            end_date=req.end_date,
            parent_horizon_id=req.parent_horizon_id,
            calendar_id=req.calendar_id,
            description=req.description,
            auto_generate_periods=req.auto_generate_periods,
        )
        return _horizon_to_response(h)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/site/{site_id}", response_model=List[HorizonResponse])
async def list_horizons(site_id: str, db: Session = Depends(get_db)):
    """List all planning horizons for a site."""
    svc = get_planning_horizon_service(db)
    return [_horizon_to_response(h) for h in svc.list_horizons(site_id)]


@router.get("/{horizon_id}", response_model=HorizonResponse)
async def get_horizon(horizon_id: str, db: Session = Depends(get_db)):
    """Get a single planning horizon."""
    svc = get_planning_horizon_service(db)
    h = svc.get_horizon(horizon_id)
    if not h:
        raise HTTPException(status_code=404, detail="Horizon not found")
    return _horizon_to_response(h)


@router.delete("/{horizon_id}")
async def delete_horizon(horizon_id: str, db: Session = Depends(get_db)):
    """Delete a planning horizon and all its targets."""
    svc = get_planning_horizon_service(db)
    ok = svc.delete_horizon(horizon_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Horizon not found")
    return {"deleted": True}


# ── Targets ─────────────────────────────────────────────────────────────────

@router.get("/{horizon_id}/targets", response_model=List[TargetResponse])
async def get_targets(horizon_id: str, db: Session = Depends(get_db)):
    """Get all targets for a horizon."""
    from ..domain.models_planning_horizon import HorizonTarget

    targets = (
        db.query(HorizonTarget)
        .filter(HorizonTarget.horizon_id == horizon_id)
        .order_by(HorizonTarget.sequence)
        .all()
    )
    return [_target_to_response(t) for t in targets]


@router.put("/targets/{target_id}", response_model=TargetResponse)
async def update_target(
    target_id: str, body: TargetUpdate, db: Session = Depends(get_db)
):
    """Set planned targets for a single horizon period."""
    from ..domain.models_planning_horizon import HorizonTarget

    t = db.query(HorizonTarget).filter(HorizonTarget.target_id == target_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Target not found")

    for field, value in body.dict(exclude_unset=True).items():
        setattr(t, field, value)
    t.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(t)
    return _target_to_response(t)


@router.put("/targets/{target_id}/actuals", response_model=TargetResponse)
async def update_target_actuals(
    target_id: str, body: TargetActualsUpdate, db: Session = Depends(get_db)
):
    """Record actual values for a horizon target (for variance reporting)."""
    from ..domain.models_planning_horizon import HorizonTarget

    t = db.query(HorizonTarget).filter(HorizonTarget.target_id == target_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Target not found")

    for field, value in body.dict(exclude_unset=True).items():
        setattr(t, field, value)
    t.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(t)
    return _target_to_response(t)


# ── Propagation & Variance ──────────────────────────────────────────────────

@router.post("/{horizon_id}/propagate")
async def propagate_targets(horizon_id: str, db: Session = Depends(get_db)):
    """Propagate parent horizon targets into child horizons."""
    svc = get_planning_horizon_service(db)
    try:
        result = svc.propagate_targets(horizon_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{horizon_id}/variance")
async def variance_report(horizon_id: str, db: Session = Depends(get_db)):
    """Calculate planned-vs-actual variance for a horizon."""
    svc = get_planning_horizon_service(db)
    h = svc.get_horizon(horizon_id)
    if not h:
        raise HTTPException(status_code=404, detail="Horizon not found")
    return svc.calculate_variance(horizon_id)


# ── Helpers ──────────────────────────────────────────────────────────────────

def _horizon_to_response(h) -> HorizonResponse:
    return HorizonResponse(
        horizon_id=h.horizon_id,
        site_id=h.site_id,
        name=h.name,
        granularity=h.granularity,
        start_date=h.start_date,
        end_date=h.end_date,
        parent_horizon_id=h.parent_horizon_id,
        status=h.status,
        target_count=len(h.targets) if h.targets else 0,
        created_at=h.created_at,
    )


def _target_to_response(t) -> TargetResponse:
    return TargetResponse(
        target_id=t.target_id,
        period_label=t.period_label,
        sequence=t.sequence,
        target_total_tonnes=t.target_total_tonnes,
        target_ore_tonnes=t.target_ore_tonnes,
        target_waste_tonnes=t.target_waste_tonnes,
        target_stripping_ratio=t.target_stripping_ratio,
        quality_targets=t.quality_targets,
        actual_total_tonnes=t.actual_total_tonnes,
        actual_ore_tonnes=t.actual_ore_tonnes,
        actual_waste_tonnes=t.actual_waste_tonnes,
        actual_stripping_ratio=t.actual_stripping_ratio,
        actual_quality=t.actual_quality,
    )
