# GitHub Issue Drafts (Audit 2026-02-07)

These drafts are ready to paste into GitHub issues.
Current blocker: GitHub CLI is not available in this shell (and non-admin install failed), so I could not publish directly.

---

## 1) Fix critical frontend/backend API contract drift
**Labels:** `bug`, `backend`, `frontend`, `api`, `priority:high`

### Summary
Multiple frontend API calls do not match implemented backend routes, causing broken workflows.

### Evidence
- `frontend/src/services/api.js:357`, `frontend/src/services/api.js:368` vs `backend/app/routers/config_router.py:39`.
- `frontend/src/services/api.js:483` vs `backend/app/routers/schedule_router.py:29`.
- `frontend/src/services/api.js:552` (no backend publish route).
- `frontend/src/services/api.js:591` vs `backend/app/routers/optimization_router.py:65`.
- `frontend/src/services/api.js:956`, `frontend/src/services/api.js:967`, `frontend/src/services/api.js:977` vs `backend/app/routers/reporting_router.py:174`, `backend/app/routers/reporting_router.py:442`, `backend/app/routers/reporting_router.py:332`.
- `frontend/src/services/api.js:1206` vs `backend/app/routers/drill_blast_router.py:374`.
- `frontend/src/services/api.js:1476`, `frontend/src/services/api.js:1485`, `frontend/src/services/api.js:1495`, `frontend/src/services/api.js:1506` vs `backend/app/routers/surface_router.py:137`.
- `frontend/src/services/api.js:1528`, `frontend/src/services/api.js:1539`, `frontend/src/services/api.js:1549` vs `backend/app/routers/integration_router.py:687`, `backend/app/routers/integration_router.py:704`, `backend/app/routers/integration_router.py:839`.

### Acceptance Criteria
- All frontend API methods map to real backend endpoints.
- Removed/renamed endpoints are reflected in frontend service layer.
- Contract tests validate route + payload shape for all core modules.

---

## 2) Fix Seed Data success navigation target
**Labels:** `bug`, `frontend`, `navigation`, `priority:high`

### Summary
Seed success CTA routes to non-existent `/dashboard` instead of `/app/dashboard`.

### Evidence
- `frontend/src/pages/SeedDataPage.jsx:202`
- Valid route table in `frontend/src/App.jsx:87`.

### Acceptance Criteria
- CTA navigates to `/app/dashboard`.
- Add navigation test for SeedData success flow.

---

## 3) Fix ShiftLog prop contract mismatch in Operations Dashboard
**Labels:** `bug`, `frontend`, `operations`, `priority:high`

### Summary
`ShiftLog` expects `activeShift`, but dashboard passes `shiftId`.

### Evidence
- `frontend/src/components/operations/ShiftLog.jsx:4`
- `frontend/src/pages/OperationsDashboard.jsx:214`

### Acceptance Criteria
- Prop interface aligned.
- Shift log loads current tickets for active shift.

---

## 4) Fix shift handover payload schema mismatch
**Labels:** `bug`, `frontend`, `backend`, `operations`, `priority:high`

### Summary
Frontend handover payload field names do not match backend `HandoverCreate` schema.

### Evidence
- Frontend payload fields: `frontend/src/components/operations/ShiftHandoverForm.jsx:7` to `frontend/src/components/operations/ShiftHandoverForm.jsx:10`
- Backend schema: `backend/app/routers/operations_router.py:79` to `backend/app/routers/operations_router.py:86`

### Acceptance Criteria
- Submit payload validates without 422.
- End-to-end handover + shift end flow passes.

---

## 5) Fix blast event payload mismatch (`blast_time` vs `blast_date`)
**Labels:** `bug`, `frontend`, `backend`, `drill-blast`, `priority:high`

### Summary
Frontend sends `blast_time`, backend requires `blast_date`.

### Evidence
- Frontend: `frontend/src/components/drillblast/BlastEventLogger.jsx:8`, `frontend/src/components/drillblast/BlastEventLogger.jsx:20`
- Backend: `backend/app/routers/drill_blast_router.py:114`

### Acceptance Criteria
- Blast event form submits successfully.
- Regression test ensures schema compatibility.

---

## 6) Fix geology response parsing in `GeologyViewer`
**Labels:** `bug`, `frontend`, `geology`, `priority:high`

