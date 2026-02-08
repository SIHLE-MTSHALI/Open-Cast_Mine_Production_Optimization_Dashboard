# MineOpt Commercial Product Recovery Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver a production-grade, no-cost-first mine planning platform that meets the full requirements set (ECW/CRS/file workflows/site builder/surface-CAD tools/planning engine/reporting/collaboration).

**Architecture:** Keep the existing FastAPI + React architecture, but move from feature-fragmented to workflow-driven by wiring all major modules through a single planner workflow. Remove fallback behavior in critical paths, enforce deterministic scheduling runs, and gate releases with green automated tests and E2E scenario packs.

**Tech Stack:** FastAPI, SQLAlchemy, React + Vite, axios/fetch, pyproj, rasterio/GDAL, scipy, ezdxf, three.js/react-three-fiber, pytest, Jest/Vitest (standardize to one).

---

### Phase 0: Governance + No-Cost Guardrails

**Files:**
- Create: `docs/architecture/2026-02-07-no-cost-architecture-policy.md`
- Modify: `README.md`
- Modify: `docs/requirements.md`

1. Define a strict “no paid runtime dependency” policy and approved OSS package list.
2. Add an explicit section for optional paid capabilities (for example, ECW server/compression path) that must remain feature-flagged/off by default.
3. Define acceptance gates for feature completion: API contract tests + integration tests + UI flow tests + docs.

### Phase 1: Engineering Baseline Stabilization (Must Pass First)

**Files:**
- Modify: `backend/pytest.ini`
- Modify: `backend/tests/*`
- Modify: `frontend/jest.config.js`
- Modify: `frontend/package.json`
- Modify: `frontend/eslint.config.js`

1. Fix backend import/package issues (`app` module path) and stale test contracts.
2. Get backend test suite to green in CI (or define temporary quarantine list with hard deadline).
3. Standardize frontend test runner (Jest or Vitest, one only) and align config.
4. Bring lint to zero error baseline; warnings tracked with issue IDs.
5. Add CI status gate: backend tests + frontend tests + lint + build.

### Phase 2: API Contract Unification

**Files:**
- Modify: `frontend/src/services/api.js`
- Modify: `frontend/vite.config.js`
- Modify: `frontend/src/components/**/*`
- Modify: `frontend/src/pages/**/*`

1. Remove hardcoded `http://localhost:8000` calls from page/components.
2. Standardize all calls through centralized API client.
3. Decide one dev strategy: proxy `/api` or direct base URL env, then apply everywhere.
4. Add typed endpoint wrappers for raster/CRS/CAD/surface/file workflow endpoints.
5. Add a contract drift test that compares frontend-used endpoints vs backend router map.

### Phase 3: Geospatial Foundation (ECW + CRS)

**Files:**
- Modify: `backend/app/routers/raster_router.py`
- Modify: `backend/app/services/raster_service.py`
- Modify: `frontend/src/components/raster/RasterLayerPanel.jsx`
- Modify: `frontend/src/components/ui/CRSSelector.jsx`
- Modify: `frontend/src/components/ui/CoordinateTransformer.jsx`
- Modify: `frontend/src/pages/PlannerWorkspace.jsx`

1. Implement upload-first raster ingestion workflow (avoid raw server file path dependency for UI users).
2. Add runtime driver capability check endpoint (ECW readable, writable flags, reasons).
3. Wire `RasterLayerPanel` into Planner `spatial` tab.
4. Wire CRS selection/transformation UI into import and spatial workflows.
5. Add CRS metadata display per layer/object and reprojection controls.
6. Add test fixtures and integration tests for GeoTIFF + ECW behavior.

### Phase 4: File I/O and Site Builder Workflow

**Files:**
- Modify: `frontend/src/pages/PlannerWorkspace.jsx`
- Modify: `frontend/src/components/import/SiteBuilderWizard.jsx`
- Delete/merge: `frontend/src/components/wizard/SiteBuilderWizard.jsx`
- Modify: `frontend/src/components/import/FileUploader.jsx`
- Modify: `backend/app/routers/file_format_router.py`

1. Consolidate duplicate SiteBuilderWizard implementations into one source of truth.
2. Make Site Builder available as first-class planner tab and menu entry.
3. Build guided workflow: upload -> map columns -> validate -> preview -> estimate -> create activity areas.
4. Ensure DXF/CSV/TXT/ASCII imports can feed site builder flows directly.
5. Add edit/export flows for generated datasets, not only parse.
6. Add explicit user validation and error recovery screens for malformed imports.

### Phase 5: 3D Surfaces, Strings, and Annotation Workspace

