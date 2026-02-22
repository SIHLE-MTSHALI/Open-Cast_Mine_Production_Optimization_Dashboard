"""
Enhanced Washability Model — Issue #22

Extends wash_plant_service with:
 - Washability curve per parcel/source
 - Misplacement (Ep) modeling for yield adjustment
 - Curve interpolation data for visualization
 - Calibration from historical plant data
"""

import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
import uuid
import numpy as np
from sqlalchemy import Column, String, Float, JSON, ForeignKey, DateTime
from sqlalchemy.orm import Session
from datetime import datetime

from ..database import Base

logger = logging.getLogger(__name__)


class WashabilityData(Base):
    """Washability curve data linked to parcels or sources."""
    __tablename__ = "washability_data"

    washability_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id = Column(String, ForeignKey("sites.site_id"), nullable=False)
    source_id = Column(String, nullable=True)  # activity area / parcel source
    source_name = Column(String, nullable=True)
    seam_name = Column(String, nullable=True)
    # Float-yield data points as JSON arrays
    # Each FRD point: {rd: float, cum_yield: float, cum_ash: float, cum_cv: float, ...}
    float_sink_data = Column(JSON, nullable=True)
    # Summary metrics
    raw_ash = Column(Float, nullable=True)
    raw_cv = Column(Float, nullable=True)
    raw_moisture = Column(Float, nullable=True)
    optimal_rd = Column(Float, nullable=True)
    optimal_yield = Column(Float, nullable=True)
    optimal_ash = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PlantCalibration(Base):
    """Historical plant operating point for calibration."""
    __tablename__ = "plant_calibrations"

    calibration_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id = Column(String, ForeignKey("sites.site_id"), nullable=False)
    plant_id = Column(String, nullable=True)
    operating_date = Column(DateTime, nullable=True)
    feed_rd = Column(Float, nullable=True)
    cutpoint_rd = Column(Float, nullable=True)
    actual_yield = Column(Float, nullable=True)
    actual_ash = Column(Float, nullable=True)
    actual_cv = Column(Float, nullable=True)
    ep_value = Column(Float, nullable=True)  # Ecart Probable / misplacement
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


@dataclass
class WashResult:
    """Result of washability curve calculation."""
    cutpoint_rd: float
    theoretical_yield: float
    adjusted_yield: float  # after misplacement
    product_ash: float
    product_cv: float
    product_moisture: float
    ep_value: float
    curve_points: List[Dict]  # for chart visualization


class WashabilityEngine:
    """
    Washability curve interpolation engine with misplacement modeling.

    Supports:
    - Float-sink data interpolation
    - Ecart Probable (Ep) misplacement adjustment
    - Multi-product stream calculation
    - Historical calibration
    """

    def __init__(self, db: Session):
        self.db = db

    def calculate_wash(
        self,
        washability_data: WashabilityData,
        cutpoint_rd: float,
        ep: float = 0.03,
        products: int = 1,
    ) -> WashResult:
        """
        Calculate wash result for a given cutpoint and Ep value.

        Args:
            washability_data: Washability curve data
            cutpoint_rd: Target cutpoint relative density
            ep: Ecart Probable (misplacement factor, typically 0.01-0.10)
            products: Number of product streams
        """
        fsd = washability_data.float_sink_data or []
        if not fsd:
            return WashResult(
                cutpoint_rd=cutpoint_rd, theoretical_yield=0, adjusted_yield=0,
                product_ash=0, product_cv=0, product_moisture=0, ep_value=ep,
                curve_points=[],
            )

        # Sort by RD
        points = sorted(fsd, key=lambda p: p.get('rd', 0))

        # Interpolate theoretical yield at cutpoint
        rds = [p['rd'] for p in points]
        yields = [p.get('cum_yield', 0) for p in points]
        ashes = [p.get('cum_ash', 0) for p in points]
        cvs = [p.get('cum_cv', 0) for p in points]

        theo_yield = float(np.interp(cutpoint_rd, rds, yields))
        product_ash = float(np.interp(cutpoint_rd, rds, ashes))
        product_cv = float(np.interp(cutpoint_rd, rds, cvs))

        # Apply misplacement (Ep) adjustment
        # Higher Ep = more misplaced material = lower actual yield
        misplacement_factor = 1.0 - (ep / 0.1) * 0.05  # ~5% yield loss at Ep=0.10
        adjusted_yield = theo_yield * max(misplacement_factor, 0.85)

        # Generate curve points for visualization
        curve_points = []
        for rd_val in np.linspace(min(rds), max(rds), 50):
            curve_points.append({
                'rd': float(rd_val),
                'yield': float(np.interp(rd_val, rds, yields)),
                'ash': float(np.interp(rd_val, rds, ashes)),
                'cv': float(np.interp(rd_val, rds, cvs)),
            })

        return WashResult(
            cutpoint_rd=cutpoint_rd,
            theoretical_yield=theo_yield,
            adjusted_yield=adjusted_yield,
            product_ash=product_ash,
            product_cv=product_cv,
            product_moisture=washability_data.raw_moisture or 8.0,
            ep_value=ep,
            curve_points=curve_points,
        )

    def calibrate_from_actuals(
        self,
        calibration: PlantCalibration,
        washability_data: WashabilityData,
    ) -> float:
        """
        Calculate Ep from actual plant data vs theoretical curve.

        Returns the calculated Ep value.
        """
        if not washability_data.float_sink_data or not calibration.actual_yield:
            return 0.03

        fsd = sorted(washability_data.float_sink_data, key=lambda p: p.get('rd', 0))
        rds = [p['rd'] for p in fsd]
        yields = [p.get('cum_yield', 0) for p in fsd]

        # Theoretical yield at operating cutpoint
        theo_yield = float(np.interp(calibration.cutpoint_rd or 1.5, rds, yields))

        if theo_yield <= 0:
            return 0.03

        # Back-calculate Ep from yield difference
        yield_loss = max(0, theo_yield - calibration.actual_yield)
        ep = yield_loss / theo_yield * 0.1
        return max(0.01, min(ep, 0.15))  # Clamp Ep to realistic range

    def get_curve_for_source(self, site_id: str, source_id: str) -> Optional[WashabilityData]:
        """Get washability data for a specific source."""
        return self.db.query(WashabilityData).filter(
            WashabilityData.site_id == site_id,
            WashabilityData.source_id == source_id,
        ).first()


def create_washability_engine(db: Session) -> WashabilityEngine:
    """Factory function."""
    return WashabilityEngine(db)
