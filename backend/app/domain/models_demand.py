"""
Demand Chain / Order Fulfillment — Issue #20

Domain models for product demand scheduling and order tracking:
- DemandSchedule: per-product, per-period tonnage & quality targets
- CustomerOrder: individual orders with due dates and priority
- DemandFulfillment: tracking planned vs achieved delivery
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from ..database import Base


class DemandSchedule(Base):
    """Per-product, per-period demand targets."""
    __tablename__ = "demand_schedules"

    demand_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id = Column(String, ForeignKey("sites.site_id"), nullable=False)
    product_id = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    period_id = Column(String, nullable=True)  # null = applies to all periods
    target_tonnes = Column(Float, default=0)
    min_tonnes = Column(Float, default=0)
    max_tonnes = Column(Float, nullable=True)
    quality_specs = Column(JSON, nullable=True)  # {field: {min,max,target}}
    priority = Column(Integer, default=1)  # 1=highest
    penalty_per_tonne_short = Column(Float, default=0)
    penalty_per_tonne_over = Column(Float, default=0)
    revenue_per_tonne = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CustomerOrder(Base):
    """Individual customer order with due date."""
    __tablename__ = "customer_orders"

    order_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id = Column(String, ForeignKey("sites.site_id"), nullable=False)
    customer_name = Column(String, nullable=False)
    product_id = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    order_tonnes = Column(Float, nullable=False)
    quality_specs = Column(JSON, nullable=True)
    due_date = Column(DateTime, nullable=False)
    priority = Column(Integer, default=1)
    status = Column(String, default="open")  # open, partial, fulfilled, cancelled
    allocated_tonnes = Column(Float, default=0)
    revenue = Column(Float, default=0)
    penalty_if_missed = Column(Float, default=0)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DemandFulfillment(Base):
    """Tracking planned vs achieved demand delivery per period."""
    __tablename__ = "demand_fulfillments"

    fulfillment_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    schedule_version_id = Column(String, nullable=False)
    period_id = Column(String, nullable=False)
    product_id = Column(String, nullable=False)
    demand_id = Column(String, ForeignKey("demand_schedules.demand_id"), nullable=True)
    order_id = Column(String, ForeignKey("customer_orders.order_id"), nullable=True)
    planned_tonnes = Column(Float, default=0)
    actual_tonnes = Column(Float, default=0)
    planned_quality = Column(JSON, nullable=True)
    actual_quality = Column(JSON, nullable=True)
    fulfillment_pct = Column(Float, default=0)
    revenue_earned = Column(Float, default=0)
    penalty_incurred = Column(Float, default=0)
    status = Column(String, default="pending")  # pending, met, partial, unmet
    created_at = Column(DateTime, default=datetime.utcnow)
