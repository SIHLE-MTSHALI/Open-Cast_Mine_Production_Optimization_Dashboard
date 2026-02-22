"""
Demand Chain Router — Issue #20

CRUD for demand schedules, customer orders, and fulfillment tracking.
"""

import logging
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..domain.models_demand import DemandSchedule, CustomerOrder, DemandFulfillment

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/demand", tags=["Demand Chain"])


# ── Schemas ─────────────────────────────────────────────────────────

class DemandScheduleCreate(BaseModel):
    site_id: str
    product_id: str
    product_name: str
    period_id: Optional[str] = None
    target_tonnes: float = 0
    min_tonnes: float = 0
    max_tonnes: Optional[float] = None
    quality_specs: Optional[dict] = None
    priority: int = 1
    penalty_per_tonne_short: float = 0
    penalty_per_tonne_over: float = 0
    revenue_per_tonne: float = 0

class DemandScheduleUpdate(BaseModel):
    target_tonnes: Optional[float] = None
    min_tonnes: Optional[float] = None
    max_tonnes: Optional[float] = None
    quality_specs: Optional[dict] = None
    priority: Optional[int] = None
    penalty_per_tonne_short: Optional[float] = None
    penalty_per_tonne_over: Optional[float] = None
    revenue_per_tonne: Optional[float] = None

class OrderCreate(BaseModel):
    site_id: str
    customer_name: str
    product_id: str
    product_name: str
    order_tonnes: float
    quality_specs: Optional[dict] = None
    due_date: datetime
    priority: int = 1
    revenue: float = 0
    penalty_if_missed: float = 0
    notes: Optional[str] = None

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    allocated_tonnes: Optional[float] = None
    notes: Optional[str] = None


# ── Demand Schedule CRUD ────────────────────────────────────────────

@router.get("/schedule/site/{site_id}")
def list_demand_schedules(site_id: str, db: Session = Depends(get_db)):
    """List all demand schedules for a site."""
    return db.query(DemandSchedule).filter(DemandSchedule.site_id == site_id).all()


@router.post("/schedule")
def create_demand_schedule(data: DemandScheduleCreate, db: Session = Depends(get_db)):
    """Create a new demand schedule entry."""
    entry = DemandSchedule(**data.dict())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/schedule/{demand_id}")
def update_demand_schedule(demand_id: str, data: DemandScheduleUpdate, db: Session = Depends(get_db)):
    """Update a demand schedule entry."""
    entry = db.query(DemandSchedule).filter(DemandSchedule.demand_id == demand_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Demand schedule not found")
    for k, v in data.dict(exclude_none=True).items():
        setattr(entry, k, v)
    entry.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/schedule/{demand_id}")
def delete_demand_schedule(demand_id: str, db: Session = Depends(get_db)):
    """Delete a demand schedule entry."""
    entry = db.query(DemandSchedule).filter(DemandSchedule.demand_id == demand_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Demand schedule not found")
    db.delete(entry)
    db.commit()
    return {"detail": "Deleted"}


# ── Customer Orders CRUD ────────────────────────────────────────────

@router.get("/orders/site/{site_id}")
def list_orders(site_id: str, status: Optional[str] = None, db: Session = Depends(get_db)):
    """List customer orders for a site, optionally filtered by status."""
    q = db.query(CustomerOrder).filter(CustomerOrder.site_id == site_id)
    if status:
        q = q.filter(CustomerOrder.status == status)
    return q.order_by(CustomerOrder.due_date).all()


@router.post("/orders")
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    """Create a new customer order."""
    order = CustomerOrder(**data.dict())
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.put("/orders/{order_id}")
def update_order(order_id: str, data: OrderUpdate, db: Session = Depends(get_db)):
    """Update an existing order."""
    order = db.query(CustomerOrder).filter(CustomerOrder.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    for k, v in data.dict(exclude_none=True).items():
        setattr(order, k, v)
    order.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    return order


@router.delete("/orders/{order_id}")
def delete_order(order_id: str, db: Session = Depends(get_db)):
    """Delete a customer order."""
    order = db.query(CustomerOrder).filter(CustomerOrder.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()
    return {"detail": "Deleted"}


# ── Fulfillment Tracking ────────────────────────────────────────────

@router.get("/fulfillment/{schedule_version_id}")
def get_fulfillment(schedule_version_id: str, db: Session = Depends(get_db)):
    """Get demand fulfillment records for a schedule version."""
    return db.query(DemandFulfillment).filter(
        DemandFulfillment.schedule_version_id == schedule_version_id
    ).all()


@router.get("/fulfillment/{schedule_version_id}/summary")
def get_fulfillment_summary(schedule_version_id: str, db: Session = Depends(get_db)):
    """Get aggregated fulfillment summary by product."""
    records = db.query(DemandFulfillment).filter(
        DemandFulfillment.schedule_version_id == schedule_version_id
    ).all()

    summary = {}
    for r in records:
        pid = r.product_id
        if pid not in summary:
            summary[pid] = {
                "product_id": pid,
                "total_planned": 0,
                "total_actual": 0,
                "total_revenue": 0,
                "total_penalty": 0,
                "periods_met": 0,
                "periods_total": 0,
            }
        summary[pid]["total_planned"] += r.planned_tonnes or 0
        summary[pid]["total_actual"] += r.actual_tonnes or 0
        summary[pid]["total_revenue"] += r.revenue_earned or 0
        summary[pid]["total_penalty"] += r.penalty_incurred or 0
        summary[pid]["periods_total"] += 1
        if r.status == "met":
            summary[pid]["periods_met"] += 1

    for s in summary.values():
        s["fulfillment_pct"] = (
            (s["total_actual"] / s["total_planned"] * 100)
            if s["total_planned"] > 0 else 0
        )

    return list(summary.values())
