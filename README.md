# MineOpt Pro

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Python](https://img.shields.io/badge/python-3.10+-green)
![React](https://img.shields.io/badge/react-19+-61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688)
![Three.js](https://img.shields.io/badge/Three.js-0.182+-black)

**Open-Cast Mine Production Scheduling and Optimization System**

[Quick Start](#-quick-start-for-beginners) • [All Features](#-complete-feature-list) • [Visual Validation](#-end-to-end-visual-validation-checklist) • [Setup Options](#-setup-options) • [Usage Guide](#-detailed-usage-guide) • [API Reference](#-api-reference) • [Limitations](#-current-limitations--known-gaps-february-2026) • [Future Work](#-future-work-roadmap-to-commercial-readiness) • [Troubleshooting](#-troubleshooting)

</div>

---

## 📖 What is MineOpt Pro?

MineOpt Pro is a **comprehensive, full-stack web application** designed for open-cast mining operations. It helps mining engineers, schedulers, and supervisors to:

- **📅 Plan and optimize production schedules** with 12-hour shift granularity
- **🧪 Manage material blending** to meet quality targets with Monte Carlo simulation
- **🚚 Track equipment fleet** in real-time with GPS and geofencing
- **💥 Design drill & blast patterns** with fragmentation prediction using Kuz-Ram model
- **📍 Monitor slope stability** and environmental conditions
- **📊 Generate reports** and interactive analytics dashboards
- **🗺️ Visualize mine operations** in 3D with interactive terrain surfaces
- **🔄 Integrate with external systems** (SCADA, SAP, Oracle)

Whether you're a complete beginner or an experienced developer, this guide will help you get MineOpt Pro running on your machine.

---

## 📍 Read This First (Important)

This README is intentionally long and operational. It is designed so:

- a non-technical planner can install and run the system
- a technical user can verify architecture, APIs, and module boundaries
- both users can understand current limitations and in-progress work

### Current-State Promise (as of February 8, 2026)

MineOpt Pro has broad backend and frontend coverage, and the product runs locally with meaningful workflows.  
At the same time, some advanced workflows are still in hardening and integration phases.

To keep this honest and useful:

- each major section includes practical verification guidance
- limitations are documented in a dedicated section
- future work is explicitly mapped for commercial-product readiness

### Visual Confirmation Legend Used in This Guide

You will repeatedly see these validation markers:

- `✅` means expected successful state
- `⚠️` means warning or partial state that still allows progress
- `❌` means blocked state requiring action before proceeding
- `👀 You should see` means exact visual cue to confirm

### Minimum Success Criteria for a "Good Install"

You should be able to verify all of the following:

1. Backend health endpoint returns healthy response.
2. Backend API docs open in browser.
3. Frontend loads and shows landing/login flow.
4. You can register/login and reach dashboard.
5. You can open planner and navigate tabs.
6. You can run seed data and see new entities in planner modules.

If any one of these fails, jump to [🐛 Troubleshooting](#-troubleshooting) before continuing.

---

## 🚀 Quick Start for Beginners

> **Complete Step-by-Step Guide** - Follow these instructions exactly in order. Each step must complete successfully before moving to the next.

### Step 0: Check Your System Requirements

Before installing anything, make sure your computer has these programs. Open a command prompt (Windows) or terminal (Mac/Linux) and run each check command:

| Requirement | Minimum Version | How to Check | What to Install |
|-------------|-----------------|--------------|-----------------|
| **Python** | 3.10 or higher | `python --version` | Download from [python.org](https://python.org) |
| **Node.js** | 18 or higher | `node --version` | Download from [nodejs.org](https://nodejs.org) |
| **Git** | Any version | `git --version` | Download from [git-scm.com](https://git-scm.com) |
| **npm** | 9 or higher | `npm --version` | Comes with Node.js |

**Example output you should see:**
```
C:\Users\YourName> python --version
Python 3.11.4

C:\Users\YourName> node --version
v18.17.0

C:\Users\YourName> npm --version
9.6.7

C:\Users\YourName> git --version
git version 2.41.0.windows.1
```

> ⚠️ **If any command says "not recognized" or "command not found"**, you need to install that program first before continuing.

---

### Step 1: Download the Project

Open your command prompt/terminal and run:

```bash
# Navigate to where you want to download the project
# For example, your Documents folder:
cd Documents

# Clone (download) the repository
git clone https://github.com/SIHLE-MTSHALI/MineOpt-pro.git

# Navigate into the project folder
cd MineOpt-pro
```

**What this does:** Downloads all the project files from GitHub to your computer.

**👀 You should see:**
- `Cloning into 'MineOpt-pro'...`
- A completed download summary with object counts.
- No authentication error if repository is public.

**✅ Step 1 complete when:**
- A folder named `MineOpt-pro` exists on your machine.
- Running `dir` (Windows) or `ls` (Mac/Linux) in the parent directory shows that folder.

---

### Step 2: Set Up the Backend (Python Server)

The backend is the "brain" of the application - it processes data and handles all the logic.

```bash
# Navigate to the backend folder
cd backend

# Create a virtual environment (isolated Python environment)
python -m venv venv

# Activate the virtual environment
# On Windows (Command Prompt):
venv\Scripts\activate

# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# On Windows (Git Bash):
source venv/Scripts/activate

# On Mac/Linux:
source venv/bin/activate
```

**You should see `(venv)` at the beginning of your command line when activated:**
```
(venv) C:\Users\YourName\Documents\MineOpt-pro\backend>
```

Now install the required Python packages:

```bash
# Install all Python dependencies (this may take 2-5 minutes)
pip install -r requirements.txt
```

**What this installs:**
- FastAPI (web framework)
- SQLAlchemy (database)
- NumPy & Pandas (data processing)
- SciPy (optimization algorithms)
- PyKrige (geostatistics)
- And many more...

**👀 You should see:**
- Download/install logs for Python packages.
- Final message similar to `Successfully installed ...`
- No fatal errors about missing compiler/toolchain.

**✅ Step 2 complete when:**
- Your prompt still shows `(venv)`.
- `python -c "import fastapi; print('ok')"` prints `ok`.

---

### Step 3: Start the Backend Server

With the virtual environment still activated:

```bash
# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Success looks like this:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
Database initialized with 50 tables
INFO:     Application startup complete.
```

> **✅ Keep this terminal window open and running!** The backend must stay running while you use the application.

> **📌 Tip:** You can verify the backend is working by opening a web browser and going to: http://localhost:8000/docs - You should see the interactive API documentation.

**👀 You should see in browser:**
- Swagger UI page title similar to `MineOpt Pro Enterprise API`.
- Endpoints grouped by tags (auth, schedule, quality, flow, raster, etc.).

**✅ Step 3 complete when:**
- `http://localhost:8000/health` returns JSON with healthy status.
- Backend terminal keeps running without repeated crash/restart loops.

---

### Step 4: Set Up the Frontend (New Terminal Window)

**Open a NEW terminal/command prompt window** (keep the backend running in the first one).

```bash
# Navigate to the project's frontend folder
cd frontend

# Install all JavaScript dependencies (this may take 2-5 minutes)
npm install
```

**What this installs:**
- React 19 (user interface framework)
- Three.js (3D visualization)
- Leaflet (interactive maps)
- Recharts (charts and graphs)
- And more...

**👀 You should see:**
- `added ... packages` (or equivalent npm success output)
- No `npm ERR!` fatal line at the end

**✅ Step 4 complete when:**
- `node_modules` exists in the `frontend` folder.
- `npm run dev` is available without script-not-found errors.

---

### Step 5: Start the Frontend Development Server

```bash
# Start the frontend development server
npm run dev
```

**Success looks like this:**
```
  VITE v7.2.4  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h + enter to show help
```

**👀 You should see:**
- A local URL, usually `http://localhost:5173/`.
- No immediate Vite crash after startup.

**✅ Step 5 complete when:**
- Opening the local URL loads the app shell (not a browser error page).

---

### Step 6: Open the Application

1. Open your web browser (Chrome, Firefox, or Edge recommended)
2. Go to: **http://localhost:5173**
3. You should see the MineOpt Pro landing page!

**👀 You should see on screen:**
- A branded landing page with a start/login call-to-action.
- No blank white page and no fatal red overlay.

**🎉 Congratulations! MineOpt Pro is now running on your computer!**

---

### Step 7: Create an Account and Log In

1. Click **"Get Started"** on the landing page
2. Click **"Register"** to create a new account
3. Fill in:
   - Email address (e.g., `admin@example.com`)
   - Password (at least 6 characters)
4. Click **"Register"**
5. You'll be automatically logged in and see the Site Dashboard

**👀 You should see on screen:**
- Authentication form accepts your input.
- After submit, browser redirects to `/app/dashboard`.
- Sidebar/menu appears with planning and operations entries.

**✅ Step 7 complete when:**
- Refreshing dashboard keeps you logged in (token stored).

---

### Step 8: Generate Sample Data (Recommended for Testing)

To see the application's features in action with demo data:

1. From the Site Dashboard, click **"Open Planner"** in the sidebar
2. Click the **"Seed Data"** button in the toolbar
3. This will generate sample sites, equipment, schedules, and more

**👀 You should see on screen:**
- Success toast/notification after seed operation.
- Planner modules show populated entities (resources, areas, schedules, etc.).

**✅ Step 8 complete when:**
- Planner tabs show non-empty datasets.
- Dashboard cards/summary values are no longer all empty.

---

## ✅ End-to-End Visual Validation Checklist

Use this checklist immediately after installation.  
This section is written so a user can confirm success by looking at the screen, without guessing.

### A. Startup Validation (System Health)

| Check | Where to look | Expected visual result | Status |
|------|------|------|------|
| Backend process | Backend terminal | `Application startup complete` and no crash loop | ⬜ |
| Backend health URL | Browser → `http://localhost:8000/health` | JSON response with `"status": "healthy"` | ⬜ |
| API docs | Browser → `http://localhost:8000/docs` | Swagger UI loads with endpoint groups | ⬜ |
| Frontend process | Frontend terminal | Vite local URL line present | ⬜ |
| Frontend app | Browser → `http://localhost:5173` | Landing page loads with action buttons | ⬜ |

### B. Authentication Validation

| Check | Action | Expected visual result | Status |
|------|------|------|------|
| Register user | Open register form and submit | Redirect to dashboard | ⬜ |
| Login persistence | Refresh page | User remains logged in | ⬜ |
| Protected routing | Open `/app/dashboard` without login in fresh session | Redirect to `/login` if not authenticated | ⬜ |

### C. Dashboard Validation

| Check | Action | Expected visual result | Status |
|------|------|------|------|
| Dashboard loads | Open `/app/dashboard` | KPI cards and summary panels visible | ⬜ |
| Navigation menu | Inspect sidebar | Planning, Operations, Monitoring, Configuration links visible | ⬜ |
| Seed data entry | Open Seed Data page | Seed controls and status feedback visible | ⬜ |

### D. Planner Navigation Validation

Open each route and confirm the module renders.

| Route | Expected visual result | Status |
|------|------|------|
| `/app/planner?tab=spatial` | Spatial/3D planning workspace and related controls | ⬜ |
| `/app/planner?tab=gantt` | Gantt scheduling view with timeline/task region | ⬜ |
| `/app/planner?tab=schedule-control` | Schedule control panel with run controls | ⬜ |
| `/app/planner?tab=reporting` | Reports/analytics module | ⬜ |
| `/app/planner?tab=flow-editor` | Flow network editor panel | ⬜ |
| `/app/planner?tab=product-specs` | Product and quality specifications UI | ⬜ |
| `/app/planner?tab=resources` | Resource management content | ⬜ |
| `/app/planner?tab=geology` | Geology/block model content | ⬜ |
| `/app/planner?tab=data` | Stockpile/data tab content | ⬜ |
| `/app/planner?tab=import` | Import workflow UI | ⬜ |
| `/app/planner?tab=integrations` | Integration mapping/config UI | ⬜ |
| `/app/planner?tab=settings` | Settings panel | ⬜ |

### E. Operations Module Validation

| Route | Expected visual result | Status |
|------|------|------|
| `/app/fleet` | Fleet dashboard widgets/panels visible | ⬜ |
| `/app/drill-blast` | Drill & blast page content visible | ⬜ |
| `/app/operations` | Shift operations and handover content visible | ⬜ |
| `/app/monitoring` | Monitoring dashboard content visible | ⬜ |

### F. Data Import and File Workflow Validation

1. Open planner import tab.
2. Upload a small CSV test file.
3. Confirm preview renders.
4. Confirm column mapping/validation view appears (if required by import type).

**👀 You should see:**
- file recognized in uploader
- preview rows or parse summary
- no unhandled frontend exception

### G. API and Data Service Validation

Use Swagger (`/docs`) and run quick checks:

1. `GET /files/formats` returns supported formats list.
2. `GET /crs/systems` returns CRS options.
3. `GET /raster/formats` returns available raster driver summary.

**👀 You should see:**
- HTTP 200 responses
- JSON payload (not HTML error page)

### H. Final Acceptance Check

Mark installation successful only if all are true:

- You can log in and navigate every main menu area.
- Planner tabs open through URL query navigation.
- Seed data creates visible planner entities.
- API docs and health endpoints respond.
- No critical blank screens or repeated crash loops.

If any line fails, go directly to [🐛 Troubleshooting](#-troubleshooting) and resolve before production-style use.

---

## 📋 Complete Feature List

MineOpt Pro includes **13+ major modules** with **50+ features**. Here's everything you can do:

> **Status note:** This list is the full platform capability map. Some items are fully operational today and some are in partial/hardening state.  
> Use [⚠️ Current Limitations & Known Gaps](#-current-limitations--known-gaps-february-2026) for the transparent maturity view.

### 🏠 Dashboard & Overview

| Feature | Description | How to Access |
|---------|-------------|---------------|
| **Site Dashboard** | Overview of key metrics (planned tonnes, variance, quality compliance) | Home page after login |
| **KPI Cards** | Real-time production metrics | Dashboard top section |
| **Active Schedule Summary** | Current schedule status with optimization details | Dashboard center |
| **Stockpile Status** | Current stockpile levels with visual progress bars | Dashboard side panel |
| **Quick Actions** | Run Fast Pass, Create Scenario, View Reports, Site Settings | Dashboard action buttons |
| **Alerts Panel** | Recent notifications, warnings, and system alerts | Dashboard alerts section |

---

### 📅 Scheduling Module

The heart of MineOpt Pro - plan and optimize your mine production schedules.

| Feature | Description | How to Access |
|---------|-------------|---------------|
| **Gantt Chart** | Visual timeline of all scheduled tasks | Planner Workspace → Schedule tab |
| **Drag & Drop Tasks** | Move tasks to different time slots by dragging | Click and drag any task bar |
| **Split Task** | Divide a task across multiple periods | Right-click task → "Split Task" |
| **Merge Tasks** | Combine multiple tasks into one | Select tasks → Right-click → "Merge" |
| **Change Resource** | Reassign tasks to different equipment | Right-click task → "Change Resource" |
| **Rate Factor Editing** | Adjust production rates inline | Click task → edit rate input |
| **Precedence Validation** | Enforce task dependencies and sequences | Automatic when scheduling |
| **Fast Pass Optimization** | Quick schedule optimization (~3 seconds) | Click "Fast Pass" button |
| **Full Optimization** | Complete optimization pass (~60 seconds) | Click "Full Optimize" button |
| **Scenario Comparison** | Compare different scheduling scenarios | Create Scenario → Compare |

#### How to Create a Schedule:

1. Navigate to **Planner Workspace** → **Schedule** tab
2. Click **"New Schedule"**
3. Select the calendar period (start date, end date)
4. Choose which resources (equipment) to include
5. Click **"Fast Pass"** for quick scheduling
6. Review the Gantt chart and adjust as needed
7. Click **"Publish"** when satisfied

#### Gantt Chart Context Menu (Right-Click Options):

- ✏️ **Edit Task** - Modify task properties (quantity, notes, breakdown indicators)
- ✂️ **Split Task** - Divide task with percentage and target period
- 📋 **Duplicate** - Create a copy of the task
- 🔄 **Change Resource** - Reassign to different equipment
- 📊 **View Explanation** - See why the optimizer made this decision
- 🗑️ **Delete Task** - Remove the task from schedule

---

### 🗺️ 3D Visualization & Spatial Module

Interactive 3D view of your mine with advanced terrain visualization.

| Feature | Description | How to Access |
|---------|-------------|---------------|
| **3D Terrain Viewer** | Interactive 3D mine visualization | Planner Workspace → 3D View tab |
| **Surface Timeline** | Play back surface changes over time | Timeline scrubber in 3D view |
| **Surface Comparison** | Compare two surfaces side-by-side | Compare button in toolbar |
| **Cut/Fill Volumes** | Calculate volume differences between surfaces | After comparison |
| **Excavation Progress Chart** | Cumulative excavation visualization | Progress tab in 3D view |
| **3D Measurements** | Measure points, distances, and areas | Measurement toolbar |
| **LOD Settings** | Adjust render quality for performance | Settings → Graphics |
| **Activity Area Renderer** | Visualize mining blocks and areas | Auto-displayed in 3D view |
| **Block Model Renderer** | Display block model grades and properties | Enable in view options |
| **Borehole Renderer** | Show drillhole locations and data | Enable in view options |
| **Stockpile Renderer** | Visualize stockpile locations | Enable in view options |
| **Haulage Renderer** | Display haul roads and routes | Enable in view options |

#### 3D Navigation Controls:

| Control | Action |
|---------|--------|
| Left mouse + drag | Rotate view |
| Right mouse + drag | Pan view |
| Scroll wheel | Zoom in/out |
| Double-click | Focus on clicked point |
| Shift + drag | Measure distance |

---

### 🚚 Fleet Management System

Track and manage your entire mining fleet in real-time.

| Feature | Description | How to Access |
|---------|-------------|---------------|
| **GPS Tracking** | Live location of all equipment on the map | Fleet → Map View |
| **Fleet Map Overlay** | Equipment icons on interactive Leaflet map | Fleet → Map View |
| **Equipment Detail Card** | Popup with status, hours, and controls | Click equipment icon |
| **Geofencing** | Set restricted zones and get violation alerts | Fleet → Geofences |
| **Geofence Violations** | Track equipment entering restricted areas | Fleet → Violations log |
| **Haul Cycle Analysis** | Automatic detection of loading, hauling, dumping cycles | Fleet → Haul Cycles |
| **Haul Cycle KPIs** | Cycle time, queue time, payload metrics | Fleet → Analytics |
| **Maintenance Calendar** | Gantt-style view for planned maintenance | Fleet → Maintenance |
| **Maintenance Scheduling** | Schedule PM services and repairs | Fleet → Schedule Maintenance |
| **Equipment Health Dashboard** | ML-based failure prediction with risk scores | Fleet → Health |
| **Component Life Tracking** | Track engine hours, tire wear, etc. | Equipment Detail Card |

#### How to Track Equipment:

1. Go to **Fleet** → **Map View**
2. See all equipment locations in real-time on the map
3. Click any equipment icon to see:
   - Current status (operating, idle, down)
   - Today's operating hours
   - Current task/destination
   - Recent haul cycles
4. View haul cycle metrics in the **Analytics** tab

---

### 💥 Drill & Blast Module

Design blast patterns and predict fragmentation.

| Feature | Description | How to Access |
|---------|-------------|---------------|
| **Pattern Designer** | Interactive 2D grid for hole placement | Drill & Blast → Designer |
| **Burden/Spacing Config** | Set blast pattern parameters | Pattern properties panel |
| **Hole Placement** | Click to place drill holes on grid | Click on grid |
| **Delay Timing** | Visual delay sequence visualization | Delays tab |
| **Delay Numbering** | Assign delay numbers for sequencing | Click hole → set delay |
| **Kuz-Ram Prediction** | Calculate expected fragmentation (X50 size) | Click "Predict Fragmentation" |
| **Drill Log Generation** | Export drill hole specifications | Export → Drill Log |
| **Fragmentation Model** | Configure rock factor and other parameters | Settings → Blast Config |

#### How to Design a Blast Pattern:

1. Go to **Drill & Blast** → **Pattern Designer**
2. Click **"New Pattern"**
3. Set parameters:
   - **Burden:** Distance between rows (typically 4-6m)
   - **Spacing:** Distance between holes in a row (typically 5-7m)
   - **Hole Diameter:** In millimeters
   - **Bench Height:** Height of the bench being blasted
4. Click on the grid to place drill holes
5. Assign delay numbers to each hole (sequence of detonation)
6. Click **"Predict Fragmentation"** to see expected P80 size
7. Export drill log for field crew

---

### 📦 Material Tracking & Shift Operations

Track material movements and manage shift handovers.

| Feature | Description | How to Access |
|---------|-------------|---------------|
| **Load Tickets** | Record each truck load with origin, destination, tonnage | Operations → Tickets |
| **Material Flow Sankey** | Visual diagram of material movements | Operations → Flow Diagram |
| **Shift Handover Form** | Digital handover with notes and tasks | Operations → Handover |
| **Shift Log** | Record shift events and activities | Operations → Shift Log |
| **Incident Logging** | Record and track safety incidents | Operations → Incidents |
| **Reconciliation** | Compare planned vs actual production | Operations → Reconciliation |

#### How to Record a Load Ticket:

1. Go to **Operations** → **Load Tickets**
2. Click **"New Ticket"**
3. Fill in:
   - Truck fleet number
   - Origin (pit, block, bench)
   - Destination (stockpile, dump, ROM)
   - Tonnes (weight)
   - Material type
4. Click **"Submit"**

---

### 🏔️ Geotechnical Monitoring

Monitor slope stability and water levels for safety.

| Feature | Description | How to Access |
|---------|-------------|---------------|
| **Prism Monitoring** | Track survey prism movements | Monitoring → Slopes |
| **Displacement Alerts** | Automatic alerts when thresholds exceeded | Configured in Settings |
| **Displacement History** | Historical movement graphs | Click prism → History |
| **Water Level Tracking** | Monitor bore water levels | Monitoring → Water |
| **Trend Analysis** | Visualize movement trends over time | Monitoring → Trends |
| **Hazard Zones** | Define exclusion and hazard areas on map | Monitoring → Hazards |
| **Zone Violations** | Track equipment entering hazard zones | Monitoring → Violations |

#### How to Monitor Slope Stability:

1. Go to **Monitoring** → **Slope Stability**
2. View prism status cards with color-coded alerts:
   - 🟢 Green: Normal (< 5mm movement)
   - 🟡 Yellow: Warning (5-15mm movement)
   - 🔴 Red: Alert (> 15mm movement)
3. Click a prism to see detailed displacement history
4. Set alert thresholds in **Settings** → **Geotech**

---

### 🌬️ Environmental Monitoring

Track dust levels and air quality.

| Feature | Description | How to Access |
|---------|-------------|---------------|
| **Dust Monitoring** | PM10 and PM2.5 real-time readings | Monitoring → Environment |
| **Exceedance Alerts** | Automatic alerts when limits exceeded | Configured in Settings |
| **Historical Trends** | View readings over time | Environment → History |
| **Weather Integration** | Wind speed and direction display | Environment → Weather |

---

### 🧪 Quality Management

Manage material quality and run simulations.

| Feature | Description | How to Access |
|---------|-------------|---------------|
| **Quality Fields** | Define quality parameters (CV, Ash, Moisture, etc.) | Quality → Fields |
| **Blend Calculation** | Calculate blended quality from multiple sources | Quality → Blend |
| **Monte Carlo Simulation** | Simulate quality uncertainty (100-10,000 iterations) | Quality → Simulation |
| **Confidence Bands** | P5/P50/P95 probability ranges | Simulation results |
| **Compliance Probability** | Likelihood of meeting specifications | Simulation results |
| **Risk Score** | Overall quality risk assessment | Quality → Risk |
| **Product Specifications** | Define quality targets for products | Quality → Products |
| **Demand Schedule** | Set target and committed tonnes by period | Products → Demand |
| **Lab Results Import** | Import delayed lab assay results | Import → Lab Results |

#### How to Run a Quality Simulation:

1. Go to **Quality** → **Simulation Panel**
2. Select sources (parcels/blocks to blend)
3. Set iteration count:
   - 100: Quick estimate
   - 1,000: Standard accuracy
   - 10,000: High precision
4. Click **"Run Simulation"**
5. Review results:
   - Probability distribution charts
   - Compliance percentage
   - P5/P50/P95 values

---

### ⚗️ Wash Plant Management

Configure and simulate coal washing processes.

| Feature | Description | How to Access |
|---------|-------------|---------------|
| **Wash Tables** | Define wash plant characteristics | Wash Plant → Tables |
| **Process Simulation** | Simulate material through wash plant | Wash Plant → Process |
| **Multi-Stage Wash** | Configure multiple washing stages | Wash Plant → Stages |
| **Cutpoint Optimization** | Optimize specific gravity cutpoints | Wash Plant → Optimize |
| **Yield Prediction** | Predict yield at different cutpoints | Process results |

---

### 📊 Reporting & Export

Generate reports and export data.

| Feature | Description | How to Access |
|---------|-------------|---------------|
| **Query Builder** | Create ad-hoc reports without SQL | Reports → Query Builder |
| **PDF Reports** | Export formatted PDF reports | Reports → Export PDF |
| **Scheduled Reports** | Set up automated email reports | Reports → Schedules |
| **Report Packs** | Generate bundled PDF reports | Reports → Pack |
| **BI Extract** | Export data for business intelligence tools | Integration → BI Extract |
| **CSV Export** | Download data as spreadsheets | Export → CSV |

#### Using the Query Builder:

1. Go to **Reports** → **Query Builder**
2. Select a table from the dropdown (e.g., "Load Tickets")
3. Choose columns to display (checkbox list)
4. Add filters:
   - Field: Select the column
   - Operator: equals, greater than, contains, etc.
   - Value: Enter the filter value
5. Add aggregations if needed (sum, average, count)
6. Click **"Run Query"**
7. View results and export as CSV or chart

---

### 🔌 Integration Hub

Connect to external systems.

| Feature | Description | How to Access |
|---------|-------------|---------------|
| **SCADA Integration** | OPC-UA tag reading, historian queries | Integration → SCADA |
| **SAP Integration** | RFC connection for cost rates, work orders | Integration → SAP |
| **Oracle EBS Integration** | REST API for invoices, production records | Integration → Oracle |
| **External ID Mapping** | Map external system IDs to MineOpt entities | Integration → Mappings |
| **BI Extract Publishing** | Schedule data exports | Integration → BI Extract |
| **Webhook Registration** | Register webhooks for real-time events | Integration → Webhooks |
| **Fleet Actuals Import** | Import fleet data from external systems | Integration → Fleet |
| **Survey Data Import** | Import survey data | Integration → Survey |

#### Setting Up External ID Mappings:

1. Go to **Integration** → **External ID Mappings**
2. Select entity type tab (Parcels, Resources, Locations, Products)
3. Actions:
   - **Add Mapping:** Click "Add Mapping" button
   - **Import CSV:** Upload file with columns: `external_id`, `internal_id`, `description`
   - **Export:** Download current mappings as CSV
   - **Search:** Filter by any field

---

### 📁 Data Import & File Formats

Import data from various file formats.

| Feature | Description | How to Access |
|---------|-------------|---------------|
| **File Uploader** | Drag-and-drop file upload interface | Import → Upload |
| **Column Mapper** | Map CSV columns to database fields | During import |
| **DXF Import** | Import CAD drawings (AutoCAD format) | Import → CAD |
| **Surpac STR Import** | Import Surpac string files | Import → Terrain |
| **ASCII Grid Import** | Import ASCII grid terrain files | Import → Terrain |
| **CSV/Excel Import** | Import tabular data | Import → Data |
| **Borehole Import** | Import drillhole collar, survey, assay data | Import → Boreholes |
| **Block Model Import** | Import block model definitions | Import → Block Model |
| **Lab Results Import** | Import lab assay results | Import → Lab |

#### Importing Terrain Data:

1. Go to **Import** → **Terrain Import Panel**
2. Choose file format:
   - **DXF:** AutoCAD files with 3D contours
   - **STR:** Surpac string files
   - **ASC:** ASCII grid files
3. Upload your file (drag-and-drop or click)
4. Set coordinate reference system (CRS)
5. Preview the data
6. Click **"Import"**

---

### 🛠️ CAD & Geometry Tools

Edit and create mine geometries.

| Feature | Description | How to Access |
|---------|-------------|---------------|
| **Geometry Editor** | Modify mining area boundaries | 3D View → Edit Mode |
| **Vertex Editing** | Drag vertices to adjust boundaries | Select polygon → Edit Vertices |
| **Split Polygon** | Divide polygon into multiple areas | Edit → Split |
| **Merge Polygons** | Combine adjacent polygons | Select multiple → Merge |
| **Add Vertex** | Insert new point on edge | Click edge + Insert |
| **Delete Vertex** | Remove selected point | Select vertex → Delete |
| **CAD String Export** | Export to DXF format | Export → DXF |
| **Annotation Tools** | Add text labels and notes | Annotate button |
| **Undo/Redo** | Revert or redo changes | Ctrl+Z / Ctrl+Y |

---

### 🔗 Real-Time Collaboration

Multi-user features for team collaboration.

| Feature | Description | How to Access |
|---------|-------------|---------------|
| **Presence Indicators** | See who's online and working | User avatars in header |
| **Editing Locks** | Prevent conflicts when editing | Automatic |
| **Change Log** | Track all modifications | View → Change Log |
| **Real-Time Updates** | See changes from other users instantly | WebSocket-based |

#### Presence Indicator Colors:

- 🟢 **Green dot:** User is actively working
- 🟡 **Yellow dot:** User is idle (no recent activity)
- ✏️ **Pencil icon:** User is currently editing

---

### ⚙️ Settings & Configuration

Configure site and system settings.

| Feature | Description | How to Access |
|---------|-------------|---------------|
| **Site Settings** | Configure site-specific parameters | Settings → Site |
| **User Management** | Add/remove users, set roles | Settings → Users |
| **Role Permissions** | Configure access permissions | Settings → Roles |
| **Calendar Configuration** | Set up scheduling periods | Settings → Calendar |
| **Quality Field Config** | Define quality parameters | Settings → Quality |
| **Alert Thresholds** | Set monitoring alert levels | Settings → Alerts |
| **CRS Configuration** | Set coordinate reference system | Settings → Spatial |

---

## 🧭 Feature Access Guide (Menu-by-Menu, Screen-by-Screen)

This section explains exactly how a user reaches each major feature and what they should see when it is working.

### A. Home and Dashboard

Path:

1. Login
2. Open sidebar
3. Click `Dashboard`

Expected visuals:

- KPI/summary cards at top
- active context panels (site/schedule context)
- navigation still visible on left

If something is wrong:

- blank cards: run seed data first
- redirect to login: token/auth session expired

### B. Planner entry point

Path:

1. Sidebar → `3D Spatial View` (or any planning tab shortcut)
2. URL should become `/app/planner?tab=...`

Expected visuals:

- planner header region
- tab-specific module content area
- no hard browser error overlay

### C. Planner tab-by-tab guide

#### C1. Spatial View

Access:

- Sidebar → Planning → `3D Spatial View`
- URL: `/app/planner?tab=spatial`

Expected visuals:

- spatial panel/canvas area
- spatial controls/toolbar blocks
- selectable planning artifacts (depending on seed/import state)

#### C2. Gantt Schedule

Access:

- Sidebar → Planning → `Gantt Schedule`
- URL: `/app/planner?tab=gantt`

Expected visuals:

- timeline-style scheduling view
- rows/blocks area for tasks
- schedule-related controls

#### C3. Schedule Control

Access:

- Sidebar → Planning → `Schedule Control`
- URL: `/app/planner?tab=schedule-control`

Expected visuals:

- controls for schedule operations
- status/diagnostic feedback area
- run/fork/switch style control actions

#### C4. Reports & Analytics

Access:

- Sidebar → Planning → `Reports & Analytics`
- URL: `/app/planner?tab=reporting`

Expected visuals:

- report widgets/tables/charts or report controls
- export/report interaction options where available

#### C5. Flow Network

Access:

- Sidebar → Configuration → `Flow Network`
- URL: `/app/planner?tab=flow-editor`

Expected visuals:

- flow network editor area
- node/arc configuration controls

#### C6. Product Specs

Access:

- Sidebar → Configuration → `Product Specs`
- URL: `/app/planner?tab=product-specs`

Expected visuals:

- quality/product specification controls
- save/update interaction controls

#### C7. Resources

Access:

- Sidebar → Configuration → `Resources`
- URL: `/app/planner?tab=resources`

Expected visuals:

- resource list/config panel
- editable fields for resource-level parameters

#### C8. Block Model

Access:

- Sidebar → Configuration → `Block Model`
- URL: `/app/planner?tab=geology`

Expected visuals:

- geology/block model module content
- entity/layer selection controls

#### C9. Stockpiles

Access:

- Sidebar → Configuration → `Stockpiles`
- URL: `/app/planner?tab=data`

Expected visuals:

- stockpile-related tables/panels
- data summaries for current state

#### C10. Import Data

Access:

- Sidebar → Data & Integration → `Import Data`
- URL: `/app/planner?tab=import`

Expected visuals:

- file upload controls
- file parsing or mapping interfaces

#### C11. Integrations

Access:

- Sidebar → Data & Integration → `Integrations`
- URL: `/app/planner?tab=integrations`

Expected visuals:

- external mapping/integration configuration panels
- import/export mapping actions

#### C12. Settings

Access:

- Sidebar → Data & Integration → `Settings`
- URL: `/app/planner?tab=settings`

Expected visuals:

- configuration forms for settings domains
- persistent save actions and feedback toasts/messages

### D. Operations modules guide

#### D1. Fleet Management

Access:

- Sidebar → Operations → `Fleet Management`
- URL: `/app/fleet`

Expected visuals:

- fleet dashboard cards/charts/maps
- equipment/cycle context panels

#### D2. Drill & Blast

Access:

- Sidebar → Operations → `Drill & Blast`
- URL: `/app/drill-blast`

Expected visuals:

- blast pattern/event module UI
- related action controls

#### D3. Shift Operations

Access:

- Sidebar → Operations → `Shift Operations`
- URL: `/app/operations`

Expected visuals:

- shift handover/operations forms and logs
- shift context selectors or summary panels

### E. Monitoring modules guide

#### E1. Slope Stability

Access:

- Sidebar → Monitoring → `Slope Stability`
- URL base: `/app/monitoring`

Expected visuals:

- monitoring panels for geotechnical context
- alert/readings view blocks

#### E2. Environment

Access:

- Sidebar → Monitoring → `Environment`
- URL base: `/app/monitoring`

Expected visuals:

- environmental monitoring panels
- dust/condition tracking context

### F. Seed Data workflow guide

Access:

- Sidebar → Data & Integration → `Seed Demo Data`
- URL: `/app/seed-data`

Expected visuals:

- clearly labeled seed action controls
- success/failure status messaging
- post-seed planner pages populate with data

---

## 🔧 Setup Options

MineOpt Pro can be set up in three different ways depending on your needs:

### Option 1: Development Setup (Recommended for Beginners)

This is the simplest setup, great for learning and development.

**Terminal 1 - Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Access Points:**
| Service | URL |
|---------|-----|
| Frontend App | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Documentation (Swagger) | http://localhost:8000/docs |
| Alternative API Docs (ReDoc) | http://localhost:8000/redoc |

---

### Option 2: Docker Setup (Recommended for Consistent Environments)

Use Docker to run everything in containers. This ensures the same environment everywhere.

**Prerequisites:**
- Docker Desktop installed ([download here](https://www.docker.com/products/docker-desktop))

**Quick Start:**
```bash
# From the project root directory
docker-compose up --build
```

**What happens:**
1. PostgreSQL database container starts
2. Backend API container builds and starts
3. Frontend container builds and starts
4. All services are networked together

**Access Points:**
| Service | URL |
|---------|-----|
| Frontend App | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| PostgreSQL Database | localhost:5432 |

**Other Docker Commands:**
```bash
# Run in background
docker-compose up -d

# Stop all containers
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up --build

# Remove all data and start fresh
docker-compose down -v
docker-compose up --build
```

---

### Option 3: Production Deployment

For deploying to a production server.

**Backend (using Gunicorn):**
```bash
cd backend
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

**Frontend (build static files):**
```bash
cd frontend
npm run build
# The 'dist' folder contains static files
# Serve with nginx, Apache, or any static file server
```

**Example Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/mineopt/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## ⚙️ Environment Configuration

### Creating Your .env File

Copy the example file and customize:

```bash
# In the project root directory
cp .env.example .env
```

**Edit `.env` with your settings:**

```bash
# Database Configuration
POSTGRES_USER=mineopt
POSTGRES_PASSWORD=your-secure-password-here
POSTGRES_DB=mineopt_pro

# Backend Configuration
SECRET_KEY=your-super-secret-jwt-key-here-change-this
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Optional: Email Configuration (for report delivery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourcompany.com

# Optional: Redis (for caching and sessions)
REDIS_URL=redis://redis:6379/0
```

### Database Options

**SQLite (Default - Development):**
- No configuration needed
- Database file: `backend/mineopt.db`
- Created automatically on first run

**PostgreSQL (Recommended for Production):**

1. Install PostgreSQL
2. Create a database:
   ```bash
   createdb mineopt_pro
   ```
3. Update `.env`:
   ```bash
   DATABASE_URL=postgresql://username:password@localhost/mineopt_pro
   ```
4. Restart the backend

---

## 📖 Detailed Usage Guide

### Daily Workflow Example

Here's a typical day using MineOpt Pro:

#### Morning Shift Start (6:00 AM)

1. **Check Dashboard**
   - Review overnight alerts and notifications
   - Check equipment status
   - Review today's planned production

2. **Complete Shift Handover**
   - Go to **Operations** → **Handover**
   - Review outgoing shift notes
   - Acknowledge handover items
   - Add incoming shift notes

3. **Verify Equipment Status**
   - Go to **Fleet** → **Map View**
   - Confirm all equipment is accounted for
   - Check for any maintenance alerts

#### During Shift

4. **Record Load Tickets**
   - Use **Operations** → **Load Tickets**
   - Record each truck load as it moves

5. **Monitor Slopes (if applicable)**
   - Check **Monitoring** → **Slopes** after blasting
   - Log any unusual readings

6. **Run Schedule Updates**
   - If delays occur, update the schedule
   - Run **Fast Pass** to re-optimize

#### Shift End

7. **Generate Reports**
   - Run **Reports** → **Daily Production**
   - Export shift summary

8. **Complete Handover**
   - Document key events
   - Note any outstanding tasks
   - Submit handover form

---

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Z` | Undo last action |
| `Ctrl + Y` | Redo |
| `Ctrl + Shift + Z` | Redo (alternative) |
| `Ctrl + S` | Save current changes |
| `Escape` | Cancel current operation |
| `Delete` | Remove selected item |
| `F` | Fit view to all objects (3D view) |
| `G` | Toggle grid (3D view) |
| `M` | Measurement mode (3D view) |

---

## 📡 API Reference

MineOpt Pro provides a comprehensive REST API. Full interactive documentation is available at `http://localhost:8000/docs` when the server is running.

### Authentication

All API endpoints (except login) require authentication:

**Login:**
```http
POST /auth/token
Content-Type: application/x-www-form-urlencoded

username=admin@example.com&password=yourpassword
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Using the Token:**
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Key API Endpoints

#### Health Check
```http
GET /
Response: {"status": "MineOpt Pro Server Running", "version": "2.0.0"}
```

#### Sites
```http
GET /sites                     # List all sites
GET /sites/{site_id}          # Get site details
POST /sites                    # Create new site
```

#### Scheduling
```http
GET /schedules/site/{site_id}  # List schedules for site
POST /schedules                # Create new schedule
GET /schedules/{id}            # Get schedule details
POST /schedules/{id}/run       # Run optimization (type: "fast" or "full")
PUT /schedules/{id}/publish    # Publish draft schedule
GET /schedules/{id}/tasks      # Get scheduled tasks
```

#### Fleet Management
```http
GET /fleet/equipment                           # List all equipment
GET /fleet/equipment/{id}                      # Get equipment details
POST /fleet/equipment/{id}/gps                 # Record GPS reading
GET /fleet/equipment/{id}/haul-cycle-kpis     # Get haul cycle metrics
GET /fleet/geofences                          # List geofences
POST /fleet/geofences                         # Create geofence
GET /fleet/maintenance                        # List maintenance records
```

#### Drill & Blast
```http
POST /drill-blast/patterns                     # Create blast pattern
GET /drill-blast/patterns/{id}                # Get pattern details
POST /drill-blast/patterns/{id}/holes         # Add drill hole
GET /drill-blast/patterns/{id}/fragmentation  # Predict fragmentation
```

#### Quality
```http
POST /quality/blend                           # Calculate blended quality
POST /quality/simulate                        # Run Monte Carlo simulation
GET /quality/fields/site/{site_id}           # Get quality field config
POST /quality/check-constraints               # Check spec compliance
```

#### Operations
```http
POST /operations/tickets                      # Create load ticket
GET /operations/sites/{site_id}/current-shift # Get current shift
POST /operations/handover                     # Submit shift handover
```

#### Monitoring
```http
POST /monitoring/prisms/readings              # Record prism reading
GET /monitoring/sites/{site_id}/slope-alerts  # Get slope alerts
GET /monitoring/sites/{site_id}/dust          # Get dust readings
```

#### Surfaces
```http
GET /surfaces/{surface_id}/history           # List surface versions
POST /surfaces/compare                        # Compare two surfaces
GET /surfaces/sites/{site_id}/progress       # Get excavation progress
```

#### Reports
```http
GET /reports/schedule/{id}/pdf               # Export PDF report
GET /reports/schedule/{id}/bi                # Export BI data
POST /reports/schedules                      # Create report schedule
```

### WebSocket Endpoints

Real-time collaboration uses WebSockets:

```javascript
// Connect to real-time updates
const ws = new WebSocket('ws://localhost:8000/ws/connect?site_id=SITE_ID&user_id=USER_ID');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  // Handle: presence_update, entity_changed, editing_lock
};
```

---

## ⚠️ Current Limitations & Known Gaps (February 2026)

This section is intentionally direct. It describes where the product is still maturing so users and contributors can plan safely.

### Capability Maturity Matrix

Legend:

- `✅ Available` = usable now in normal workflows
- `🟡 Partial` = available with constraints or incomplete UX
- `🔜 Planned` = designed/targeted but not fully delivered in active workflow

| Domain | Maturity | Notes |
|------|------|------|
| Core authentication and protected routing | ✅ Available | Login/register and protected routes are active in app shell. |
| Dashboard and planner shell navigation | ✅ Available | Main pages and planner tabs are reachable via menu and URL. |
| Schedule and scenario interaction | 🟡 Partial | Core workflows exist; ongoing hardening for enterprise-grade determinism and diagnostics depth. |
| Quality and stockpile workflows | 🟡 Partial | Core modules are available; complete operational confidence workflows continue to mature. |
| Flow network configuration | 🟡 Partial | Editable and usable; validation depth and advanced UX still improving. |
| Raster + terrain operations | 🟡 Partial | Strong API foundation; runtime driver support and upload UX vary by environment. |
| CRS transformation and multi-coordinate support | ✅ Available | CRS service is broad and practical for mine workflows. |
| ECW handling | 🟡 Partial | Works where runtime drivers support it; GeoTIFF fallback recommended for universal behavior. |
| DXF/STR/CSV/TXT/ASCII file workflows | ✅ Available | Parse/import/export paths exist; end-user pipeline UX continues to be refined. |
| Surface/CAD string/annotation tooling | 🟡 Partial | API coverage is substantial; some interactive tool chains remain integration-heavy. |
| Fleet/drill-blast/operations/monitoring dashboards | ✅ Available | Dedicated modules are present and accessible. |
| Publishing/report-pack enterprise pipeline | 🟡 Partial | Reporting exists; full commercial governance and publishing rigor is still in progress. |
| Multi-user conflict controls/audit depth | 🟡 Partial | Present foundations with ongoing enterprise hardening work. |

### What this means for end-users today

1. You can run and evaluate meaningful planning workflows locally.
2. You can test import, schedule, and module navigation end-to-end.
3. You should still treat this as an evolving product platform rather than a fully hardened commercial release.

### Known technical constraints to be aware of

1. Raster file operations can depend on server file accessibility and installed raster drivers.
2. ECW behavior is environment-dependent and may need conversion workflows.
3. Some advanced UX pathways are still converging from module-first to workflow-first behavior.
4. Large frontend bundles in some builds can impact first-load performance.
5. Some workflows still require clearer operator-guided validations and guardrails.

### No-cost policy impact

This project is built to avoid mandatory paid runtime dependencies.

Possible cost triggers (optional, environment-driven):

1. Commercial ECW/GDAL codec/licensing in certain enterprise deployments.
2. Enterprise hosting/monitoring/email providers for production scale.
3. Proprietary external system access (if your organization requires paid integration endpoints).

If your goal is strict no-cost operation, use open-source-compatible formats and local services by default.

---

## 🛣️ Future Work Roadmap to Commercial Readiness

This roadmap aligns with the project recovery plans and issue execution waves.

### Phase 1: Reliability and baseline health

Target outcomes:

1. Stable automated test baseline across backend and frontend.
2. Strong lint/build gates in CI.
3. Elimination of unstable contract drift in active user workflows.

Key work:

- backend import path cleanup and test contract alignment
- frontend test runner and config standardization
- lint baseline hardening and quality gate enforcement

### Phase 2: API and workflow consistency

Target outcomes:

1. Single API access strategy for frontend modules.
2. Uniform endpoint usage patterns.
3. Reduced environment-specific behavior differences.

Key work:

- centralize all active API calls through service layer
- remove fragmented hardcoded endpoint usage
- strengthen endpoint compatibility checks

### Phase 3: Geospatial and coordinate pipeline hardening

Target outcomes:

1. Upload-first raster workflows with robust validations.
2. Clear runtime capability checks for ECW and other raster formats.
3. Seamless CRS handling in import and spatial flows.

Key work:

- raster ingestion workflow hardening
- CRS metadata visibility and transformation controls
- explicit fallback workflows for unsupported drivers

### Phase 4: Site-builder and import UX maturity

Target outcomes:

1. Unified, intuitive import-to-site workflow.
2. Strong validation and recoverable error handling.
3. Cleaner route-level discoverability of file workflows.

Key work:

- consolidate duplicate wizard paths where relevant
- guided upload → map → validate → build pipeline
- improve malformed file diagnostics and recovery UX

### Phase 5: Surface/CAD/annotation integrated workspace

Target outcomes:

1. Single integrated spatial tool experience.
2. Shared selection and editing model.
3. Better operational feedback for geometry operations.

Key work:

- integrate surface tools, CAD strings, and annotations into unified workspace behavior
- add operation history, undo/redo and clearer result overlays
- strengthen spatial query/edit cycles for production users

### Phase 6: Scheduling and optimization authority

Target outcomes:

1. Deterministic schedule runs for same inputs.
2. Strong explanation artifacts for decisions.
3. Improved operational trust in full-pass outputs.

Key work:

- harden objective profile execution and constraint accounting
- improve diagnostics and binding-constraint transparency
- deepen scenario comparison outputs

### Phase 7: Reporting, publishing, and governance

Target outcomes:

1. Reliable report-pack generation.
2. Version-linked publishing with strong traceability.
3. Enterprise-friendly operational exports.

Key work:

- standard report templates and export consistency
- immutable schedule version linkage across artifacts
- outbound integration hardening for dispatch/BI flows

### Phase 8: Collaboration and enterprise controls

Target outcomes:

1. Safer multi-user editing behavior.
2. Stronger permissions and audit consistency.
3. Better operator awareness of concurrent changes.

Key work:

- enforce role checks across critical endpoints
- improve change tracking and collaboration visibility
- strengthen edit conflict handling

### Phase 9: Realistic synthetic data and regression scenarios

Target outcomes:

1. Repeatable realistic scenario datasets.
2. Better workflow regression confidence.
3. More reliable demo/test environments.

Key work:

- deterministic synthetic generation controls
- region-aligned realistic scenario packs
- import-to-report regression suite coverage

### Phase 10: Commercial release readiness

Target outcomes:

1. Release checklist with pass/fail gates.
2. Performance and reliability budgets.
3. Documented UAT for planner/supervisor/admin personas.

Key work:

- enforce release governance checklist
- performance monitoring and runtime thresholds
- end-to-end UAT evidence capture

---

## 🐛 Troubleshooting

### Backend Issues

#### "Module not found" Error

```bash
# Make sure virtual environment is activated
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux

# Reinstall all dependencies
pip install -r requirements.txt
```

#### "Port 8000 already in use"

```bash
# Option 1: Use a different port
uvicorn app.main:app --reload --port 8001

# Option 2: Kill the process using port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :8000
kill -9 <PID>
```

#### Database Connection Error

```bash
# SQLite: Delete and recreate the database
cd backend
del mineopt.db          # Windows
rm mineopt.db           # Mac/Linux

# Restart the server - database recreates automatically
uvicorn app.main:app --reload
```

#### WeasyPrint PDF Generation Issues

WeasyPrint requires GTK libraries for PDF generation:

**Windows:**
```bash
# Install GTK via MSYS2 or download pre-built binaries
# See: https://weasyprint.readthedocs.io/en/stable/install.html#windows
```

**Mac:**
```bash
brew install pango
brew install gtk+3
```

**Linux:**
```bash
sudo apt-get install libpango-1.0-0 libpangocairo-1.0-0
```

---

### Frontend Issues

#### "npm install" Fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock
rmdir /s /q node_modules         # Windows
rm -rf node_modules              # Mac/Linux
del package-lock.json            # Windows
rm package-lock.json             # Mac/Linux

# Reinstall
npm install
```

#### "Cannot connect to backend" / CORS Errors

1. Verify backend is running on port 8000:
   - Open http://localhost:8000 in browser
   - Should see `{"status": "MineOpt Pro Server Running"}`

2. Check allowed origins in backend:
   - Frontend should be on http://localhost:5173 or http://localhost:3000

#### Page Shows Blank / White Screen

```bash
# Check browser console for errors (F12 → Console tab)

# Common fixes:
# 1. Restart the dev server
npm run dev

# 2. Clear browser cache (Ctrl+Shift+R)

# 3. Check for JavaScript errors in console
```

#### 3D View Not Rendering

1. Ensure your browser supports WebGL:
   - Go to https://get.webgl.org/
   - Should see a spinning cube

2. Update graphics drivers

3. Try a different browser (Chrome/Firefox recommended)

---

### Common Error Messages and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `ENOENT: no such file or directory` | Missing node_modules | Run `npm install` in frontend folder |
| `ModuleNotFoundError` | Missing Python packages | Activate venv and run `pip install -r requirements.txt` |
| `Connection refused` | Backend not running | Start backend with `uvicorn app.main:app --reload` |
| `CORS error` | Cross-origin blocked | Ensure correct ports (8000 backend, 5173 frontend) |
| `401 Unauthorized` | Token expired/invalid | Log out and log in again |
| `422 Validation Error` | Invalid request data | Check request body matches API schema |
| `500 Internal Server Error` | Backend bug | Check backend console for traceback |

---

## 📦 Project Structure

```
Open-Cast_Mine_Production_Optimization_Dashboard/
│
├── 📁 backend/                      # Python FastAPI backend
│   ├── 📁 app/
│   │   ├── 📁 domain/               # SQLAlchemy database models
│   │   │   ├── models_core.py       # User, Role, Site
│   │   │   ├── models_calendar.py   # Calendar, Period
│   │   │   ├── models_fleet.py      # Equipment, GPS, Geofence
│   │   │   ├── models_drill_blast.py # BlastPattern, DrillHole
│   │   │   ├── models_flow.py       # FlowNetwork, FlowNode, FlowArc
│   │   │   ├── models_geotech_safety.py # Prism, HazardZone
│   │   │   ├── models_material_shift.py # LoadTicket, Shift
│   │   │   ├── models_surface.py    # Surface, CADString
│   │   │   └── ... (18 total model files)
│   │   │
│   │   ├── 📁 services/             # Business logic layer
│   │   │   ├── fleet_service.py     # Fleet management logic
│   │   │   ├── drill_blast_service.py # Blast pattern logic
│   │   │   ├── schedule_engine.py   # Scheduling optimization
│   │   │   ├── lp_allocator.py      # Linear programming solver
│   │   │   ├── cp_solver_service.py # Constraint programming
│   │   │   ├── quality_simulator.py # Monte Carlo simulation
│   │   │   ├── wash_plant_service.py # Wash plant processing
│   │   │   ├── kriging_service.py   # Geostatistics
│   │   │   ├── dxf_service.py       # CAD file handling
│   │   │   └── ... (50+ service files)
│   │   │
│   │   ├── 📁 routers/              # API endpoint definitions
│   │   │   ├── auth_router.py       # Authentication
│   │   │   ├── schedule_router.py   # Scheduling API
│   │   │   ├── fleet_router.py      # Fleet API
│   │   │   ├── drill_blast_router.py # Drill & blast API
│   │   │   ├── flow_router.py       # Material flow API
│   │   │   ├── quality_router.py    # Quality API
│   │   │   └── ... (31 total routers)
│   │   │
│   │   ├── database.py              # Database connection setup
│   │   └── main.py                  # FastAPI application entry
│   │
│   ├── 📁 tests/                    # Pytest test files
│   │   ├── test_services.py         # Service unit tests
│   │   ├── test_api_endpoints.py    # API integration tests
│   │   ├── test_e2e_workflows.py    # End-to-end tests
│   │   └── ... (22 test files)
│   │
│   └── requirements.txt             # Python dependencies
│
├── 📁 frontend/                     # React frontend application
│   ├── 📁 src/
│   │   ├── 📁 components/           # Reusable React components
│   │   │   ├── 📁 spatial/          # 3D visualization
│   │   │   │   ├── Viewport3D.jsx   # Main 3D canvas
│   │   │   │   ├── SurfaceRenderer.jsx
│   │   │   │   ├── BlockModelRenderer.jsx
│   │   │   │   └── VolumeCalculator.jsx
│   │   │   │
│   │   │   ├── 📁 scheduler/        # Scheduling components
│   │   │   │   ├── GanttChart.jsx   # Interactive Gantt
│   │   │   │   ├── GanttTaskBar.jsx
│   │   │   │   ├── GanttContextMenu.jsx
│   │   │   │   └── DiagnosticsPanel.jsx
│   │   │   │
│   │   │   ├── 📁 fleet/            # Fleet management UI
│   │   │   │   ├── FleetMapOverlay.jsx
│   │   │   │   ├── EquipmentDetailCard.jsx
│   │   │   │   ├── HaulCycleDashboard.jsx
│   │   │   │   └── MaintenanceCalendar.jsx
│   │   │   │
│   │   │   ├── 📁 quality/          # Quality management
│   │   │   │   ├── QualitySimulation.jsx
│   │   │   │   └── SimulationPanel.jsx
│   │   │   │
│   │   │   ├── 📁 import/           # Data import
│   │   │   │   ├── FileUploader.jsx
│   │   │   │   ├── ColumnMapper.jsx
│   │   │   │   └── TerrainImportPanel.jsx
│   │   │   │
│   │   │   └── ... (30 component directories)
│   │   │
│   │   ├── 📁 pages/                # Page-level components
│   │   │   ├── LandingPage.jsx      # Public homepage
│   │   │   ├── LoginPage.jsx        # Authentication
│   │   │   ├── SiteDashboard.jsx    # Main dashboard
│   │   │   └── PlannerWorkspace.jsx # Planner interface
│   │   │
│   │   ├── 📁 hooks/                # Custom React hooks
│   │   ├── 📁 services/             # API service layer
│   │   ├── App.jsx                  # Main React component
│   │   └── main.jsx                 # Application entry
│   │
│   └── package.json                 # JavaScript dependencies
│
├── 📁 docs/                         # Documentation
│   ├── API_DOCUMENTATION.md         # API reference
│   ├── DEVELOPER_GUIDE.md           # Developer guide
│   ├── USER_GUIDE.md               # User manual
│   └── requirements.md              # Requirements document
│
├── docker-compose.yml               # Docker configuration
├── .env.example                     # Environment template
└── README.md                        # This file
```

### Visual Architecture Map (How a user action travels through the system)

```text
[User in Browser]
       |
       v
[React Page / Component]
       |
       v
[frontend/src/services/api.js]
       |
       v
[FastAPI Router Endpoint]
       |
       v
[Service Layer Business Logic]
       |
       v
[SQLAlchemy Models + Database]
       |
       v
[JSON Response Back to UI]
```

### Visual Runtime Topology (Local Development)

```text
┌─────────────────────────────┐
│ Browser (localhost:5173)    │
│ React UI                    │
└──────────────┬──────────────┘
               │ HTTP/JSON
               ▼
┌─────────────────────────────┐
│ FastAPI (localhost:8000)    │
│ Routers + Services + Models │
└──────────────┬──────────────┘
               │ SQL
               ▼
┌─────────────────────────────┐
│ SQLite or PostgreSQL        │
│ Site, schedule, flow, etc.  │
└─────────────────────────────┘
```

### Visual Frontend Route Hierarchy

```text
/                       -> LandingPage
/login                  -> LoginPage
/register               -> LoginPage (register mode)
/app/dashboard          -> SiteDashboard
/app/planner            -> PlannerWorkspace (tab-driven)
/app/fleet              -> FleetDashboard
/app/drill-blast        -> DrillBlastDashboard
/app/operations         -> OperationsDashboard
/app/monitoring         -> MonitoringDashboard
/app/seed-data          -> SeedDataPage
```

### Visual Planner Tab Hierarchy

```text
/app/planner?tab=spatial
/app/planner?tab=gantt
/app/planner?tab=schedule-control
/app/planner?tab=reporting
/app/planner?tab=flow-editor
/app/planner?tab=product-specs
/app/planner?tab=resources
/app/planner?tab=geology
/app/planner?tab=data
/app/planner?tab=import
/app/planner?tab=integrations
/app/planner?tab=settings
```

### Visual "Where to Edit What" Guide

| If you want to change... | Start here |
|------|------|
| API endpoint behavior | `backend/app/routers/` |
| Business rules/calculations | `backend/app/services/` |
| Database entities/fields | `backend/app/domain/` |
| UI page routing | `frontend/src/App.jsx` |
| Sidebar navigation/menu | `frontend/src/components/layout/AppLayout.jsx` |
| Planner tab orchestration | `frontend/src/pages/PlannerWorkspace.jsx` |
| API call wiring in UI | `frontend/src/services/api.js` |
| Docs and plans | `docs/` |

### Visual "How to verify structure is healthy"

Run from project root:

```bash
# Backend starts
cd backend
uvicorn app.main:app --reload --port 8000

# Frontend starts (new terminal)
cd frontend
npm run dev
```

**👀 You should see:**

- backend: startup complete + table init log
- frontend: Vite local URL output
- app pages resolve without route 404 for listed routes

---

## 🧪 Testing

### Running Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_services.py

# Run tests matching a pattern
pytest -k "test_blend"

# Generate coverage report
pytest --cov=app --cov-report=html
# Open htmlcov/index.html in browser to view
```

### Running Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run with watch mode
npm test -- --watch

# Generate coverage
npm test -- --coverage
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
   - Click "Fork" on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/SIHLE-MTSHALI/MineOpt-pro.git
   cd MineOpt-pro
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/my-awesome-feature
   ```

4. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation

5. **Run tests**
   ```bash
   cd backend && pytest
   cd ../frontend && npm test
   ```

6. **Commit your changes**
   ```bash
   git commit -m 'feat: add my awesome feature'
   ```
   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `refactor:` for code refactoring

7. **Push to your fork**
   ```bash
   git push origin feature/my-awesome-feature
   ```

8. **Open a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your branch

---

## 📚 Additional Resources

### Documentation Links

- **Interactive API Docs:** http://localhost:8000/docs (when server running)
- **Alternative API Docs (ReDoc):** http://localhost:8000/redoc
- **User Guide:** [docs/USER_GUIDE.md](docs/USER_GUIDE.md)
- **Developer Guide:** [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)
- **API Reference:** [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

### Technology Documentation

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Three.js Documentation](https://threejs.org/docs/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Leaflet Documentation](https://leafletjs.com/reference.html)

---

## ❓ Need Help?

- **Check the Troubleshooting section** above
- **Open an issue on GitHub** for bugs or feature requests
- **Start a Discussion** for questions and ideas
- **Review the API documentation** at http://localhost:8000/docs

---

<div align="center">

**MineOpt Pro** - Optimizing Mine Production, One Shift at a Time

Built with ❤️ for the mining industry

</div>
