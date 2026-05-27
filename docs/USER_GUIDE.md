# Open-Cast Mine Production Optimization Dashboard User Guide

Last reviewed: 2026-05-27

This guide explains how to use the web application once the backend and frontend are running. It focuses on the workflows that are present in the current React and FastAPI codebase.

For setup commands, see the root `README.md`. For endpoint details, open the generated FastAPI docs at `http://localhost:8000/docs` while the backend is running.

## Accessing the App

Start the backend and frontend, then open:

```text
http://localhost:5173
```

Available user-facing routes:

| Route | Purpose |
| --- | --- |
| `/` | Public landing page. |
| `/login` | Login screen. |
| `/register` | Registration screen. |
| `/app/dashboard` | Site dashboard. |
| `/app/planner` | Main planning workspace. |
| `/app/fleet` | Fleet dashboard. |
| `/app/drill-blast` | Drill and blast dashboard. |
| `/app/operations` | Operations dashboard. |
| `/app/monitoring` | Monitoring dashboard. |
| `/app/seed-data` | Seed working data into the backend database. |

## Login and Registration

You can create a user from the registration screen. For local development, the backend also supports a bootstrap account:

```text
username: admin
password: admin
```

When this account does not already exist, the backend creates it on first successful login. This is useful for local setup and should be changed before any shared deployment.

## Working With Sites

The app uses the first available site returned by the backend as the active site. The selected site is shared through the frontend site context and used by dashboards and workspace modules.

If no real site data exists yet, seed data first. The seed data flow is designed to give the existing modules enough records to exercise the app.

## Seeding Working Data

Open:

```text
/app/seed-data
```

The seed page calls the comprehensive backend seed endpoint. Seeded data can include mine sites, equipment, GPS readings, haul cycles, blast patterns, shifts, load tickets, geotechnical readings, and environmental readings.

Use this when:

- setting up the project for the first time
- testing UI workflows
- checking API behavior without manually creating every record
- demonstrating the app to another contributor

The seed action adds data to the current database. If you need a clean local SQLite database, stop the backend, delete `backend/mineopt_pro.db`, restart the backend, and seed again.

## Site Dashboard

Open:

```text
/app/dashboard
```

The site dashboard provides a high-level view of the selected site.

Current dashboard areas include:

- planned tonnes today
- actual-vs-plan percentage
- quality compliance percentage
- active equipment count
- active schedule summary
- alert list
- stockpile summary
- quick links to fleet, drill/blast, operations, and monitoring screens

Some cards use fallback values when an API call fails or data is missing. If a number looks unexpected, check the backend response in the browser network tab or use the API docs.

## Planner Workspace

Open:

```text
/app/planner
```

The planner workspace is the main work area. It uses tabs for different mine-planning domains.

Common tabs and module areas:

| Area | What you can use it for |
| --- | --- |
| Spatial view | Inspect 3D/spatial components for site data, activity areas, surfaces, boreholes, blocks, and stockpiles where data is available. |
| Gantt schedule | View and interact with schedule tasks by resource and period. |
| Schedule control | Work with schedule versions and optimization actions. |
| Reporting | Open reporting dashboard and reporting module components. |
| Flow editor | Work with material flow network concepts. |
| Product specs | Work with product and quality specification UI. |
| Stockpiles | Manage stockpile-oriented UI flows. |
| Wash plant | Work with wash plant configuration components. |
| Geology | Open geology and block model viewer components. |
| Settings | View and update site/user settings where supported. |
| Fleet | Open haul cycle and fleet components inside the planner. |
| Drill/blast | Work with pattern and blast event components. |
| Shift operations | Work with shift and operational record components. |
| Geotech/environment | Inspect monitoring and environmental components. |
| Import/integrations | Work with file import, external ID mapping, BI extract, and integration components. |

## Scheduling Workflow

A typical local scheduling flow is:

1. Seed working data or create site data manually through the API.
2. Open the planner workspace.
3. Confirm a schedule version exists.
4. Inspect tasks in the Gantt tab.
5. Use schedule control actions to run available optimization endpoints.
6. Refresh tasks and inspect the updated schedule data.

