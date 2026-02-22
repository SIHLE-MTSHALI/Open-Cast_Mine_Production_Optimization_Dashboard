"""
MineOpt Pro Enterprise API

Main FastAPI application entry point.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import (
    config_router, 
    calendar_router, 
    schedule_router, 
    stockpile_router, 
    reporting_router, 
    optimization_router, 
    integration_router, 
    auth_router,
    quality_router,
    staged_stockpile_router,
    wash_table_router,
    security_router,
    cp_solver_router,
    flow_router,
    websocket_router,
    reports_router,
    file_format_router,
    borehole_router,
    block_model_router,
    surface_router,
    crs_router,
    cad_string_router,
    surface_tools_router,
    annotation_router,
    raster_router,
    # New feature routers
    fleet_router,
    drill_blast_router,
    operations_router,
    monitoring_router,
    surface_history_router,
    analytics_router,
    # Additional routers
    geology_router,
    settings_router,
    resources_router,
    csv_export_router,
    planning_horizon_router,
    precedence_router,
    demand_router,
    health_router
)
from .database import engine, Base


# Import all domain models to register them with SQLAlchemy
from .domain.models_core import User, Role, Site
from .domain.models_calendar import Calendar, Period
from .domain.models_resource import (
    MaterialType, QualityField, Activity, ActivityArea, 
    Resource, ResourcePeriodParameters
)
from .domain.models_flow import (
    FlowNetwork, FlowNode, FlowArc, ArcQualityObjective,
    TransportTimeModel, StockpileConfig, WashPlantConfig
)
from .domain.models_parcel import Parcel, ParcelMovement
from .domain.models_wash_table import WashTable, WashTableRow, WashPlantOperatingPoint
from .domain.models_staged_stockpile import (
    StagedStockpileConfig, BuildSpec, StagedPileState, StagedPileTransaction
)
from .domain.models_scheduling import ScheduleVersion, Task
from .domain.models_schedule_results import (
    ScheduleRunRequest, FlowResult, InventoryBalance, 
    DecisionExplanation, ObjectiveProfile
)
from .domain.models_borehole import (
    BoreholeCollar, BoreholeSurvey, BoreholeInterval,
    BoreholeAssay, Borehole3DTrace
)
from .domain.models_block_model import (
    BlockModelDefinition, Block, BlockModelRun
)
from .domain.models_surface import (
    Surface, SurfaceProperty, CADString, CADAnnotation
)

# Import new feature domain models
from .domain.models_fleet import (
    Equipment, GPSReading, Geofence, GeofenceViolation,
    HaulCycle, MaintenanceRecord, ComponentLife
)
from .domain.models_drill_blast import (
    BlastPattern, DrillHole, BlastEvent, FragmentationModel
)
from .domain.models_material_shift import (
    LoadTicket, MaterialMovementSummary, Shift, ShiftHandover, 
    ShiftIncident, ReconciliationPeriod
)
from .domain.models_geotech_safety import (
    GeotechDomain, SlopeMonitoringPrism, PrismReading,
    MonitoringBore, WaterLevelReading, DustMonitor, DustReading,
    RehabilitationArea, HazardZone, HazardZoneEntry,
    FatigueEvent, OperatorFatigueScore
)
from .domain.models_surface_history import (
    SurfaceVersion, SurfaceComparison, ExcavationProgress
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events for the application."""
    # Run database migrations via Alembic (preferred for production/dev)
    # Falls back to Base.metadata.create_all for test environments
    _run_database_setup()
    
    # Auto-seed comprehensive demo data if Equipment table is empty
    from .database import SessionLocal
    db = SessionLocal()
    try:
        equipment_count = db.query(Equipment).count()
        if equipment_count == 0:
            print("No equipment found - seeding comprehensive demo data...")
            from .services import comprehensive_seed_service
            result = comprehensive_seed_service.seed_all(db)
            print(f"Seeded: {result.get('sites_created', 0)} sites, {result.get('equipment_created', 0)} equipment")
    except Exception as e:
        print(f"Auto-seed skipped: {e}")
    finally:
        db.close()
    
    yield
    # Cleanup on shutdown (if needed)


def _run_database_setup():
    """Run Alembic migrations programmatically.
    
    Attempts to run 'alembic upgrade head' to apply all pending migrations.
    Falls back to Base.metadata.create_all() if Alembic config is not found
    (e.g., in test environments or first-time setup before migrations exist).
    """
    import os

    # Locate alembic.ini relative to this file (backend/app/main.py -> backend/alembic.ini)
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    alembic_ini = os.path.join(backend_dir, "alembic.ini")

    if os.path.exists(alembic_ini):
        try:
            from alembic.config import Config
            from alembic import command

            alembic_cfg = Config(alembic_ini)
            # Ensure script_location is absolute so it works from any cwd
            alembic_cfg.set_main_option(
                "script_location",
                os.path.join(backend_dir, "migrations")
            )
            command.upgrade(alembic_cfg, "head")
            print(f"Database migrations applied (Alembic). {len(Base.metadata.tables)} tables registered.")
        except Exception as e:
            print(f"Alembic migration failed ({e}), falling back to create_all...")
            Base.metadata.create_all(bind=engine)
            print(f"Database initialized with {len(Base.metadata.tables)} tables (create_all fallback)")
    else:
        # No alembic.ini found - use create_all (test environments, CI)
        Base.metadata.create_all(bind=engine)
        print(f"Database initialized with {len(Base.metadata.tables)} tables (no alembic.ini)")


app = FastAPI(
    title="MineOpt Pro Enterprise API",
    description="Enterprise coal mine production scheduling and optimization system",
    version="2.0.0-Enterprise",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174", 
        "http://localhost:5175",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(config_router.router)
app.include_router(calendar_router.router)
app.include_router(schedule_router.router)
app.include_router(optimization_router.router)
app.include_router(stockpile_router.router)
app.include_router(reporting_router.router)
app.include_router(integration_router.router)
app.include_router(auth_router.router)
app.include_router(quality_router.router)
app.include_router(staged_stockpile_router.router)
app.include_router(wash_table_router.router)
app.include_router(security_router.router)
app.include_router(cp_solver_router.router)
app.include_router(flow_router.router)
app.include_router(websocket_router.router)
app.include_router(reports_router.router)
app.include_router(reports_router.products_router)
app.include_router(file_format_router.router)
app.include_router(borehole_router.router)
app.include_router(block_model_router.router)
app.include_router(surface_router.router)
app.include_router(crs_router.router)
app.include_router(cad_string_router.router)
app.include_router(surface_tools_router.router)
app.include_router(annotation_router.router)
app.include_router(raster_router.router)

# New feature routers
app.include_router(fleet_router.router)
app.include_router(drill_blast_router.router)
app.include_router(operations_router.router)
app.include_router(monitoring_router.router)
app.include_router(surface_history_router.router)
app.include_router(analytics_router.router)

# Additional routers
app.include_router(geology_router.router)
app.include_router(settings_router.router)
app.include_router(resources_router.router)
app.include_router(csv_export_router.router)
app.include_router(planning_horizon_router.router)
app.include_router(precedence_router.router)
app.include_router(demand_router.router)
app.include_router(health_router.router)


@app.get("/")
def root_check():
    """API root endpoint."""
    return {
        "status": "healthy",
        "message": "MineOpt Pro Server Running",
        "version": "2.0.0-Enterprise",
        "tables_registered": len(Base.metadata.tables)
    }

