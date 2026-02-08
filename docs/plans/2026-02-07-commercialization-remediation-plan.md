# MineOpt Pro Commercialization Remediation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the current prototype/integration build into a commercially shippable, testable, and operable product baseline.

**Architecture:** Stabilize system contracts first (API parity + schema alignment), then fix workflow blockers, then enforce quality gates (tests/lint/docs/CI), then harden security/performance/deployment for production readiness.

**Tech Stack:** FastAPI, SQLAlchemy, React, Vite, Jest, ESLint, Docker, PostgreSQL.

---

## Program-Level Delivery Rules
1. All API contract changes must update both `backend` routers/schemas and `frontend/src/services/api.js` in the same PR.
2. All workflow bug fixes require at least one automated regression test.
3. No new feature work until all `priority:high` defects from audit are resolved.
4. Remove hidden mock fallbacks in production code paths; replace with explicit error states.
5. CI must block merges on failing tests/lint/contract checks.

---

### Task 1: Establish API Contract Source Of Truth

**Files:**
- Modify: `backend/app/main.py`
- Modify: `backend/app/routers/*.py`
- Modify: `frontend/src/services/api.js`
- Create: `docs/contracts/api-contract-map.md`

**Step 1: Inventory implemented backend endpoints**
- Run: `rg -n "@router" backend/app/routers`
- Output a canonical endpoint list grouped by module.

**Step 2: Inventory frontend API usages**
- Run: `rg -n "/(config|schedule|optimization|reporting|integration|monitoring|surfaces|drill-blast|wash)" frontend/src`
- Map each call to backend route.

**Step 3: Define canonical endpoints**
- Prefer backend route conventions already implemented unless they are clearly incorrect.
- Record request/response examples in `docs/contracts/api-contract-map.md`.

**Step 4: Add contract test skeleton**
- Create a lightweight test file in backend (for route existence) and frontend (for API path snapshots).

**Step 5: Commit**
- `git commit -m "chore: define canonical backend-frontend API contract map"`

---

### Task 2: Repair Config/Schedule/Optimization Contracts

**Files:**
- Modify: `frontend/src/services/api.js`
- Modify: `frontend/src/pages/PlannerWorkspace.jsx`
- Modify: `backend/app/routers/schedule_router.py` (only if endpoint additions are chosen)

**Step 1: Decide endpoint direction**
- Option A: adapt frontend to existing backend routes.
- Option B: add compatibility aliases in backend for existing frontend paths.
- Recommended: Option A now, Option B only as temporary migration.

**Step 2: Fix schedule create/publish behaviors**
- Align `createVersion` path/payload with `POST /schedule/versions`.
- Implement or remove `publishVersion` until backend route exists.

**Step 3: Fix optimization fast pass path**
- Change frontend from `/optimization/fast-pass` to `/optimization/run-fast`.

**Step 4: Validate planner schedule workflows**
- Run planner actions: list versions, create version, run fast pass.
- Add regression tests for each.

**Step 5: Commit**
- `git commit -m "fix: align schedule and optimization API contracts"`

---

### Task 3: Repair Reporting Contracts

**Files:**
- Modify: `frontend/src/services/api.js`
- Modify: `frontend/src/components/reporting/ReportingModule.jsx`
- Modify: `backend/app/routers/reporting_router.py` (if compatibility endpoints added)

**Step 1: Align dashboard endpoint**
- Use `/reporting/dashboard/{schedule_version_id}` contract.

**Step 2: Align summary/export endpoints**
- Use existing summary and export endpoints from `reporting_router.py`.
- Standardize request body/query requirements.

**Step 3: Remove mock-success fallback behavior**
- Replace demo fallback with explicit error UI and retry actions.

**Step 4: Add integration tests**
- Backend: report endpoint smoke tests.
- Frontend: reporting module API integration tests with mocked responses.

**Step 5: Commit**
- `git commit -m "fix: align reporting module with backend routes"`

---

### Task 4: Repair Drill/Blast and Operations Workflow Breakers

**Files:**
- Modify: `frontend/src/components/drillblast/BlastEventLogger.jsx`
- Modify: `frontend/src/components/operations/ShiftHandoverForm.jsx`
- Modify: `frontend/src/pages/OperationsDashboard.jsx`
- Modify: `frontend/src/components/operations/ShiftLog.jsx`

