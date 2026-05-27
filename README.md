# Open-Cast Mine Production Optimization Dashboard

Last reviewed: 2026-05-27

An open-source, full-stack application for open-cast mine planning, production scheduling, material movement, fleet records, geology data, quality workflows, monitoring data, reporting, and operational dashboards.

The project combines a FastAPI backend, SQLAlchemy domain models, optimization/simulation services, and a React/Vite frontend. It is designed as a working codebase that developers, students, mine-planning teams, and open-source contributors can run locally, inspect, extend, test, and adapt for mining software workflows.

Sample and seeded data are included so the existing features can be exercised without needing a real mine database on day one. They are not the purpose of the application; they are there to help users explore and validate the modules that already exist.

## Table of Contents

- [What This Project Does](#what-this-project-does)
- [Who This Is For](#who-this-is-for)
- [Core Workflows](#core-workflows)
- [Feature Areas](#feature-areas)
- [Application Screens](#application-screens)
- [Backend API Coverage](#backend-api-coverage)
- [Architecture](#architecture)
- [Repository Layout](#repository-layout)
- [Quick Start](#quick-start)
- [Docker Setup](#docker-setup)
- [Configuration](#configuration)
- [Working With Data](#working-with-data)
- [Testing](#testing)
- [Development Guide](#development-guide)
- [Troubleshooting](#troubleshooting)
- [Contribution Guide](#contribution-guide)
- [Operational Notes](#operational-notes)
- [License Status](#license-status)

## What This Project Does

This codebase provides a web application and API for modelling and managing open-cast mine production planning data.

At a practical level, the app lets you:

- create and load mine-site data
- seed a complete working dataset for exploration and testing
- register/login users and work behind protected frontend routes
- view site-level operational KPIs
- manage planning schedules, schedule versions, and tasks
- run backend optimization endpoints against schedule data
- inspect Gantt-style production plans
- model resources, activity areas, calendars, flow networks, stockpiles, wash plants, and product specs
- work with quality fields, blending calculations, washability tables, and quality simulation endpoints
- manage boreholes, block models, surfaces, coordinate systems, CAD strings, annotations, and raster/DEM operations
- store equipment, GPS readings, geofences, haul cycles, maintenance records, and equipment-health data
- record drill patterns, holes, blast events, shift tickets, handovers, incidents, and material movement summaries
- capture monitoring data for slope prisms, monitoring bores, dust monitors, hazard zones, and fatigue events
- generate dashboard/reporting responses and export selected data to CSV, JSON, HTML, or PDF where supported
- use the frontend as a mine-planning workspace and the backend as a documented API platform

The repository also contains an older Dash/Plotly/SimPy simulator under `src/`. That path is separate from the main FastAPI + React app and can be useful for experimenting with simulation and genetic-algorithm optimization concepts.

## Who This Is For

| Audience | How the codebase is useful |
| --- | --- |
| Mine-planning software developers | Study or extend a domain-rich FastAPI/React application with scheduling, fleet, geology, reporting, and quality modules. |
| Mining engineers and planners with coding interest | Explore how mine entities, schedules, activity areas, stockpiles, equipment, and monitoring data can be represented in software. |
| Students and researchers | Use the sample data and APIs to test planning, optimization, simulation, visualization, and reporting ideas. |
| Open-source contributors | Improve tests, data models, UI workflows, API consistency, documentation, security hardening, and deployment reliability. |
| Product engineers | Use the app structure as a starting point for operational dashboards, domain workflows, and modular API/frontend design. |

## Core Workflows

### 1. Set Up a Mine Site

The configuration layer supports site and resource data through `/config/*` endpoints and the frontend site context.

You can work with:

- mine sites
- material types
- resources/equipment
- activity areas
- network nodes
- wash plant configuration
- geology blocks
- site settings

The frontend automatically selects the first returned site and uses it across the protected app screens.

### 2. Load or Seed Working Data

The project includes backend seed endpoints and a frontend seed page. These help you populate enough data to explore the application without creating every domain object manually.

Available seeding paths include:

- `POST /config/seed-demo-data`
- `POST /config/seed-comprehensive-demo`
- `/app/seed-data` in the web app
- backend startup auto-seeding when the equipment table is empty

Seeded data can include mine sites, resources, equipment, GPS readings, haul cycles, blast patterns, shifts, load tickets, geotechnical readings, and environmental readings.

### 3. Plan and Manage Schedules

The scheduling layer supports schedule versions, tasks, scenario forking, publish actions, diagnostics, and run endpoints.

Related capabilities:

- create schedule versions
- list versions by site
- fork a schedule version into a new scenario
- create, update, delete, and fetch schedule tasks
- run fast-pass and full-pass schedule operations
- publish versions
- fetch run status and diagnostics
- inspect tasks in the frontend Gantt workspace

Important files:

- `backend/app/routers/schedule_router.py`
- `backend/app/routers/optimization_router.py`
- `backend/app/routers/cp_solver_router.py`
- `backend/app/services/schedule_engine.py`
- `backend/app/services/optimization_service.py`
- `backend/app/services/lp_allocator.py`
- `backend/app/services/cp_solver.py`
- `frontend/src/pages/PlannerWorkspace.jsx`
- `frontend/src/components/scheduler/`

### 4. Work With Material Flow and Stockpiles

The app includes domain models and services for flow networks, flow nodes, flow arcs, stockpiles, staged stockpiles, parcels, inventory balances, and wash plant processing.

Related capabilities:

- define network nodes and arcs
- validate material routing concepts
- model staged stockpile accept/reclaim flows
- process wash plant tables and cutpoints
- calculate blend-related quality values
- export flow and inventory data through CSV endpoints

Important files:

- `backend/app/domain/models_flow.py`
- `backend/app/domain/models_staged_stockpile.py`
- `backend/app/domain/models_parcel.py`
- `backend/app/routers/flow_router.py`
- `backend/app/routers/stockpile_router.py`
- `backend/app/routers/staged_stockpile_router.py`
- `backend/app/routers/wash_table_router.py`
- `frontend/src/components/flow/`
- `frontend/src/components/stockpile/`
- `frontend/src/components/washplant/`

### 5. Manage Quality and Product Specifications

The quality module supports quality fields, product specs, thermal-coal defaults, blending calculations, basis conversion, constraint checks, penalty-related metadata, and simulation endpoints.

Related capabilities:

- create and update quality fields
- seed default thermal-coal quality fields
- calculate blend quality
- check quality constraints
- convert quality basis values
- run quality simulation endpoints
- work with product specifications in the frontend

Important files:

- `backend/app/routers/quality_router.py`
- `backend/app/services/quality_service.py`
- `backend/app/services/quality_simulator.py`
- `backend/app/services/monte_carlo_quality.py`
- `backend/app/services/washability_engine.py`
- `frontend/src/components/quality/`
- `frontend/src/components/products/ProductSpecs.jsx`

### 6. Manage Geology, Surfaces, CAD, and Spatial Data

The codebase includes APIs and UI components for boreholes, block models, surfaces, CRS transforms, CAD strings, raster/DEM operations, surface tools, annotations, and 3D visualization.

Related capabilities:

- import borehole data
- inspect borehole collars, traces, assays, and summaries
- create block models and estimate block values
- create surfaces from points, files, grids, contours, or breaklines
- query surfaces and calculate volumes
- manage CAD strings and vertices
- export selected CAD/string data
- transform coordinates between CRS systems
- sample raster/DEM data
- view spatial data in React/Three.js components

Important files:

- `backend/app/routers/borehole_router.py`
- `backend/app/routers/block_model_router.py`
- `backend/app/routers/surface_router.py`
- `backend/app/routers/crs_router.py`
- `backend/app/routers/cad_string_router.py`
- `backend/app/routers/raster_router.py`
- `backend/app/routers/annotation_router.py`
- `backend/app/services/kriging_service.py`
- `backend/app/services/surface_service.py`
- `backend/app/services/dxf_service.py`
- `frontend/src/components/spatial/`
- `frontend/src/components/cad/`
- `frontend/src/components/geology/`
- `frontend/src/components/raster/`
- `frontend/src/components/viewer3d/`

### 7. Track Fleet and Haulage Records

The fleet module stores equipment and operational movement records. It supports equipment records, status updates, GPS readings, current positions, trails, geofences, cycle detection, maintenance records, pending maintenance, and health summaries.

Related capabilities:

- create equipment records
- update equipment status
- store GPS readings
- fetch latest site positions
- fetch equipment trails
- manage geofences
- detect haul cycles
- view cycle statistics
- create and complete maintenance records
- fetch equipment health summaries

Important files:

- `backend/app/routers/fleet_router.py`
- `backend/app/domain/models_fleet.py`
- `backend/app/services/fleet_service.py`
- `backend/app/services/haulage_optimizer.py`
- `frontend/src/pages/FleetDashboard.jsx`
- `frontend/src/components/fleet/`
- `frontend/src/components/haulage/`

### 8. Record Drill, Blast, and Shift Operations

The drill/blast and operations modules support planning and shift execution records.

Related capabilities:

- define blast patterns
- store drill holes and blast events
- work with fragmentation model records
- create load tickets and dump ticket updates
- create shifts and end shifts
- fetch active shift and shift summaries
- create handovers and acknowledge them
- create and list incidents
- summarize material movement

Important files:

- `backend/app/routers/drill_blast_router.py`
- `backend/app/routers/operations_router.py`
- `backend/app/domain/models_drill_blast.py`
- `backend/app/domain/models_material_shift.py`
- `frontend/src/pages/DrillBlastDashboard.jsx`
- `frontend/src/pages/OperationsDashboard.jsx`
- `frontend/src/components/drillblast/`
- `frontend/src/components/drill-blast/`
- `frontend/src/components/operations/`

### 9. Capture Monitoring and Safety-Adjacent Data

The monitoring module stores geotechnical and environmental monitoring data. It can be used to build dashboards, alerts, and analysis workflows around recorded data.

Related capabilities:

- create slope monitoring prisms
- record prism readings
- fetch slope alerts
- create monitoring bores and bore readings
- create dust monitors and dust readings
- fetch dust exceedances
- create hazard zones
- record fatigue events
- fetch operator fatigue scores

Important files:

- `backend/app/routers/monitoring_router.py`
- `backend/app/domain/models_geotech_safety.py`
- `backend/app/services/geotech_safety_service.py`
- `frontend/src/pages/MonitoringDashboard.jsx`
- `frontend/src/components/monitoring/`
- `frontend/src/components/geotech/`
- `frontend/src/components/environmental/`

### 10. Report, Export, and Integrate

The reporting and integration code gives the app a base for operational outputs and external-system connections.

Related capabilities:

- fetch dashboard summaries
- generate report responses
- create report packs
- export JSON, CSV, HTML, and PDF report formats where dependencies support them
- export flow, inventory, decisions, surfaces, and strings to CSV
- import survey actuals, lab quality, fleet actual tonnes, equipment hours, cycle times, geometry, stockpile volumes, and maintenance windows
- publish dispatch targets and BI extracts
- manage connectors, webhooks, external ID mappings, and lab-result pending queues

Important files:

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

## Feature Areas

| Area | Implemented codebase coverage |
| --- | --- |
| Authentication | Registration, token login, logout, token refresh, sessions, current-user endpoint, demo admin bootstrap. |
| Site setup | Sites, resources, material types, activity areas, network nodes, settings, wash plant site config. |
| Scheduling | Schedule versions, tasks, schedule runs, scenario forks, publishing, diagnostics, Gantt UI, schedule controls. |
| Optimization | Fast/full optimization routes, CP solver routes, LP allocation services, schedule explanation/diagnostic routes. |
| Quality | Quality fields, blend calculations, quality constraints, basis conversion, thermal-coal defaults, simulations, product specs. |
| Stockpiles and flow | Stockpile/staged-stockpile APIs, flow network models, wash plant tables, parcels, inventory balances. |
| Geology and spatial | Boreholes, block models, surfaces, CRS, CAD strings, annotations, raster/DEM, surface tools, 3D components. |
| Fleet | Equipment, GPS, positions, geofences, haul cycles, maintenance, health views, route/haulage components. |
| Drill/blast | Blast patterns, holes, blast events, fragmentation records, drill/blast dashboards and components. |
| Operations | Tickets, shifts, handovers, incidents, shift summaries, material movement summaries. |
| Monitoring | Slope prisms, monitoring bores, dust monitors, hazard zones, fatigue events, alert/exceedance endpoints. |
| Reporting | Dashboard reports, report generation, report packs, JSON/CSV/HTML/PDF exports, CSV templates. |
| Integrations | Survey/lab/fleet/maintenance imports, dispatch targets, BI extracts, connectors, webhooks, external ID mapping. |
| UI foundation | Protected routes, app layout, site context, toast context, API client, domain components, error boundaries, loading states. |

## Application Screens

The frontend is a React 19 + Vite app. Main routes are defined in `frontend/src/App.jsx`.

| Route | Purpose |
| --- | --- |
| `/` | Public landing page. |
| `/login` | Login screen. |
| `/register` | Registration mode using the login page. |
| `/app/dashboard` | Site dashboard with KPIs, alerts, active schedule summary, stockpiles, and quick actions. |
| `/app/planner` | Main planner workspace with scheduling, spatial, reporting, flow, quality, resources, geology, fleet, operations, import, and integration tabs. |
| `/app/fleet` | Fleet-focused dashboard. |
| `/app/drill-blast` | Drill and blast dashboard. |
| `/app/operations` | Shift and production operations dashboard. |
| `/app/monitoring` | Monitoring dashboard for geotechnical/environmental data. |
| `/app/seed-data` | Seed comprehensive working data into the backend database. |

The frontend API client lives in `frontend/src/services/api.js`. It centralizes Axios configuration, auth-token injection, retry handling, simple GET caching, and domain-specific API objects.

## Backend API Coverage

Run the backend and open:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/health`

Main router groups:

| Prefix | Router file |
| --- | --- |
| `/auth` | `backend/app/routers/auth_router.py` |
| `/health` | `backend/app/routers/health_router.py` |
| `/config` | `backend/app/routers/config_router.py` |
| `/calendar` | `backend/app/routers/calendar_router.py` |
| `/schedule` | `backend/app/routers/schedule_router.py` |
| `/optimization` | `backend/app/routers/optimization_router.py` |
| `/cp-solver` | `backend/app/routers/cp_solver_router.py` |
| `/quality` | `backend/app/routers/quality_router.py` |
| `/stockpiles` and `/staged-stockpiles` | `backend/app/routers/stockpile_router.py`, `backend/app/routers/staged_stockpile_router.py` |
| `/wash-plants` | `backend/app/routers/wash_table_router.py` |
| `/boreholes` | `backend/app/routers/borehole_router.py` |
| `/blockmodels` | `backend/app/routers/block_model_router.py` |
| `/surfaces` | `backend/app/routers/surface_router.py`, `backend/app/routers/surface_history_router.py` |
| `/crs` | `backend/app/routers/crs_router.py` |
| `/strings` | `backend/app/routers/cad_string_router.py` |
| `/annotations` | `backend/app/routers/annotation_router.py` |
| `/raster` | `backend/app/routers/raster_router.py` |
| `/surface-tools` | `backend/app/routers/surface_tools_router.py` |
| `/fleet` | `backend/app/routers/fleet_router.py` |
| `/drill-blast` | `backend/app/routers/drill_blast_router.py` |
| `/operations` | `backend/app/routers/operations_router.py` |
| `/monitoring` | `backend/app/routers/monitoring_router.py` |
| `/reporting`, `/reports`, `/csv` | reporting/export routers |
| `/integration` | `backend/app/routers/integration_router.py` |
| `/ws` | `backend/app/routers/websocket_router.py` |

The generated OpenAPI docs are the best source for exact request bodies and response models.

## Architecture

```text
Browser
  |
  | React/Vite frontend
  | - routes/pages
  | - domain components
  | - SiteContext and ToastContext
  | - Axios API client
  v
FastAPI backend
  |
  | Routers
  | - request validation
  | - HTTP endpoints
  | - dependency injection
  v
Services
  |
  | Domain logic
  | - scheduling
  | - optimization
  | - quality
  | - geology/spatial
  | - fleet
  | - reports
  v
SQLAlchemy models
  |
  | SQLite locally or PostgreSQL through DATABASE_URL/Docker
  v
Database
```

### Backend structure

- `backend/app/main.py` creates the FastAPI app, runs database setup, auto-seeds comprehensive data when appropriate, registers CORS, and includes routers.
- `backend/app/database.py` selects PostgreSQL when `DATABASE_URL` is set and SQLite otherwise.
- `backend/app/domain/` contains SQLAlchemy models grouped by mining domain.
- `backend/app/routers/` exposes API endpoints.
- `backend/app/services/` contains reusable domain and integration logic.
- `backend/migrations/` contains Alembic migration files.
- `backend/tests/` contains pytest coverage for APIs, services, parsers, domain models, spatial tools, performance, and integration paths.

### Frontend structure

- `frontend/src/App.jsx` defines routes and protected route behavior.
- `frontend/src/pages/` contains route-level screens.
- `frontend/src/components/` contains domain components.
- `frontend/src/context/` contains shared site/toast state.
- `frontend/src/hooks/` contains reusable React hooks.
- `frontend/src/services/api.js` is the API client.
- `frontend/src/styles/design-system.css` and `frontend/src/index.css` define styling foundations.

## Repository Layout

```text
.
|-- app/                         # Root compatibility package for app.main imports
|-- backend/
|   |-- app/
|   |   |-- domain/              # SQLAlchemy domain models
|   |   |-- routers/             # FastAPI routers
|   |   |-- schemas/             # Pydantic schemas
|   |   |-- services/            # Business/domain services
|   |   |-- database.py          # SQLAlchemy engine/session setup
|   |   `-- main.py              # FastAPI app entrypoint
|   |-- migrations/              # Alembic migrations
|   |-- tests/                   # Backend pytest suite
|   |-- requirements.txt
|   `-- Dockerfile
|-- frontend/
|   |-- src/
|   |   |-- components/          # React components by domain
|   |   |-- context/             # Site and toast providers
|   |   |-- hooks/               # Custom hooks
|   |   |-- pages/               # Route-level pages
|   |   |-- services/api.js      # Axios API layer
|   |   `-- styles/
|   |-- package.json
|   |-- package-lock.json
|   `-- Dockerfile
|-- src/                         # Legacy Dash/SimPy simulator and optimizer
|-- data/                        # Sample CSV/data files
|-- docs/                        # Guides, API docs, requirements, plans, reviews
|-- tests/                       # Root-level compatibility tests
|-- docker-compose.yml
|-- requirements.txt             # Legacy Dash/SimPy requirements
`-- verify_full_flow.py          # Manual full-flow backend smoke script
```

## Quick Start

### Prerequisites

Install:

- Git
- Python 3.10+
- Node.js 18+
- npm

Optional but useful:

- Docker Desktop or Docker Engine
- PostgreSQL

### Clone the repository

```bash
git clone <repository-url>
cd Open-Cast_Mine_Production_Optimization_Dashboard
```

### Start the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Windows PowerShell activation:

```powershell
.\.venv\Scripts\Activate.ps1
```

Expected backend URLs:

- API root: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- Health: `http://127.0.0.1:8000/health`

By default, local development uses SQLite at:

```text
backend/mineopt_pro.db
```

You can also run the backend from the repository root:

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The root `app/` package maps `app.main` to `backend/app/main.py`.

### Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Expected frontend URL:

```text
http://localhost:5173
```

Vite proxies `/api/*` requests to the backend on port `8000`.

### Log in

You can register a user through the UI, or use the local bootstrap account:

```text
username: admin
password: admin
```

The backend creates this user on first successful `admin` / `admin` login if it does not already exist.

### Seed data

Use the web app:

```text
http://localhost:5173/app/seed-data
```

or call the API:

```bash
curl -X POST http://localhost:8000/config/seed-comprehensive-demo
```

Then open:

```text
http://localhost:5173/app/dashboard
http://localhost:5173/app/planner
```

## Docker Setup

The repository includes Dockerfiles for backend/frontend and a Compose file for backend, frontend, and PostgreSQL.

```bash
cp .env.example .env
docker compose up --build
```

Then open:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

Docker Compose services:

| Service | Purpose |
| --- | --- |
| `postgres` | PostgreSQL 15 database with persistent Docker volume. |
| `backend` | FastAPI app served by Uvicorn. |
| `frontend` | Vite build served by Nginx, with `/api/` and `/ws/` proxying. |

## Configuration

Root `.env.example`:

```text
POSTGRES_USER=mineopt
POSTGRES_PASSWORD=your-secure-password-here
POSTGRES_DB=mineopt_pro
SECRET_KEY=your-super-secret-jwt-key-here-change-this
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@mineopt.com
REDIS_URL=redis://redis:6379/0
```

Frontend `.env.example`:

```text
VITE_API_BASE_URL=http://localhost:8000
```

Configuration notes:

- If `DATABASE_URL` is set, the backend uses PostgreSQL.
- If `DATABASE_URL` is not set, the backend uses SQLite.
- The frontend defaults to `/api`, which works with the Vite proxy in development and the Nginx proxy in Docker.
- SMTP settings are only useful for report/email workflows that need email delivery.
- `REDIS_URL` is documented but Redis is not part of the current Compose stack.

## Working With Data

### Local SQLite

Local default:

```text
backend/mineopt_pro.db
```

This is convenient for development and quick testing.

### PostgreSQL

Use Docker Compose or set your own `DATABASE_URL`:

```text
postgresql://user:password@host:5432/database
```

### Migrations

On startup, `backend/app/main.py` attempts to run Alembic migrations. If migrations fail or are not available in a partial environment, the backend falls back to SQLAlchemy `create_all`.

For production-grade database evolution, use Alembic deliberately and review generated migrations before applying them.

### Data import and export

The codebase includes support for:

- DXF parsing/export routes
- Surpac/tabular parser routes
- borehole import
- raster/DEM sampling and transformations
- CSV exports for flow, inventory, decisions, surfaces, and strings
- integration imports for survey, lab, fleet, geometry, stockpile volumes, and maintenance windows
- external ID mappings
- BI extract configuration

Exact file formats and request schemas are documented in the generated FastAPI docs.

## Testing

### Backend

```bash
cd backend
pytest -q
```

Verbose:

```bash
cd backend
pytest -v
```

Target one test module:

```bash
cd backend
pytest -q tests/test_api_endpoints.py
```

### Root import compatibility

```bash
pytest -q tests/test_root_app_module_resolution.py
```

### Frontend

```bash
cd frontend
npm run lint
npm test -- --runInBand
npm run build
```

### Manual full-flow smoke check

Start the backend first:

```bash
python verify_full_flow.py
```

The script:

- logs in with the bootstrap admin account
- seeds demo data
- verifies flow network nodes and resources
- runs optimization
- fetches schedule tasks
- fetches a reporting dashboard

## Development Guide

### Backend development flow

1. Add or update SQLAlchemy models in `backend/app/domain/`.
2. Add service logic in `backend/app/services/`.
3. Add or update API routes in `backend/app/routers/`.
4. Register new routers in `backend/app/main.py`.
5. Add tests in `backend/tests/`.
6. Run focused tests, then the broader backend suite.

### Frontend development flow

1. Add API methods to `frontend/src/services/api.js`.
2. Add UI components under the relevant domain folder in `frontend/src/components/`.
3. Add route-level behavior in `frontend/src/pages/` when needed.
4. Use `SiteContext` for selected-site behavior.
5. Use `ToastContext` for user feedback.
6. Handle loading, empty, error, and partial-data states.
7. Run lint, tests, and build.

### Package manager rules

- Frontend uses `package-lock.json`, so use npm.
- Backend uses `requirements.txt`.
- Root `requirements.txt` belongs to the older Dash/SimPy path.
- Avoid mixing package managers unless the repository is intentionally migrated.

### Generated/local files to avoid committing

- `.venv/`, `venv/`
- `node_modules/`
- `frontend/dist/`
- `.pytest_cache/`
- coverage outputs
- local SQLite databases
- local `.env` files

## Troubleshooting

### Backend cannot import `app.main`

Run from `backend/`:

```bash
cd backend
python -m uvicorn app.main:app --reload
```

or from the repository root:

```bash
python -m uvicorn app.main:app --reload
```

The root `app/__init__.py` is there to support root-level imports.

### Frontend cannot reach backend

Check:

- backend is running on `http://localhost:8000`
- frontend is running on `http://localhost:5173`
- `frontend/vite.config.js` proxy is active
- requests use `/api` or the correct `VITE_API_BASE_URL`
- CORS includes the frontend origin

### Spatial/PDF dependencies fail to install

Dependencies such as Rasterio, PyProj, Shapely, and WeasyPrint can require native libraries depending on OS. If native install is painful, use Docker or WSL.

### Seed data repeats

The seed page adds data to the current database. If you want a clean local SQLite database, stop the backend, remove `backend/mineopt_pro.db`, restart, and seed again.

### Report PDF generation fails

PDF export depends on WeasyPrint and its system-level requirements. Confirm WeasyPrint works in your environment before debugging report code.

### Tests fail after changing models

Check:

- model imports in `backend/app/domain/__init__.py`
- migrations
- test database setup
- API response schemas
- frontend assumptions in `api.js`

## Contribution Guide

Good contributions are small, tested, and clear about the workflow they improve.

High-value contribution areas:

- stronger tests for routers and services
- more realistic sample datasets
- clearer migration discipline
- improved API schema consistency
- better frontend empty/error/loading states
- accessibility and keyboard navigation
- schedule optimization validation examples
- integration import/export examples
- Docker and CI improvements
- documentation that reflects current code
- security hardening for auth and authorization

Suggested pull request structure:

```text
## Summary
What changed.

## Why
Why the change was needed.

## Verification
Commands run and results.

## Risks
Known edge cases, migrations, or follow-up work.
```

Commit style:

```text
feat: add equipment status filter
fix: handle empty schedule version list
docs: improve setup instructions
test: cover quality blend validation
refactor: extract schedule diagnostics mapper
```

## Operational Notes

This repository contains substantial application code, but any real-world mining deployment needs project-specific validation.

Before using it with live operational data, review:

- authentication and authorization coverage
- database migrations and backup strategy
- integration contracts with real source systems
- coordinate reference systems and spatial assumptions
- optimizer constraints and objective functions
- data-quality rules for imported survey/lab/fleet records
- safety, environmental, and regulatory requirements
- logging of sensitive data
- file upload and parser security
- deployment, HTTPS, secrets, and monitoring

These notes are not meant to reduce the usefulness of the codebase. They are the checklist a serious user should expect for any mining operations platform.

## License Status

No standalone `LICENSE` file was found in the repository root during this review. Add a license file before distributing the project or accepting external contributions under a specific open-source license.

## Existing Documentation

Additional docs are available under `docs/`:

- `docs/USER_GUIDE.md`
- `docs/DEVELOPER_GUIDE.md`
- `docs/API_DOCUMENTATION.md`
- `docs/requirements.md`
- `docs/reviews/`
- `docs/plans/`

Some older docs may not match the current code as closely as this README. When in doubt, verify behavior against the source code, tests, and generated FastAPI docs.