### Summary
Viewer stores full response object in `blocks` state instead of `response.blocks`.

### Evidence
- `frontend/src/components/geology/GeologyViewer.jsx:246`
- Backend response shape: `backend/app/routers/geology_router.py:45`

### Acceptance Criteria
- Viewer handles backend response shape correctly.
- Filtering/search works on array data.

---

## 7) Fix wash plant UI/backend integration mismatch
**Labels:** `bug`, `frontend`, `backend`, `wash-plant`, `priority:high`

### Summary
Wash plant UI mixes endpoint families and mismatched IDs/response shapes.

### Evidence
- `frontend/src/components/washplant/WashPlantConfig.jsx:233` to `frontend/src/components/washplant/WashPlantConfig.jsx:237`
- `frontend/src/components/washplant/WashPlantConfig.jsx:261`
- Backend singular router: `backend/app/routers/washplant_router.py:13`, `backend/app/routers/washplant_router.py:16`
- Backend plural router: `backend/app/routers/wash_table_router.py:21`, `backend/app/routers/wash_table_router.py:338`

### Acceptance Criteria
- Unified endpoint strategy (`/washplant` vs `/wash-plants`) documented and implemented.
- UI uses correct identifier (`node_id` or canonical equivalent).
- Full load/edit/save wash table workflow passes.

---

## 8) Standardize API access patterns (remove hardcoded localhost and mixed `/api`)
**Labels:** `tech-debt`, `frontend`, `infra`, `priority:high`

### Summary
Frontend mixes centralized client, hardcoded hosts, and `/api` calls while Vite proxy is disabled.

### Evidence
- Base client: `frontend/src/services/api.js:24`
- Hardcoded fetch/axios examples: `frontend/src/pages/LoginPage.jsx:24`, `frontend/src/components/geology/GeologyViewer.jsx:245`
- `/api` calls: `frontend/src/components/import/SiteBuilderWizard.jsx:128`
- Disabled Vite proxy: `frontend/vite.config.js:15` to `frontend/vite.config.js:19`

### Acceptance Criteria
- One source of truth for API base URL.
- No raw hardcoded backend URLs in feature components.
- Local dev + docker deploys both work without code changes.

---

## 9) Add real `/health` endpoint or align healthcheck target
**Labels:** `bug`, `backend`, `devops`, `priority:high`

### Summary
Container healthcheck probes `/health`, but backend only serves `/`.

### Evidence
- Healthcheck probe: `backend/Dockerfile:31`
- Existing route: `backend/app/main.py:196`
- Runtime check result: `/health` returns 404.

### Acceptance Criteria
- `/health` returns 200 with lightweight payload.
- Docker healthcheck passes consistently.

---

## 10) Fix backend test execution baseline (`ModuleNotFoundError: app`)
**Labels:** `bug`, `backend`, `tests`, `priority:high`

### Summary
`pytest` fails during collection because package import path is not configured.

### Evidence
- Failing collection in `tests/test_api_endpoints.py` and others.
- `backend/pytest.ini` lacks `pythonpath` config.

### Acceptance Criteria
- `pytest` runs from backend root with no import-path errors.
- CI command is documented and reproducible.

---

## 11) Repair stale backend tests after model evolution
**Labels:** `tech-debt`, `backend`, `tests`, `priority:medium`

### Summary
Even with `PYTHONPATH=.`, domain model tests fail due outdated field expectations.

### Evidence
- `tests/test_domain_models.py` failures (`invalid keyword argument` for multiple models).

### Acceptance Criteria
- Tests updated to current schema contracts.
- Model contract tests reflect authoritative model fields.

---

## 12) Fix frontend Jest/ESM configuration incompatibility
**Labels:** `bug`, `frontend`, `tests`, `priority:high`

### Summary
`npm test` fails immediately: `module is not defined` in Jest config under ESM project setup.

### Evidence
- `frontend/package.json` has `"type": "module"`.
- `frontend/jest.config.js:5` uses CommonJS `module.exports`.

### Acceptance Criteria
- Jest config and runtime compatible with current module system.
- `npm test` executes suite.

---

## 13) Establish lint quality baseline and enforce cleanup
**Labels:** `tech-debt`, `frontend`, `quality`, `priority:medium`

