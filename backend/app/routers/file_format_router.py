"""
File Format Router - Phase 1 File Format Foundation

REST API endpoints for file parsing, preview, and export.
Supports DXF, Surpac .str, CSV, and ASCII formats.
All parse/export endpoints support optional CRS transformation.

Endpoints:
- POST /files/parse - Parse uploaded file
- POST /files/preview - Preview first N rows
- POST /files/export - Export data to file format
- GET /files/formats - List supported formats
- GET /files/templates/{format} - Get import template
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Tuple
from enum import Enum
import io
import logging

from ..services.dxf_service import get_dxf_service, DXFParseResult, DXFExportConfig, DXFPoint
from ..services.surpac_parser import get_surpac_parser, SurpacParseResult, SurpacString
from ..services.tabular_parser import (
    get_tabular_parser, 
    TabularParseResult, 
    Delimiter,
    ColumnInfo,
    ImportTemplate,
    BoreholeBoreholePurpose
)
from ..services.crs_service import get_crs_service


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/files", tags=["File Formats"])


class FileFormat(str, Enum):
    """Supported file formats."""
    DXF = "dxf"
    SURPAC_STR = "str"
    CSV = "csv"
    TXT = "txt"
    ASCII = "ascii"


class ParseRequest(BaseModel):
    """Request parameters for file parsing."""
    delimiter: Optional[str] = None  # For CSV/TXT, None = auto-detect
    has_header: bool = True
    encoding: str = "utf-8"


class PreviewRequest(BaseModel):
    """Request parameters for file preview."""
    max_rows: int = Field(default=10, ge=1, le=100)
    delimiter: Optional[str] = None
    has_header: bool = True


class ExportFormat(str, Enum):
    """Export format options."""
    DXF = "dxf"
    SURPAC_STR = "str"
    CSV = "csv"


class ExportRequest(BaseModel):
    """Request for exporting data."""
    format: ExportFormat
    data: List[Dict[str, Any]]
    filename: str = "export"
    options: Dict[str, Any] = Field(default_factory=dict)
    source_crs: Optional[int] = Field(None, description="Source EPSG code for coordinate data")
    target_crs: Optional[int] = Field(None, description="Target EPSG code to transform coordinates before export")


# Response Models

class FormatInfo(BaseModel):
    """Information about a supported format."""
    format: str
    name: str
    extensions: List[str]
    description: str
    supports_read: bool
    supports_write: bool


class DXFEntityResponse(BaseModel):
    """DXF entity in response."""
    entity_type: str
    layer: str
    point_count: int
    is_closed: bool


class CRSMetadata(BaseModel):
    """CRS information attached to parsed file data."""
    source_crs: Optional[int] = None
    target_crs: Optional[int] = None
    source_crs_name: Optional[str] = None
    target_crs_name: Optional[str] = None
    transformed: bool = False
    transform_errors: List[str] = []


class DXFParseResponse(BaseModel):
    """Response from parsing a DXF file."""
    success: bool
    filename: Optional[str]
    version: Optional[str]
    layers: List[str]
    entity_count: int
    point_count: int
    polyline_count: int
    face_count: int
    extent_min: Optional[List[float]]
    extent_max: Optional[List[float]]
    entities: List[DXFEntityResponse]
    errors: List[str]
    warnings: List[str]
    crs: Optional[CRSMetadata] = None


class SurpacStringResponse(BaseModel):
    """Surpac string in response."""
    string_number: int
    point_count: int
    is_closed: bool
    first_descriptor: Optional[str]


class SurpacParseResponse(BaseModel):
    """Response from parsing a Surpac file."""
    success: bool
    filename: Optional[str]
    string_count: int
    point_count: int
    descriptor_count: int
    extent_min: Optional[List[float]]
    extent_max: Optional[List[float]]
    strings: List[SurpacStringResponse]
    errors: List[str]
    warnings: List[str]
    crs: Optional[CRSMetadata] = None


class ColumnInfoResponse(BaseModel):
    """Column info in response."""
    index: int
    name: str
    inferred_type: str
    sample_values: List[str]
    null_count: int
    unique_count: int
    suggested_mapping: Optional[str]


class TabularParseResponse(BaseModel):
    """Response from parsing a tabular file."""
    success: bool
    filename: Optional[str]
    delimiter: str
    has_header: bool
    row_count: int
    column_count: int
    inferred_purpose: str
    columns: List[ColumnInfoResponse]
    preview_rows: List[Dict[str, str]]
    errors: List[str]
    warnings: List[str]
    crs: Optional[CRSMetadata] = None


class TemplateResponse(BaseModel):
    """Import template response."""
    name: str
    purpose: str
    required_columns: List[str]
    optional_columns: List[str]
    column_mappings: Dict[str, str]
    description: str


# =============================================================================
# CRS Helper Functions
# =============================================================================

def _build_crs_metadata(
    source_crs: Optional[int],
    target_crs: Optional[int],
    transformed: bool = False,
    errors: Optional[List[str]] = None
) -> Optional[CRSMetadata]:
    """Build CRS metadata for responses."""
    if source_crs is None and target_crs is None:
        return None
    
    crs_service = get_crs_service()
    source_name = None
    target_name = None
    
    if source_crs:
        info = crs_service.get_crs_info(source_crs)
        source_name = info.name if info else f"EPSG:{source_crs}"
    if target_crs:
        info = crs_service.get_crs_info(target_crs)
        target_name = info.name if info else f"EPSG:{target_crs}"
    
    return CRSMetadata(
        source_crs=source_crs,
        target_crs=target_crs,
        source_crs_name=source_name,
        target_crs_name=target_name,
        transformed=transformed,
        transform_errors=errors or []
    )


def _transform_points_list(
    points: List[Tuple[float, float, float]],
    from_epsg: int,
    to_epsg: int
) -> Tuple[List[Tuple[float, float, float]], List[str]]:
    """Transform a list of (x,y,z) tuples between CRS. Returns (transformed, errors)."""
    if from_epsg == to_epsg:
        return points, []
    
    crs_service = get_crs_service()
    result = crs_service.transform_points(points, from_epsg, to_epsg)
    
    if result.success:
        return result.transformed_points, result.errors
    else:
        return points, result.errors


# =============================================================================
# Endpoints
# =============================================================================

@router.get("/formats", response_model=List[FormatInfo])
async def list_formats():
    """List all supported file formats."""
    return [
        FormatInfo(
            format="dxf",
            name="AutoCAD DXF",
            extensions=[".dxf"],
            description="Drawing Interchange Format for CAD geometry",
            supports_read=True,
            supports_write=True
        ),
        FormatInfo(
            format="str",
            name="Surpac String",
            extensions=[".str"],
            description="GEOVIA Surpac 3D string file (ASCII)",
            supports_read=True,
            supports_write=True
        ),
        FormatInfo(
            format="csv",
            name="CSV",
            extensions=[".csv"],
            description="Comma-separated values (Vulcan, Minex, GeoBank exports)",
            supports_read=True,
            supports_write=True
        ),
        FormatInfo(
            format="txt",
            name="Text/ASCII",
            extensions=[".txt", ".dat", ".asc"],
            description="Delimited text files (tab, space, semicolon)",
            supports_read=True,
            supports_write=True
        ),
    ]


@router.post("/parse/dxf", response_model=DXFParseResponse)
async def parse_dxf(
    file: UploadFile = File(...),
    source_crs: Optional[int] = Query(None, description="Source EPSG code of the DXF coordinates"),
    target_crs: Optional[int] = Query(None, description="Target EPSG code to transform coordinates to")
):
    """
    Parse a DXF file and extract geometry.
    
    Returns layers, entities, and extents.
    Optionally transforms coordinates from source_crs to target_crs.
    """
    if not file.filename.lower().endswith('.dxf'):
        raise HTTPException(400, "File must have .dxf extension")
    
    content = await file.read()
    
    try:
        service = get_dxf_service()
        result = service.parse_bytes(content, file.filename)
        
        # Apply CRS transformation if both source and target are specified
        crs_errors = []
        transformed = False
        if source_crs and target_crs and source_crs != target_crs:
            try:
                for entity in result.entities:
                    if entity.points:
                        pts = [(p.x, p.y, p.z) for p in entity.points]
                        tx_pts, errs = _transform_points_list(pts, source_crs, target_crs)
                        crs_errors.extend(errs)
                        for i, (tx, ty, tz) in enumerate(tx_pts):
                            entity.points[i] = DXFPoint(x=tx, y=ty, z=tz)
                # Recalculate extents after transformation
                all_points = [p for e in result.entities for p in e.points]
                if all_points:
                    result.extent_min = DXFPoint(
                        x=min(p.x for p in all_points),
                        y=min(p.y for p in all_points),
                        z=min(p.z for p in all_points)
                    )
                    result.extent_max = DXFPoint(
                        x=max(p.x for p in all_points),
                        y=max(p.y for p in all_points),
                        z=max(p.z for p in all_points)
                    )
                transformed = True
                logger.info(f"Transformed DXF coordinates EPSG:{source_crs} → EPSG:{target_crs}")
            except Exception as e:
                crs_errors.append(f"CRS transformation failed: {str(e)}")
        
        # Convert to response format
        entities = [
            DXFEntityResponse(
                entity_type=e.entity_type.value,
                layer=e.layer,
                point_count=len(e.points),
                is_closed=e.is_closed
            )
            for e in result.entities[:100]  # Limit to first 100 for response
        ]
        
        return DXFParseResponse(
            success=result.success,
            filename=result.filename,
            version=result.version,
            layers=result.layers,
            entity_count=result.entity_count,
            point_count=result.point_count,
            polyline_count=result.polyline_count,
            face_count=result.face_count,
            extent_min=[result.extent_min.x, result.extent_min.y, result.extent_min.z] if result.extent_min else None,
            extent_max=[result.extent_max.x, result.extent_max.y, result.extent_max.z] if result.extent_max else None,
            entities=entities,
            errors=result.errors,
            warnings=result.warnings,
            crs=_build_crs_metadata(source_crs, target_crs, transformed, crs_errors)
        )
    except ImportError as e:
        raise HTTPException(500, f"DXF parsing unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"Failed to parse DXF: {str(e)}")


@router.post("/parse/surpac", response_model=SurpacParseResponse)
async def parse_surpac(
    file: UploadFile = File(...),
    source_crs: Optional[int] = Query(None, description="Source EPSG code of the Surpac coordinates"),
    target_crs: Optional[int] = Query(None, description="Target EPSG code to transform coordinates to")
):
    """
    Parse a Surpac .str file.
    
    Returns strings, points, and extents.
    Optionally transforms coordinates from source_crs to target_crs.
    """
    if not file.filename.lower().endswith('.str'):
        raise HTTPException(400, "File must have .str extension")
    
    content = await file.read()
    
    try:
        parser = get_surpac_parser()
        result = parser.parse_bytes(content, file.filename)
        
        # Apply CRS transformation if both source and target are specified
        crs_errors = []
        transformed = False
        if source_crs and target_crs and source_crs != target_crs:
            try:
                for s in result.strings:
                    if hasattr(s, 'points') and s.points:
                        pts = [(p[0], p[1], p[2] if len(p) > 2 else 0.0) for p in s.points]
                        tx_pts, errs = _transform_points_list(pts, source_crs, target_crs)
                        crs_errors.extend(errs)
                        for i, (tx, ty, tz) in enumerate(tx_pts):
                            s.points[i] = (tx, ty, tz)
                # Recalculate extents
                all_pts = []
                for s in result.strings:
                    if hasattr(s, 'points'):
                        all_pts.extend(s.points)
                if all_pts:
                    result.extent_min = (
                        min(p[0] for p in all_pts),
                        min(p[1] for p in all_pts),
                        min(p[2] if len(p) > 2 else 0.0 for p in all_pts)
                    )
                    result.extent_max = (
                        max(p[0] for p in all_pts),
                        max(p[1] for p in all_pts),
                        max(p[2] if len(p) > 2 else 0.0 for p in all_pts)
                    )
                transformed = True
                logger.info(f"Transformed Surpac coordinates EPSG:{source_crs} → EPSG:{target_crs}")
            except Exception as e:
                crs_errors.append(f"CRS transformation failed: {str(e)}")
        
        # Convert to response format
        strings = [
            SurpacStringResponse(
                string_number=s.string_number,
                point_count=s.point_count,
                is_closed=s.is_closed,
                first_descriptor=s.get_first_descriptor(0)
            )
            for s in result.strings[:100]  # Limit for response
        ]
        
        return SurpacParseResponse(
            success=result.success,
            filename=result.filename,
            string_count=result.string_count,
            point_count=result.point_count,
            descriptor_count=result.descriptor_count,
            extent_min=list(result.extent_min) if result.extent_min else None,
            extent_max=list(result.extent_max) if result.extent_max else None,
            strings=strings,
            errors=result.errors,
            warnings=result.warnings,
            crs=_build_crs_metadata(source_crs, target_crs, transformed, crs_errors)
        )
    except Exception as e:
        raise HTTPException(500, f"Failed to parse Surpac file: {str(e)}")


@router.post("/parse/tabular", response_model=TabularParseResponse)
async def parse_tabular(
    file: UploadFile = File(...),
    delimiter: Optional[str] = Query(None, description="Delimiter (comma, tab, etc). Auto-detect if not specified."),
    has_header: bool = Query(True, description="Whether file has header row"),
    source_crs: Optional[int] = Query(None, description="Source EPSG code of coordinate columns"),
    target_crs: Optional[int] = Query(None, description="Target EPSG code to transform coordinates to"),
    x_column: Optional[str] = Query(None, description="Name of X/Easting column for CRS transform"),
    y_column: Optional[str] = Query(None, description="Name of Y/Northing column for CRS transform"),
    z_column: Optional[str] = Query(None, description="Name of Z/Elevation column for CRS transform")
):
    """
    Parse a CSV or delimited text file.
    
    Supports auto-detection of delimiter and column types.
    Returns column info and data preview.
    Optionally transforms coordinate columns from source_crs to target_crs.
    """
    content = await file.read()
    
    try:
        parser = get_tabular_parser()
        
        # Determine delimiter
        delim = Delimiter.AUTO
        if delimiter:
            if delimiter == "comma" or delimiter == ",":
                delim = Delimiter.COMMA
            elif delimiter == "tab" or delimiter == "\t":
                delim = Delimiter.TAB
            elif delimiter == "semicolon" or delimiter == ";":
                delim = Delimiter.SEMICOLON
            elif delimiter == "space" or delimiter == " ":
                delim = Delimiter.SPACE
        
        result = parser.parse_bytes(content, file.filename, delim, has_header)
        
        # Apply CRS transformation to coordinate columns if specified
        crs_errors = []
        transformed = False
        if source_crs and target_crs and source_crs != target_crs and result.rows:
            # Auto-detect coordinate columns if not specified
            col_names = [c.name.lower() for c in result.columns]
            x_col = x_column or _detect_coord_column(col_names, ['x', 'easting', 'east', 'lon', 'longitude'])
            y_col = y_column or _detect_coord_column(col_names, ['y', 'northing', 'north', 'lat', 'latitude'])
            z_col = z_column or _detect_coord_column(col_names, ['z', 'elevation', 'elev', 'rl', 'altitude', 'height'])
            
            if x_col and y_col:
                try:
                    # Get actual column names (case-sensitive)
                    actual_x = _find_actual_column(result.columns, x_col)
                    actual_y = _find_actual_column(result.columns, y_col)
                    actual_z = _find_actual_column(result.columns, z_col) if z_col else None
                    
                    if actual_x and actual_y:
                        pts = []
                        for row in result.rows:
                            try:
                                x = float(row.values.get(actual_x, 0))
                                y = float(row.values.get(actual_y, 0))
                                z = float(row.values.get(actual_z, 0)) if actual_z else 0.0
                                pts.append((x, y, z))
                            except (ValueError, TypeError):
                                pts.append((0.0, 0.0, 0.0))
                        
                        tx_pts, errs = _transform_points_list(pts, source_crs, target_crs)
                        crs_errors.extend(errs)
                        
                        for i, (tx, ty, tz) in enumerate(tx_pts):
                            result.rows[i].values[actual_x] = str(tx)
                            result.rows[i].values[actual_y] = str(ty)
                            if actual_z:
                                result.rows[i].values[actual_z] = str(tz)
                        
                        transformed = True
                        logger.info(f"Transformed tabular coordinates EPSG:{source_crs} → EPSG:{target_crs}")
                except Exception as e:
                    crs_errors.append(f"CRS transformation failed: {str(e)}")
            else:
                crs_errors.append(
                    "Could not detect coordinate columns. "
                    "Specify x_column, y_column, z_column explicitly."
                )
        
        # Build column info response
        columns = [
            ColumnInfoResponse(
                index=c.index,
                name=c.name,
                inferred_type=c.inferred_type.value,
                sample_values=c.sample_values[:5],
                null_count=c.null_count,
                unique_count=c.unique_count,
                suggested_mapping=c.suggested_mapping
            )
            for c in result.columns
        ]
        
        # Preview rows (first 10)
        preview = [row.values for row in result.rows[:10]]
        
        return TabularParseResponse(
            success=result.success,
            filename=result.filename,
            delimiter=result.delimiter,
            has_header=result.has_header,
            row_count=result.row_count,
            column_count=result.column_count,
            inferred_purpose=result.inferred_purpose.value,
            columns=columns,
            preview_rows=preview,
            errors=result.errors,
            warnings=result.warnings,
            crs=_build_crs_metadata(source_crs, target_crs, transformed, crs_errors)
        )
    except Exception as e:
        raise HTTPException(500, f"Failed to parse file: {str(e)}")


@router.get("/templates", response_model=List[TemplateResponse])
async def list_templates():
    """List available import templates."""
    parser = get_tabular_parser()
    templates = []
    
    for key in parser.list_templates():
        t = parser.get_template(key)
        if t:
            templates.append(TemplateResponse(
                name=t.name,
                purpose=t.purpose.value,
                required_columns=t.required_columns,
                optional_columns=t.optional_columns,
                column_mappings=t.column_mappings,
                description=t.description
            ))
    
    return templates


@router.get("/templates/{template_key}", response_model=TemplateResponse)
async def get_template(template_key: str):
    """Get a specific import template."""
    parser = get_tabular_parser()
    t = parser.get_template(template_key)
    
    if not t:
        raise HTTPException(404, f"Template '{template_key}' not found")
    
    return TemplateResponse(
        name=t.name,
        purpose=t.purpose.value,
        required_columns=t.required_columns,
        optional_columns=t.optional_columns,
        column_mappings=t.column_mappings,
        description=t.description
    )


@router.post("/export/dxf")
async def export_dxf(request: ExportRequest):
    """
    Export data to DXF format.
    
    Expects data with geometry (vertices) for each item.
    If source_crs and target_crs are set, transforms coordinates before export.
    """
    try:
        # Apply CRS transformation to geometry data before export
        data = request.data
        if request.source_crs and request.target_crs and request.source_crs != request.target_crs:
            data = _transform_export_data(data, request.source_crs, request.target_crs)
        
        service = get_dxf_service()
        
        # Export as activity areas
        dxf_bytes = service.export_activity_areas(
            data,
            file_path=None,
            config=DXFExportConfig(**request.options) if request.options else None
        )
        
        return StreamingResponse(
            io.BytesIO(dxf_bytes),
            media_type="application/dxf",
            headers={"Content-Disposition": f"attachment; filename={request.filename}.dxf"}
        )
    except ImportError as e:
        raise HTTPException(500, f"DXF export unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"Export failed: {str(e)}")


@router.post("/export/dxf/contours")
async def export_dxf_contours(
    contours: List[Dict[str, Any]] = [],
    major_interval: float = Query(10.0, description="Major contour interval in Z units"),
    version: str = Query("R2018", description="DXF version", pattern="^(R12|R2000|R2004|R2007|R2010|R2013|R2018)$"),
):
    """
    Export contour lines to DXF.

    Expects contours as list of dicts with 'elevation' and 'points' keys.
    Points should be lists of [x, y, z] tuples.
    
    Contours at multiples of major_interval are placed on a CONTOUR_MAJOR layer.
    """
    try:
        from pydantic import BaseModel as _Body
        service = get_dxf_service()
        config = DXFExportConfig(version=version)

        dxf_bytes = service.export_contours(
            contours,
            file_path=None,
            major_interval=major_interval,
            config=config,
        )

        return StreamingResponse(
            io.BytesIO(dxf_bytes),
            media_type="application/dxf",
            headers={"Content-Disposition": "attachment; filename=contours.dxf"}
        )
    except ImportError as e:
        raise HTTPException(500, f"DXF contour export unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"Contour export failed: {str(e)}")


class DXFContourExportBody(BaseModel):
    """Body for contour export from a list of contour dicts."""
    contours: List[Dict[str, Any]]
    major_interval: float = 10.0
    version: str = "R2018"


@router.post("/export/dxf/contours-body")
async def export_dxf_contours_body(request: DXFContourExportBody):
    """
    Export contour lines to DXF from a JSON body.
    """
    try:
        service = get_dxf_service()
        config = DXFExportConfig(version=request.version)

        dxf_bytes = service.export_contours(
            request.contours,
            file_path=None,
            major_interval=request.major_interval,
            config=config,
        )

        return StreamingResponse(
            io.BytesIO(dxf_bytes),
            media_type="application/dxf",
            headers={"Content-Disposition": "attachment; filename=contours.dxf"}
        )
    except ImportError as e:
        raise HTTPException(500, f"DXF contour export unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"Contour export failed: {str(e)}")


@router.post("/parse/dxf/preview")
async def parse_dxf_preview(file: UploadFile = File(...)):
    """
    Parse a DXF and return layer summary for import previewing.
    
    Returns layer names with entity counts and types, allowing
    the user to filter which layers to import.
    """
    if not file.filename.lower().endswith('.dxf'):
        raise HTTPException(400, "File must have .dxf extension")

    content = await file.read()

    try:
        service = get_dxf_service()
        result = service.parse_bytes(content, file.filename)

        # Build layer summary
        layer_summary = {}
        for entity in result.entities:
            layer = entity.layer
            if layer not in layer_summary:
                layer_summary[layer] = {
                    "name": layer,
                    "entity_count": 0,
                    "types": {},
                    "point_count": 0,
                }
            layer_summary[layer]["entity_count"] += 1
            layer_summary[layer]["point_count"] += len(entity.points)
            etype = entity.entity_type.value
            layer_summary[layer]["types"][etype] = layer_summary[layer]["types"].get(etype, 0) + 1

        return {
            "filename": result.filename,
            "version": result.version,
            "layers": list(layer_summary.values()),
            "total_entities": result.entity_count,
            "total_layers": len(layer_summary),
            "extent_min": [result.extent_min.x, result.extent_min.y, result.extent_min.z] if result.extent_min else None,
            "extent_max": [result.extent_max.x, result.extent_max.y, result.extent_max.z] if result.extent_max else None,
        }
    except Exception as e:
        raise HTTPException(500, f"DXF preview failed: {str(e)}")



@router.post("/export/surpac")
async def export_surpac(request: ExportRequest):
    """
    Export data to Surpac .str format.
    
    Expects data with geometry (vertices) for each item.
    If source_crs and target_crs are set, transforms coordinates before export.
    """
    try:
        # Apply CRS transformation to geometry data before export
        data = request.data
        if request.source_crs and request.target_crs and request.source_crs != request.target_crs:
            data = _transform_export_data(data, request.source_crs, request.target_crs)
        
        parser = get_surpac_parser()
        
        # Convert data to SurpacStrings
        strings = []
        for i, item in enumerate(data, start=1):
            geometry = item.get("geometry", {})
            surpac_string = parser.from_activity_area_geometry(
                geometry,
                string_number=i,
                descriptor=item.get("name", "")
            )
            strings.append(surpac_string)
        
        # Export
        content_bytes = parser.export_to_bytes(
            strings,
            header_purpose=request.options.get("purpose", "Exported from MineOpt Pro"),
            location_code=request.options.get("location_code", "MINEOPT")
        )
        
        return StreamingResponse(
            io.BytesIO(content_bytes),
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={request.filename}.str"}
        )
    except Exception as e:
        raise HTTPException(500, f"Export failed: {str(e)}")


@router.post("/export/csv")
async def export_csv(request: ExportRequest):
    """
    Export data to CSV format.
    """
    try:
        parser = get_tabular_parser()
        
        columns = request.options.get("columns")
        content = parser.export_to_csv(request.data, columns)
        
        return StreamingResponse(
            io.BytesIO(content.encode('utf-8')),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={request.filename}.csv"}
        )
    except Exception as e:
        raise HTTPException(500, f"Export failed: {str(e)}")


# =============================================================================
# CRS Coordinate Detection Helpers
# =============================================================================

def _detect_coord_column(col_names: List[str], candidates: List[str]) -> Optional[str]:
    """Find a coordinate column by matching against candidate names."""
    for candidate in candidates:
        for name in col_names:
            if name == candidate or name == candidate.upper():
                return name
    return None


def _find_actual_column(columns: List[ColumnInfo], target: str) -> Optional[str]:
    """Find the actual column name (case-sensitive) matching target."""
    for c in columns:
        if c.name.lower() == target.lower():
            return c.name
    return None


def _transform_export_data(
    data: List[Dict[str, Any]],
    from_epsg: int,
    to_epsg: int
) -> List[Dict[str, Any]]:
    """Transform geometry coordinates in export data from one CRS to another."""
    import copy
    transformed_data = copy.deepcopy(data)
    
    for item in transformed_data:
        geometry = item.get("geometry", {})
        vertices = geometry.get("vertices", [])
        if vertices:
            pts = [
                (v.get("x", v.get("easting", 0)),
                 v.get("y", v.get("northing", 0)),
                 v.get("z", v.get("elevation", v.get("rl", 0))))
                for v in vertices
            ]
            tx_pts, _ = _transform_points_list(pts, from_epsg, to_epsg)
            for i, (tx, ty, tz) in enumerate(tx_pts):
                if "x" in vertices[i]:
                    vertices[i]["x"] = tx
                    vertices[i]["y"] = ty
                    vertices[i]["z"] = tz
                else:
                    vertices[i]["easting"] = tx
                    vertices[i]["northing"] = ty
                    vertices[i]["elevation"] = tz
    
    return transformed_data
