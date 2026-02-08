# MineOpt Pro

MineOpt Pro is a planning and operations workspace for open-cast mining teams.

This project combines scheduling, quality management, surface/CAD tools, data import/export, and operations dashboards in one web application.

If you are not technical, this README is written for you. It explains exactly how to get the system running and what you can do with it right now.

## Current project status (as of February 8, 2026)

MineOpt Pro is active and usable for development, testing, and workflow validation.

What is true today:

- Backend API is running and tested across core modules.
- Frontend app is running and tested with route and workflow coverage.
- Planning, monitoring, fleet, drill/blast, quality, surface, CAD string, annotation, and file-format modules are available in the UI/API.
- Synthetic demo data generation is available for quick trial runs.

Validation snapshot from latest local verification:

- Backend tests: 377 passed
- Frontend tests: 97 passed
- Frontend production build: successful

Important reality check:

- This is a serious product foundation, but not yet a finished commercial release.
- Some advanced enterprise workflows are present as building blocks and still being hardened for full production operations.

## Who this is for

MineOpt Pro currently supports three groups:

1. Mine planners and supervisors who want one place to review schedules, flows, and operating status.
2. Technical teams who need geospatial and mine-data workflows (surfaces, strings, raster, boreholes, block model).
3. Project contributors validating features against real mine-planning requirements.

## What you can do right now

### 1) Planning and scheduling workspace

- Open a planner with dedicated tabs for spatial view, Gantt schedule, schedule control, reporting, flow editor, product specs, resources, geology, stockpiles, import, integrations, and settings.
- Navigate directly using menu links and URL tabs.
- Run scheduling workflows with diagnostics and report paths.

### 2) Operations dashboards

Dedicated pages are available for:

- Site dashboard
- Fleet dashboard
- Drill and blast dashboard
- Shift operations dashboard
- Monitoring dashboard

### 3) File and geospatial workflows

Available API/UI capabilities include:

- DXF read/export and CAD geometry workflows
- Surpac string (.str) parsing
- CSV/TXT/ASCII parsing and preview
- Surface creation from points, XYZ/TXT/ASC files
- Raster metadata, sampling, TIN generation, overview/tile/hillshade operations
- CRS transformation support for multi-coordinate-system workflows

### 4) Surface, CAD, and annotation tools

- CAD string CRUD and editing (vertices, geometry operations, analysis)
- Annotation endpoints and entity-linking support
- Surface tools for transformation, refinement, slope/profile/isopach, and volume-related workflows

### 5) Quality, stockpile, and simulation services

- Quality blending and constraint evaluation services
- Stockpile and staged stockpile services
- Simulation and optimization service paths for planning experiments

### 6) Seeded demo data for onboarding and testing

- Automatic backend demo seeding (when empty)
- In-app seed-data page for guided data setup
- Synthetic dataset generator for realistic test scenarios

## No-cost policy and cost notes

MineOpt Pro is designed to be runnable with free/open tooling.

No mandatory paid tools are required for local development.

Potential optional cost areas (only if you choose them):

- Commercial ECW/GDAL codec stacks in some enterprise environments
- Enterprise hosting/infrastructure
- Commercial SMTP/monitoring vendors

If ECW support is limited in your environment, a no-cost fallback is to convert imagery to GeoTIFF using free tools such as QGIS/GDAL command-line utilities.

## Easiest setup for non-technical users (Docker)

If you are new to development tools, this is the best path.

### Before you start

Install these two applications:

1. Git: https://git-scm.com/downloads
2. Docker Desktop: https://www.docker.com/products/docker-desktop/

After installing Docker Desktop, make sure it is open and running.

### Step-by-step

1. Open Command Prompt.
2. Copy and run:

```bash
git clone https://github.com/SIHLE-MTSHALI/MineOpt-pro.git
cd MineOpt-pro
docker compose up --build
```

3. Wait for startup to complete.
4. Open the app in your browser:

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs

To stop everything:

```bash
docker compose down
```

## Local setup (manual, no Docker)

Use this if you are comfortable with terminals.

### Requirements

- Python 3.10+
- Node.js 18+
- npm 9+
- Git

Check versions:

```bash
python --version
node --version
npm --version
git --version
```

### 1) Clone project

```bash
git clone https://github.com/SIHLE-MTSHALI/MineOpt-pro.git
cd MineOpt-pro
```

