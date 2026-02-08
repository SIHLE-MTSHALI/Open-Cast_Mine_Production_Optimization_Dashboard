# 2026-02-07 Target Requirements Gap Audit

## Scope
Audit against the target product definition provided on 2026-02-07:
- Strategic short/long range mine planning engine
- ECW + multi-CRS geospatial workflows
- DXF/ASCII/TXT/CSV read/create/import/export/edit
- Site Builder workflows from exploration/legacy project files
- 3D surfaces, strings, annotations, volume/tonnage tooling
- Menu navigation and workflow usability
- Commercial-product readiness

## Current Product Intent (What the codebase is trying to do)
The repository is building a full-stack mine planning platform with:
- FastAPI backend with broad domain routers for scheduling, flow, quality, stockpiles, wash plant, surface, raster, CAD strings, annotations, fleet, drill-blast, monitoring, integration, security (`backend/app/main.py:155`).
- React frontend with routed operations dashboards and a central Planner Workspace with tab-based modules (`frontend/src/App.jsx:85`, `frontend/src/pages/PlannerWorkspace.jsx:67`).
- Database-backed domain model for many target entities (site, calendar/periods, resources, flow network, parcels, schedule versions, tasks, explanations).

Net: architecture direction matches your target, but implementation maturity is inconsistent and many advanced modules are not connected in user workflows.

## High-Level Readiness
- Product architecture coverage: `~65%` (many modules exist in backend/frontend)
- End-to-end production workflow readiness: `~35%`
- Commercial readiness (reliability/testing/ops): `~20%`

## What Is Right
1. Broad backend capability surface exists already.
- Routers cover most required domains: scheduling, optimization, flow, quality, integration, file formats, CRS, raster, surfaces, CAD strings, annotations (`backend/app/main.py:155`).

2. CRS foundation is strong.
- CRS endpoints and transformations implemented (`backend/app/routers/crs_router.py:121`, `backend/app/routers/crs_router.py:341`).
- Region-specific mining CRS coverage exists (SA/AU/Indonesia/US) (`backend/app/services/crs_service.py:67`).

3. File-format backend foundation exists.
- Parse: DXF, Surpac STR, tabular CSV/TXT (`backend/app/routers/file_format_router.py:211`, `backend/app/routers/file_format_router.py:259`, `backend/app/routers/file_format_router.py:302`).
- Export: DXF, STR, CSV (`backend/app/routers/file_format_router.py:407`, `backend/app/routers/file_format_router.py:435`, `backend/app/routers/file_format_router.py:472`).

4. Surface and volume/tonnage APIs exist.
- TIN creation, volume-between, seam tonnage, contour generation (`backend/app/routers/surface_router.py:137`, `backend/app/routers/surface_router.py:335`, `backend/app/routers/surface_router.py:378`, `backend/app/routers/surface_router.py:421`).

5. Advanced editing APIs exist on backend.
- String editing operations (`backend/app/routers/cad_string_router.py:251`).
- Annotation CRUD and specialized labels (`backend/app/routers/annotation_router.py:177`).
- Surface tools for clip/merge/transform/sampling/profile/isopach (`backend/app/routers/surface_tools_router.py:188`).

6. Existing frontend information architecture is coherent.
- Main routes and protected access structure are clear (`frontend/src/App.jsx:63`).
- Sidebar/menu-to-planner-tab model is consistent (`frontend/src/components/layout/AppLayout.jsx:171`).

## What Is Wrong / At Risk
### 1) Automated quality gates are not healthy
- Backend test run (`pytest -q --continue-on-collection-errors`): `137 failed, 201 passed, 2 errors`.
- Collection errors include import path/package drift (`ModuleNotFoundError: app`) and stale test contracts.
- Frontend tests fail to start due Jest/ESM config mismatch (`frontend/jest.config.js:5`).
- Frontend lint has 270 errors / 31 warnings.

### 2) API connectivity is fragmented
- Mixed hardcoded `http://localhost:8000` and `/api/*` usage across frontend.
- Dev proxy for `/api` is commented out (`frontend/vite.config.js:15`), so many fetch calls will break in local dev.

### 3) Advanced modules exist but are not integrated into active workflows
The following key components are present but not wired into Planner Workspace routing/content:
- `frontend/src/components/raster/RasterLayerPanel.jsx`
- `frontend/src/components/cad/CADStringEditor.jsx`
- `frontend/src/components/annotation/AnnotationToolbar.jsx`
- `frontend/src/components/surface/SurfaceToolPanel.jsx`
- `frontend/src/components/spatial/VolumeCalculator.jsx`
- `frontend/src/components/ui/CRSSelector.jsx`
- `frontend/src/components/ui/CoordinateTransformer.jsx`
- `frontend/src/components/wizard/SiteBuilderWizard.jsx`

### 4) Duplicate/inconsistent workflow implementations
- Two separate SiteBuilderWizard implementations:
  - `frontend/src/components/import/SiteBuilderWizard.jsx`
  - `frontend/src/components/wizard/SiteBuilderWizard.jsx`
- Neither is connected to planner navigation content.

