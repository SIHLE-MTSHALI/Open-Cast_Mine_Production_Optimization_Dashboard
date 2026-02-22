# ⛏️ MineOpt Pro — Open-Cast Mine Production Optimization Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.182-black.svg)](https://threejs.org)

> **MineOpt Pro** is a full-stack, enterprise-grade open-cast mine production optimization platform.
> It integrates scheduling, quality management, 3D visualization, fleet tracking, drill & blast planning,
> environmental monitoring, and real-time collaboration into a single unified dashboard — purpose-built
> for modern mining operations.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Screenshots and UI Guide](#screenshots-and-ui-guide)
4. [Architecture Overview](#architecture-overview)
5. [Technology Stack](#technology-stack)
6. [Getting Started](#getting-started)
7. [Installation Guide](#installation-guide)
8. [Configuration Reference](#configuration-reference)
9. [Running the Application](#running-the-application)
10. [Docker Deployment](#docker-deployment)
11. [Project Structure](#project-structure)
12. [Backend API Reference](#backend-api-reference)
13. [Frontend Components Reference](#frontend-components-reference)
14. [Domain Models](#domain-models)
15. [Scheduling and Optimization Engine](#scheduling-and-optimization-engine)
16. [Quality Management System](#quality-management-system)
17. [3D Visualization and CAD Tools](#3d-visualization-and-cad-tools)
18. [Geology and Geotechnical](#geology-and-geotechnical)
19. [Fleet Management System](#fleet-management-system)
20. [Drill and Blast Planning](#drill-and-blast-planning)
21. [Environmental Monitoring](#environmental-monitoring)
22. [Reporting and Export](#reporting-and-export)
23. [Collaboration and Real-Time Features](#collaboration-and-real-time-features)
24. [Data Management Hub](#data-management-hub)
25. [Security and Authentication](#security-and-authentication)
26. [Tools and Workflows](#tools-and-workflows)
27. [UI Components and Design System](#ui-components-and-design-system)
28. [Testing Guide](#testing-guide)
29. [Troubleshooting Guide](#troubleshooting-guide)
30. [Frequently Asked Questions](#frequently-asked-questions)
31. [Performance Tuning](#performance-tuning)
32. [Contributing](#contributing)
33. [Future Work and Roadmap](#future-work-and-roadmap)
34. [Changelog](#changelog)
35. [License](#license)

---

## Overview

MineOpt Pro addresses the core challenge every open-cast mine faces: **how do you move the right
material, at the right time, to the right destination, while meeting quality specifications, fleet
constraints, and environmental regulations?**

Traditional mine planning relies on disconnected spreadsheets, siloed geological models, and manual
scheduling. MineOpt Pro replaces this fragmented approach with an integrated digital platform.

### What MineOpt Pro Does

| Capability | Description |
|-----------|-------------|
| **Production Scheduling** | Multi-horizon planning with CP-SAT and LP solvers, Gantt chart editing, shift calendars |
| **Quality Management** | Monte Carlo simulation, washability analysis, penalty curves, demand chain tracking |
| **3D Visualization** | WebGL terrain, block models, surface timelines, CAD string editing, annotations |
| **Fleet Management** | GPS tracking, geofencing, haul cycle analysis, route optimization, maintenance |
| **Drill & Blast** | Pattern planning, fragmentation modeling, cost estimation, blast-to-mine linking |
| **Environmental** | Dust, noise, water quality monitoring, rehabilitation tracking, compliance dashboards |
| **Reporting** | Automated report packs, reconciliation, management KPIs, CSV/PDF export, email delivery |
| **Collaboration** | Real-time presence, edit locking, audit trail, version control |

### Who Is This For?

| Audience | What You Get |
|----------|-------------|
| **Mine Planners** | Multi-horizon scheduling, Gantt charts, precedence management, shift calendars |
| **Geologists** | Borehole management, seam modeling, block model visualization, kriging interpolation |
| **Processing Engineers** | Washability analysis, penalty curves, demand chain dashboards, quality simulation |
| **Fleet Managers** | Real-time GPS tracking, maintenance scheduling, haul route optimization, cycle analysis |
| **Environmental Officers** | Dust/noise monitoring, water quality, rehabilitation planning, compliance reports |
| **Mine Managers** | KPI dashboards, reconciliation, management report packs, variance analysis |
| **Software Developers** | Clean REST API (40 routers), React component library, extensible architecture |
| **Students & Researchers** | Open-source reference implementation of modern mine planning concepts |

### Non-Technical Summary

If you manage or work at an open-cast mine, MineOpt Pro gives you a **single web-based dashboard**
where you can:

- 📅 **Plan what to mine and when** — drag tasks on a Gantt chart, set production targets per week/month/year
- 🧪 **Manage coal or ore quality** — see predicted quality before mining, optimize blending to meet customer specs
- 🗺️ **View your mine in 3D** — rotate, zoom, and query terrain surfaces, pit designs, and geological models
- 🚛 **Track your fleet** — see where trucks and excavators are in real-time, monitor fuel and maintenance
- 💣 **Plan blasting** — design drill patterns, estimate fragmentation, calculate explosives costs
- 🌿 **Stay compliant** — monitor dust, noise, and water levels against regulatory thresholds
- 📊 **Generate reports** — daily production summaries, quality compliance, management KPI packs
- 👥 **Work together** — see who else is editing, avoid conflicts, track all changes

No special software installation is needed — it runs in your web browser.

---

## Key Features

### 🗓️ Production Scheduling

- **Multi-horizon planning** — strategic (yearly), tactical (monthly), operational (weekly/shift)
- **Constraint programming** — Google OR-Tools CP-SAT solver with configurable objectives
- **Linear programming** — Multi-period material allocation and blending optimization
- **Precedence management** — Block-to-block mining sequence constraints with visual editor
- **Interactive Gantt chart** — Drag-and-drop schedule visualization with critical path highlighting
- **Shift calendar builder** — Define shifts, public holidays, weather stoppages, maintenance windows
- **Schedule diagnostics** — Infeasibility detection, binding constraint analysis, optimizer delay tracking
- **Variable rate control** — Override equipment production rates per period for what-if analysis
- **Async execution** — Background schedule runs with WebSocket progress updates
- **Schedule versioning** — Immutable schedule snapshots with diff comparison
- **Flow network validation** — Material routing with capacity constraints and quality objectives

### 🧪 Quality Management

- **Monte Carlo simulation** — Probabilistic quality forecasting across blended material streams
- **Washability analysis** — Interactive yield/ash curves with density cutpoint optimization
- **Penalty curve editor** — Define quality penalties per parameter and visualize financial impact
- **Demand chain dashboard** — Track customer quality specs against planned production per period
- **Lab results import** — Parse CSV/TXT lab exports with delayed-data handling
- **Quality compliance reports** — Automated checks against tolerance bands
- **Multi-product blending** — Optimize blends across multiple stockpiles and destinations

### 🌏 3D Visualization and CAD

- **3D terrain viewer** — WebGL-powered surface rendering with orbit, pan, and zoom controls
- **Block model viewer** — Voxel-based geological model display with attribute filtering and selection
- **Surface timeline player** — Temporal playback of mining progress with comparison overlays
- **CAD string editor** — Create, edit, split, merge, and reverse 3D polylines with vertex handles
- **Annotation system** — 10 types: text, elevation, dimension, area, volume, bearing, coordinates, grade, station, label
- **Print layout manager** — A0–A4 page setup with configurable scale bar, title block, north arrow
- **Surface query tool** — Point elevation, profile extraction, cut/fill, contour, smoothing
- **Volume calculator** — Seam reserves, cut/fill earthworks, ramp design, dump capacity calculations
- **DXF import/export** — Industry-standard CAD file format support
- **ASCII grid import** — Raster surface data (GeoTIFF, ASC) with CRS transformation

### 🚛 Fleet and Haulage

- **Real-time fleet panel** — GPS position tracking with equipment status indicators
- **Geofencing** — Define exclusion/inclusion zones with automatic violation alerts
- **Haul cycle analysis** — Automatic trip detection (load → haul → dump → return) with timestamps
- **Haulage route editor** — Multi-route comparison with cycle time, fleet sizing, cost-per-tonne
- **Maintenance tracking** — Component life monitoring with overdue alerts and service scheduling
- **Haulage optimization** — Dijkstra shortest-path routing with grade and rolling-resistance modeling
- **Fleet KPI dashboard** — Utilization, availability, MTBF, and payload tracking

### 💣 Drill and Blast

- **Pattern planning** — Visual drill hole grid layout with burden × spacing configuration
- **Hole specifications** — Diameter, depth, charge weight, stemming height per individual hole
- **Fragmentation modeling** — Kuz-Ram prediction with size distribution curves
- **Blast cost estimation** — Explosives, drilling, and accessories cost breakdown per blast event
- **Blast-to-mine linking** — Connect blast events to scheduling tasks and geological blocks
- **Pattern library** — Save and reuse proven drill patterns for consistent results

### 🌿 Environmental Monitoring

- **Dust monitoring** — PM2.5 and PM10 levels with trend analysis and regulatory limit compliance
- **Noise monitoring** — Decibel readings with time-of-day profiling and limit tracking
- **Water quality** — pH, turbidity, suspended solids, and dissolved metals at monitoring points
- **Rehabilitation tracking** — Area status progression (planned → active → completed) with targets
- **Environmental dashboard** — Unified view across all environmental domains with alert priorities
- **Compliance reports** — Automated checks against permit conditions and regulatory thresholds

### 📊 Reporting and Export

- **Report pack generator** — Daily, weekly, monthly production summary reports
- **Management KPI reports** — Executive dashboards with production-vs-plan, quality, and equipment KPIs
- **Reconciliation panel** — Planned vs actual tonnage, grade, and strip ratio variance analysis
- **CSV export** — Tabular data export for all datasets
- **Email delivery** — Scheduled report distribution via SMTP
- **Shift handover reports** — End-of-shift summary with incidents, production, and notes

### 👥 Collaboration and Real-Time

- **Presence indicators** — See who is online and what they are editing
- **Edit locking** — Prevent concurrent edits with heartbeat-based lock management
- **Audit trail** — Complete change history for all entities with user attribution
- **WebSocket updates** — Real-time schedule progress, fleet positions, and notifications
- **Version immutability** — Published schedules are frozen; edits create new versions

### 🔐 Security

- **JWT authentication** — Token-based auth with configurable expiry
- **Role-based access** — Admin, Planner, Viewer, and Operator roles
- **Password hashing** — bcrypt-based secure credential storage
- **CORS configuration** — Configurable allowed origins for API access
- **Health checks** — Liveness, readiness, and detailed system probes for container orchestration

---

## Screenshots and UI Guide

MineOpt Pro features a modern, dark-themed dashboard interface designed for mine planning professionals.
Below is a tour of the main screens and what you can accomplish in each.

### Landing Page

The landing page provides a high-level overview of MineOpt Pro's capabilities and quick access to
core features. It is the first thing users see before logging in.

**Key elements:**
- Hero section with animated entrance
- Feature highlights with icon cards
- Quick-start links to documentation
- Login / Register call-to-action

### Site Dashboard

After logging in and selecting a mine site, the **Site Dashboard** is your command center.

**Panels include:**
- **Production KPIs** — total tonnes, ore tonnes, waste tonnes, strip ratio (planned vs actual)
- **Quality Summary** — current quality parameters vs target bands
- **Schedule Progress** — percentage complete vs plan for current period
- **Fleet Status** — equipment availability, active trucks, and idle equipment count
- **Alerts Panel** — critical notifications (geofence violations, quality exceedances, overdue maintenance)
- **Quick Actions** — links to run schedulers, generate reports, view 3D viewer

### Planner Workspace

The **Planner Workspace** is the primary environment for mine planners. It provides:

- **Gantt Chart** — drag-and-drop task scheduling with dependency arrows
- **Resource Table** — equipment assignments with utilization indicators
- **Flow Network Editor** — visual material routing from pit → stockpile → plant → product
- **Precedence Graph** — directed acyclic graph of mining sequence constraints
- **Optimizer Controls** — run CP-SAT solver, view diagnostics, compare schedule versions
- **Period Selector** — switch between planning horizons (annual, quarterly, monthly, weekly)

### 3D Viewer

The **3D Viewer** renders mine geometry using Three.js with React Three Fiber:

- **Terrain Surface** — triangulated irregular network (TIN) with elevation-based coloring
- **Block Model** — semi-transparent voxels showing grade, material type, or density
- **CAD Strings** — polylines for pit outlines, roads, dumps, and infrastructure boundaries
- **Annotations** — floating labels, dimension lines, elevation callouts, and bearing indicators
- **Camera Controls** — orbit, pan, zoom, preset views (top, front, side, isometric)
- **Measurement Tools** — point-to-point distance, area of polygon, volume between surfaces

### Operations Dashboard

The **Operations Dashboard** provides a real-time view for shift supervisors:

- **Live Fleet Map** — equipment positions on a Leaflet basemap with status icons
- **Production Counters** — real-time tonnage counters updated via WebSocket
- **Active Alerts** — geofence violations, fatigue events, hazard zone entries
- **Shift Summary** — current shift production vs target with time elapsed bar
- **Material Movement** — tonnage moved per source/destination pair this shift

### Fleet Dashboard

The **Fleet Dashboard** gives fleet managers comprehensive oversight:

- **Equipment Cards** — availability, utilization, MTBF, and current status per machine
- **Haul Cycle Table** — detailed trip records with load/haul/dump/return timestamps
- **Maintenance Panel** — upcoming services, overdue items, component life remaining
- **GPS Track Viewer** — historical path replay for any equipment over selected date range
- **Geofence Manager** — draw and manage exclusion/inclusion zones on the map

### Drill & Blast Dashboard

The **Drill & Blast Dashboard** supports blast planning:

- **Pattern Editor** — visual grid layout with hole spacing, burden, and offset controls
- **Hole Detail Panel** — depth, diameter, charge weight, and stemming per hole
- **Fragmentation Prediction** — Kuz-Ram model output with size distribution chart
- **Cost Summary** — explosives, drilling, and accessories cost per blast calculated automatically
- **Blast Log** — historical blast events with links to geological and scheduling data

### Monitoring Dashboard

The **Monitoring Dashboard** gives environmental officers a unified view:

- **Dust Tab** — PM2.5 and PM10 charts with regulatory threshold lines
- **Noise Tab** — dB(A) readings with time-of-day patterns
- **Water Tab** — pH, turbidity, and dissolved metals at each monitoring bore
- **Rehabilitation Tab** — progress cards showing hectares planned, active, and completed
- **Exceedance Alerts** — automatic notifications when readings exceed permit limits

### Seed Data Page

The **Seed Data Page** lets new users quickly populate the system with realistic demo data.
Click the seed button to generate:

- 2 example mine sites with full geological data
- Borehole sets, block models, and terrain surfaces
- Equipment fleet with GPS history and maintenance records
- Sample schedules, quality data, drill patterns, and environmental readings
- Calendar with shifts, holidays, and weather events

This is ideal for evaluation, training, and development purposes.

---

## Architecture Overview

MineOpt Pro follows a **three-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                   │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │  Pages   │ │Components│ │ Context  │ │   Hooks     │ │
│  │  (10)    │ │  (41     │ │ (Site,   │ │ (API calls, │ │
│  │         │ │ folders) │ │  Auth,   │ │  WebSocket) │ │
│  │         │ │          │ │  Theme)  │ │             │ │
│  └─────────┘ └──────────┘ └──────────┘ └─────────────┘ │
│  Vite Dev Server (:5173)  ─── Build → Nginx (:3000)    │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / WebSocket
┌────────────────────────▼────────────────────────────────┐
│                  Backend (FastAPI)                       │
│  ┌──────────┐ ┌───────────┐ ┌─────────────────────────┐│
│  │ Routers  │ │ Services  │ │    Domain Models        ││
│  │  (40     │ │  (60+     │ │  (21 model files,       ││
│  │ files)   │ │  files)   │ │   SQLAlchemy ORM)       ││
│  └──────────┘ └───────────┘ └─────────────────────────┘│
│  ┌──────────┐ ┌───────────┐ ┌─────────────────────────┐│
│  │ Solvers  │ │   Auth    │ │    WebSocket Hub        ││
│  │ (CP-SAT, │ │  (JWT,    │ │  (presence, progress,   ││
│  │  LP)     │ │  bcrypt)  │ │   fleet updates)        ││
│  └──────────┘ └───────────┘ └─────────────────────────┘│
│  Uvicorn (:8000)                                        │
└────────────────────────┬────────────────────────────────┘
                         │ SQLAlchemy ORM
┌────────────────────────▼────────────────────────────────┐
│                   Database Layer                         │
│  ┌──────────────────────┐  ┌──────────────────────────┐ │
│  │   PostgreSQL 15      │  │   SQLite (dev/test)      │ │
│  │   (production)       │  │   (zero-config local)    │ │
│  └──────────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Separation of Concerns** — Routers handle HTTP, services contain business logic, domain models define data
2. **Convention over Configuration** — Consistent file naming, standard CRUD patterns across all modules
3. **Progressive Enhancement** — Works with SQLite for development, scales to PostgreSQL for production
4. **Offline-First Components** — Frontend renders meaningfully with demo data, no backend required for UI dev
5. **Theme Compatibility** — All components use CSS custom properties (`var(--color-*)`) for light/dark mode

### Request Flow

```
User Action → React Component → API Hook → Axios Request
    → FastAPI Router → Service Layer → SQLAlchemy ORM → Database
    → Response → JSON → React State Update → UI Re-render
```

### WebSocket Flow

```
Frontend connects → /ws/{client_id}
Server broadcasts: schedule_progress, fleet_position, presence_update, notification
Frontend dispatches to appropriate context/reducer
```

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Python** | 3.10+ | Core language |
| **FastAPI** | 0.100+ | REST API framework with automatic OpenAPI docs |
| **Uvicorn** | 0.20+ | ASGI server with WebSocket support |
| **SQLAlchemy** | 2.0+ | ORM with relationship mapping and migrations |
| **PostgreSQL** | 15 | Production database |
| **SQLite** | 3 | Development/testing database (zero-config) |
| **Google OR-Tools** | — | CP-SAT constraint programming solver |
| **NumPy** | 1.21+ | Numerical computation (kriging, optimization) |
| **Pandas** | 1.3+ | Data manipulation for reports and CSV export |
| **SimPy** | 4.0+ | Discrete event simulation for quality Monte Carlo |
| **DEAP** | 1.3+ | Evolutionary algorithms for multi-objective optimization |
| **Shapely** | 2.0+ | Geometric operations (polygons, intersections, buffering) |
| **PyProj** | 3.4+ | Coordinate reference system transformations |
| **Rasterio** | 1.3+ | GeoTIFF and raster DEM reading |
| **Faker** | 8.0+ | Realistic demo data generation |
| **PyJWT** | — | JSON Web Token authentication |
| **bcrypt** | — | Password hashing |

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19 | UI component framework |
| **Vite** | 6+ | Build tool and dev server with HMR |
| **React Router** | 7 | Client-side routing |
| **Axios** | 1.13+ | HTTP client with interceptors |
| **Three.js** | 0.182 | 3D rendering engine |
| **React Three Fiber** | 9.5 | React bindings for Three.js |
| **React Three Drei** | 10.7 | Three.js helpers (controls, text, loaders) |
| **Recharts** | 3.6 | Charting library for KPI dashboards |
| **Leaflet** | 1.9 | 2D map rendering for fleet tracking |
| **React Leaflet** | 5.0 | React bindings for Leaflet |
| **Lucide React** | 0.562 | Icon library (mine-themed iconography) |
| **Tailwind CSS** | 4.1 | Utility-first CSS framework |

### Infrastructure

| Technology | Purpose |
|-----------|---------|
| **Docker** | Containerization for all services |
| **Docker Compose** | Multi-service orchestration |
| **Nginx** | Frontend static file serving and reverse proxy |
| **Redis** | Session caching and pub/sub (optional) |

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Minimum Version | Check Command |
|------------|-----------------|---------------|
| Python | 3.10 | `python --version` |
| Node.js | 18 | `node --version` |
| npm | 9 | `npm --version` |
| Git | 2.30 | `git --version` |
| Docker *(optional)* | 20 | `docker --version` |

### Quick Start (5 Minutes)

For the impatient — get MineOpt Pro running in 5 steps:

```bash
# 1. Clone the repository
git clone https://github.com/SIHLE-MTSHALI/MineOpt-pro.git
cd MineOpt-pro

# 2. Set up the backend
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt

# 3. Start the backend
uvicorn app.main:app --reload --port 8000

# 4. In a new terminal, set up and start the frontend
cd frontend
npm install
npm run dev

# 5. Open your browser to http://localhost:5173
```

**First things to do after launch:**

1. **Register a new account** on the login page
2. **Visit the Seed Data page** to populate with demo data
3. **Select a site** from the site selector dropdown
4. **Explore the dashboard** — try the Planner Workspace, 3D Viewer, and Fleet Dashboard

---

## Installation Guide

### Detailed Backend Setup

```bash
# Clone the repository
git clone https://github.com/SIHLE-MTSHALI/MineOpt-pro.git
cd MineOpt-pro

# Create and activate a Python virtual environment
cd backend
python -m venv venv

# Activate the virtual environment
# On Windows (PowerShell):
venv\Scripts\Activate.ps1
# On Windows (cmd):
venv\Scripts\activate.bat
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

#### What Gets Installed

The `requirements.txt` installs the following packages:

| Package | Purpose |
|---------|---------|
| `fastapi` | Web framework with automatic API documentation |
| `uvicorn` | ASGI server for running FastAPI |
| `websockets` | WebSocket support for real-time features |
| `numpy`, `pandas` | Numerical computation and data manipulation |
| `faker` | Realistic demo data generation for seeding |
| `simpy` | Discrete event simulation engine |
| `deap` | Evolutionary/genetic algorithm framework |
| `pyproj` | Coordinate reference system transformation |
| `shapely` | 2D geometric operations |
| `rasterio` | Raster data (GeoTIFF, DEM) reading |

### Detailed Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Verify installation
npm run build
```

#### What Gets Installed

| Package | Purpose |
|---------|---------|
| `react`, `react-dom` | UI component framework |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP client for API communication |
| `three`, `@react-three/fiber`, `@react-three/drei` | 3D rendering |
| `recharts` | Charting and data visualization |
| `leaflet`, `react-leaflet` | 2D map rendering |
| `lucide-react` | SVG icon library |
| `tailwindcss` | Utility-first CSS framework |

### Verifying Your Installation

After installing both backend and frontend, verify everything works:

```bash
# Terminal 1: Start backend
cd backend
uvicorn app.main:app --reload --port 8000
# You should see: "Uvicorn running on http://0.0.0.0:8000"

# Terminal 2: Start frontend
cd frontend
npm run dev
# You should see: "Local: http://localhost:5173/"

# Terminal 3: Verify API
curl http://localhost:8000/
# Should return: {"message": "MineOpt Pro API is running"}

# Verify API docs
# Open browser to: http://localhost:8000/docs
# You should see the Swagger UI with all 40+ API endpoints
```

---

## Configuration Reference

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `mineopt` | PostgreSQL username |
| `POSTGRES_PASSWORD` | *(required)* | PostgreSQL password |
| `POSTGRES_DB` | `mineopt_pro` | Database name |
| `SECRET_KEY` | *(required)* | JWT signing key — use a long random string |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Allowed frontend origins |
| `SMTP_HOST` | *(optional)* | SMTP server for email report delivery |
| `SMTP_PORT` | `587` | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_USER` | *(optional)* | SMTP authentication username |
| `SMTP_PASSWORD` | *(optional)* | SMTP authentication password |
| `SMTP_FROM` | `noreply@mineopt.com` | Sender email address |
| `REDIS_URL` | *(optional)* | Redis connection string for caching |

### Generating a Secure Secret Key

```bash
# Python method
python -c "import secrets; print(secrets.token_urlsafe(64))"

# OpenSSL method
openssl rand -base64 48
```

### Database Configuration

**Development (SQLite — no configuration needed):**

By default, MineOpt Pro uses SQLite with a database file at `backend/mineopt_pro.db`.
This requires zero configuration and is ideal for development and testing.

**Production (PostgreSQL):**

Set the `DATABASE_URL` environment variable:

```bash
DATABASE_URL=postgresql://mineopt:your-password@localhost:5432/mineopt_pro
```

The database schema is created automatically on first startup via SQLAlchemy's `create_all()`.
For production, Alembic migrations are supported if configured.

### Frontend Configuration

The frontend connects to the backend via the `VITE_API_URL` environment variable:

```bash
# In frontend/.env (create if it doesn't exist)
VITE_API_URL=http://localhost:8000
```

If not set, the frontend defaults to `http://localhost:8000`.

---

## Running the Application

### Development Mode

Development mode provides hot-reloading for both backend and frontend:

```bash
# Terminal 1: Backend with auto-reload
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8000 --log-level info

# Terminal 2: Frontend with HMR (Hot Module Replacement)
cd frontend
npm run dev
```

**Backend runs on:** `http://localhost:8000`
**Frontend runs on:** `http://localhost:5173`
**API documentation:** `http://localhost:8000/docs` (Swagger UI)
**Alternative API docs:** `http://localhost:8000/redoc` (ReDoc)

### Production Mode

```bash
# Build the frontend for production
cd frontend
npm run build

# Run backend in production mode
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The production frontend build outputs to `frontend/dist/` and should be served
by a reverse proxy (e.g., Nginx) or a static file server.

---

## Docker Deployment

### Using Docker Compose

The easiest way to deploy MineOpt Pro is with Docker Compose, which starts all three services
(PostgreSQL, Backend, Frontend) with a single command:

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your settings (especially POSTGRES_PASSWORD and SECRET_KEY)

# 2. Build and start all services
docker-compose up -d --build

# 3. Check service health
docker-compose ps

# 4. View logs
docker-compose logs -f backend
```

### Service Ports

| Service | Port | URL |
|---------|------|-----|
| PostgreSQL | 5432 | `postgresql://mineopt:password@localhost:5432/mineopt_pro` |
| Backend API | 8000 | `http://localhost:8000` |
| Frontend | 3000 | `http://localhost:3000` |

### Health Checks

The backend provides health check endpoints for container orchestration:

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `GET /health/live` | Liveness probe | `{"status": "alive"}` |
| `GET /health/ready` | Readiness probe | `{"status": "ready", "database": "connected"}` |
| `GET /health/detailed` | Full system check | CPU, memory, disk, database, all services |

### Stopping and Cleanup

```bash
# Stop all services
docker-compose down

# Stop and remove all data (including database)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build
```

---

## Project Structure

```
MineOpt-pro/
├── .env.example              # Environment variable template
├── .gitignore                # Git ignore patterns
├── docker-compose.yml        # Multi-service Docker orchestration
├── requirements.txt          # Root-level Python dependencies
│
├── backend/                  # FastAPI backend application
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile            # Backend container definition
│   └── app/
│       ├── main.py           # FastAPI app entry point, middleware, router registration
│       ├── database.py       # SQLAlchemy engine and session configuration
│       ├── domain/           # SQLAlchemy ORM models (21 files)
│       │   ├── models_core.py           # User, Role, Site
│       │   ├── models_calendar.py       # Calendar, Period
│       │   ├── models_resource.py       # MaterialType, Activity, Resource
│       │   ├── models_scheduling.py     # ScheduleVersion, Task
│       │   ├── models_flow.py           # FlowNetwork, FlowNode, FlowArc
│       │   ├── models_fleet.py          # Equipment, GPSReading, HaulCycle
│       │   ├── models_drill_blast.py    # BlastPattern, DrillHole, BlastEvent
│       │   ├── models_borehole.py       # Borehole, BoreholeInterval
│       │   ├── models_block_model.py    # BlockModel, Block
│       │   ├── models_surface.py        # Surface, SurfacePoint
│       │   ├── models_surface_history.py # SurfaceVersion, SurfaceComparison
│       │   ├── models_wash_table.py     # WashTable, WashTableEntry
│       │   ├── models_demand.py         # Product, Customer, DemandForecast
│       │   ├── models_geotech_safety.py # GeotechDomain, HazardZone, FatigueEvent
│       │   ├── models_material_shift.py # LoadTicket, Shift, ShiftHandover
│       │   ├── models_planning_horizon.py # PlanningHorizon, HorizonTarget
│       │   ├── models_precedence.py     # PrecedenceConstraint
│       │   ├── models_parcel.py         # MaterialParcel
│       │   ├── models_staged_stockpile.py # StagedStockpile
│       │   └── models_schedule_results.py # ScheduleResult
│       ├── routers/          # API endpoint definitions (40 files)
│       │   ├── auth_router.py           # Authentication (login, register, token)
│       │   ├── config_router.py         # Site configuration CRUD
│       │   ├── schedule_router.py       # Schedule versions and solver execution
│       │   ├── optimization_router.py   # CP-SAT and LP optimization runs
│       │   ├── quality_router.py        # Quality data and compliance
│       │   ├── fleet_router.py          # Equipment and GPS tracking
│       │   ├── geology_router.py        # Geological data (boreholes, seams)
│       │   ├── surface_router.py        # Terrain surfaces CRUD
│       │   ├── reporting_router.py      # Report generation and scheduling
│       │   ├── flow_router.py           # Material flow network
│       │   ├── drill_blast_router.py    # Blast patterns and events
│       │   ├── monitoring_router.py     # Environmental monitoring
│       │   ├── health_router.py         # Liveness/readiness probes
│       │   ├── websocket_router.py      # WebSocket connections
│       │   └── ... (26 more routers)
│       └── services/         # Business logic layer (60+ files)
│           ├── auth_service.py          # JWT token management, password hashing
│           ├── cp_solver.py             # Google OR-Tools CP-SAT integration
│           ├── lp_allocator.py          # Linear programming material allocation
│           ├── flow_optimizer.py        # Network flow optimization
│           ├── haulage_optimizer.py     # Haul route shortest path (Dijkstra)
│           ├── monte_carlo_quality.py   # Quality Monte Carlo simulation
│           ├── kriging_service.py       # Spatial interpolation for geology
│           ├── report_pack.py           # Multi-section report generation
│           ├── comprehensive_seed_service.py # Demo data generation
│           └── ... (50+ more services)
│
├── frontend/                 # React 19 + Vite frontend application
│   ├── package.json          # Node.js dependencies and scripts
│   ├── Dockerfile            # Frontend container definition
│   ├── vite.config.js        # Vite build configuration
│   └── src/
│       ├── App.jsx           # Root component with routing
│       ├── main.jsx          # React DOM render entry point
│       ├── index.css         # Global styles and CSS custom properties
│       ├── context/          # React contexts (Auth, Site, Theme)
│       ├── pages/            # Page-level components (10 pages)
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── SiteDashboard.jsx
│       │   ├── PlannerWorkspace.jsx
│       │   ├── OperationsDashboard.jsx
│       │   ├── FleetDashboard.jsx
│       │   ├── DrillBlastDashboard.jsx
│       │   ├── MonitoringDashboard.jsx
│       │   ├── SeedDataPage.jsx
│       │   └── NotFoundPage.jsx
│       └── components/       # Reusable UI components (41 directories)
│           ├── annotation/   # Annotation tools (toolbar, renderer)
│           ├── cad/          # CAD string editor, print layout
│           ├── calendar/     # Shift calendar builder
│           ├── collaboration/# Presence indicators, edit locks
│           ├── dashboard/    # KPI cards, production widgets
│           ├── data/         # Data management hub
│           ├── drill-blast/  # Blast pattern editor
│           ├── fleet/        # Fleet panel, maintenance views
│           ├── flow/         # Flow network editor
│           ├── gantt/        # Gantt chart component
│           ├── geology/      # Borehole viewer, seam editor
│           ├── geotech/      # Slope analysis, hazard zones
│           ├── quality/      # Washability, penalty curves
│           ├── reporting/    # Report builder, reconciliation
│           ├── scheduler/    # Optimizer controls, diagnostics
│           ├── site/         # Site builder wizard
│           ├── spatial/      # Volume calculator, haulage routes
│           ├── surface/      # Surface tools panel
│           ├── ui/           # Shared UI primitives (buttons, modals)
│           ├── viewer3d/     # 3D terrain and block model viewer
│           ├── washplant/    # Wash plant configuration
│           └── ... (20 more component directories)
│
├── docs/                     # Documentation files
├── tests/                    # Test suites
└── data/                     # Local data storage (gitignored)
```

---

## Backend API Reference

All API endpoints are documented automatically via FastAPI's OpenAPI integration.
Visit `http://localhost:8000/docs` for the interactive Swagger UI,
or `http://localhost:8000/redoc` for the ReDoc alternative.

### API Router Summary (40 Routers)

| Router | Prefix | Description |
|--------|--------|-------------|
| `auth_router` | `/auth` | User registration, login, JWT token management |
| `config_router` | `/config` | Site configuration, settings CRUD |
| `schedule_router` | `/schedule` | Schedule versions, tasks, solver execution |
| `optimization_router` | `/optimization` | CP-SAT and LP solver runs, diagnostics |
| `cp_solver_router` | `/cp-solver` | Direct CP-SAT solver API for advanced users |
| `quality_router` | `/quality` | Quality data, compliance checks |
| `fleet_router` | `/fleet` | Equipment, GPS, haul cycles, maintenance |
| `geology_router` | `/geology` | Geological layers, seam models |
| `borehole_router` | `/boreholes` | Borehole data and interval management |
| `block_model_router` | `/block-models` | Block model CRUD and queries |
| `surface_router` | `/surfaces` | Terrain surface management |
| `surface_tools_router` | `/surface-tools` | Surface queries, operations, analysis |
| `surface_history_router` | `/surface-history` | Surface versioning and temporal comparison |
| `cad_string_router` | `/cad-strings` | CAD polyline CRUD |
| `annotation_router` | `/annotations` | Map annotations CRUD |
| `raster_router` | `/raster` | Raster/DEM data import and queries |
| `file_format_router` | `/files` | DXF, ASCII grid, and other format support |
| `flow_router` | `/flow` | Material flow network management |
| `calendar_router` | `/calendar` | Calendar and period management |
| `planning_horizon_router` | `/horizons` | Planning horizon and target management |
| `precedence_router` | `/precedence` | Mining sequence constraints |
| `resources_router` | `/resources` | Resource (equipment/material) management |
| `demand_router` | `/demand` | Product demand forecasting |
| `reporting_router` | `/reporting` | Report generation and scheduling |
| `reports_router` | `/reports` | Report pack downloads |
| `csv_export_router` | `/export` | CSV data export for any dataset |
| `analytics_router` | `/analytics` | Advanced analytics and KPIs |
| `drill_blast_router` | `/drill-blast` | Blast patterns, holes, events |
| `fleet_router` | `/fleet` | Fleet equipment and tracking |
| `monitoring_router` | `/monitoring` | Environmental monitoring data |
| `operations_router` | `/operations` | Shift operations and material movement |
| `stockpile_router` | `/stockpiles` | Stockpile management |
| `staged_stockpile_router` | `/staged-stockpiles` | Staged stockpile tracking |
| `washplant_router` | `/washplant` | Wash plant configuration and data |
| `wash_table_router` | `/wash-tables` | Washability data tables |
| `integration_router` | `/integration` | External system integration |
| `settings_router` | `/settings` | Application settings |
| `security_router` | `/security` | Security audit and access logs |
| `crs_router` | `/crs` | Coordinate reference system operations |
| `websocket_router` | `/ws` | WebSocket connections |
| `health_router` | `/health` | Liveness, readiness, detailed health probes |

### Common API Patterns

All routers follow consistent REST patterns:

```http
# List all items for a site
GET /api/{resource}/site/{site_id}

# Get a single item by ID
GET /api/{resource}/{id}

# Create a new item
POST /api/{resource}/

# Update an existing item
PUT /api/{resource}/{id}

# Delete an item
DELETE /api/{resource}/{id}
```

### Authentication

All endpoints (except `/auth/login`, `/auth/register`, `/health/*`) require a JWT token:

```bash
# Register a new user
curl -X POST http://localhost:8000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username": "planner1", "password": "secure_pass", "email": "planner@mine.com"}'

# Login and get token
curl -X POST http://localhost:8000/auth/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=planner1&password=secure_pass'

# Use token in subsequent requests
curl http://localhost:8000/config/sites \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## Frontend Components Reference

The frontend is organized into 41 component directories, each focused on a specific domain.
Components use React 19 with hooks, CSS custom properties for theming, and Lucide React for icons.

### Component Directory Map

| Directory | Key Components | Purpose |
|-----------|---------------|---------|
| `annotation/` | `AnnotationToolbar`, `AnnotationRenderer` | 10 annotation types with styles |
| `audit/` | `AuditLogViewer` | Change history viewer |
| `cad/` | `CADStringEditor`, `PrintLayoutManager` | String editing, print layouts |
| `calendar/` | `CalendarBuilder`, `ShiftCalendar` | Shift and period calendars |
| `collaboration/` | `PresenceIndicator`, `EditLock` | Real-time collaboration |
| `dashboard/` | `KPICards`, `ProductionWidget` | Main dashboard widgets |
| `data/` | `DataManagementHub` | Centralized CRUD for all datasets |
| `demand/` | `DemandDashboard`, `ProductEditor` | Customer demand tracking |
| `drill-blast/` | `BlastPatternEditor`, `FragmentationChart` | Blast planning |
| `fleet/` | `FleetPanel`, `MaintenancePanel` | Fleet tracking and maintenance |
| `flow/` | `FlowNetworkEditor`, `NodeEditor` | Material flow network |
| `gantt/` | `GanttChart`, `TaskEditor` | Interactive Gantt scheduling |
| `geology/` | `BoreholeViewer`, `SeamEditor` | Geological data |
| `geotech/` | `SlopeAnalysis`, `HazardZones` | Geotechnical safety |
| `haulage/` | `HaulageRouter`, `RouteEditor` | Haul route management |
| `material/` | `MaterialTracker`, `ShiftLog` | Material movement tracking |
| `monitoring/` | `EnvironmentalDashboard` | Dust, noise, water monitoring |
| `operations/` | `ShiftSummary`, `Alerts` | Real-time operations |
| `quality/` | `WashabilityChart`, `PenaltyCurve` | Quality management |
| `reporting/` | `ReportBuilder`, `ReconciliationPanel` | Report generation |
| `scheduler/` | `OptimizerControls`, `ScheduleDiagnostics` | Solver integration |
| `site/` | `SiteBuilderWizard` | New mine site setup |
| `spatial/` | `VolumeCalculator`, `HaulageRenderer` | Spatial calculations |
| `surface/` | `SurfaceToolPanel`, `SurfaceQueryTool` | Surface operations |
| `ui/` | `Button`, `Modal`, `SkeletonLoader`, `Breadcrumb` | Shared UI primitives |
| `viewer3d/` | `TerrainViewer`, `BlockModelViewer` | 3D WebGL rendering |
| `washplant/` | `WashPlantConfig` | Wash plant settings |

---

## Domain Models

MineOpt Pro's data layer consists of 21 SQLAlchemy model files defining the complete
open-cast mining data schema. All models use UUID primary keys and support multi-tenant
site isolation via `site_id` foreign keys.

### Core Models

| Model | Table | Key Fields |
|-------|-------|------------|
| `User` | `users` | `user_id`, `username`, `email`, `hashed_password`, `role` |
| `Role` | `roles` | `role_id`, `name`, `permissions` (JSON) |
| `Site` | `sites` | `site_id`, `name`, `location`, `crs_epsg`, `status` |

### Calendar & Planning

| Model | Table | Key Fields |
|-------|-------|------------|
| `Calendar` | `calendars` | `calendar_id`, `site_id`, `name`, `year` |
| `Period` | `periods` | `period_id`, `calendar_id`, `name`, `start_date`, `end_date`, `type` |
| `PlanningHorizon` | `planning_horizons` | `horizon_id`, `parent_id`, `level`, `targets` |
| `HorizonTarget` | `horizon_targets` | `target_id`, `horizon_id`, tonnage, ore, waste, quality |

### Scheduling

| Model | Table | Key Fields |
|-------|-------|------------|
| `ScheduleVersion` | `schedule_versions` | `version_id`, `site_id`, `status`, `schedule_type` |
| `Task` | `tasks` | `task_id`, `schedule_version_id`, `resource_id`, `period_id`, `planned_quantity` |
| `PrecedenceConstraint` | `precedence_constraints` | `constraint_id`, predecessor/successor IDs, lag |

### Resources & Materials

| Model | Table | Key Fields |
|-------|-------|------------|
| `MaterialType` | `material_types` | `material_type_id`, `name`, `density`, quality fields |
| `QualityField` | `quality_fields` | `field_id`, `name`, `unit`, `min`, `max`, `target` |
| `Activity` | `activities` | `activity_id`, `type` (Mining, Haulage, Processing, etc.) |
| `Resource` | `resources` | `resource_id`, `type`, `capacity`, `availability` |

### Flow Network

| Model | Table | Key Fields |
|-------|-------|------------|
| `FlowNetwork` | `flow_networks` | `network_id`, `site_id`, `name` |
| `FlowNode` | `flow_nodes` | `node_id`, `type` (Source, Stockpile, Plant, Dump, Customer) |
| `FlowArc` | `flow_arcs` | `arc_id`, `from_node_id`, `to_node_id`, `capacity` |
| `ArcQualityObjective` | `arc_quality_objectives` | `objective_id`, `arc_id`, quality bounds |

### Geological

| Model | Table | Key Fields |
|-------|-------|------------|
| `Borehole` | `boreholes` | `borehole_id`, `site_id`, collar X/Y/Z, depth |
| `BoreholeInterval` | `borehole_intervals` | `interval_id`, from/to depth, lithology, quality |
| `BlockModel` | `block_models` | `model_id`, `site_id`, origin, cell sizes, block count |
| `Block` | `blocks` | `block_id`, I/J/K indices, grade, density, material type |
| `Surface` | `surfaces` | `surface_id`, `name`, `type`, `crs_epsg`, points (JSON) |

### Fleet & Operations

| Model | Table | Key Fields |
|-------|-------|------------|
| `Equipment` | `equipment` | `equipment_id`, `type`, `model`, `status`, `capacity` |
| `GPSReading` | `gps_readings` | `reading_id`, `equipment_id`, lat/lon, `timestamp` |
| `HaulCycle` | `haul_cycles` | `cycle_id`, `equipment_id`, load/haul/dump/return times |
| `MaintenanceRecord` | `maintenance_records` | `record_id`, `equipment_id`, `type`, `cost` |
| `Geofence` | `geofences` | `geofence_id`, `name`, `polygon`, `type` (exclusion/inclusion) |

### Safety & Environmental

| Model | Table | Key Fields |
|-------|-------|------------|
| `GeotechDomain` | `geotech_domains` | `domain_id`, slope angle, FoS, material properties |
| `SlopeMonitoringPrism` | `slope_prisms` | `prism_id`, position, displacement vector |
| `HazardZone` | `hazard_zones` | `zone_id`, `polygon`, `severity`, active/inactive |
| `FatigueEvent` | `fatigue_events` | `event_id`, `operator_id`, `severity`, `timestamp` |
| `RehabilitationArea` | `rehabilitation_areas` | `area_id`, hectares, status, target date |

---

## Scheduling and Optimization Engine

The scheduling engine is the heart of MineOpt Pro. It supports three optimization approaches:

### CP-SAT Solver (Constraint Programming)

The CP-SAT solver uses Google OR-Tools to find optimal or near-optimal schedules:

```python
# How it works internally:
# 1. Load mining blocks, equipment, periods from database
# 2. Define decision variables: which block is mined by which equipment in which period
# 3. Add constraints:
#    - Equipment capacity per period
#    - Precedence (block A must be mined before block B)
#    - Blending quality targets at each destination
#    - Calendar availability (shifts, holidays, weather)
# 4. Define objective: minimize cost, maximize throughput, or balance both
# 5. Solve with configurable time limit
# 6. Save ScheduleVersion with result tasks
```

**Configuration options:**

| Parameter | Description | Default |
|-----------|-------------|---------|
| `max_time_seconds` | Maximum solver time | 300 |
| `objective` | `minimize_cost`, `maximize_throughput`, `balanced` | `balanced` |
| `num_workers` | Parallel solver threads | 4 |
| `enforce_precedence` | Respect block mining sequences | `true` |
| `enforce_blending` | Enforce quality constraints | `true` |

### LP Allocator (Linear Programming)

The LP allocator optimizes material flow allocation across the complete network:

- **Multi-period allocation** — Distribute material across periods to meet demand
- **Quality blending** — Meet customer quality specs by optimizing source mix
- **Capacity constraints** — Respect equipment, haulage, and plant throughput limits
- **Cost minimization** — Minimize total mining, haulage, and processing cost

### Flow Optimizer

The flow optimizer models the mine as a directed graph:

```
  [Pit A] ──→ [Stockpile ROM] ──→ [Wash Plant] ──→ [Product Stockpile] ──→ [Customer]
    │                                                        ↑
  [Pit B] ──→ [Stockpile Low Grade] ────────────────────────┘
    │
    └──────→ [Waste Dump]
```

Nodes represent sources, stockpiles, plants, dumps, and customers.
Arcs define valid material routes with capacity and quality constraints.
The optimizer finds the cheapest feasible flow that satisfies all quality requirements.

### Haulage Optimizer

Uses Dijkstra's shortest-path algorithm with edge weights based on:
- Distance (meters)
- Grade (positive or negative, affecting fuel and cycle time)
- Rolling resistance (based on road surface type)
- Speed limits (per segment)

---

## Quality Management System

### Monte Carlo Quality Simulation

The Monte Carlo engine simulates quality outcomes by:

1. **Sampling** geological variability from borehole/block model data
2. **Simulating** material streams through the flow network
3. **Blending** at each node (stockpile, plant) with mass-weighted average quality
4. **Reporting** probability distributions (P10, P50, P90) for each quality parameter

```
Typical outputs:
- Product CV: P10 = 26.5 MJ/kg, P50 = 27.1 MJ/kg, P90 = 27.8 MJ/kg
- Product Ash: P10 = 11.2%, P50 = 12.5%, P90 = 14.1%
- Yield: P10 = 62%, P50 = 65%, P90 = 68%
```

### Washability Analysis

The washability module provides:

- **Float-sink curves** — Yield vs density for each seam/block
- **Ash-yield curves** — Trade-off between ash rejection and product yield
- **Cutpoint optimization** — Find the optimal separation density for each processing plant
- **Multi-product analysis** — Split material into primary and secondary products

### Penalty Curves

Define financial penalties for quality exceedances:

- **Ash penalty** — $/tonne per % above target
- **Moisture penalty** — Dry tonnage adjustments
- **CV penalty** — Calorific value rebate/penalty
- **Sulfur penalty** — Environmental compliance surcharges

The penalty curves are visualized as interactive SVG charts and integrated into
the optimization objective function.

---

## 3D Visualization and CAD Tools

### Rendering Pipeline

MineOpt Pro uses **Three.js** via **React Three Fiber** for hardware-accelerated 3D rendering:

```
Surface Data → Triangulation → BufferGeometry → Three.js Mesh → WebGL Canvas
               (Delaunay)      (vertices,        (material,     (GPU-accelerated
                                normals,          lighting,      rendering)
                                colors)           camera)
```

### CAD String Editor

The CAD string editor supports:

- **Vertex manipulation** — Click to select, drag to move, handles for fine control
- **Insert vertex** — Click on a segment to add a new point
- **Delete vertex** — Select and press Delete key
- **Split string** — Break a string into two at a selected vertex
- **Merge strings** — Join the endpoints of two strings
- **Reverse direction** — Flip the vertex order
- **Close/Open** — Toggle between closed polygon and open polyline
- **Undo/Redo** — Full edit history with Ctrl+Z / Ctrl+Y
- **Keyboard shortcuts** — Delete, Escape, Ctrl+Z, Ctrl+Y, Ctrl+S

### Print Layout Manager

Create publication-quality plan sheets:

| Feature | Options |
|---------|---------|
| Page Size | A4, A3, A2, A1, A0 |
| Orientation | Portrait, Landscape |
| Scale | 1:500 to 1:25,000 |
| Title Block | Mine name, drawing title, date, revision, author |
| Scale Bar | Automatic scaling with labeled divisions |
| North Arrow | Configurable style and position |
| Grid | Optional coordinate grid overlay |
| Layer Visibility | Show/hide terrain, strings, annotations, blocks |

---

## Geology and Geotechnical

### Borehole Management

MineOpt Pro supports comprehensive borehole data management:

- **Import** — CSV or DXF borehole collar files with X, Y, Z, depth
- **Intervals** — Define lithological intervals with from/to depth, rock type, quality parameters
- **Visualization** — 3D borehole sticks in the terrain viewer with interval coloring
- **Query** — Filter boreholes by location, depth, quality parameter ranges

### Block Model Management

Block models represent the orebody as a 3D grid of blocks with attributed data:

- **Import** — CSV block model files with I, J, K indices and attribute columns
- **Attributes** — Grade, density, material type, tonnage factor, quality parameters
- **Filtering** — Display blocks matching attribute criteria (e.g., grade > 5%)
- **Volume queries** — Calculate tonnage within arbitrary polygonal boundaries

### Seam Modeling

For stratiform deposits (coal, manganese, iron ore):

- **Seam definition** — Roof and floor surfaces with thickness
- **Quality modeling** — Quality parameter surfaces via kriging interpolation
- **Reserve estimation** — Tonnage between roof/floor surfaces within pit boundaries
- **Seam correlation** — Link borehole intervals to named geological seams

### Kriging Service

Spatial interpolation for creating quality surfaces from point data:

- **Ordinary kriging** — Estimate values at ungauged locations
- **Variogram modeling** — Fit experimental variograms (spherical, exponential, Gaussian)
- **Cross-validation** — Leave-one-out validation for model quality assessment

### Geotechnical Safety

- **Slope analysis** — Factor of safety calculations with material properties
- **Prism monitoring** — Track slope displacement from survey prism readings
- **Hazard zones** — Define and monitor geotechnical risk areas
- **Fatigue management** — Operator fatigue scoring and event tracking

---

## Fleet Management System

### Equipment Lifecycle

```
Register Equipment → Assign to Site → Track GPS → Monitor Haul Cycles
       ↓                                              ↓
  Set Maintenance     ←──── Service Alerts ←──── Component Life
  Schedule                                       Monitoring
```

### GPS Integration

The fleet system accepts GPS readings with the following data:

| Field | Type | Description |
|-------|------|-------------|
| `equipment_id` | String | Which machine reported |
| `latitude` | Float | WGS84 latitude |
| `longitude` | Float | WGS84 longitude |
| `altitude` | Float | Elevation in meters (optional) |
| `speed` | Float | Ground speed in km/h |
| `heading` | Float | Compass bearing in degrees |
| `timestamp` | DateTime | UTC timestamp |

### Haul Cycle Detection

The system automatically detects haul cycles from GPS data:

1. **Loading** — Equipment enters a loading zone (source geofence)
2. **Hauling** — Equipment travels between source and destination
3. **Dumping** — Equipment enters a dump zone (destination geofence)
4. **Returning** — Equipment travels back to the loading zone

Cycle metrics calculated: total time, queue time, load time, haul time, dump time, return time.

### Maintenance Management

- **Preventive schedules** — Define service intervals based on hours or calendar
- **Component life tracking** — Track remaining life for tyres, engine, transmission, etc.
- **Overdue alerts** — Automatic notifications when service is overdue
- **Cost tracking** — Parts, labor, and downtime cost per service event

---

## Drill and Blast Planning

### Pattern Design Workflow

1. **Define pattern geometry** — Set burden, spacing, and offset for the drill grid
2. **Place drill holes** — Auto-generate or manually place holes within the pattern area
3. **Configure each hole** — Set diameter, depth, charge weight, stemming, and deck charges
4. **Run fragmentation model** — Kuz-Ram prediction with P80 and size distribution
5. **Cost estimate** — Automatic calculation of drilling, explosives, and accessories cost
6. **Link to schedule** — Associate blast event with mining tasks and schedule periods

### Fragmentation Prediction (Kuz-Ram model)

```
Inputs:                    Outputs:
- Rock factor (A)          - Mean fragment size (x̄)
- Powder factor (q)        - P80 (80% passing size)
- Burden (B)               - Size distribution curve
- Spacing (S)              - Uniformity index (n)
- Hole diameter (D)
- Charge length (L)
- Explosive density (ρ)
```

---

## Environmental Monitoring

### Monitoring Domains

| Domain | Parameters | Alert Thresholds |
|--------|-----------|------------------|
| **Dust** | PM2.5, PM10 (µg/m³) | Regulatory limits (e.g., 150 µg/m³ PM10 24-hr) |
| **Noise** | dB(A) Leq, Lmax | Daytime/nighttime limits (e.g., 65/45 dB(A)) |
| **Water** | pH, turbidity (NTU), TSS, metals | License conditions per monitoring point |
| **Rehab** | Area (ha), vegetation cover (%) | Annual targets per rehabilitation zone |

### Compliance Workflow

```
Reading uploaded → Check against threshold → Pass: log as compliant
                                            → Fail: create alert → notify officer
                                                                 → log exceedance
                                                                 → generate report
```

---

## Reporting and Export

### Report Types

| Report | Content | Frequency |
|--------|---------|-----------|
| **Daily Production** | Tonnage by source/destination, equipment utilization, quality KPIs | Daily |
| **Weekly Summary** | Production vs plan, equipment availability, safety incidents | Weekly |
| **Monthly Management** | Full KPI dashboard, financial reconciliation, variance analysis | Monthly |
| **Quality Compliance** | Quality parameter tracking, exceedance log, trend charts | On-demand |
| **Reconciliation** | Planned vs actual tonnage, grade, strip ratio | On-demand |
| **Shift Handover** | End-of-shift summary with incidents, production, and operator notes | Per shift |

### Report Pack Generation

The report pack generator creates multi-section reports:

```python
# Each report contains:
# - Header with site name, date range, report type
# - KPI section with key metrics
# - Data tables with detailed breakdown
# - Charts and visualizations
# - Appendices with raw data references
```

### Export Options

- **CSV** — TabularData export for any dataset via the export router
- **PDF** — Report packs with formatted multi-section output
- **Email** — Scheduled delivery to configured recipients via SMTP

---

## Collaboration and Real-Time Features

### WebSocket Architecture

```
Client connects: ws://localhost:8000/ws/{client_id}

Message types received:
├── presence_update    — {user_id, status, editing_entity}
├── schedule_progress  — {run_id, percentage, status, message}
├── fleet_position     — {equipment_id, lat, lon, speed, heading}
├── notification       — {type, severity, title, body}
└── edit_lock          — {entity_type, entity_id, locked_by, heartbeat}
```

### Presence System

- Each connected user broadcasts their status every 30 seconds
- Green dot = active, yellow = idle (>5 min), red = offline
- Tooltip shows what entity the user is currently editing

### Edit Locking

- When a user starts editing an entity, a lock is created
- Other users see the lock indicator and cannot edit until released
- Locks auto-expire after 60 seconds without heartbeat
- Force-unlock available for admin users

---

## Data Management Hub

The Data Management Hub (`DataManagementHub.jsx`) provides centralized CRUD for all datasets:

### Supported Dataset Types

| Tab | Datasets | Import Formats |
|-----|----------|---------------|
| Boreholes | Collar data, interval logs | CSV, DXF |
| Surfaces | Terrain surfaces, pit designs | ASC, GeoTIFF, DXF |
| Block Models | Geological block models | CSV, BMF |
| Equipment | Fleet inventory and specs | CSV, JSON |
| Drill & Blast | Patterns, holes, events | CSV |
| Quality | Lab results, quality logs | CSV, TXT |
| Documents | Reports, plans, procedures | PDF, DOCX |
| Maps | Spatial layers, rasters | GeoTIFF, SHP |

### Features

- **Search** — Full-text search across all dataset names and tags
- **Filter by tag** — Tag-based filtering for organizing datasets
- **Import panel** — Drag-and-drop file upload with format auto-detection
- **Bulk operations** — Select multiple datasets for tagging, archiving, or deletion
- **Quality indicators** — Visual badges showing data completeness and recency

---

## Security and Authentication

### Authentication Flow

```
1. User submits credentials → POST /auth/token
2. Server validates password (bcrypt hash comparison)
3. Server issues JWT token with expiry
4. Client stores token in localStorage
5. Client sends token in Authorization header for all API calls
6. Server validates token on each request via dependency injection
```

### Role-Based Access Control

| Role | Permissions |
|------|------------|
| **Admin** | Full access: manage users, sites, settings, all data |
| **Planner** | Read/write: schedules, flow networks, precedence, reports |
| **Operator** | Read/write: shift logs, material movement, equipment status |
| **Viewer** | Read-only access to all dashboards and reports |

### Security Best Practices

- Change `SECRET_KEY` in production (never use the default)
- Use HTTPS in production (terminate TLS at the reverse proxy)
- Configure `CORS_ORIGINS` to allow only trusted frontend domains
- Rotate JWT tokens with reasonable expiry times
- Use strong passwords (minimum 8 characters recommended)

---

## Tools and Workflows

### Common Workflows

#### Setting Up a New Mine Site

1. **Launch Site Builder Wizard** (from Site Dashboard → New Site)
2. **Step 1 — Identity**: Enter site name, select coordinate reference system, set location
3. **Step 2 — Geology**: Import borehole CSV files, define geological seams
4. **Step 3 — Topography**: Upload terrain surface (DXF or ASCII grid)
5. **Step 4 — Fleet**: Define equipment types, quantities, and production rates
6. **Step 5 — Calendar**: Configure shifts, holidays, and operating schedule
7. **Submit**: Site is created with all imported data ready for planning

#### Creating a Production Schedule

1. Navigate to **Planner Workspace**
2. Select/create a **Calendar** with periods (months, weeks, or shifts)
3. Define **Planning Horizons** with production targets per period
4. Set up the **Flow Network** (sources → stockpiles → plants → customers)
5. Define **Precedence Constraints** (which blocks must be mined before others)
6. Click **Run Optimizer** and select solver type (CP-SAT or LP)
7. Monitor progress via WebSocket updates
8. Review results in the **Gantt Chart** and **Schedule Diagnostics**
9. Compare with previous schedule versions
10. **Publish** the schedule to lock it as the authoritative plan

#### Running Quality Simulation

1. Navigate to Quality section
2. Select source blocks and destination blending points
3. Click **Run Monte Carlo** to simulate 1,000+ blending scenarios
4. Review probability distributions (P10, P50, P90) per quality parameter
5. Adjust cutpoints or source mix and re-run
6. Export results to CSV or include in report pack

#### Managing Fleet

1. Open **Fleet Dashboard**
2. View real-time equipment positions on the map
3. Check **Maintenance Panel** for upcoming and overdue services
4. Review **Haul Cycles** for productivity analysis
5. Define/edit **Geofences** for exclusion zones
6. View **Equipment KPIs** — utilization, availability, MTBF

#### Generating Reports

1. Navigate to **Reporting** section
2. Select report type (Daily, Weekly, Monthly, Quality, Reconciliation)
3. Set date range and site
4. Click **Generate**
5. View report in-app or export to CSV/PDF
6. Optionally schedule automated delivery via email

---

## UI Components and Design System

### Theme System

MineOpt Pro uses CSS custom properties for a comprehensive theming system:

```css
/* All components reference theme variables */
:root {
  --color-bg-primary: #0f172a;      /* Deep blue-black */
  --color-bg-secondary: #1e293b;    /* Card backgrounds */
  --color-bg-tertiary: #334155;     /* Elevated surfaces */
  --color-text-primary: #f1f5f9;    /* Primary text */
  --color-text-secondary: #94a3b8;  /* Secondary text */
  --color-accent: #3b82f6;          /* Blue accent */
  --color-success: #22c55e;         /* Green indicators */
  --color-warning: #f59e0b;         /* Yellow alerts */
  --color-error: #ef4444;           /* Red errors */
}

[data-theme='light'] {
  --color-bg-primary: #f8fafc;
  --color-bg-secondary: #ffffff;
  --color-text-primary: #0f172a;
  /* ... */
}
```

### Shared UI Primitives

| Component | Purpose |
|-----------|---------|
| `Button` | Styled button with variant, size, and loading state |
| `Modal` | Accessible dialog overlay with focus trapping |
| `SkeletonLoader` | Content placeholder with shimmer animation |
| `Breadcrumb` | Navigation breadcrumb with clickable path segments |
| `Tooltip` | Contextual information on hover |
| `Badge` | Status indicators (online, pending, error) |
| `Card` | Elevated surface container with optional header |
| `DataTable` | Sortable, filterable data grid |

### Responsive Design

All components are responsive and work across:

- **Desktop** (1920px+) — Full multi-panel layouts
- **Laptop** (1366px) — Condensed layouts with collapsible panels
- **Tablet** (768px) — Stacked layout with tabbed navigation

---

## Testing Guide

### Backend Tests

```bash
# Run all backend tests
cd backend
python -m pytest tests/ -v

# Run specific test module
python -m pytest tests/test_cp_solver.py -v

# Run with coverage report
python -m pytest tests/ --cov=app --cov-report=html
```

### Frontend Tests

```bash
# Run all frontend tests
cd frontend
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode during development
npx jest --watch
```

### Integration Tests

```bash
# Full-stack verification
python verify_full_flow.py
```

This script tests:
- Backend API health endpoints
- Authentication flow (register, login, token refresh)
- Site creation and configuration
- Data seeding
- Schedule creation and optimizer execution
- Report generation

### Writing New Tests

**Backend test pattern:**

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_site():
    response = client.post("/config/sites", json={
        "name": "Test Mine",
        "location": "Test Location",
        "crs_epsg": 32735
    })
    assert response.status_code == 200
    assert response.json()["name"] == "Test Mine"
```

**Frontend test pattern:**

```jsx
import { render, screen } from '@testing-library/react';
import SiteDashboard from '../pages/SiteDashboard';

test('renders dashboard KPI cards', () => {
  render(<SiteDashboard />);
  expect(screen.getByText(/Production Summary/i)).toBeInTheDocument();
});
```

---

## Troubleshooting Guide

### Backend Issues

#### "ModuleNotFoundError: No module named 'app'"

**Cause:** You're not in the `backend` directory, or the virtual environment isn't activated.

```bash
# Fix:
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8000
```

#### "sqlite3.OperationalError: no such table"

**Cause:** Database tables haven't been created yet.

```bash
# Fix: The tables are auto-created on first startup.
# If the database is corrupted, delete and restart:
rm backend/mineopt_pro.db
uvicorn app.main:app --reload --port 8000
```

#### "CORS Error" in browser console

**Cause:** Frontend origin not in the allowed CORS list.

```bash
# Fix: Set CORS_ORIGINS in .env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### Port 8000 already in use

```bash
# Find and kill the process using port 8000
# Linux/macOS:
lsof -i :8000 | grep LISTEN
kill -9 <PID>

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use a different port:
uvicorn app.main:app --reload --port 8001
```

#### Database migration errors

```bash
# If Alembic migrations fail, fall back to auto-creation:
# Delete the database and let SQLAlchemy recreate all tables
rm backend/mineopt_pro.db
# Then restart the backend
```

### Frontend Issues

#### "npm install" fails with peer dependency errors

```bash
# Try with legacy peer deps flag:
npm install --legacy-peer-deps
```

#### Blank page after login

**Cause:** No site selected. The dashboard requires an active site context.

```
Fix:
1. Navigate to the Seed Data page
2. Run the data seeder to create demo sites
3. Select a site from the site selector dropdown
```

#### 3D viewer shows black screen

**Cause:** WebGL not supported or GPU driver issues.

```
Fixes:
1. Try a different browser (Chrome/Edge recommended for WebGL2)
2. Update your GPU drivers
3. Check browser console for Three.js errors
4. Ensure your machine has a dedicated GPU (integrated GPUs may struggle)
```

#### Components not rendering / white screen

```
Debugging steps:
1. Open browser Developer Tools (F12) → Console tab
2. Look for red error messages
3. Check Network tab for failed API calls (401 = auth expired, 404 = wrong URL)
4. Try hard-refreshing: Ctrl+Shift+R
5. Clear localStorage: Developer Tools → Application → Local Storage → Clear
```

### Docker Issues

#### Container won't start

```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend

# Common causes:
# - Port conflict: change ports in docker-compose.yml
# - Missing .env file: cp .env.example .env
# - Database not ready: backend depends_on with healthcheck handles this
```

#### "Cannot connect to database" in Docker

```bash
# Ensure PostgreSQL is healthy before backend starts
docker-compose ps  # Check postgres status is 'healthy'

# If not, check PostgreSQL logs:
docker-compose logs postgres
```

---

## Frequently Asked Questions

### General

**Q: Is MineOpt Pro free to use?**

A: Yes. MineOpt Pro is released under the MIT License. You can use, modify, and distribute it
freely for both personal and commercial purposes.

**Q: Does it work for underground mines?**

A: MineOpt Pro is designed primarily for **open-cast (surface) mining**. Many concepts
(scheduling, quality, fleet) apply to underground mines, but the 3D visualization and
drill & blast modules are specifically tailored for surface operations.

**Q: What commodity types are supported?**

A: MineOpt Pro is commodity-agnostic. It has been designed to handle coal, iron ore,
manganese, copper, gold, and any other minerals mined in open-cast operations.
The quality parameters and washability analysis are configurable per commodity.

**Q: How much data can it handle?**

A: The system has been tested with:
- Block models up to 500,000 blocks
- Schedules with 10,000+ tasks
- GPS feeds of 50+ trucks at 10-second intervals
- Borehole datasets of 1,000+ holes

For very large datasets (millions of blocks), consider using PostgreSQL instead of SQLite
and ensure adequate server memory (8GB+ recommended).

**Q: Can I connect it to my existing mine systems?**

A: Yes. The integration router (`/integration`) supports:
- REST API webhooks for external system notifications
- CSV/JSON import/export for batch data exchange
- External ID mapping for cross-referencing entities
- BI extract publishing for data warehouse integration

### Technical

**Q: Can I use PostgreSQL instead of SQLite?**

A: Yes. Set the `DATABASE_URL` environment variable to your PostgreSQL connection string.
SQLAlchemy handles the switch transparently — no code changes required.

**Q: How do I reset all data?**

```bash
# SQLite: delete the database file
rm backend/mineopt_pro.db

# PostgreSQL: drop and recreate the database
psql -U mineopt -c 'DROP DATABASE mineopt_pro;'
psql -U mineopt -c 'CREATE DATABASE mineopt_pro;'

# Then restart the backend (tables auto-create)
```

**Q: How do I add a new API endpoint?**

1. Create a new router file in `backend/app/routers/`
2. Define your FastAPI route functions
3. Import and register the router in `backend/app/main.py`
4. Create corresponding service in `backend/app/services/`
5. If needed, add domain models in `backend/app/domain/`

**Q: How do I add a new frontend component?**

1. Create a new directory in `frontend/src/components/`
2. Add your `.jsx` component file
3. Use CSS custom properties (`var(--color-*)`) for theme compatibility
4. Use Lucide React for icons
5. Import and use in the appropriate page component

**Q: Why does the scheduler take a long time?**

A: Constraint programming (CP-SAT) solving time depends on problem size.
Tips to speed up:
- Reduce the number of periods in the planning horizon
- Decrease the number of mining blocks
- Increase `max_time_seconds` for better solutions (not faster)
- Use the LP allocator for approximate solutions
- Enable parallel solving with `num_workers > 1`

**Q: Can I use this without the 3D viewer?**

A: Absolutely. The 3D viewer is one module among many. All scheduling, quality,
fleet, reporting, and data management features work without 3D visualization.
The 3D viewer simply won't render if no surface data is loaded.

**Q: How do I back up my data?**

```bash
# SQLite (development)
cp backend/mineopt_pro.db backup_$(date +%Y%m%d).db

# PostgreSQL (production)
pg_dump -U mineopt mineopt_pro > backup_$(date +%Y%m%d).sql
```

---

## Performance Tuning

### Backend Performance

| Setting | Default | Recommended for Production |
|---------|---------|---------------------------|
| Workers | 1 | 4–8 (match CPU cores) |
| Database | SQLite | PostgreSQL with connection pooling |
| Solver threads | 1 | 4+ for CP-SAT |
| Solver time limit | 300s | Adjust based on problem size |

```bash
# Production backend with multiple workers
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend Performance

- **3D rendering** — Reduce block model detail for large datasets
- **Lazy loading** — Components load on-demand via React Suspense
- **Caching** — API responses cached with configurable TTL
- **WebSocket** — Debounced updates to prevent UI flooding

### Database Optimization

```sql
-- Recommended PostgreSQL indexes for large datasets
CREATE INDEX idx_tasks_site ON tasks(schedule_version_id);
CREATE INDEX idx_blocks_model ON blocks(model_id);
CREATE INDEX idx_gps_equipment ON gps_readings(equipment_id, timestamp);
CREATE INDEX idx_borehole_site ON boreholes(site_id);
```

---

## Contributing

Contributions are welcome! See below for how to get involved.

### Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Create a branch** for your feature: `git checkout -b feature/my-feature`
4. **Make changes** following the code style guidelines
5. **Test** your changes locally
6. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `refactor:` for code restructuring
   - `test:` for test additions
7. **Push** to your fork and open a **Pull Request**

### Code Style

- **Python**: Follow PEP 8, use type hints where practical
- **JavaScript/React**: Use functional components with hooks, JSDoc for complex functions
- **CSS**: Use CSS custom properties for all colors and spacing
- **Commits**: Conventional Commits format (`feat:`, `fix:`, `docs:`, etc.)

### Areas for Contribution

- 🐛 Bug fixes and stability improvements
- 📚 Documentation and examples
- 🧪 Test coverage expansion
- 🎨 UI/UX improvements and accessibility
- 🌐 Internationalization (i18n)
- 📱 Mobile responsiveness
- 🔌 New integration connectors
- ⚡ Performance optimizations

---

## Future Work and Roadmap

MineOpt Pro is actively developed. Here are the planned enhancements:

### 🤖 Agentic Scheduling (Next Major Feature)

The next major feature is an **AI-powered agentic scheduling system** that will:

- **Autonomous schedule generation** — An AI agent that understands mine constraints,
  geological data, and business objectives to generate optimized schedules with minimal
  human input
- **Natural language interactions** — Ask the agent questions like:
  - "What happens if we delay Pit B by two weeks?"
  - "Optimize for maximum coal quality this quarter"
  - "Suggest the best three schedule scenarios for next month"
- **Adaptive replanning** — Agent detects schedule deviations from production data and
  automatically proposes corrective schedule adjustments
- **Multi-objective negotiation** — Agent balances conflicting objectives (cost vs quality
  vs throughput) and presents Pareto-optimal choices
- **Learning from history** — Agent improves recommendations based on past schedule
  performance, equipment breakdowns, and geological surprises

### 🏗️ AI-Assisted Mine Design

Future AI capabilities for mine design:

- **Automated pit shell generation** — Generate optimal pit shells from block model
  economics using Lerchs-Grossmann or floating cone algorithms
- **Pushback design** — AI-assisted creation of mining phases (pushbacks) that
  balance strip ratio and NPV over the life of mine
- **Dump design optimization** — Optimal waste dump placement considering haulage
  distance, capacity, environmental constraints, and end-of-mine rehabilitation
- **Road network design** — Automatic haul road layout optimizing gradient, distance,
  and traffic flow
- **Ramp design** — AI-generated ramp alignments meeting bench height and gradient constraints

### 📋 Planned Enhancements

| Feature | Category | Status |
|---------|----------|--------|
| Pit optimization (Lerchs-Grossmann) | Scheduling | Planned |
| Multi-objective evolutionary scheduling | Scheduling | Planned |
| Machine learning grade prediction | Quality | Planned |
| Real-time GPS integration (MQTT/NTRIP) | Fleet | Planned |
| Autonomous truck dispatch API | Fleet | Planned |
| Mobile companion app (React Native) | Frontend | Planned |
| Internationalization (i18n) | Frontend | Planned |
| Plugin/extension system | Architecture | Planned |
| Alembic migration management | Backend | Planned |
| End-to-end Playwright tests | Testing | Planned |
| Terraform/Helm deployment charts | Infrastructure | Planned |
| SSO / OAuth2 integration | Security | Planned |
| Audit log analytics | Security | Planned |
| Survey import (LAS, DTM) | Data | Planned |
| Video flythrough generation | 3D | Planned |
| AR/VR integration | 3D | Experimental |

### 🔬 Research Areas

- **Digital twin** — Real-time mine digital twin with sensor integration
- **Stochastic scheduling** — Schedule optimization under geological uncertainty
- **Reinforcement learning** — RL-based adaptive fleet dispatch
- **Computer vision** — Automated fragmentation analysis from blast photographs
- **LiDAR integration** — Drone survey point cloud processing for stockpile measurement

---

## Changelog

### v1.0.0 — February 2026

**Initial release** with 60+ backend services, 40 API routers, and 41 frontend component directories.

#### Highlights

- ✅ CP-SAT and LP scheduling engine with multi-horizon planning
- ✅ Quality management with Monte Carlo simulation and washability analysis
- ✅ 3D terrain viewer with block models, surface timelines, and CAD editing
- ✅ Fleet management with GPS tracking, geofencing, and haul cycle analysis
- ✅ Drill & blast planning with fragmentation modeling
- ✅ Environmental monitoring across dust, noise, water, and rehabilitation
- ✅ Report pack generation with email delivery and CSV export
- ✅ Real-time collaboration with WebSocket presence and edit locking
- ✅ JWT authentication with role-based access control
- ✅ Docker Compose deployment with health checks
- ✅ Comprehensive demo data seeing for evaluation
- ✅ Dark/light theme system

#### Statistics

- **40** API routers
- **60+** backend services
- **21** domain model files
- **41** frontend component directories
- **10** page-level components
- **~25,000** lines of backend Python
- **~20,000** lines of frontend React/JSX

---

## License

MineOpt Pro is released under the **MIT License**.

```
MIT License

Copyright (c) 2026 Sihle Mtshali

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

**Built with ❤️ for the mining industry by [Sihle Mtshali](https://github.com/SIHLE-MTSHALI)**

If you find MineOpt Pro useful, please ⭐ star the repository on GitHub!
---

## Appendix A: API Usage Examples

### Creating a Mine Site via API

```bash
# Step 1: Register and login
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123", "email": "admin@mine.com"}'

TOKEN=$(curl -s -X POST http://localhost:8000/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123" | python -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# Step 2: Create a site
curl -X POST http://localhost:8000/config/sites \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Kalahari Mine", "location": "Northern Cape", "crs_epsg": 32735}'

# Step 3: Create a calendar
curl -X POST http://localhost:8000/calendar/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"site_id": "SITE_ID", "name": "2026 Calendar", "year": 2026}'

# Step 4: Create periods (monthly)
for MONTH in 01 02 03 04 05 06 07 08 09 10 11 12; do
  curl -X POST http://localhost:8000/calendar/periods \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"calendar_id": "CAL_ID", "name": "Month '$MONTH'", "type": "monthly"}'
done
```

### Running the Optimizer via API

```bash
# Create a schedule version
SCHEDULE=$(curl -s -X POST http://localhost:8000/schedule/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"site_id": "SITE_ID", "name": "Q1 2026 Plan", "schedule_type": "Authoritative"}')

VERSION_ID=$(echo $SCHEDULE | python -c "import sys,json; print(json.load(sys.stdin)['version_id'])")

# Run the CP-SAT optimizer
curl -X POST http://localhost:8000/optimization/run \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"schedule_version_id": "'$VERSION_ID'", "solver": "cpsat", "max_time_seconds": 120}'

# Check optimization status (poll until complete)
curl http://localhost:8000/optimization/status/RUN_ID \
  -H "Authorization: Bearer $TOKEN"
# Response: {"status": "running", "progress": 45, "message": "Solving..."}
# Response: {"status": "completed", "objective_value": 12345.67}
```

### Fetching Fleet Data via API

```bash
# List all equipment for a site
curl http://localhost:8000/fleet/equipment/site/SITE_ID \
  -H "Authorization: Bearer $TOKEN"

# Get latest GPS positions for all equipment
curl http://localhost:8000/fleet/gps/latest/SITE_ID \
  -H "Authorization: Bearer $TOKEN"

# Get haul cycles for a date range
curl "http://localhost:8000/fleet/haul-cycles/SITE_ID?start=2026-01-01&end=2026-01-31" \
  -H "Authorization: Bearer $TOKEN"

# Get equipment maintenance status
curl http://localhost:8000/fleet/maintenance/EQUIPMENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Generating Reports via API

```bash
# Generate a daily production report
curl -X POST http://localhost:8000/reporting/daily \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"site_id": "SITE_ID", "date": "2026-01-15"}'

# Generate a management report pack
curl -X POST http://localhost:8000/reports/pack \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"site_id": "SITE_ID", "report_type": "monthly", "period": "2026-01"}'

# Export schedule tasks to CSV
curl http://localhost:8000/export/csv/tasks/SITE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -o tasks_export.csv

# Export quality data to CSV
curl http://localhost:8000/export/csv/quality/SITE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -o quality_export.csv
```

---

## Appendix B: Mining Glossary

For readers unfamiliar with mining terminology, here is a glossary of key terms
used throughout MineOpt Pro:

| Term | Definition |
|------|-----------|
| **Bench** | A horizontal step or ledge in the pit wall created during mining operations |
| **Blast Pattern** | The geometric arrangement of drill holes for a planned explosive detonation |
| **Block Model** | A 3D grid representation of an orebody with geological attributes per block |
| **Borehole** | A narrow shaft drilled into the ground to collect geological core samples |
| **Burden** | The distance from a row of blast holes to the free face or previous row of holes |
| **Calorific Value (CV)** | Energy content of coal, measured in MJ/kg or kcal/kg |
| **Collar** | The surface location (X, Y, Z) where a borehole enters the ground |
| **CP-SAT** | Constraint Programming with Satisfiability — a solver from Google OR-Tools |
| **CRS** | Coordinate Reference System — defines how map coordinates relate to the real world |
| **Cut and Fill** | Earthworks calculation comparing material removed (cut) vs material added (fill) |
| **DXF** | Drawing Exchange Format — a standard CAD file interchange format |
| **Face** | The active area of rock or ore being mined at a bench |
| **Factor of Safety (FoS)** | Ratio of resisting to driving forces in a slope stability analysis |
| **Float-Sink** | A laboratory test that separates coal/ore by density to determine washability |
| **Fragmentation** | The size distribution of rock pieces after blasting |
| **Gantt Chart** | A timeline bar chart showing scheduled activities plotted against time |
| **Geofence** | A virtual geographic boundary defined in software for location-based alerts |
| **GeoTIFF** | A raster image format with embedded geographic coordinate information |
| **Grade** | The concentration of a valuable mineral in ore (e.g., % Fe, g/t Au) |
| **Haul Cycle** | One complete truck trip: loading → hauling → dumping → returning empty |
| **Horizon** | A planning time span (e.g., life-of-mine, 5-year, annual, monthly, weekly) |
| **In-situ** | Material in its original position in the ground before mining |
| **Kriging** | A geostatistical interpolation method for estimating values between sample points |
| **Kuz-Ram** | An empirical model for predicting blast fragmentation size distribution |
| **Lithology** | The physical characteristics and composition of a rock type |
| **LP** | Linear Programming — an optimization technique for problems with continuous variables |
| **MTBF** | Mean Time Between Failures — average operating time before equipment breaks down |
| **Open-Cast** | Surface mining where overburden is stripped to expose and extract the orebody |
| **Ore** | Rock or earth containing enough minerals to be economically extracted |
| **Overburden** | Non-valuable material lying above the ore that must be removed before mining |
| **Pareto Front** | The set of optimal solutions where improving one objective worsens another |
| **Pit Shell** | The optimal final pit boundary determined by economic analysis |
| **Powder Factor** | The amount of explosive used per unit volume of rock (kg/m³) |
| **Precedence** | A constraint requiring one mining block to be extracted before another can begin |
| **Pushback** | A phase of mining that extends the pit in a planned direction |
| **Reconciliation** | Systematic comparison of planned vs actual production, quality, and costs |
| **ROM** | Run-of-Mine — raw material as extracted from the pit before any processing |
| **Seam** | A layer of economically valuable mineral (especially coal) within geological strata |
| **Spacing** | The distance between adjacent drill holes within a single blast pattern row |
| **Stemming** | Inert material (crusite, drill cuttings) placed above explosives in a blast hole |
| **Stockpile** | A temporary storage area for mined material awaiting processing or transport |
| **Strip Ratio** | Ratio of waste to ore tonnage (e.g., 3:1 = 3 tonnes waste per 1 tonne ore) |
| **Swell Factor** | The increase in volume when rock is broken from its in-situ state |
| **TIN** | Triangulated Irregular Network — a 3D surface model constructed from triangles |
| **Variogram** | A function describing the spatial correlation of a geological variable |
| **Washability** | The separation characteristics of coal/ore when processed at different densities |
| **Waste** | Non-valuable material that must be mined and placed in a waste dump |
| **WebGL** | Web Graphics Library — a JavaScript API for rendering 3D graphics in the browser |
| **Yield** | The percentage of ROM material recovered as saleable product after processing |

---

## Appendix C: Keyboard Shortcuts

### CAD String Editor

| Shortcut | Action |
|----------|--------|
| `Click` | Select nearest vertex |
| `Click + Drag` | Move selected vertex to new position |
| `Click on segment` | Insert new vertex at click point |
| `Delete` / `Backspace` | Delete selected vertex |
| `Escape` | Cancel current operation / deselect |
| `Ctrl+Z` | Undo last edit |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo last undo |
| `Ctrl+S` | Save all changes |
| `S` | Split string at selected vertex |
| `R` | Reverse vertex order |
| `C` | Toggle close/open string |

### 3D Viewer Controls

| Control | Action |
|---------|--------|
| `Left Mouse + Drag` | Orbit (rotate) camera around target |
| `Right Mouse + Drag` | Pan camera laterally |
| `Middle Mouse + Drag` | Pan camera (alternative) |
| `Scroll Wheel Up` | Zoom in |
| `Scroll Wheel Down` | Zoom out |
| `Double-Click` | Focus on clicked point |
| `F` | Fit all geometry in view |
| `T` | Top-down (plan) view |
| `Numpad 1` | Front view |
| `Numpad 3` | Right side view |
| `Numpad 7` | Top view |
| `Numpad 5` | Toggle perspective/orthographic |

### Dashboard Navigation

| Shortcut | Action |
|----------|--------|
| `Alt+D` | Go to Site Dashboard |
| `Alt+P` | Go to Planner Workspace |
| `Alt+O` | Go to Operations Dashboard |
| `Alt+F` | Go to Fleet Dashboard |
| `Alt+B` | Go to Drill & Blast Dashboard |
| `Alt+M` | Go to Monitoring Dashboard |
| `Escape` | Close any open modal or sidebar panel |
