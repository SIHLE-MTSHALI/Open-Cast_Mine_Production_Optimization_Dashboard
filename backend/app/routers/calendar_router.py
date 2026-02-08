from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..domain import models_calendar, models_core
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

router = APIRouter(prefix="/calendar", tags=["Calendar"])


class CalendarCreateRequest(BaseModel):
    name: str
    site_id: str
    period_type: Optional[str] = "Shift"
    description: Optional[str] = None


@router.get("/calendars")
def list_calendars(db: Session = Depends(get_db)):
    """Legacy-compatible endpoint returning all calendars."""
    return db.query(models_calendar.Calendar).all()


@router.post("/calendars")
def create_calendar(payload: CalendarCreateRequest, db: Session = Depends(get_db)):
    """Legacy-compatible calendar create endpoint."""
    site = db.query(models_core.Site).filter(models_core.Site.site_id == payload.site_id).first()
    if not site:
        raise HTTPException(status_code=400, detail="Site not found")

    calendar = models_calendar.Calendar(
        site_id=payload.site_id,
        name=payload.name,
        description=payload.description,
        period_granularity_type=payload.period_type or "Shift"
    )
    db.add(calendar)
    db.commit()
    db.refresh(calendar)
    return calendar

@router.get("/site/{site_id}")
def get_site_calendars(site_id: str, db: Session = Depends(get_db)):
    """Get all calendars associated with a site."""
    return db.query(models_calendar.Calendar).filter(models_calendar.Calendar.site_id == site_id).all()

@router.get("/{calendar_id}/periods")
def get_periods(
    calendar_id: str, 
    start_date: Optional[datetime] = None, 
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Get periods for a calendar, optionally filtered by date range."""
    query = db.query(models_calendar.Period).filter(models_calendar.Period.calendar_id == calendar_id)
    
    if start_date:
        query = query.filter(models_calendar.Period.end_datetime >= start_date)
    if end_date:
        query = query.filter(models_calendar.Period.start_datetime <= end_date)
        
    return query.order_by(models_calendar.Period.start_datetime).all()

@router.get("/{calendar_id}/current-period")
def get_current_period(calendar_id: str, db: Session = Depends(get_db)):
    """Get the period that officially contains 'now'."""
    now = datetime.utcnow() # In a real app we'd use site timezone
    period = db.query(models_calendar.Period).filter(
        models_calendar.Period.calendar_id == calendar_id,
        models_calendar.Period.start_datetime <= now,
        models_calendar.Period.end_datetime > now
    ).first()
    return period

