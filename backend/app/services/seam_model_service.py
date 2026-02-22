"""
seam_model_service.py — Issue #100

Seam modeling and stratigraphic framework:
 - SeamModel entity with floor/roof surfaces
 - Multi-seam correlation across boreholes
 - Stratigraphic column generation
 - Seam thickness variability mapping
 - Split/merge seam handling
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from enum import Enum
import math
import logging

logger = logging.getLogger(__name__)


class SeamType(str, Enum):
    COAL = "coal"
    INTERBURDEN = "interburden"
    OVERBURDEN = "overburden"
    PARTING = "parting"
    FLOOR = "floor"


@dataclass
class SeamSurface:
    """Floor or roof surface elevations for a seam."""
    borehole_id: str
    x: float
    y: float
    elevation: float
    quality_data: Optional[Dict] = None  # ash, cv, moisture, density


@dataclass
class SeamDefinition:
    """Definition of a geological seam."""
    id: str
    name: str
    seam_type: SeamType
    display_color: str = "#8B4513"
    average_thickness: float = 0.0
    min_thickness: float = 0.0
    max_thickness: float = 0.0
    floor_points: List[SeamSurface] = field(default_factory=list)
    roof_points: List[SeamSurface] = field(default_factory=list)
    quality_stats: Dict = field(default_factory=dict)
    parent_seam_id: Optional[str] = None  # For split seams
    order: int = 0  # Stratigraphic order (0=topmost)


@dataclass
class BoreholeLog:
    """Borehole log with intersected seams."""
    borehole_id: str
    x: float
    y: float
    collar_elevation: float
    total_depth: float
    intersections: List[Dict] = field(default_factory=list)
    # Each intersection: { seam_id, from_depth, to_depth, thickness, quality }


@dataclass
class StratigraphicColumn:
    """Generated stratigraphic column at a location."""
    x: float
    y: float
    layers: List[Dict] = field(default_factory=list)
    # Each layer: { seam_id, seam_name, type, thickness, top_elev, bottom_elev, quality }


class SeamModelService:
    """Manages seam models and stratigraphic analysis."""

    SEAM_COLORS = {
        SeamType.COAL: "#2d2d2d",
        SeamType.INTERBURDEN: "#c4a35a",
        SeamType.OVERBURDEN: "#8B7355",
        SeamType.PARTING: "#a0522d",
        SeamType.FLOOR: "#696969",
    }

    def __init__(self):
        self.seams: Dict[str, SeamDefinition] = {}
        self.boreholes: Dict[str, BoreholeLog] = {}

    def create_seam(self, id: str, name: str, seam_type: SeamType,
                    order: int = 0, parent_seam_id: str = None) -> SeamDefinition:
        """Create a new seam definition."""
        seam = SeamDefinition(
            id=id, name=name, seam_type=seam_type,
            display_color=self.SEAM_COLORS.get(seam_type, "#8B4513"),
            order=order, parent_seam_id=parent_seam_id,
        )
        self.seams[id] = seam
        return seam

    def add_borehole(self, borehole_id: str, x: float, y: float,
                     collar_elevation: float, total_depth: float,
                     intersections: List[Dict]) -> BoreholeLog:
        """Add a borehole log with seam intersections."""
        bh = BoreholeLog(
            borehole_id=borehole_id, x=x, y=y,
            collar_elevation=collar_elevation,
            total_depth=total_depth,
            intersections=intersections,
        )
        self.boreholes[borehole_id] = bh

        # Update seam surfaces from borehole data
        for intersection in intersections:
            seam_id = intersection.get("seam_id")
            if seam_id in self.seams:
                seam = self.seams[seam_id]
                top_elev = collar_elevation - intersection["from_depth"]
                bottom_elev = collar_elevation - intersection["to_depth"]
                thickness = intersection["to_depth"] - intersection["from_depth"]

                seam.roof_points.append(SeamSurface(
                    borehole_id=borehole_id, x=x, y=y,
                    elevation=top_elev, quality_data=intersection.get("quality"),
                ))
                seam.floor_points.append(SeamSurface(
                    borehole_id=borehole_id, x=x, y=y,
                    elevation=bottom_elev,
                ))
                self._update_thickness_stats(seam, thickness)

        return bh

    def _update_thickness_stats(self, seam: SeamDefinition, thickness: float):
        """Update min/max/avg thickness for a seam."""
        all_thicknesses = []
        for i, roof in enumerate(seam.roof_points):
            if i < len(seam.floor_points):
                t = roof.elevation - seam.floor_points[i].elevation
                all_thicknesses.append(abs(t))
        if all_thicknesses:
            seam.average_thickness = sum(all_thicknesses) / len(all_thicknesses)
            seam.min_thickness = min(all_thicknesses)
            seam.max_thickness = max(all_thicknesses)

    def generate_stratigraphic_column(self, x: float, y: float,
                                       search_radius: float = 500) -> StratigraphicColumn:
        """Generate a stratigraphic column at a point by interpolating nearby boreholes."""
        nearby = [
            bh for bh in self.boreholes.values()
            if math.sqrt((bh.x - x) ** 2 + (bh.y - y) ** 2) <= search_radius
        ]

        if not nearby:
            return StratigraphicColumn(x=x, y=y)

        # Inverse-distance weighted interpolation
        layers = []
        ordered_seams = sorted(self.seams.values(), key=lambda s: s.order)

        for seam in ordered_seams:
            weighted_top = 0.0
            weighted_bottom = 0.0
            total_weight = 0.0

            for bh in nearby:
                dist = max(1, math.sqrt((bh.x - x) ** 2 + (bh.y - y) ** 2))
                weight = 1.0 / (dist ** 2)

                for inter in bh.intersections:
                    if inter.get("seam_id") == seam.id:
                        top = bh.collar_elevation - inter["from_depth"]
                        bottom = bh.collar_elevation - inter["to_depth"]
                        weighted_top += top * weight
                        weighted_bottom += bottom * weight
                        total_weight += weight

            if total_weight > 0:
                top_elev = weighted_top / total_weight
                bottom_elev = weighted_bottom / total_weight
                layers.append({
                    "seam_id": seam.id,
                    "seam_name": seam.name,
                    "type": seam.seam_type.value,
                    "thickness": abs(top_elev - bottom_elev),
                    "top_elev": top_elev,
                    "bottom_elev": bottom_elev,
                    "quality": seam.quality_stats,
                    "color": seam.display_color,
                })

        return StratigraphicColumn(x=x, y=y, layers=layers)

    def correlate_seams(self, borehole_ids: List[str] = None) -> List[Dict]:
        """Generate seam correlations across boreholes for cross-section display."""
        bhs = [self.boreholes[bid] for bid in (borehole_ids or self.boreholes.keys()) if bid in self.boreholes]
        ordered_seams = sorted(self.seams.values(), key=lambda s: s.order)

        correlations = []
        for seam in ordered_seams:
            seam_corr = {
                "seam_id": seam.id,
                "seam_name": seam.name,
                "type": seam.seam_type.value,
                "color": seam.display_color,
                "intersections": [],
            }
            for bh in bhs:
                for inter in bh.intersections:
                    if inter.get("seam_id") == seam.id:
                        seam_corr["intersections"].append({
                            "borehole_id": bh.borehole_id,
                            "x": bh.x, "y": bh.y,
                            "top_elev": bh.collar_elevation - inter["from_depth"],
                            "bottom_elev": bh.collar_elevation - inter["to_depth"],
                            "thickness": inter["to_depth"] - inter["from_depth"],
                        })
            correlations.append(seam_corr)

        return correlations

    def get_thickness_map(self, seam_id: str) -> List[Dict]:
        """Get thickness data points for contouring."""
        seam = self.seams.get(seam_id)
        if not seam:
            return []

        points = []
        for i, roof in enumerate(seam.roof_points):
            if i < len(seam.floor_points):
                floor = seam.floor_points[i]
                thickness = abs(roof.elevation - floor.elevation)
                points.append({
                    "x": roof.x, "y": roof.y,
                    "thickness": thickness,
                    "borehole_id": roof.borehole_id,
                })
        return points