**Step 1: Blast event schema alignment**
- Rename `blast_time` payload to `blast_date` (and validate backend expected fields).

**Step 2: Handover schema alignment**
- Map fields to backend schema: `outgoing_supervisor_name`, `incoming_supervisor_name`, etc.

**Step 3: ShiftLog prop fix**
- Pass `activeShift` into `ShiftLog` instead of `shiftId` or update component API consistently.

**Step 4: Add workflow tests**
- Add tests for shift start, ticket logging, handover submit, and blast log submit.

**Step 5: Commit**
- `git commit -m "fix: restore drill-blast and operations workflow compatibility"`

---

### Task 5: Repair Geology/Wash Plant/Surface Contracts

**Files:**
- Modify: `frontend/src/components/geology/GeologyViewer.jsx`
- Modify: `frontend/src/components/washplant/WashPlantConfig.jsx`
- Modify: `frontend/src/services/api.js`
- Modify: `backend/app/routers/wash_table_router.py`

**Step 1: Geology response parsing**
- Use `res.data.blocks` rather than full object payload.

**Step 2: Wash plant endpoint unification**
- Pick one canonical API family (`/washplant` or `/wash-plants`) and normalize IDs (`node_id` vs `plant_id`).

**Step 3: Surface API alignment**
- Update frontend service methods to existing `surface_router` endpoints or add missing backend endpoints with clear semantics.

**Step 4: Fix backend `FlowNetwork` import**
- Add missing import in `wash_table_router.py` and add route test.

**Step 5: Commit**
- `git commit -m "fix: align geology wash-plant and surface integrations"`

---

### Task 6: Standardize Frontend API Access And Runtime Configuration

**Files:**
- Modify: `frontend/src/services/api.js`
- Modify: `frontend/src/pages/LoginPage.jsx`
- Modify: `frontend/src/components/**/*` (all direct-host calls)
- Modify: `frontend/vite.config.js`
- Modify: `frontend/nginx.conf`

**Step 1: Remove hardcoded `http://localhost:8000` calls**
- Route all requests through centralized API client.

**Step 2: Standardize `/api` strategy**
- Either:
  - Use absolute backend URL only, or
  - Use `/api` consistently with working dev proxy.
- Recommended: consistent `/api` path + Vite proxy in dev + nginx proxy in prod.

**Step 3: Enable and verify Vite proxy**
- Un-comment and validate proxy config.

**Step 4: Add env docs**
- Document `VITE_API_BASE_URL`, auth token handling, and deployment variants.

**Step 5: Commit**
- `git commit -m "refactor: standardize frontend API transport and config"`

---

### Task 7: Fix Navigation Reliability And UX Semantics

