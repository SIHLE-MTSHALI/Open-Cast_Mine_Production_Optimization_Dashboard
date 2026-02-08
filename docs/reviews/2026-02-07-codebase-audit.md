# MineOpt Pro Codebase Audit (2026-02-07)

## Scope
- Full backend and frontend static review.
- Backend/frontend contract linkage audit.
- Navigation and workflow usability review.
- Test/build/lint execution checks.

## What The System Is Trying To Do
MineOpt Pro is a full-stack mine planning and operations product for open-cast workflows:
- Planning and scheduling (`/schedule`, `/optimization`, planner workspace UI).
- Material flow and stockpile optimization (`/flow`, `/stockpiles`, wash plant modules).
- Geology and block model access (`/geology`, block model views).
- Fleet, drill/blast, and shift operations (`/fleet`, `/drill-blast`, `/operations`).
- Monitoring (geotech/environment/safety) (`/monitoring`).
- Reporting and integration features (`/reporting`, `/integration`).

The architecture intent is strong:
- Backend is modular: routers + services + domain models.
- Frontend has route-based page shells with module components.
- There is a central API service (`frontend/src/services/api.js`) with cache/retry/interceptors.

## What Is Working Well
1. Core product decomposition is good.
- Backend router/service split is clear (`backend/app/main.py`, `backend/app/routers/*`, `backend/app/services/*`).
- Frontend app route boundaries are clear (`frontend/src/App.jsx:63`).

2. Main protected routes are defined and reachable.
- Routes exist for dashboard/planner/fleet/drill-blast/operations/monitoring/seed data in `frontend/src/App.jsx:87`, `frontend/src/App.jsx:96`, `frontend/src/App.jsx:105`, `frontend/src/App.jsx:114`, `frontend/src/App.jsx:123`, `frontend/src/App.jsx:132`, `frontend/src/App.jsx:141`.
- Menu wiring exists in `frontend/src/components/layout/AppLayout.jsx:175`, `frontend/src/components/layout/AppLayout.jsx:190`, `frontend/src/components/layout/AppLayout.jsx:191`, `frontend/src/components/layout/AppLayout.jsx:192`, `frontend/src/components/layout/AppLayout.jsx:198`, `frontend/src/components/layout/AppLayout.jsx:217`.

3. Production build succeeds.
- `npm run build` completed successfully (with warnings), proving compile-time viability.

4. Backend imports and starts in-process.
- `from app.main import app` succeeded; root endpoint responds 200.

## High Severity Findings
1. Frontend/backend API contract drift across core modules.
- `configAPI` calls non-existent flow-network endpoints: `frontend/src/services/api.js:357`, `frontend/src/services/api.js:368`; no `/config/flow-network/*` backend endpoints in `backend/app/routers/config_router.py:39` onward.
- `scheduleAPI.createVersion` uses `/schedule/site/{siteId}/versions`: `frontend/src/services/api.js:483`, but backend expects `POST /schedule/versions` with full body: `backend/app/routers/schedule_router.py:29`.
- `scheduleAPI.publishVersion` has no backend route: `frontend/src/services/api.js:552`; no `publish` route in `backend/app/routers/schedule_router.py`.
- `optimizationAPI.runFastPass` calls `/optimization/fast-pass`: `frontend/src/services/api.js:591`, but backend is `/optimization/run-fast`: `backend/app/routers/optimization_router.py:65`.
- `reportingAPI` paths mismatch:
  - `frontend/src/services/api.js:956` expects query param style `/reporting/dashboard?schedule_version_id=...`, backend exposes `/reporting/dashboard/{schedule_version_id}` at `backend/app/routers/reporting_router.py:174`.
  - `frontend/src/services/api.js:967` and `frontend/src/services/api.js:977` endpoints do not match backend summary/export patterns (`backend/app/routers/reporting_router.py:442`, `backend/app/routers/reporting_router.py:332`).
- `drillBlastAPI.predictFragmentation` calls missing endpoint: `frontend/src/services/api.js:1206`; backend has `GET /drill-blast/patterns/{pattern_id}/fragmentation` in `backend/app/routers/drill_blast_router.py:374`.
- Monitoring API drift:
  - Frontend expects `/monitoring/sites/{siteId}/prisms` and `/monitoring/prisms/{id}/history`: `frontend/src/services/api.js:1333`, `frontend/src/services/api.js:1343`; backend has only create/readings + slope alerts (`backend/app/routers/monitoring_router.py:103`, `backend/app/routers/monitoring_router.py:124`, `backend/app/routers/monitoring_router.py:146`).
  - Frontend expects `/monitoring/sites/{siteId}/dust-monitors` and `/water-levels`: `frontend/src/services/api.js:1367`, `frontend/src/services/api.js:1398`; backend has no matching GET routes.
