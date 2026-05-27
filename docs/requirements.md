# Open-Cast Mine Production Optimization Dashboard Requirements

Last reviewed: 2026-05-27

This document summarizes the current product and engineering requirements reflected by the codebase. It is not a promise that every workflow is production-hardened; it is a practical requirements map for contributors and users.

## Product Goal

Provide an open-source application and API for open-cast mine planning workflows, including production scheduling, material flow, quality, geology/spatial data, fleet records, drill/blast records, operations, monitoring, reporting, and integrations.

## Primary User Goals

| User type | Needs supported by the codebase |
| --- | --- |
| Mine planner | Manage sites, activity areas, resources, schedules, schedule versions, Gantt tasks, optimization runs, diagnostics, and planning horizons. |
| Production/operations user | Work with shifts, load tickets, dump updates, material movement, handovers, incidents, and operational summaries. |
| Fleet user | Store equipment, GPS readings, positions, trails, geofences, haul cycles, maintenance, and health summaries. |
| Geology/spatial user | Work with boreholes, block models, surfaces, CRS transforms, CAD strings, annotations, raster/DEM data, and spatial tools. |
| Quality/process user | Work with quality fields, product specs, blending, quality constraints, wash tables, wash plant processing, and simulations. |
| Monitoring user | Record and inspect slope, bore, dust, hazard, and fatigue-related data. |
| Developer/contributor | Run and extend a FastAPI + React codebase with tests, sample data, Docker setup, and generated API docs. |

## Functional Requirements

### Site and Configuration

The app should support:

- listing mine sites
- selecting an active site in the frontend
- listing resources, material types, activity areas, and network nodes
- storing site settings
- seeding working data for local use and testing

Current implementation areas:

- `backend/app/routers/config_router.py`
- `frontend/src/context/SiteContext.jsx`
- `frontend/src/pages/SeedDataPage.jsx`

### Authentication and Sessions

The app should support:

- user registration
- token login
- token refresh
- logout
- active session listing
- current-user lookup
- a local bootstrap admin flow for development

Current implementation areas:

