# Open-Cast Mine Production Optimization Dashboard Developer Guide

Last reviewed: 2026-05-27

This guide is for contributors working on the current FastAPI + React codebase. It describes how the project is structured, how to run it, where to add features, and which checks to run.

## Prerequisites

Install:

- Python 3.10 or newer
- Node.js 18 or newer
- npm
- Git

Optional:

- Docker Desktop or Docker Engine
- PostgreSQL

## Local Backend Setup

From the repository root:

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

The backend runs at:

```text
http://127.0.0.1:8000
```

Generated API docs:

```text
http://127.0.0.1:8000/docs
http://127.0.0.1:8000/redoc
```

You can also run from the repository root:

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The root `app/` package maps `app.main` to `backend/app/main.py`.

## Local Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to `http://localhost:8000`.

## Docker Setup

```bash
cp .env.example .env
docker compose up --build
```

Services:

| Service | Purpose |
| --- | --- |
| `postgres` | PostgreSQL database. |
| `backend` | FastAPI app served by Uvicorn. |
| `frontend` | Vite build served by Nginx. |

Docker URLs:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

## Repository Structure

```text
.
|-- app/                         # Root compatibility package for app.main imports
|-- backend/
|   |-- app/
|   |   |-- domain/              # SQLAlchemy models
|   |   |-- routers/             # FastAPI route modules
|   |   |-- schemas/             # Pydantic schemas
|   |   |-- services/            # Domain and integration services
|   |   |-- database.py          # Engine/session setup
|   |   `-- main.py              # FastAPI app setup
|   |-- migrations/              # Alembic migrations
|   |-- tests/                   # Backend test suite
|   `-- requirements.txt
|-- frontend/
|   |-- src/
|   |   |-- components/          # Domain UI components
|   |   |-- context/             # Site and toast providers
|   |   |-- hooks/               # Custom hooks
|   |   |-- pages/               # Route-level screens
|   |   |-- services/api.js      # Axios API client
|   |   `-- styles/
|   `-- package.json
|-- docs/
|-- tests/                       # Root-level compatibility tests
|-- src/                         # Legacy Dash/SimPy simulator
`-- verify_full_flow.py
```

## Backend Architecture

The backend follows a router/service/domain model structure.

| Layer | Location | Responsibility |
| --- | --- | --- |
| App setup | `backend/app/main.py` | Create FastAPI app, configure CORS, run DB setup, register routers. |
| Database | `backend/app/database.py` | Select SQLite or PostgreSQL, create sessions, expose `Base`. |
| Domain models | `backend/app/domain/` | SQLAlchemy models grouped by mining domain. |
| Routers | `backend/app/routers/` | HTTP endpoints, request parsing, dependency injection. |
| Services | `backend/app/services/` | Domain logic, parser logic, optimizer support, integration logic. |
| Schemas | `backend/app/schemas/` | Shared Pydantic request/response models where used. |
| Tests | `backend/tests/` | Unit, service, API, parser, spatial, and integration tests. |

## Frontend Architecture

| Area | Location | Responsibility |
| --- | --- | --- |
| Routes | `frontend/src/App.jsx` | Public/protected route definitions. |
| Pages | `frontend/src/pages/` | Route-level UI screens. |
| Domain components | `frontend/src/components/` | Reusable UI grouped by mining workflow. |
| API client | `frontend/src/services/api.js` | Axios setup, auth token injection, retry behavior, domain API wrappers. |
| Site state | `frontend/src/context/SiteContext.jsx` | Active site list and selected site state. |
| Toast state | `frontend/src/context/ToastContext.jsx` | User feedback messages. |
| Hooks | `frontend/src/hooks/` | Shared frontend logic. |

## Main Backend Route Groups

| Prefix | Purpose |
| --- | --- |
| `/auth` | Registration, login, sessions, current user. |
| `/health` | Liveness, readiness, detailed health. |
| `/config` | Sites, resources, material types, settings, seed data. |
| `/calendar` | Calendars and periods. |
| `/schedule` | Schedule versions, tasks, runs, publishing, diagnostics. |
| `/optimization` | Optimization runs, status, explanations, diagnostics. |
| `/cp-solver` | CP solver experiments and model validation. |
| `/quality` | Quality fields, blending, constraints, simulations. |
| `/wash-plants` | Wash tables and wash plant operations. |
| `/stockpiles`, `/staged-stockpiles` | Stockpile state and staged pile operations. |
| `/boreholes`, `/blockmodels`, `/surfaces` | Geology and surface workflows. |
| `/crs`, `/raster`, `/strings`, `/annotations`, `/surface-tools` | Spatial, CAD, and raster workflows. |
| `/fleet` | Equipment, GPS, geofences, haul cycles, maintenance, health. |
| `/drill-blast` | Patterns, holes, blast events. |
| `/operations` | Tickets, shifts, handovers, incidents, summaries. |
| `/monitoring` | Slope, bore, dust, hazard, and fatigue records. |
| `/reporting`, `/reports`, `/csv` | Dashboards, report generation, exports. |
| `/integration` | Imports, connectors, webhooks, mappings, BI extracts. |
| `/ws` | WebSocket and collaboration-style endpoints. |

## Adding Backend Features

1. Add or update SQLAlchemy models in `backend/app/domain/`.
2. Import new model modules from `backend/app/domain/__init__.py` if tests or metadata registration need them.
3. Add service logic in `backend/app/services/`.
4. Add a router in `backend/app/routers/`.
5. Register the router in `backend/app/main.py`.
6. Add tests under `backend/tests/`.
7. Run focused tests first, then broader tests.

Example router skeleton:

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db

router = APIRouter(prefix="/example", tags=["Example"])


@router.get("/")
def list_examples(db: Session = Depends(get_db)):
    return []
```