- Integration API drift:
  - Frontend uses `/integration/mappings/{entityType}`: `frontend/src/services/api.js:1528`, `frontend/src/services/api.js:1539`; backend expects `/integration/mappings` with query/body fields at `backend/app/routers/integration_router.py:687`, `backend/app/routers/integration_router.py:704`.
  - Frontend uses `/integration/lab-results`: `frontend/src/services/api.js:1549`; backend exposes `/integration/lab-results/import-delayed` at `backend/app/routers/integration_router.py:839`.
- Surface API drift:
  - Frontend expects `/surfaces/{id}/mesh`, `/versions`, `/compare`, `/upload`: `frontend/src/services/api.js:1476`, `frontend/src/services/api.js:1485`, `frontend/src/services/api.js:1495`, `frontend/src/services/api.js:1506`.
  - Backend exposes different operations (`create-from-points`, `create-from-file`, `query`, `volume-between`, `seam-tonnage`, contours/export/delete): `backend/app/routers/surface_router.py:137`, `backend/app/routers/surface_router.py:188`, `backend/app/routers/surface_router.py:311`, `backend/app/routers/surface_router.py:335`.

2. Broken workflows in live UI components.
- Seed data success CTA navigates to invalid route: `navigate('/dashboard')` at `frontend/src/pages/SeedDataPage.jsx:202` (app routes are under `/app/*`).
- Operations ShiftLog prop mismatch:
  - `ShiftLog` expects `activeShift`: `frontend/src/components/operations/ShiftLog.jsx:4`.
  - Dashboard passes `shiftId`: `frontend/src/pages/OperationsDashboard.jsx:214`.
- Handover payload mismatch (likely 422):
  - Frontend sends `outgoing_supervisor` / `incoming_supervisor` / `notes`: `frontend/src/components/operations/ShiftHandoverForm.jsx:7`, `frontend/src/components/operations/ShiftHandoverForm.jsx:8`, `frontend/src/components/operations/ShiftHandoverForm.jsx:9`.
  - Backend requires `outgoing_supervisor_name` / `incoming_supervisor_name` and field set like `safety_notes`: `backend/app/routers/operations_router.py:79`, `backend/app/routers/operations_router.py:81`, `backend/app/routers/operations_router.py:86`.
- Blast event payload mismatch (likely 422):
  - Frontend sends `blast_time`: `frontend/src/components/drillblast/BlastEventLogger.jsx:8`, `frontend/src/components/drillblast/BlastEventLogger.jsx:20`.
  - Backend requires `blast_date`: `backend/app/routers/drill_blast_router.py:114`.
- Geology data shape mismatch:
  - Frontend sets `setBlocks(res.data)`: `frontend/src/components/geology/GeologyViewer.jsx:246`.
  - Backend returns object with `blocks` field: `backend/app/routers/geology_router.py:45`.
- Wash plant workflow is internally inconsistent:
  - Initial fetch handles response as array (`res.data.length`) but endpoint returns object (`wash_plants` wrapper): `frontend/src/components/washplant/WashPlantConfig.jsx:234`, `frontend/src/components/washplant/WashPlantConfig.jsx:235`.
  - Uses `plant_id`, while backend returns `node_id`: `frontend/src/components/washplant/WashPlantConfig.jsx:237`, `backend/app/routers/washplant_router.py:37`.
  - Calls `/washplant/{id}/wash-table` endpoints that do not exist in active routers: `frontend/src/components/washplant/WashPlantConfig.jsx:261`.

3. Environment-linkage instability due mixed API calling styles.
- Central API client uses `VITE_API_BASE_URL` fallback: `frontend/src/services/api.js:24`.
- Many modules bypass it with hardcoded localhost URLs (`frontend/src/pages/LoginPage.jsx:24`, `frontend/src/components/geology/GeologyViewer.jsx:245`, `frontend/src/components/settings/SettingsPanel.jsx:136`).
- Other modules use `/api/...` convention (`frontend/src/components/import/SiteBuilderWizard.jsx:128`, `frontend/src/components/ui/CoordinateTransformer.jsx:72`).
- Dev proxy is commented out: `frontend/vite.config.js:15` to `frontend/vite.config.js:19`.
- Result: behavior differs by runtime mode (Vite dev vs nginx/docker).