- `backend/app/routers/auth_router.py`
- `backend/app/services/auth_service.py`
- `backend/app/services/security.py`
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/hooks/useAuth.js`

### Scheduling and Optimization

The app should support:

- schedule versions
- schedule tasks
- scenario forking
- schedule publishing
- schedule run status
- fast/full scheduling actions
- optimization runs
- diagnostics and explanations
- Gantt-style frontend interaction

Current implementation areas:

- `backend/app/routers/schedule_router.py`
- `backend/app/routers/optimization_router.py`
- `backend/app/routers/cp_solver_router.py`
- `backend/app/services/schedule_engine.py`
- `backend/app/services/optimization_service.py`
- `backend/app/services/lp_allocator.py`
- `backend/app/services/cp_solver.py`
- `frontend/src/components/scheduler/`

### Material Flow, Stockpiles, and Wash Plants

The app should support:

- flow network and node data
- stockpile state workflows
- staged stockpile accept/reclaim flows
- wash table management
- wash plant configuration and processing
- flow and inventory export

Current implementation areas:

- `backend/app/domain/models_flow.py`
- `backend/app/domain/models_staged_stockpile.py`
- `backend/app/routers/flow_router.py`
- `backend/app/routers/stockpile_router.py`
- `backend/app/routers/staged_stockpile_router.py`
- `backend/app/routers/wash_table_router.py`
- `frontend/src/components/flow/`
- `frontend/src/components/stockpile/`
- `frontend/src/components/washplant/`

### Quality Management

The app should support:

- quality fields
- product/specification data
- thermal-coal default fields
- blend calculations
- quality constraint checks
- quality basis conversion
- simulation endpoints
- washability-related logic

Current implementation areas:

- `backend/app/routers/quality_router.py`
- `backend/app/services/quality_service.py`
- `backend/app/services/quality_simulator.py`
- `backend/app/services/monte_carlo_quality.py`
- `backend/app/services/washability_engine.py`
- `frontend/src/components/quality/`

### Geology, Spatial, CAD, and Raster

The app should support:

- borehole import and query workflows
- block model creation and block visualization data
- surface creation, query, contour, volume, and validation workflows
- CRS lookup, detection, validation, and transformation
- CAD string editing and export
- annotation creation and measurement-style annotations
- raster/DEM metadata, sampling, TIN, tiles, overview, and hillshade workflows
- DXF, Surpac, and tabular file parsing/export workflows

Current implementation areas:

- `backend/app/routers/borehole_router.py`
- `backend/app/routers/block_model_router.py`
- `backend/app/routers/surface_router.py`
- `backend/app/routers/surface_history_router.py`
- `backend/app/routers/crs_router.py`
- `backend/app/routers/cad_string_router.py`
- `backend/app/routers/annotation_router.py`
- `backend/app/routers/raster_router.py`
- `backend/app/routers/surface_tools_router.py`
- `backend/app/routers/file_format_router.py`
- `frontend/src/components/spatial/`
- `frontend/src/components/cad/`
- `frontend/src/components/geology/`
- `frontend/src/components/raster/`
- `frontend/src/components/viewer3d/`

### Fleet and Haulage

The app should support:

- equipment records
- equipment status updates
- GPS readings
- latest positions and equipment trails
- geofences
- haul cycle detection
- cycle statistics
- maintenance records
- pending maintenance
- equipment health summaries

Current implementation areas:

- `backend/app/routers/fleet_router.py`
- `backend/app/domain/models_fleet.py`
- `backend/app/services/fleet_service.py`
- `backend/app/services/haulage_optimizer.py`
- `frontend/src/components/fleet/`
- `frontend/src/components/haulage/`

### Drill and Blast

The app should support:

- blast pattern records
- drill hole records
- blast events
- fragmentation model records
- drill/blast frontend workflows

Current implementation areas:

- `backend/app/routers/drill_blast_router.py`
- `backend/app/domain/models_drill_blast.py`
- `backend/app/services/drill_blast_service.py`
- `frontend/src/pages/DrillBlastDashboard.jsx`
- `frontend/src/components/drillblast/`
- `frontend/src/components/drill-blast/`

### Operations

The app should support:

- load tickets
- ticket dump updates
- shift creation and ending
- active shift lookup
- shift summaries
- handovers and acknowledgements
- incidents
- material flow summaries

Current implementation areas:

- `backend/app/routers/operations_router.py`
- `backend/app/domain/models_material_shift.py`
- `frontend/src/pages/OperationsDashboard.jsx`
- `frontend/src/components/operations/`

### Monitoring

The app should support:

- slope monitoring prisms and readings
- slope alerts
- monitoring bores and readings
- dust monitors and readings
- dust exceedances
- hazard zones
- fatigue events
- operator fatigue scores

Current implementation areas:

- `backend/app/routers/monitoring_router.py`
- `backend/app/domain/models_geotech_safety.py`
- `backend/app/services/geotech_safety_service.py`
- `frontend/src/pages/MonitoringDashboard.jsx`
- `frontend/src/components/monitoring/`
- `frontend/src/components/geotech/`
- `frontend/src/components/environmental/`

### Reporting and Integration

The app should support:

- dashboard reporting data
- report generation
- report packs
- JSON, CSV, HTML, and PDF report exports where dependencies support them
- CSV templates and exports
- survey/lab/fleet/maintenance import routes
- dispatch targets
- BI extracts
- connectors
- webhooks
- external ID mappings
- delayed lab-result imports

Current implementation areas:

- `backend/app/routers/reporting_router.py`
- `backend/app/routers/reports_router.py`
- `backend/app/routers/csv_export_router.py`
- `backend/app/routers/integration_router.py`
- `backend/app/services/report_generator_service.py`
- `backend/app/services/report_pack.py`
- `backend/app/services/integration_service.py`
- `backend/app/services/integration_hub.py`
- `frontend/src/components/reporting/`
- `frontend/src/components/integration/`
- `frontend/src/components/export/`

## Non-Functional Requirements

### Local Usability

The project should remain runnable by a new contributor with:

- Python 3.10+
- Node.js 18+
- npm
- backend requirements
- frontend package lock
- optional Docker Compose stack

### Documentation

Documentation should:

- describe actual current capabilities
- avoid marketing-only or aspirational claims
- point users to generated API docs for exact schemas
- distinguish sample data from the purpose of the application
- document setup, tests, and operational cautions

### Testing

The project should keep tests for:

- backend routers
- backend services
- parsers
- domain models
- spatial tools
- root import compatibility
- frontend API/client behavior
- frontend navigation and core components

### Security

Security-sensitive areas should be reviewed before shared or production-like deployment:

- authentication
- authorization
- sessions
- secrets
- CORS
- file upload and parser endpoints
- logging
- integration endpoints
- webhook handling
- credentials and connector storage

### Data Integrity

Data workflows should be validated around:

- coordinate reference systems
- imported survey/lab/fleet records
- schedule/task assumptions
- quality field names and units
- stockpile and flow balances
- reporting calculations
- optimizer constraints and objectives

## Known Follow-Up Areas

These are useful next improvements rather than requirements already fully solved:

- stronger authorization coverage across route groups
- CI workflow documentation and enforcement
- production migration playbook
- fuller API examples for each module
- end-to-end browser tests
- improved user-facing validation messages
- clearer import file examples
- stronger report/PDF dependency setup notes
- real external-system connector examples
- documented deployment hardening checklist
