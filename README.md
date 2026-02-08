# MineOpt Pro

MineOpt Pro is a mine planning and operations workspace for open-cast mining teams.

It combines planning, scheduling, quality management, geospatial workflows, surface/CAD tooling, and operations dashboards in one product.

This README is intentionally written for **both**:

- non-technical users (planners, supervisors, operations users)
- technical users (developers, data engineers, DevOps)

If you can follow on-screen instructions and copy/paste commands, you can get it running.

---

## Table of contents

1. [What this product is](#what-this-product-is)
2. [Current state (honest status)](#current-state-honest-status)
3. [No-cost-first policy](#no-cost-first-policy)
4. [What you can do today](#what-you-can-do-today)
5. [Quick start for non-technical users (Docker)](#quick-start-for-non-technical-users-docker)
6. [Full local setup for technical users](#full-local-setup-for-technical-users)
7. [First-time onboarding walkthrough](#first-time-onboarding-walkthrough)
8. [Complete feature walkthrough (how to use each area)](#complete-feature-walkthrough-how-to-use-each-area)
9. [File format support and practical workflows](#file-format-support-and-practical-workflows)
10. [Coordinate systems and geospatial behavior](#coordinate-systems-and-geospatial-behavior)
11. [ECW support: what works and what to expect](#ecw-support-what-works-and-what-to-expect)
12. [Menu and route map](#menu-and-route-map)
13. [API usage and integration](#api-usage-and-integration)
14. [Testing and quality checks](#testing-and-quality-checks)
15. [Known limitations](#known-limitations)
16. [Future work roadmap](#future-work-roadmap)
17. [Troubleshooting](#troubleshooting)
18. [Project structure](#project-structure)
19. [Supporting documentation](#supporting-documentation)

---

## What this product is

MineOpt Pro is designed as a **long-to-short-range planning and operations execution platform**.

The target operating model is:

- plan work in time buckets (shift/day/horizon)
- plan work in space (areas/benches/strings/surfaces)
- route material through destinations (stockpile, plant, dump, etc.)
- manage quality constraints and blend outcomes
- track operational constraints and revisions

It is being built as a comprehensive system, not a thin demo.

---

## Current state (honest status)

As of **February 8, 2026**, the codebase has a broad feature foundation and an active UI/API workflow, but it is **not yet fully commercial-hard**.

What is strong right now:

- Wide backend domain coverage (planning, quality, flow, stockpiles, file formats, CRS, raster, surfaces, CAD strings, annotations, operations modules).
- Unified frontend app shell with authenticated routes and planner workspace tabs.
- Working seed-data flows for onboarding and testing.
- Core format tooling for DXF/STR/tabular and geospatial service endpoints.

What is still maturing:

- Some advanced modules are API-strong but still partially integrated into the planner UX.
- Some workflows need further polish to remove fallbacks and improve consistency.
- Commercial release governance (full hardening gates, release discipline, large-scale ops validation) is still in progress.

---

## No-cost-first policy

This project is built with a **no mandatory paid dependency** principle.

Baseline stack is open-source:

- FastAPI, SQLAlchemy, Python ecosystem
- React + Vite frontend
- Postgres
- pyproj, shapely, rasterio/GDAL (runtime-dependent), ezdxf, scipy

Potential optional cost areas to be aware of:

- ECW-related runtime licensing/driver constraints in some enterprise deployment models
- enterprise hosting/monitoring services
- commercial outbound email infrastructure at scale

The local development path does not require paid software.

---

## What you can do today

You can currently use MineOpt Pro to:

- run a multi-page mine operations UI with planner dashboard-style workflows
- configure planning entities (resources, network/config, settings)
- navigate planner modules with tab-based deep links
- manage schedules and scenarios (including schedule version operations)
- use quality/stockpile/flow modules through existing UI/API components
- parse/import/export core mine data formats (DXF/STR/CSV/TXT/ASCII)
- run CRS transformations and coordinate checks
- run raster and terrain operations (metadata, sampling, TIN and related operations)
- work with surface/CAD string/annotation services
- use operations dashboards (fleet, drill-blast, shift operations, monitoring)

---

## Quick start for non-technical users (Docker)

If you are not technical, use this method.

### Step A: install required apps

Install:

1. Git: https://git-scm.com/downloads
2. Docker Desktop: https://www.docker.com/products/docker-desktop/

After installation, open Docker Desktop and wait until it shows healthy/running.

### Step B: download the project

Open Command Prompt and run:

```bash
git clone https://github.com/SIHLE-MTSHALI/MineOpt-pro.git
cd MineOpt-pro
```

### Step C: start the full system

```bash
docker compose up --build
```

Wait until all services are running.

### Step D: open the app

- Frontend app: `http://localhost:3000`
- Backend API docs: `http://localhost:8000/docs`
- Backend health: `http://localhost:8000/health`

### Step E: stop the app later

```bash
docker compose down
```

---

## Full local setup for technical users

Use this when you want full control of backend/frontend dev loops.

### Requirements

- Python 3.10+
- Node.js 18+
- npm 9+
- Git

Optional but recommended:

- Postgres 15+
- virtual environment tooling (`venv`)

### 1) clone repository

```bash
git clone https://github.com/SIHLE-MTSHALI/MineOpt-pro.git
cd MineOpt-pro
```

### 2) backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

Run API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend should now be available at:

- `http://localhost:8000/health`
- `http://localhost:8000/docs`

### 3) frontend setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:

- `http://localhost:5173`

### 4) optional environment configuration

Copy `.env.example` to `.env` and edit values if needed.

Key variables:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `SECRET_KEY`
- `CORS_ORIGINS`

---

## First-time onboarding walkthrough

This is the shortest practical path after the app loads.

1. Open the landing/login page.
2. Register a new user (or sign in with existing credentials).
3. Enter the app (`/app/dashboard`).
4. Open **Seed Demo Data** from the left menu.
5. Run seeding to populate realistic starting entities.
6. Go to **Planning** and switch tabs:
   - 3D Spatial View
   - Gantt Schedule
   - Schedule Control
   - Reports & Analytics
7. Open **Import Data** tab and test a CSV/TXT/DXF upload path.
8. Open **Flow Network**, **Product Specs**, and **Stockpiles** tabs and inspect loaded entities.
9. Open dashboard pages (**Fleet**, **Drill & Blast**, **Shift Operations**, **Monitoring**) and verify data visibility.

At this point you have a usable evaluation environment.

---

## Complete feature walkthrough (how to use each area)

This section is written as a user guide for the current product state.

### 1) Dashboard

Purpose:

- quick operational summary
- current status context
- central launch point

Typical actions:

1. Review summary metrics and status cards.
2. Confirm active site/schedule context.
3. Move to planner or operations modules from navigation.

### 2) Planner workspace

Planner is tab-based and URL-driven (`/app/planner?tab=...`).

#### 2.1 Spatial tab (`tab=spatial`)

Use for:

- visual planning context
- geometry-linked spatial operations

Typical flow:

1. Open `3D Spatial View` from menu.
2. Load/select available planning objects.
3. Use toolbar actions for navigation/selection.
4. Switch to related tools (surfaces/strings/annotations where integrated).

#### 2.2 Gantt tab (`tab=gantt`)

Use for:

- timeline-style schedule editing and review

Typical flow:

1. Open `Gantt Schedule`.
2. Review task placement by resource/time.
3. Edit task-level items as supported in current UI.
4. Save/refresh and evaluate schedule changes.

#### 2.3 Schedule control (`tab=schedule-control`)

Use for:

- run schedule workflows
- manage versions/scenarios
- observe diagnostics

Typical flow:

1. Open `Schedule Control`.
2. Start a run (fast/full depending on workflow exposure).
3. Review run status and diagnostics.
4. Fork scenarios where needed.

#### 2.4 Reporting (`tab=reporting`)

Use for:

- inspect generated schedule outputs and tables
- export reporting data where available

Typical flow:

1. Open `Reports & Analytics`.
2. Select report type/date/context.
3. Review tabular/chart outputs.
4. Export if enabled for that report path.

#### 2.5 Flow network (`tab=flow-editor`)

Use for:

- configure material routing network behavior

Typical flow:

1. Open `Flow Network`.
2. Add or inspect nodes/arcs.
3. Set material and constraint settings.
4. Save and rerun planning workflows.

#### 2.6 Product specs (`tab=product-specs`)

Use for:

- define product/quality rule targets

Typical flow:

1. Open `Product Specs`.
2. Define limits/targets and required fields.
3. Save and evaluate against schedule outputs.

#### 2.7 Resources (`tab=resources`)

Use for:

- configure equipment/resource entities and planning parameters

Typical flow:

1. Open `Resources`.
2. Add/edit resource definitions.
3. Update availability/performance factors where supported.

#### 2.8 Geology (`tab=geology`)

Use for:

- block model/geology-linked visualization and data actions

Typical flow:

1. Open `Block Model`.
2. Load available data slices/layers.
3. Inspect and validate geometry/data associations.

#### 2.9 Stockpiles (`tab=data`)

Use for:

- stockpile inventory/quality monitoring

Typical flow:

1. Open `Stockpiles`.
2. Inspect balances and quality summaries.
3. Track build/reclaim context against plans.

#### 2.10 Import (`tab=import`)

Use for:

- ingest project/exploration/source data files

Typical flow:

1. Open `Import Data`.
2. Upload file(s).
3. Map columns/fields if prompted.
4. Validate preview.
5. Commit import into workflow dataset.

#### 2.11 Integrations (`tab=integrations`)

Use for:

- map external IDs and integration configurations

Typical flow:

1. Open `Integrations`.
2. Configure mapping between external and internal IDs.
3. Validate transformation path.

#### 2.12 Settings (`tab=settings`)

Use for:

- planner/site-level configurable settings exposed in UI

Typical flow:

1. Open `Settings`.
2. Update allowed parameters.
3. Save and retest impacted workflows.

### 3) Fleet management page (`/app/fleet`)

Use for:

- haul cycle and equipment operations visibility

Typical flow:

1. Open `Fleet Management`.
2. Review cycle/status widgets.
3. Validate fleet-state changes against schedule context.

### 4) Drill & blast (`/app/drill-blast`)

Use for:

- blast pattern and event-level workflow visibility

Typical flow:

1. Open `Drill & Blast`.
2. Review or configure pattern/event data.
3. Save events and verify downstream impact.

### 5) Shift operations (`/app/operations`)

Use for:

- operational handover and shift-level event tracking

Typical flow:

1. Open `Shift Operations`.
2. Record shift handover and incident notes.
3. Review shift summaries.

### 6) Monitoring (`/app/monitoring`)

Use for:

- slope and environmental monitoring contexts

Typical flow:

1. Open `Monitoring`.
2. Switch between monitoring intent views.
3. Review conditions and alerts in available panels.

### 7) Seed data (`/app/seed-data`)

Use for:

- initialize realistic synthetic project data

Typical flow:

1. Open `Seed Demo Data`.
2. Run seed action.
3. Return to planner and dashboards to validate loaded data.

---

## File format support and practical workflows

Current format support is centered on practical mine-planning workflows.

### Supported today

- DXF (`.dxf`) read + export
- Surpac String (`.str`) read + export
- CSV (`.csv`) read + export
- TXT/ASCII (`.txt`, `.asc`, `.dat`) read + export paths

### Main backend endpoints

- `GET /files/formats`
- `POST /files/parse/dxf`
- `POST /files/parse/surpac`
- `POST /files/parse/tabular`
- `POST /files/export/*` (format-specific)

### Practical site-builder workflow (recommended)

1. Prepare source data from legacy project or exploration files.
2. Import via planner import module.
3. Map fields (coordinates, identifiers, attributes).
4. Validate preview and data quality.
5. Create/update planning entities from validated import.
6. Move into spatial/scheduling workflow.

This is the workflow path we are continuing to harden for enterprise-grade usability.

---

## Coordinate systems and geospatial behavior

MineOpt Pro supports multi-CRS workflows through dedicated CRS services.

### Key capabilities

- list coordinate systems by region/category
- inspect CRS metadata
- transform points between EPSG systems
- detect likely CRS for datasets
- validate CRS definitions

### Main endpoints

- `GET /crs/systems`
- `GET /crs/regions`
- `GET /crs/{epsg}/info`
- `POST /crs/transform`
- `GET /crs/detect`
- `POST /crs/validate`

### Recommended user flow

1. Confirm source dataset CRS.
2. Transform to site CRS before merge/use.
3. Store CRS metadata with imported artifacts.
4. Validate transformed sample points before operational use.

---

## ECW support: what works and what to expect

You can include ECW in the raster workflow path, but behavior depends on runtime driver support.

### Current reality

- Raster APIs support metadata/sampling/TIN/tile/hillshade workflows.
- ECW read support may vary by your GDAL/raster runtime build.
- In environments without ECW drivers, use GeoTIFF conversion as fallback.

### No-cost-safe recommendation

For guaranteed local operation without licensing complexity:

1. Convert ECW to GeoTIFF using QGIS/GDAL tools.
2. Run MineOpt workflows on GeoTIFF.
3. Keep ECW-specific path optional until deployment environment is validated.

---

## Menu and route map

### Top-level routes

- `/` (landing)
- `/login`
- `/register`
- `/app/dashboard`
- `/app/planner`
- `/app/fleet`
- `/app/drill-blast`
- `/app/operations`
- `/app/monitoring`
- `/app/seed-data`

### Planner tabs

- `/app/planner?tab=spatial`
- `/app/planner?tab=gantt`
- `/app/planner?tab=schedule-control`
- `/app/planner?tab=reporting`
- `/app/planner?tab=flow-editor`
- `/app/planner?tab=product-specs`
- `/app/planner?tab=data`
- `/app/planner?tab=resources`
- `/app/planner?tab=geology`
- `/app/planner?tab=import`
- `/app/planner?tab=integrations`
- `/app/planner?tab=settings`

---

## API usage and integration

Open Swagger docs:

- `http://localhost:8000/docs`

### Core API groups

- auth/security
- config/calendar/resources/schedule
- optimization/quality/stockpile/staged stockpile/wash table
- flow network/reporting
- file formats
- geology/boreholes/block model
- surfaces/surface tools/surface history
- CAD strings/annotations
- raster/CRS
- fleet/drill-blast/operations/monitoring/analytics
- integration/websocket

### Example API smoke check

```bash
curl http://localhost:8000/health
```

Expected response shape:

```json
{
  "status": "healthy",
  "service": "mineopt-api"
}
```

---

## Testing and quality checks

Run these before merging technical changes.

### Backend

```bash
cd backend
pytest -q
```

### Frontend tests

```bash
cd frontend
npm test -- --runInBand --watchAll=false
```

### Frontend build

```bash
cd frontend
npm run build
```

### Frontend lint

```bash
cd frontend
npm run lint
```

---

## Known limitations

The following are active limitations in current state:

1. Some advanced planner modules are implemented but still being integrated into the most intuitive end-user flow.
2. Parts of the UX still need enterprise polish for consistency and reduced cognitive load.
3. Raster workflows can depend on runtime file accessibility and available drivers (especially ECW).
4. Some legacy fallback logic still exists in parts of the app and is being removed in ongoing hardening work.
5. Commercial-readiness controls (strict release gates, complete UAT packs, end-to-end production hardening) are still in progress.

This README intentionally states these gaps explicitly so expectations are clear.

---

## Future work roadmap

Current execution direction is aligned with staged delivery waves:

1. Engineering baseline stabilization
2. API contract unification and endpoint consistency
3. Geospatial foundation hardening (raster + CRS + ECW runtime checks)
4. Unified site-builder workflow for CSV/DXF/ASCII and exploration data
5. Full integration of surface/CAD/annotation tools into the spatial workspace
6. Optimization engine hardening with stronger explainability
7. Reporting/publishing and immutable operational versioning
8. Multi-user audit/security collaboration controls
9. Synthetic scenario libraries for realistic regression
10. Commercial readiness gates and release standards

Reference plans:

- `docs/plans/2026-02-07-commercial-product-recovery-plan-v2.md`
- `docs/plans/2026-02-08-open-issues-execution-wave-plan.md`
- `docs/reviews/2026-02-07-target-requirements-gap-audit.md`

---

## Troubleshooting

### Port already in use

If startup fails due to port conflicts (3000, 5173, 8000, 5432), close the conflicting app or change port mapping.

### Frontend loads but data is empty

- Check backend is running: `http://localhost:8000/health`
- Check browser console/network for failed API calls
- Confirm seed data has been loaded

### Python dependency install failure

Run:

```bash
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

### Raster/ECW file not readable

- Confirm file path and read permissions
- Check raster format support endpoint(s)
- Convert ECW to GeoTIFF if driver support is unavailable

### Login/auth issues

- Clear browser local storage token
- Re-login
- Check backend auth endpoints are reachable in `/docs`

---

## Project structure

```text
backend/    FastAPI backend services, routers, models, tests
frontend/   React + Vite UI app and component modules
docs/       plans, audits, requirements, user/developer documentation
```

---

## Supporting documentation

- `docs/USER_GUIDE.md`
- `docs/DEVELOPER_GUIDE.md`
- `docs/API_DOCUMENTATION.md`
- `docs/reviews/2026-02-07-target-requirements-gap-audit.md`
- `docs/plans/2026-02-07-commercial-product-recovery-plan-v2.md`
- `docs/plans/2026-02-08-open-issues-execution-wave-plan.md`

---

If you want this README split into role-specific guides (Planner Guide, Admin Guide, Developer Guide), that can be done next while keeping this as the master entry point.
