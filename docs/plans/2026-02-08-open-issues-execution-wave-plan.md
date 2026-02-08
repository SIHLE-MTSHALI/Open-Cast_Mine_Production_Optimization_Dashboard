# Open Issues Execution Wave Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Resolve the highest-impact open GitHub issues first by fixing API contracts, routing/navigation breakages, and test/runtime blockers.

**Architecture:** Use a compatibility-first approach: align frontend service methods to existing backend routes where possible; add minimal backend alias routes only when they unblock active UI paths. Prioritize deterministic fixes with test coverage.

**Tech Stack:** FastAPI, SQLAlchemy, React, React Router, Axios, Jest.

---

### Task 1: Fix immediate navigation and payload schema defects

**Files:**
- Modify: `frontend/src/pages/SeedDataPage.jsx`
- Modify: `frontend/src/pages/OperationsDashboard.jsx`
- Modify: `frontend/src/components/operations/ShiftHandoverForm.jsx`
- Modify: `frontend/src/components/drillblast/BlastEventLogger.jsx`
- Modify: `frontend/src/components/geology/GeologyViewer.jsx`

**Outcomes:**
- Fix Seed Data success navigation target (`#2`)
- Align ShiftLog prop contract (`#3`)
- Align shift handover payload schema (`#4`)
- Fix blast payload (`#5`)
- Fix geology response parsing (`#6`)

### Task 2: Fix backend contract and health/test blockers

**Files:**
- Modify: `backend/app/main.py`
- Modify: `backend/pytest.ini`
- Modify: `backend/app/routers/wash_table_router.py`

**Outcomes:**
- Add `/health` endpoint (`#9`)
- Add pytest import path config (`#10`)
- Fix missing `FlowNetwork` import (`#17`)

### Task 3: Standardize frontend API access patterns in active pages

**Files:**
- Modify: `frontend/src/services/api.js`
- Modify: `frontend/src/pages/LoginPage.jsx`
- Modify: `frontend/src/pages/SeedDataPage.jsx`
- Modify: `frontend/src/components/settings/SettingsPanel.jsx`
- Modify: `frontend/src/components/geology/GeologyViewer.jsx`
- Modify: `frontend/src/components/washplant/WashPlantConfig.jsx`
- Modify: `frontend/vite.config.js`

**Outcomes:**
- Remove hardcoded localhost usage in active workflows (`#8`)
- Repair core frontend/backend contract drift in active APIs (`#1`)
- Establish one practical local-dev API strategy (`#42`)

### Task 4: Improve navigation semantics and deduplicate dead nav components

**Files:**
- Modify: `frontend/src/components/layout/AppLayout.jsx`
- Modify: `frontend/src/pages/MonitoringDashboard.jsx`
- Delete: `frontend/src/components/ui/Sidebar.jsx`
- Delete: `frontend/src/components/ui/AppHeader.jsx`

**Outcomes:**
- Semantic route navigation + deterministic active state (`#18`)
- Distinct monitoring intents via query state (`#18`)
- Remove dead duplicate navigation components (`#19`)

### Task 5: Fix Jest/ESM compatibility and add route regression test

**Files:**
- Modify: `frontend/jest.config.js` (or migrate to CJS file)
- Add: `frontend/jest.config.cjs` (if migrated)
- Add: `frontend/src/__tests__/SeedDataPage.test.jsx`

**Outcomes:**
- Restore runnable frontend tests under ESM project config (`#12`)
- Add regression coverage for Seed Data navigation (`#2`)

### Task 6: Add baseline code splitting for heavy routes

**Files:**
- Modify: `frontend/src/App.jsx`

**Outcomes:**
- Route-level lazy loading for major pages (`#20`)

### Task 7: Verification and issue closure updates

**Commands:**
- Backend: `pytest -q`
- Frontend: `npm test`, `npm run build`, targeted lint
- GitHub: close resolved issues with fix notes

**Outcomes:**
- Verified fixes with reproducible commands
- Close completed issues; leave clear status on partially addressed issues