**Files:**
- Modify: `frontend/src/components/spatial/Viewport3D.jsx`
- Modify: `frontend/src/components/spatial/Spatial3DToolbar.jsx`
- Modify: `frontend/src/components/cad/CADStringEditor.jsx`
- Modify: `frontend/src/components/annotation/AnnotationToolbar.jsx`
- Modify: `frontend/src/components/surface/SurfaceToolPanel.jsx`
- Modify: `frontend/src/components/spatial/VolumeCalculator.jsx`

1. Integrate CAD strings, annotations, surface tools, and volume calculator into one spatial workspace.
2. Wire all actions to backend APIs (`/strings`, `/annotations`, `/surface-tools`, `/surfaces/volume-between`, `/surfaces/seam-tonnage`).
3. Add object selection model shared across tools (surface, string, annotation).
4. Add undo/redo and operation history for geometry edits.
5. Add visual result overlays (profiles, slope maps, cut/fill) in 3D and tabular form.

### Phase 6: Scheduling/Optimization Engine to Operational Grade

**Files:**
- Modify: `backend/app/services/schedule_engine.py`
- Modify: `backend/app/services/flow_optimizer.py`
- Modify: `backend/app/services/wash_plant_service.py`
- Modify: `frontend/src/components/scheduler/ScheduleControl.jsx`
- Modify: `frontend/src/components/scheduler/DiagnosticsPanel.jsx`

1. Replace placeholder heuristics with explicit objective profile execution and constraint accounting.
2. Ensure deterministic outputs for same inputs in fast/full pass mode.
3. Persist and expose decision explanations and binding constraints with structured schema.
4. Integrate wash plant cutpoint decisions into full pass outputs.
5. Remove simulated success fallbacks in scheduling UI.
6. Add scenario comparison (cost, penalties, quality compliance, demand fulfillment).

### Phase 7: Reporting and Publishing

**Files:**
- Modify: `frontend/src/components/reporting/ReportingModule.jsx`
- Modify: `backend/app/routers/reporting_router.py`
- Modify: `backend/app/services/report_generator_service.py`
- Modify: `backend/app/routers/integration_router.py`

1. Remove mock reporting data fallback from primary workflows.
2. Implement standard report pack required by operations (shift/day/week, quality, stockpile balances, reconciliation).
3. Ensure export formats: CSV, JSON, PDF report pack.
4. Complete publish flow with immutable schedule version references.

### Phase 8: Multi-User Collaboration, Audit, and Security

**Files:**
- Modify: `backend/app/routers/security_router.py`
- Modify: `backend/app/routers/websocket_router.py`
- Modify: `frontend/src/components/collaboration/PresenceIndicator.jsx`
- Modify: `frontend/src/components/collaboration/ChangeLogPanel.jsx`

1. Add robust permission checks across non-auth routers.
2. Add collision-safe edit controls (locking/merge strategy) for shared objects.
3. Ensure all edits are audit logged with before/after values and schedule version linkage.
4. Add UI visibility for presence and pending concurrent changes.

### Phase 9: Synthetic Data + Scenario Library

**Files:**
- Modify: `backend/app/services/synthetic_data_generator.py`
- Create: `backend/tests/scenarios/*`
- Create: `docs/data/2026-02-07-synthetic-dataset-methodology.md`

1. Fix seed determinism and reproducibility in synthetic generator.
2. Add realistic scenario presets (Mpumalanga/Bowen/Kalimantan/PRB) with documented assumptions.
3. Add import-ready synthetic artifacts (CSV/TXT/ASCII/DXF) for workflow testing.
4. Build scenario regression suite: import -> build -> schedule -> report -> publish.

### Phase 10: Commercial Readiness Gates

**Files:**
- Create: `docs/release/2026-02-07-readiness-checklist.md`
- Modify: `.github/workflows/*` (if present)

1. Set release criteria: green tests, no critical fallbacks, no hardcoded local endpoints, performance budgets met.
2. Add performance budgets for frontend bundle size and full-pass runtime.
3. Run failover and backup/restore drills for DB and schedule versions.
4. Produce UAT checklist for planner/supervisor/admin roles.

## Execution Order
1. Phase 0-2 first (foundation and integration hygiene)
2. Phase 3-5 next (geospatial/site builder/spatial tooling)
3. Phase 6-8 next (optimization + reporting + enterprise controls)
4. Phase 9-10 to close commercial readiness

## Immediate Next Sprint (First 2 Weeks)
1. Stabilize tests/lint/build (Phase 1)
2. API unification (Phase 2)
3. Wire Site Builder and Raster/CRS into Planner (Phase 3-4)
4. Remove scheduling/reporting mock fallbacks in active workflows
