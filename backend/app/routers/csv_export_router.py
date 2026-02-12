"""
CSV Export Router — Issue #69: CSV/TXT Create, Template, and Export Workflows

Provides:
  1. Downloadable CSV templates for data entry
  2. Schedule results export to CSV (flows, inventory, decisions)
  3. Surface point data export to CSV
  4. Batch export (zip of multiple CSVs)
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from enum import Enum
import csv
import io
import zipfile
import logging

from ..database import get_db
from ..domain.models_schedule_results import (
    FlowResult, InventoryBalance, DecisionExplanation
)
from ..domain.models_surface import Surface, CADString

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/csv", tags=["CSV Export"])


# =============================================================================
# Template Definitions
# =============================================================================

TEMPLATES: Dict[str, Dict[str, Any]] = {
    "borehole_collar": {
        "name": "Borehole Collar",
        "description": "Drillhole collar locations (Vulcan/Minex compatible)",
        "columns": ["HoleID", "Easting", "Northing", "Elevation", "TotalDepth", "Azimuth", "Dip", "Status"],
        "sample_rows": [
            ["BH001", "28500.00", "3150000.00", "1520.50", "120.00", "0.0", "-90.0", "completed"],
            ["BH002", "28550.00", "3150050.00", "1518.30", "95.50", "0.0", "-90.0", "in_progress"],
        ],
    },
    "borehole_survey": {
        "name": "Borehole Survey",
        "description": "Downhole survey measurements",
        "columns": ["HoleID", "Depth", "Azimuth", "Dip", "SurveyMethod"],
        "sample_rows": [
            ["BH001", "0.00", "0.0", "-90.0", "gyro"],
            ["BH001", "30.00", "5.2", "-88.5", "gyro"],
            ["BH001", "60.00", "8.1", "-87.0", "gyro"],
        ],
    },
    "borehole_assay": {
        "name": "Borehole Assay",
        "description": "Sample assay intervals with quality parameters",
        "columns": ["HoleID", "From", "To", "SampleID", "Seam", "Ash", "CV", "Moisture", "Sulphur", "Yield"],
        "sample_rows": [
            ["BH001", "45.00", "46.50", "S001", "Seam1", "12.5", "28.50", "3.2", "0.8", "85.0"],
            ["BH001", "46.50", "48.00", "S002", "Seam1", "14.1", "27.80", "3.5", "0.9", "82.0"],
        ],
    },
    "quality_data": {
        "name": "Quality Data",
        "description": "Material quality parameters for blending/wash plant",
        "columns": ["SampleID", "Source", "MaterialType", "Tonnage", "Ash", "CV", "Moisture", "Sulphur",
                     "Volatiles", "FixedCarbon", "Yield", "Density"],
        "sample_rows": [
            ["Q001", "Pit_A_Bench1", "ROM", "5000.0", "18.5", "25.40", "8.2", "1.1", "22.0", "48.5", "78.0", "1.45"],
            ["Q002", "Pit_A_Bench2", "ROM", "4500.0", "15.2", "27.10", "7.8", "0.9", "24.0", "50.3", "82.0", "1.42"],
        ],
    },
    "equipment_list": {
        "name": "Equipment List",
        "description": "Fleet and equipment register",
        "columns": ["EquipmentID", "Name", "Type", "Capacity_tonnes", "Availability_pct",
                     "CostPerHour", "Status", "AssignedArea"],
        "sample_rows": [
            ["EX001", "Hitachi EX3600", "excavator", "22.0", "85.0", "450.00", "active", "Pit_A"],
            ["TR001", "CAT 793F", "haul_truck", "227.0", "90.0", "280.00", "active", "Pit_A"],
            ["DZ001", "CAT D10T", "dozer", "0.0", "88.0", "320.00", "active", "Dump_1"],
        ],
    },
    "xyz_points": {
        "name": "XYZ Point Data",
        "description": "Generic 3D point data for surfaces / survey",
        "columns": ["PointID", "X", "Y", "Z", "Description"],
        "sample_rows": [
            ["P001", "28500.00", "3150000.00", "1520.50", "survey_peg"],
            ["P002", "28550.00", "3150050.00", "1518.30", "survey_peg"],
        ],
    },
}


# =============================================================================
# Response Models
# =============================================================================

class TemplateInfo(BaseModel):
    key: str
    name: str
    description: str
    columns: List[str]


class ExportSummary(BaseModel):
    entity_type: str
    row_count: int
    columns: List[str]


class BatchExportRequest(BaseModel):
    """Request to export multiple data sets as a zip."""
    schedule_version_id: Optional[str] = None
    surface_ids: Optional[List[str]] = None
    include_flows: bool = True
    include_inventory: bool = True
    include_decisions: bool = False


# =============================================================================
# Helpers
# =============================================================================

def _rows_to_csv_stream(columns: List[str], rows: List[List[Any]]) -> io.BytesIO:
    """Convert column headers + row data to a CSV byte stream."""
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(columns)
    writer.writerows(rows)
    out = io.BytesIO(buf.getvalue().encode("utf-8"))
    out.seek(0)
    return out


def _streaming_csv(columns: List[str], rows: List[List[Any]], filename: str) -> StreamingResponse:
    """Return a StreamingResponse for a CSV file download."""
    stream = _rows_to_csv_stream(columns, rows)
    return StreamingResponse(
        stream,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# =============================================================================
# 1. Template Endpoints
# =============================================================================

@router.get("/templates", response_model=List[TemplateInfo])
async def list_templates():
    """List all available CSV templates for data entry."""
    return [
        TemplateInfo(key=k, name=v["name"], description=v["description"], columns=v["columns"])
        for k, v in TEMPLATES.items()
    ]


@router.get("/templates/{template_key}")
async def download_template(
    template_key: str,
    include_samples: bool = Query(True, description="Include sample data rows"),
):
    """
    Download a CSV template file.
    
    Use include_samples=false to get header-only template for data entry.
    """
    tmpl = TEMPLATES.get(template_key)
    if not tmpl:
        raise HTTPException(404, f"Template '{template_key}' not found. Available: {list(TEMPLATES.keys())}")

    rows = tmpl["sample_rows"] if include_samples else []
    filename = f"{template_key}_template.csv"
    return _streaming_csv(tmpl["columns"], rows, filename)


# =============================================================================
# 2. Schedule Results Export
# =============================================================================

@router.get("/export/flows/{version_id}")
async def export_flows(
    version_id: str,
    period_id: Optional[str] = Query(None, description="Filter to specific period"),
    db: Session = Depends(get_db),
):
    """Export material flow results for a schedule version to CSV."""
    query = db.query(FlowResult).filter(FlowResult.schedule_version_id == version_id)
    if period_id:
        query = query.filter(FlowResult.period_id == period_id)

    results = query.all()
    if not results:
        raise HTTPException(404, "No flow results found for this version")

    columns = [
        "flow_result_id", "period_id", "from_node_id", "to_node_id", "arc_id",
        "material_type_id", "tonnes", "cost", "benefit", "penalty_cost", "net_value",
    ]
    rows = [
        [
            r.flow_result_id, r.period_id, r.from_node_id or "", r.to_node_id,
            r.arc_id or "", r.material_type_id or "", r.tonnes,
            r.cost, r.benefit, r.penalty_cost, r.net_value,
        ]
        for r in results
    ]

    logger.info(f"Exported {len(rows)} flow results for version {version_id}")
    return _streaming_csv(columns, rows, f"flows_{version_id[:8]}.csv")


@router.get("/export/inventory/{version_id}")
async def export_inventory(
    version_id: str,
    period_id: Optional[str] = Query(None, description="Filter to specific period"),
    db: Session = Depends(get_db),
):
    """Export inventory balances for a schedule version to CSV."""
    query = db.query(InventoryBalance).filter(
        InventoryBalance.schedule_version_id == version_id
    )
    if period_id:
        query = query.filter(InventoryBalance.period_id == period_id)

    results = query.all()
    if not results:
        raise HTTPException(404, "No inventory balances found for this version")

    columns = [
        "balance_id", "period_id", "node_id",
        "opening_tonnes", "additions_tonnes", "reclaim_tonnes",
        "processing_in_tonnes", "processing_out_tonnes", "closing_tonnes",
        "capacity_tonnes", "utilization_percent",
    ]
    rows = [
        [
            r.balance_id, r.period_id, r.node_id,
            r.opening_tonnes, r.additions_tonnes, r.reclaim_tonnes,
            r.processing_in_tonnes or "", r.processing_out_tonnes or "",
            r.closing_tonnes, r.capacity_tonnes or "", r.utilization_percent or "",
        ]
        for r in results
    ]

    logger.info(f"Exported {len(rows)} inventory balances for version {version_id}")
    return _streaming_csv(columns, rows, f"inventory_{version_id[:8]}.csv")


@router.get("/export/decisions/{version_id}")
async def export_decisions(
    version_id: str,
    db: Session = Depends(get_db),
):
    """Export optimizer decision explanations for a schedule version to CSV."""
    results = (
        db.query(DecisionExplanation)
        .filter(DecisionExplanation.schedule_version_id == version_id)
        .all()
    )
    if not results:
        raise HTTPException(404, "No decision explanations found for this version")

    columns = [
        "explanation_id", "period_id", "decision_type", "entity_id",
        "explanation_text", "confidence_score", "binding_constraint",
        "sensitivity_notes",
    ]
    rows = [
        [
            r.explanation_id, r.period_id, r.decision_type, r.entity_id,
            r.explanation_text or "", r.confidence_score or "",
            r.binding_constraint or "", r.sensitivity_notes or "",
        ]
        for r in results
    ]

    logger.info(f"Exported {len(rows)} decision explanations for version {version_id}")
    return _streaming_csv(columns, rows, f"decisions_{version_id[:8]}.csv")


# =============================================================================
# 3. Surface Point Data Export
# =============================================================================

@router.get("/export/surface/{surface_id}")
async def export_surface_points(
    surface_id: str,
    db: Session = Depends(get_db),
):
    """Export surface vertices as XYZ point data in CSV format."""
    surface = db.query(Surface).filter(Surface.surface_id == surface_id).first()
    if not surface:
        raise HTTPException(404, "Surface not found")

    vertices = surface.vertices  # List[Tuple[float, float, float]]
    if not vertices:
        raise HTTPException(404, "Surface has no vertex data")

    columns = ["PointIndex", "X", "Y", "Z"]
    rows = [[i, v[0], v[1], v[2]] for i, v in enumerate(vertices)]

    logger.info(f"Exported {len(rows)} vertices for surface '{surface.name}'")
    return _streaming_csv(columns, rows, f"surface_{surface.name or surface_id[:8]}.csv")


@router.get("/export/string/{string_id}")
async def export_string_points(
    string_id: str,
    db: Session = Depends(get_db),
):
    """Export CAD string vertices as XYZ point data in CSV format."""
    cad_string = db.query(CADString).filter(CADString.string_id == string_id).first()
    if not cad_string:
        raise HTTPException(404, "CAD string not found")

    vertices = cad_string.vertices  # List[Tuple[float, float, float]]
    if not vertices:
        raise HTTPException(404, "String has no vertex data")

    columns = ["PointIndex", "X", "Y", "Z"]
    rows = [[i, v[0], v[1], v[2]] for i, v in enumerate(vertices)]

    logger.info(f"Exported {len(rows)} vertices for string '{cad_string.name}'")
    return _streaming_csv(columns, rows, f"string_{cad_string.name or string_id[:8]}.csv")


# =============================================================================
# 4. Batch Export (Zip)
# =============================================================================

@router.post("/export/batch")
async def batch_export(
    request: BatchExportRequest,
    db: Session = Depends(get_db),
):
    """
    Export multiple data sets as a zip of CSV files.
    
    Combines schedule results (flows, inventory, decisions) and/or
    surface point data into a single downloadable zip archive.
    """
    zip_buffer = io.BytesIO()
    file_count = 0

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        # Schedule data
        if request.schedule_version_id:
            vid = request.schedule_version_id

            if request.include_flows:
                flows = db.query(FlowResult).filter(
                    FlowResult.schedule_version_id == vid
                ).all()
                if flows:
                    columns = [
                        "flow_result_id", "period_id", "from_node_id", "to_node_id",
                        "tonnes", "cost", "benefit", "penalty_cost", "net_value",
                    ]
                    stream = _rows_to_csv_stream(columns, [
                        [
                            r.flow_result_id, r.period_id, r.from_node_id or "",
                            r.to_node_id, r.tonnes, r.cost, r.benefit,
                            r.penalty_cost, r.net_value,
                        ]
                        for r in flows
                    ])
                    zf.writestr("flows.csv", stream.getvalue())
                    file_count += 1

            if request.include_inventory:
                invs = db.query(InventoryBalance).filter(
                    InventoryBalance.schedule_version_id == vid
                ).all()
                if invs:
                    columns = [
                        "balance_id", "period_id", "node_id",
                        "opening_tonnes", "additions_tonnes", "reclaim_tonnes",
                        "closing_tonnes",
                    ]
                    stream = _rows_to_csv_stream(columns, [
                        [
                            r.balance_id, r.period_id, r.node_id,
                            r.opening_tonnes, r.additions_tonnes,
                            r.reclaim_tonnes, r.closing_tonnes,
                        ]
                        for r in invs
                    ])
                    zf.writestr("inventory.csv", stream.getvalue())
                    file_count += 1

            if request.include_decisions:
                decs = db.query(DecisionExplanation).filter(
                    DecisionExplanation.schedule_version_id == vid
                ).all()
                if decs:
                    columns = [
                        "explanation_id", "period_id", "decision_type",
                        "entity_id", "explanation_text",
                    ]
                    stream = _rows_to_csv_stream(columns, [
                        [
                            r.explanation_id, r.period_id, r.decision_type,
                            r.entity_id, r.explanation_text or "",
                        ]
                        for r in decs
                    ])
                    zf.writestr("decisions.csv", stream.getvalue())
                    file_count += 1

        # Surface data
        if request.surface_ids:
            for sid in request.surface_ids:
                surface = db.query(Surface).filter(Surface.surface_id == sid).first()
                if surface and surface.vertices:
                    verts = surface.vertices
                    columns = ["PointIndex", "X", "Y", "Z"]
                    stream = _rows_to_csv_stream(columns, [
                        [i, v[0], v[1], v[2]] for i, v in enumerate(verts)
                    ])
                    safe_name = (surface.name or sid[:8]).replace(" ", "_")
                    zf.writestr(f"surface_{safe_name}.csv", stream.getvalue())
                    file_count += 1

    if file_count == 0:
        raise HTTPException(404, "No data found to export")

    zip_buffer.seek(0)
    logger.info(f"Batch export: {file_count} files in zip")

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": 'attachment; filename="mineopt_export.zip"'},
    )