### Summary
`npm run lint` reports 301 findings (270 errors, 31 warnings), preventing reliable gating.

### Evidence
- Lint run output from 2026-02-07 audit.

### Acceptance Criteria
- Error count driven to zero (or staged baseline policy with ratchet).
- Key hooks/immutability violations fixed first.

---

## 14) Remove production-time mock fallback paths from critical workflows
**Labels:** `tech-debt`, `frontend`, `product-quality`, `priority:high`

### Summary
Several modules silently swap to demo/mock data on API failure, masking defects.

### Evidence
- `frontend/src/components/scheduler/ScheduleControl.jsx:315`
- `frontend/src/components/reporting/ReportingModule.jsx:48`
- `frontend/src/components/reporting/ReportingModule.jsx:104`
- `frontend/src/components/quality/QualitySpecs.jsx:178`
- `frontend/src/pages/SiteDashboard.jsx:203`
- `frontend/src/components/integration/ExternalIdMappingUI.jsx:148`

### Acceptance Criteria
- Production mode surfaces real errors; no silent fake-success paths.
- Demo mode explicitly feature-flagged.

---

## 15) Update API documentation to match implemented routes
**Labels:** `docs`, `backend`, `frontend`, `priority:medium`

### Summary
Published API docs describe outdated routes and mislead integration work.

### Evidence
- `docs/API_DOCUMENTATION.md:61`, `docs/API_DOCUMENTATION.md:76`, `docs/API_DOCUMENTATION.md:132`, `docs/API_DOCUMENTATION.md:139`.

### Acceptance Criteria
- Docs generated from OpenAPI or contract source of truth.
- Frontend service docs and backend docs align.

---

## 16) Add authentication enforcement policy for non-auth routers
**Labels:** `security`, `backend`, `priority:high`

### Summary
Most routers do not enforce auth dependencies despite docs stating auth is required.

### Evidence
- Auth dependencies present mostly in `backend/app/routers/auth_router.py`.
- No equivalent dependency patterns found broadly in other routers.

### Acceptance Criteria
- Defined auth matrix per route group.
- Protected routes enforce auth/roles.
- Public routes explicitly documented.

---

## 17) Fix `FlowNetwork` import gap in wash table router
**Labels:** `bug`, `backend`, `wash-plant`, `priority:medium`

### Summary
`FlowNetwork` is referenced but not imported, likely causing runtime error.

### Evidence
- Usage: `backend/app/routers/wash_table_router.py:312`.
- Imports section lacks `FlowNetwork`: `backend/app/routers/wash_table_router.py:14` to `backend/app/routers/wash_table_router.py:16`.

### Acceptance Criteria
- Route executes without `NameError`.
- Add regression test for `/wash-plants/site/{site_id}`.

---

## 18) Improve navigation semantics and route intent clarity
**Labels:** `ux`, `frontend`, `accessibility`, `priority:medium`

### Summary
Navigation uses button elements without explicit route semantics/state and has duplicate intent labels on same path.

### Evidence
- Nav item implementation: `frontend/src/components/layout/AppLayout.jsx:231`.
- Monitoring entries share same path: `frontend/src/components/layout/AppLayout.jsx:198`, `frontend/src/components/layout/AppLayout.jsx:199`.

### Acceptance Criteria
- Use semantic links for route navigation or explicit ARIA state management.
- Distinct route state/query params for distinct monitoring intents.

---

## 19) Remove or integrate dead/duplicate navigation components
**Labels:** `tech-debt`, `frontend`, `priority:low`

### Summary
Legacy/duplicate nav components increase maintenance drift risk.

### Evidence
- `frontend/src/components/ui/Sidebar.jsx` appears not imported by active app shell.
- `frontend/src/components/ui/AppHeader.jsx` appears unused.

### Acceptance Criteria
- Consolidate to one navigation system.
- Delete dead components or wire them intentionally.

---

## 20) Reduce production bundle size and add code splitting
**Labels:** `performance`, `frontend`, `priority:medium`

### Summary
Frontend production bundle is very large (>2MB minified main chunk).

### Evidence
- Build output warning from `vite build` (`assets/index-*.js` ~2.27 MB, chunk warning).

### Acceptance Criteria
- Route/module-level code splitting for heavy planner/3D/reporting modules.
- Bundle budget and CI check added.