## Adding Frontend Features

1. Add API methods to `frontend/src/services/api.js` if backend calls are needed.
2. Add or update components under the matching folder in `frontend/src/components/`.
3. Add route-level behavior in `frontend/src/pages/` if the feature needs a page.
4. Use `SiteContext` for active site behavior.
5. Use `ToastContext` for user feedback.
6. Handle loading, empty, error, disabled, and long-data states.
7. Add or update tests under `frontend/src/__tests__/`.

## Testing

Backend:

```bash
cd backend
pytest -q
```

Specific backend test file:

```bash
cd backend
pytest -q tests/test_api_endpoints.py
```

Root import compatibility:

```bash
pytest -q tests/test_root_app_module_resolution.py
```

Frontend:

```bash
cd frontend
npm run lint
npm test -- --runInBand
npm run build
```

Manual smoke check:

```bash
python verify_full_flow.py
```

Start the backend before running `verify_full_flow.py`.

## Database Notes

When `DATABASE_URL` is not set, the backend uses SQLite:

```text
backend/mineopt_pro.db
```

When `DATABASE_URL` is set, the backend uses PostgreSQL.

On startup, the app tries to run Alembic migrations. If that fails in a partial local environment, it falls back to SQLAlchemy `create_all`. For serious deployment work, manage migrations deliberately with Alembic and review schema changes.

## Environment Variables

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

## Dependency Notes

- Use npm for frontend dependencies because `frontend/package-lock.json` is present.
- Use `backend/requirements.txt` for the FastAPI backend.
- Root `requirements.txt` is for the older Dash/SimPy code under `src/`.
- Spatial/PDF dependencies such as Rasterio, PyProj, Shapely, and WeasyPrint may require system libraries depending on OS.

## Pull Request Checklist

Before opening a PR:

- scope the change to one coherent task
- avoid staging unrelated dirty worktree files
- run `git diff --check`
- run focused backend/frontend checks relevant to the change
- update docs when behavior, setup, routes, or workflows change
- describe verification results in the PR body

## Common Pitfalls

- Frontend components may show fallback data when API calls fail. Check browser network output before assuming backend data exists.
- Some route groups are broad and generated API docs are the source of truth for exact request/response models.
- Seed data adds records to the current database. Reset local SQLite if you need a clean run.
- Do not assume every endpoint has production-grade authorization coverage. Review security-sensitive paths before exposing the app beyond local development.