### 5) Production behavior still relies on demo fallbacks in critical flows
Examples:
- Site dashboard fallback mock data (`frontend/src/pages/SiteDashboard.jsx:203`).
- Reporting module mock table/query fallback (`frontend/src/components/reporting/ReportingModule.jsx:48`).
- Wash plant “saved locally” fallback (`frontend/src/components/washplant/WashPlantConfig.jsx:301`).
- Planner schedule control simulated success fallback (`frontend/src/components/scheduler/ScheduleControl.jsx:315`).

### 6) Some feature claims exceed currently implemented behavior
- Surface export endpoint advertises ASC support in query pattern but returns “not yet supported” for ASC TIN export (`backend/app/routers/surface_router.py:449`, `backend/app/routers/surface_router.py:471`).
- Raster endpoints mostly expect server-side file paths, limiting robust browser upload workflows (`backend/app/routers/raster_router.py:109`).

### 7) Navigation and discoverability gaps for requested toolchain
- Core app pages are menu reachable, but advanced geospatial/CAD toolchain is not discoverable via menu-driven UX.
- Monitoring menu entries (“Slope Stability”, “Environment”) both route to same page path; no deep-link tab params for direct targeting (`frontend/src/components/layout/AppLayout.jsx:198`).

## Requirement-by-Requirement Status
## 1) Read/plot/display ECW
Status: `Partial`
- Backend service recognizes ECW format (`backend/app/services/raster_service.py:52`).
- Frontend raster panel allows `.ecw` extension (`frontend/src/components/raster/RasterLayerPanel.jsx:359`).
- But raster panel is not wired into planner and raster ingestion is path-based (not robust upload workflow).

## 2) Multiple coordinate systems
Status: `Partial to Strong backend / Weak frontend integration`
- Backend CRS service/routers are strong (`backend/app/routers/crs_router.py:121`).
- CRS UI tools exist but are not integrated into main planner workflows.

## 3) Read/create/import/export/edit DXF, ASCII, TXT, CSV
Status: `Partial`
- Backend parse/export exists for DXF/STR/tabular (`backend/app/routers/file_format_router.py:211`).
- DXF service is robust and free-stack (`backend/app/services/dxf_service.py:5`).
- Editing workflows and unified UX are incomplete on frontend; dedicated site-builder/file-edit path is not connected.

## 4) Build sites from CSV/DXF/ASCII exploration data with intuitive workflow
Status: `Partial`
- Workflow components exist (upload/mapping/estimation/activity area creation).
- Not integrated in planner route/navigation; duplicate implementations increase confusion.

## 5) Build 3D terrain surfaces and strings from site builder data
Status: `Partial`
- Backend supports surface creation and CAD strings.
- End-to-end pipeline from site-builder output into active spatial scene is not wired.

## 6) Manipulate/query/edit surfaces, lines/strings, annotations, volume/tonnage
Status: `Backend strong / Frontend weak integration`
- Backend surface tools + CAD + annotation APIs exist.
- UI components exist but are not integrated into planner’s active spatial tab.

## 7) Planning/optimization engine with explainability
Status: `Early to mid-stage`
- Full/faspass scaffolding exists (`backend/app/services/schedule_engine.py`).
- Major realism, constraint completeness, and result explainability UX remain below commercial threshold.

## 8) Menu navigation and forward/back workflow usability
Status: `Partial`
- Primary pages are reachable via menu.
- Planner breadcrumbs exist.
- Advanced modules are not menu-addressable; back/forward semantics are mostly browser-native instead of explicit workflow controls.

## Backend <-> Frontend Linkage Assessment
Strongly linked domains:
- Core planner schedule/version/task flows
- Fleet/operations/monitoring dashboards

Weakly linked or disconnected domains:
- Raster/ECW workflow
- CRS selection + transformation in planning/import flows
- CAD string editing + annotation + surface-tool panel integration
- Full site-builder wizard workflow
- Unified import/export center

## Workflow Usability Check
Current workflows provide usable information in several dashboard modules, but strategic planning workflows are not fully executable end-to-end without fallback behavior.

Key blockers for “usable operational workflow”:
- Fallback demo data in critical modules
- Split API calling patterns
- Broken test baseline and lint baseline
- Incomplete integration of spatial editing toolchain

## Cost / Licensing Flags (important for your no-cost rule)
Likely to require spend unless constrained by architecture:
1. ECW on server deployment.
- GDAL ECW/JP2 support requires ECW SDK linking and has licensing constraints for server/compression use.

2. Commercial benchmark products (Vulcan, MinePlanner, MicroStation).
- These are commercial products; do not depend on them to deliver your own product.

Potentially free path:
- Use open-source stack by default (FastAPI, pyproj, rasterio+GDAL, ezdxf, scipy, three.js) and keep paid capabilities optional.

## Test / Build Status (Executed)
- Backend: `pytest -q --continue-on-collection-errors`
  - Result: `137 failed, 201 passed, 2 errors`
- Frontend: `npm test -- --runInBand --watchAll=false`
  - Result: fails at startup due jest config/module mismatch
- Frontend: `npm run build`
  - Result: build succeeds; large bundle warning (~2.27 MB JS)
- Frontend: `npm run lint`
  - Result: fails (`270 errors`, `31 warnings`)

## Conclusion
You are not far from a strong platform foundation, but you are far from commercial-operational readiness. The main gap is not lack of components; it is integration quality, consistency, workflow completeness, and engineering reliability.