**Files:**
- Modify: `frontend/src/pages/SeedDataPage.jsx`
- Modify: `frontend/src/components/layout/AppLayout.jsx`
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/__tests__/navigation.test.jsx`

**Step 1: Fix invalid route**
- Change seed-data success navigation to `/app/dashboard`.

**Step 2: Improve route intent for Monitoring menu**
- Add query state for distinct views (example: `/app/monitoring?tab=geotech|environment`).

**Step 3: Navigation semantics/accessibility**
- Use `Link`/`NavLink` or explicitly set ARIA current-state on button-based nav items.

**Step 4: Forward/back policy**
- Add consistent in-app back affordance for major pages or define that browser history is canonical.

**Step 5: Commit**
- `git commit -m "fix: improve navigation correctness and semantics"`

---

### Task 8: Replace Hidden Mock Fallbacks With Explicit Product Modes

**Files:**
- Modify: `frontend/src/components/scheduler/ScheduleControl.jsx`
- Modify: `frontend/src/components/reporting/ReportingModule.jsx`
- Modify: `frontend/src/components/quality/QualitySpecs.jsx`
- Modify: `frontend/src/pages/SiteDashboard.jsx`
- Modify: `frontend/src/components/integration/ExternalIdMappingUI.jsx`
- Create: `frontend/src/config/featureFlags.js`

**Step 1: Define explicit demo flag**
- Add `VITE_DEMO_MODE` or equivalent.

**Step 2: Gate mock data behavior behind demo mode only**
- Default production mode must not fake success.

**Step 3: Add user-visible error states**
- Show actionable retries and error details.

**Step 4: Add tests**
- Validate behavior differs correctly by demo flag.

**Step 5: Commit**
- `git commit -m "feat: explicit demo mode and production-safe error handling"`

---

### Task 9: Rebuild Test Infrastructure Baseline

**Files:**
- Modify: `backend/pytest.ini`
- Modify: `backend/tests/*` (failing imports and stale expectations)
- Modify: `frontend/jest.config.js`
- Modify: `frontend/src/setupTests.js`
- Modify: `frontend/package.json`

**Step 1: Backend import path fix**
- Ensure `pytest` can import `app` without manual `PYTHONPATH`.

**Step 2: Update stale backend tests**
- Align domain tests to current model fields.

**Step 3: Frontend Jest ESM alignment**
- Convert config format to ESM-compatible setup or move to CJS file naming convention.

**Step 4: Establish required smoke suites**
- Backend smoke: key router endpoints.
- Frontend smoke: route rendering + core workflow APIs.

**Step 5: Commit**
- `git commit -m "test: restore backend and frontend test executability"`

---

### Task 10: Restore Lint Baseline And Hook Correctness

**Files:**
- Modify: `frontend/src/**/*`
- Modify: `frontend/eslint.config.js`

**Step 1: Triage lint categories**
- Blockers first: hook immutability/order issues and undefined globals in tests/config.

**Step 2: Fix test globals/config**
- Ensure jest/vitest globals configured correctly for test files.

**Step 3: Fix hook safety issues**
- Prioritize `ToastContext` and `useWebSocket` callback ordering/dependencies.

**Step 4: Ratchet policy**
- If full cleanup is large, enforce "no new lint errors" while reducing baseline in batches.

**Step 5: Commit**
- `git commit -m "chore: restore eslint baseline and hook safety"`

---

### Task 11: Harden Backend Readiness (Health, Auth, Config)

**Files:**
- Modify: `backend/app/main.py`
- Modify: `backend/Dockerfile`
- Modify: `backend/app/routers/*.py` (auth dependency strategy)
- Modify: `docs/API_DOCUMENTATION.md`

**Step 1: Add `/health` endpoint**
- Return lightweight health payload and optional dependency checks.

**Step 2: Make CORS configurable**
- Read allowed origins from env rather than static hardcoded list.

**Step 3: Define auth policy**
- Mark public routes and enforce auth on all protected routes.

**Step 4: Add auth tests**
- Unauthorized request should fail on protected endpoints.

**Step 5: Commit**
- `git commit -m "feat: production readiness hardening for health auth and cors"`

---

### Task 12: Documentation And Release Governance

**Files:**
- Modify: `docs/API_DOCUMENTATION.md`
- Modify: `docs/DEVELOPER_GUIDE.md`
- Modify: `README.md`
- Create: `.github/workflows/ci.yml`
- Create: `docs/release/readiness-checklist.md`

**Step 1: Regenerate API docs from source of truth**
- Eliminate stale route examples.

**Step 2: Update developer setup docs**
- Ensure test/lint/build commands are accurate.

**Step 3: Add CI workflow gates**
- Backend tests, frontend tests, lint, build, and optional contract checks.

**Step 4: Define release checklist**
- Security, performance, observability, backup, rollback, smoke tests.

**Step 5: Commit**
- `git commit -m "docs: align product docs and add release governance"`

---

## Commercial-Grade Enhancements (Post-Stabilization)
1. Observability
- Structured logging, trace IDs, error reporting, dashboards.
2. Performance
- Frontend route-level code splitting and bundle budgets.
- Backend query profiling and slow-query guardrails.
3. Security
- Secrets management, token rotation, RBAC matrix, audit exports.
4. Data Reliability
- Migration framework, backup/restore drills, seed idempotency.
5. Product Operations
- SLA/SLO definitions, incident playbooks, on-call runbooks.

---

## Validation Matrix (Definition Of Done)
1. Functional
- All critical workflows run end-to-end without mock fallbacks.
2. Contract
- 100% parity between frontend service methods and backend routes.
3. Quality
- Tests pass on CI, lint baseline enforced, build warnings reduced.
4. Security
- Protected routes enforce auth.
5. Operability
- Healthchecks pass, docker-compose startup stable, docs accurate.

---

Plan complete and saved to `docs/plans/2026-02-07-commercialization-remediation-plan.md`.
Two execution options:
1. Subagent-Driven (this session) - I execute the plan task-by-task with checkpoints.
2. Parallel Session (separate) - Start a fresh execution session focused only on this plan.