### 2) Start backend

Open Terminal 1:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend endpoints:

- Health: http://localhost:8000/health
- API docs: http://localhost:8000/docs

### 3) Start frontend

Open Terminal 2:

```bash
cd frontend
npm install
npm run dev
```

Open frontend:

- http://localhost:5173

## First-use walkthrough (non-technical)

After the app opens:

1. Register a new account from the login/register flow.
2. Sign in.
3. Go to dashboard.
4. Open the left menu and explore:
   - Dashboard
   - Planning (3D Spatial View, Gantt Schedule, Schedule Control)
   - Operations (Fleet, Drill and Blast, Shift Operations)
   - Monitoring (Slope, Environment)
   - Configuration and Data/Integration tools
5. Use "Seed Demo Data" from the menu to populate a working dataset.
6. Open planner tabs and confirm you can move between modules.

## Current menu and page map

Top-level app routes:

- `/app/dashboard`
- `/app/planner`
- `/app/fleet`
- `/app/drill-blast`
- `/app/operations`
- `/app/monitoring`
- `/app/seed-data`

Planner tab routes are driven by query string:

- `/app/planner?tab=spatial`
- `/app/planner?tab=gantt`
- `/app/planner?tab=schedule-control`
- `/app/planner?tab=reporting`
- `/app/planner?tab=flow-editor`
- `/app/planner?tab=product-specs`
- `/app/planner?tab=resources`
- `/app/planner?tab=geology`
- `/app/planner?tab=data`
- `/app/planner?tab=import`
- `/app/planner?tab=integrations`
- `/app/planner?tab=settings`

## API capability groups

The backend includes routers for:

- Auth and security
- Calendar/config/resources/schedule
- Optimization/quality/stockpile/staged stockpile/wash table
- Flow network and reporting
- File formats (DXF/Surpac/tabular)
- Boreholes, block model, geology
- Surfaces, surface tools/history, CAD strings, annotations
- Raster/DEM and CRS
- Fleet, drill-blast, operations, monitoring, analytics
- Integration and websocket paths

## Data formats and interoperability (current)

Current supported data workflow coverage includes:

- DXF: parse and export
- Surpac STR: parse
- CSV/TXT/ASCII: parse/preview and export paths
- XYZ/ASC/TXT to surface generation
- Raster formats through raster service stack (including ECW support depending on runtime driver availability)

## Known limitations and in-progress areas

- Some modules are feature-rich foundations that still need enterprise UX polishing.
- Large planner chunks still trigger frontend bundle-size warnings.
- CSS import-order warning exists in the current frontend build (non-blocking).
- Commercial readiness work (governance, release gates, hardened operations) is ongoing.

## Troubleshooting

### Problem: "Port already in use"

- Stop other apps using 3000, 5173, or 8000.
- Or change ports in run commands/config.

### Problem: Frontend loads but API calls fail

- Confirm backend is running at port 8000.
- Open `http://localhost:8000/health`.
- If health works, restart frontend server.

### Problem: Python package installation fails

- Upgrade pip first:

```bash
python -m pip install --upgrade pip
```

- Re-run `pip install -r backend/requirements.txt`.

### Problem: Raster/ECW operation not available

- Your local GDAL/raster stack may not include the required driver.
- Use GeoTIFF fallback for now.

## Project structure

```text
backend/    FastAPI API, services, domain models, tests
frontend/   React + Vite web app, UI components, tests
docs/       Plans, audits, and requirements/review artifacts
```

## Documentation links

- `docs/USER_GUIDE.md`
- `docs/DEVELOPER_GUIDE.md`
- `docs/API_DOCUMENTATION.md`
- `docs/reviews/2026-02-07-target-requirements-gap-audit.md`
- `docs/plans/2026-02-08-open-issues-execution-wave-plan.md`

## For contributors

Run quality checks before pushing:

Backend:

```bash
cd backend
pytest -q
```

Frontend:

```bash
cd frontend
npm test -- --runInBand
npm run build
```

## Final note

MineOpt Pro is being developed as a comprehensive, no-shortcuts mine planning platform.

If you are a planner/end-user, you can already run and evaluate meaningful workflows.
If you are a contributor, the test baseline is strong and the architecture is ready for continued delivery.