Related backend route groups:

- `/schedule`
- `/optimization`
- `/cp-solver`
- `/planning-horizons`
- `/precedence`

## Quality Workflow

The quality module supports quality fields, blending calculations, constraint checks, basis conversion, thermal-coal defaults, and simulation endpoints.

Typical workflow:

1. Confirm a site has quality fields.
2. Seed default thermal-coal fields if needed.
3. Define or inspect product specifications.
4. Use blend and constraint endpoints to calculate quality results.
5. Use simulation endpoints when you need uncertainty or risk-style output.

Related backend route group:

- `/quality`

Related frontend components:

- `frontend/src/components/quality/`
- `frontend/src/components/products/ProductSpecs.jsx`

## Fleet Workflow

The fleet module works with stored equipment and movement records.

You can use it to:

- create equipment records
- update equipment status
- record GPS readings
- fetch latest positions by site
- fetch equipment trails
- manage geofences
- detect haul cycles
- view cycle statistics
- create and complete maintenance records
- fetch equipment health summaries

Related backend route group:

- `/fleet`

## Drill and Blast Workflow

The drill/blast module supports blast patterns, drill holes, blast events, and fragmentation-related records.

Use it to inspect or build workflows around:

- blast pattern setup
- drill-hole records
- blast event logging
- fragmentation model data

Related backend route group:

- `/drill-blast`

## Operations Workflow

The operations module supports production and shift records.

You can work with:

- load tickets
- dump updates
- shifts
- active shift lookup
- shift summaries
- handovers
- incidents
- material movement summaries

Related backend route group:

- `/operations`

## Monitoring Workflow

The monitoring module stores geotechnical, environmental, hazard, and fatigue-related records.

You can work with:

- slope monitoring prisms and readings
- monitoring bores and readings
- dust monitors and readings
- dust exceedances
- hazard zones
- fatigue events
- operator fatigue scores

Related backend route group:

- `/monitoring`

## Geology, Spatial, and CAD Workflow

The app includes APIs and UI components for spatial mining data.

You can work with:

- borehole collars, intervals, assays, and traces
- block model definitions and blocks
- surfaces created from points, files, grids, contours, or breaklines
- surface query, contour, volume, and validation endpoints
- coordinate reference systems and transforms
- CAD strings and vertices
- annotations
- raster and DEM sampling
- DXF, Surpac, and tabular parser routes

Related route groups:

- `/boreholes`
- `/blockmodels`
- `/surfaces`
- `/crs`
- `/strings`
- `/annotations`
- `/raster`
- `/surface-tools`
- `/files`

## Reporting and Export Workflow

The reporting and export modules provide dashboards and file-oriented outputs.

You can use:

- reporting dashboard endpoints
- report generation endpoints
- report packs
- JSON, CSV, HTML, and PDF export routes where dependencies support them
- CSV templates and exports for flow, inventory, decisions, surfaces, and strings

Related route groups:

- `/reporting`
- `/reports`
- `/csv`

## Integrations Workflow

The integration module provides a base for exchanging data with external systems.

Current integration areas include:

- survey actuals
- lab quality
- fleet actual tonnes
- equipment hours
- cycle times
- survey geometry
- stockpile volumes
- maintenance windows and availability
- dispatch targets
- BI extracts
- connectors
- webhooks
- external ID mappings
- delayed lab-result imports

Related backend route group:

- `/integration`

## Useful Checks for Users

When something does not look right:

1. Confirm the backend is running at `http://localhost:8000`.
2. Confirm the frontend is running at `http://localhost:5173`.
3. Open `http://localhost:8000/docs` and test the relevant endpoint.
4. Check whether the active site has data for the module you are viewing.
5. Seed working data if you are exploring from an empty database.
6. Check browser network errors if the UI shows fallback data.

## Operational Caution

The app contains substantial mining-domain functionality, but real operational use requires project-specific validation. Validate integrations, data quality, coordinate systems, optimizer assumptions, authorization, safety requirements, and reporting outputs before using it with live mine data.