4. Healthcheck contract broken in backend container.
- Docker healthcheck calls `/health`: `backend/Dockerfile:31`.
- Backend only defines root endpoint `/`: `backend/app/main.py:196`.
- Runtime check confirmed `/health` returns 404.

## Medium Severity Findings
1. Tests are not reliable as quality gates.
- Backend default `pytest` fails at collection (`ModuleNotFoundError: app`) and stale imports (`ValidationError` missing).
- Frontend `npm test` fails immediately due ESM/CommonJS config mismatch (`module is not defined` in `frontend/jest.config.js:5` with `"type": "module"` package setup).
- Frontend lint is currently red with high volume: 301 findings (270 errors, 31 warnings).

2. Model/test drift in backend.
- With `PYTHONPATH=.`, `tests/test_domain_models.py` runs but many failures show invalid constructor kwargs (tests no longer align to models).

3. Demo fallback behavior hides integration failures.
- Simulated success or mock replacements present in production pathways:
  - `frontend/src/components/scheduler/ScheduleControl.jsx:315`.
  - `frontend/src/components/reporting/ReportingModule.jsx:48`, `frontend/src/components/reporting/ReportingModule.jsx:104`.
  - `frontend/src/components/quality/QualitySpecs.jsx:178`.
  - `frontend/src/pages/SiteDashboard.jsx:203`.
  - `frontend/src/components/integration/ExternalIdMappingUI.jsx:148`.

4. Documentation drift.
- `docs/API_DOCUMENTATION.md` still documents routes like `/schedules/*` and `/flow/networks/*` (`docs/API_DOCUMENTATION.md:61`, `docs/API_DOCUMENTATION.md:76`) that do not reflect current backend router definitions.

5. Security/readiness gap.
- API docs claim broad auth requirement, but router-level auth dependencies are mostly absent outside auth router (`backend/app/routers/auth_router.py:125` etc).
- This is acceptable for local dev, not for commercial production posture.

6. Backend code defect likely to raise runtime error.
- `FlowNetwork` is used in `backend/app/routers/wash_table_router.py:312` but not imported in module header (`backend/app/routers/wash_table_router.py:14` to `backend/app/routers/wash_table_router.py:16`).

## Navigation Audit
### Menu-to-page coverage
- All protected page routes are reachable from menu either directly (`path`) or via planner tab navigation (`plannerTab`) using `handleNavClick`: `frontend/src/components/layout/AppLayout.jsx:283`, `frontend/src/components/layout/AppLayout.jsx:287`.
- Protected routes exist in router table: `frontend/src/App.jsx:87` to `frontend/src/App.jsx:145`.

### Forward/back behavior
- Explicit back buttons exist on only a subset:
  - `frontend/src/pages/SeedDataPage.jsx:74`.
  - `frontend/src/pages/NotFoundPage.jsx:41`.
- Other pages rely on browser history only; no explicit in-app back flow standard.
- Seed page has a broken "forward to dashboard" action due bad path (`frontend/src/pages/SeedDataPage.jsx:202`).

### UX/UI guideline concerns (targeted)
- Navigation items are buttons (not links) without explicit `aria-current` state semantics in menu item component (`frontend/src/components/layout/AppLayout.jsx:231`).
- Monitoring menu has two separate labels routed to the same path with no route-state differentiation (`frontend/src/components/layout/AppLayout.jsx:198`, `frontend/src/components/layout/AppLayout.jsx:199`), reducing navigational clarity.

## Backend <-> Frontend Linkage Status (Module Summary)
- Auth: partially linked and functional.
- Scheduling/Optimization: partially linked; key action endpoints drift.
- Reporting: linked in UI, mismatched API contracts.
- Drill/Blast: create and prediction flows mismatched.
- Operations: mostly linked, but handover and ShiftLog wiring defects block intended behavior.
- Monitoring: slope/dust summary used; several API methods in service are unimplemented backend-side.
- Geology/Wash plant/Surface: linked, but multiple payload/shape/path mismatches.
- Integration: mixed; BI extract paths align in one component, but shared service functions drift.

## Command/Test Evidence
- `pytest` in backend: collection errors (`ModuleNotFoundError: app`, missing import symbols).
- `npm test` in frontend: fails immediately (`module is not defined` from Jest config).
- `npm run build` in frontend: succeeds with warnings (large bundle + CSS @import order warning).
- `npm run lint` in frontend: fails with 301 findings.
- Backend runtime probe: `/` returns 200; `/health` returns 404.

## Overall Status
- Product intent and module breadth are strong.
- Codebase is in advanced prototype/integration phase, not commercial release-ready.
- Primary blocker is contract consistency and quality-gate reliability, not feature count.
