# Open-Cast Mine Production Optimization Dashboard API Documentation

Last reviewed: 2026-05-27

This document maps the current FastAPI route groups and common usage patterns. For exact request and response schemas, run the backend and use the generated OpenAPI documentation.

```text
Swagger UI: http://localhost:8000/docs
ReDoc:      http://localhost:8000/redoc
Base URL:  http://localhost:8000
```

## Health and Root Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | Root status check. |
| `GET` | `/health` | Basic liveness check. |
| `GET` | `/health/ready` | Readiness check, including database check. |
| `GET` | `/health/detailed` | Detailed runtime/system information where available. |

## Authentication

Auth routes live under `/auth`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Register a username/password user. |
| `POST` | `/auth/token` | Login with form data and receive a bearer token. |
| `POST` | `/auth/token/refresh` | Refresh an active token. |
| `POST` | `/auth/logout` | Invalidate the current session. |
| `POST` | `/auth/logout/all` | Invalidate all sessions for the current user. |
| `GET` | `/auth/users/me` | Return current user context. |
| `GET` | `/auth/sessions` | List current user's active sessions. |
| `DELETE` | `/auth/sessions/{session_id}` | Invalidate one session. |

Login example:

```bash
curl -X POST http://localhost:8000/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin"
```

Authenticated request example:

```bash
curl http://localhost:8000/auth/users/me \
  -H "Authorization: Bearer <access_token>"
```

Not every current endpoint is uniformly protected. Review router dependencies before treating an endpoint as production-secured.

## Configuration and Seed Data

Routes live under `/config`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/config/seed-demo-data` | Seed a smaller working dataset. |
| `POST` | `/config/seed-comprehensive-demo` | Seed comprehensive working data. |
| `GET` | `/config/sites` | List sites. |
| `GET` | `/config/resources` | List resources for a site. |
| `GET` | `/config/material-types` | List material types. |
| `GET` | `/config/activity-areas` | List activity areas. |
| `GET` | `/config/network-nodes` | List flow/network nodes. |
| `GET` | `/config/washplant/site/{site_id}` | Get wash plant site configuration. |
| `GET` | `/config/geology/site/{site_id}/blocks` | Get geology blocks for a site. |
| `GET` | `/config/settings/site/{site_id}` | Get site settings. |
| `PUT` | `/config/settings/site/{site_id}` | Update site settings. |
| `GET` | `/config/resources/maintenance` | Get resource maintenance data. |

Seed example:

```bash
curl -X POST http://localhost:8000/config/seed-comprehensive-demo
```

## Calendar

Routes live under `/calendar`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/calendar/calendars` | List calendars. |
| `POST` | `/calendar/calendars` | Create a calendar. |
| `GET` | `/calendar/site/{site_id}` | List calendars for a site. |
| `GET` | `/calendar/{calendar_id}/periods` | List periods for a calendar. |
| `GET` | `/calendar/{calendar_id}/current-period` | Get current period for a calendar. |

## Scheduling

Routes live under `/schedule`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/schedule/versions` | Create a schedule version. |
| `GET` | `/schedule/versions` | List versions. |
| `POST` | `/schedule/versions/{version_id}/fork` | Fork a schedule version. |
| `GET` | `/schedule/site/{site_id}/versions` | List versions for a site. |
| `GET` | `/schedule/versions/{version_id}` | Get one version. |
| `GET` | `/schedule/versions/{version_id}/runs` | List runs for a version. |
| `POST` | `/schedule/run/full-pass` | Run full-pass scheduling flow. |
| `POST` | `/schedule/run/fast-pass` | Run fast-pass scheduling flow. |
| `GET` | `/schedule/run/{run_id}/status` | Get run status. |
| `POST` | `/schedule/optimize` | Run schedule optimization action. |
| `GET` | `/schedule/versions/{version_id}/tasks` | List tasks for a version. |
| `POST` | `/schedule/versions/{version_id}/tasks` | Create a task. |
| `PUT` | `/schedule/tasks/{task_id}` | Update a task. |
| `DELETE` | `/schedule/tasks/{task_id}` | Delete a task. |
| `POST` | `/schedule/versions/{version_id}/publish` | Publish a version. |
| `GET` | `/schedule/versions/{version_id}/diagnostics` | Get schedule diagnostics. |

## Optimization and CP Solver

Optimization routes live under `/optimization`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/optimization/run` | Run optimization. |
| `POST` | `/optimization/run-fast` | Run fast optimization. |
| `POST` | `/optimization/run-full` | Run full optimization. |
| `GET` | `/optimization/status/{run_id}` | Get optimization status. |
| `GET` | `/optimization/explain/{schedule_version_id}` | Get explanation data. |
| `GET` | `/optimization/diagnostics/{schedule_version_id}` | Get diagnostics. |

CP solver routes live under `/cp-solver`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/cp-solver/solve` | Solve a CP model request. |
| `POST` | `/cp-solver/mining-schedule` | Solve a mining schedule-style request. |
| `POST` | `/cp-solver/optimize-flow` | Optimize flow-style request. |
| `GET` | `/cp-solver/constraint-types` | List constraint types. |
| `GET` | `/cp-solver/solver-info` | Get solver metadata. |
| `POST` | `/cp-solver/validate-model` | Validate a model request. |

## Quality

Routes live under `/quality`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/quality/fields/site/{site_id}` | List site quality fields. |
| `GET` | `/quality/fields` | List quality fields. |
| `GET` | `/quality/site/{site_id}/specs` | List site specs. |
| `GET` | `/quality/fields/{field_id}` | Get one quality field. |
| `POST` | `/quality/fields` | Create a quality field. |
| `PUT` | `/quality/fields/{field_id}` | Update a quality field. |
| `DELETE` | `/quality/fields/{field_id}` | Delete a quality field. |
| `POST` | `/quality/fields/seed-thermal-coal/{site_id}` | Seed thermal-coal defaults. |
| `POST` | `/quality/blend` | Calculate blended quality. |
| `POST` | `/quality/calculate-blend` | Calculate blend with alternate route. |
| `POST` | `/quality/check-constraints` | Check quality constraints. |
| `POST` | `/quality/convert-basis` | Convert quality basis. |
| `GET` | `/quality/defaults/thermal-coal` | Get thermal-coal defaults. |
| `GET` | `/quality/aggregation-rules` | List aggregation rules. |
| `GET` | `/quality/penalty-types` | List penalty types. |
| `GET` | `/quality/basis-types` | List basis types. |
| `POST` | `/quality/simulate` | Run quality simulation. |
| `POST` | `/quality/simulate/quick` | Run quick quality simulation. |

## Wash Plants, Flow, and Stockpiles

Wash plant routes live under `/wash-plants`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/wash-plants/tables/site/{site_id}` | List wash tables by site. |
| `GET` | `/wash-plants/tables/{table_id}` | Get wash table. |
| `POST` | `/wash-plants/tables` | Create wash table. |
| `POST` | `/wash-plants/tables/{table_id}/rows` | Add wash table row. |
| `PUT` | `/wash-plants/tables/{table_id}/rows` | Update wash table rows. |
| `DELETE` | `/wash-plants/tables/{table_id}` | Delete wash table. |
| `POST` | `/wash-plants/tables/{table_id}/interpolate` | Interpolate wash table values. |
| `POST` | `/wash-plants/tables/{table_id}/find-cutpoint-target` | Find cutpoint target. |
| `POST` | `/wash-plants/tables/{table_id}/optimize-cutpoint` | Optimize cutpoint. |
| `GET` | `/wash-plants/nodes` | List wash plant nodes. |
| `GET` | `/wash-plants/site/{site_id}` | List wash plants by site. |
| `GET` | `/wash-plants/{node_id}/config` | Get node config. |
| `PUT` | `/wash-plants/{node_id}/config` | Update node config. |
| `POST` | `/wash-plants/{node_id}/process` | Process material through wash plant. |

Additional related route groups:

- `/flow`
- `/stockpiles`
- `/staged-stockpiles`

Use generated OpenAPI docs for exact endpoint names in those route groups.

## Geology, Spatial, CAD, and Raster

Route groups:

| Prefix | Purpose |
| --- | --- |
| `/boreholes` | Borehole import, collar summaries, detail, traces, assays, quality summaries. |
| `/blockmodels` | Block model creation, listing, estimation, block visualization data, activity areas. |
| `/surfaces` | Surface creation, listing, detail, query, volumes, seam tonnage, contours, history, progress. |
| `/crs` | CRS systems, regions, EPSG info, WKT, transforms, detection, validation, regional presets. |
| `/strings` | CAD string CRUD, vertices, split, merge, reverse, close/open, offset, smooth, simplify, densify, export. |
| `/annotations` | Annotation CRUD, elevation, distance, area, volume, gradient, coordinate, batch annotations. |
| `/raster` | Raster metadata, format checks, sampling, TIN, tiles, overview, hillshade, ECW status/conversion. |
| `/surface-tools` | Clip, merge, translate, rotate, scale, smooth, simplify, resample, slope, profile, isopach, drape, sampling. |
| `/files` | DXF, Surpac, tabular parsing, templates, DXF/Surpac/CSV exports. |

## Fleet

Routes live under `/fleet`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/fleet/equipment` | Create equipment. |
| `GET` | `/fleet/equipment/{equipment_id}` | Get equipment. |
| `GET` | `/fleet/sites/{site_id}/equipment` | List site equipment. |
| `PATCH` | `/fleet/equipment/{equipment_id}/status` | Update equipment status. |
| `POST` | `/fleet/gps` | Record GPS reading. |
| `GET` | `/fleet/equipment/{equipment_id}/trail` | Get equipment trail. |
| `GET` | `/fleet/sites/{site_id}/positions` | Get latest site positions. |
| `POST` | `/fleet/geofences` | Create geofence. |
| `GET` | `/fleet/sites/{site_id}/geofences` | List site geofences. |
| `POST` | `/fleet/equipment/{equipment_id}/detect-cycles` | Detect haul cycles. |
| `GET` | `/fleet/sites/{site_id}/cycle-statistics` | Get cycle statistics. |
| `POST` | `/fleet/maintenance` | Create maintenance record. |
| `GET` | `/fleet/sites/{site_id}/maintenance/pending` | List pending maintenance. |
| `POST` | `/fleet/maintenance/{record_id}/complete` | Complete maintenance. |
| `GET` | `/fleet/equipment/{equipment_id}/health` | Get equipment health. |

## Drill and Blast

Routes live under `/drill-blast`. Use OpenAPI docs for exact request models.

Common domain objects:

- blast patterns
- drill holes
- blast events
- fragmentation model records

## Operations

Routes live under `/operations`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/operations/tickets` | Create load ticket. |
| `POST` | `/operations/tickets/{ticket_id}/dump` | Mark ticket dump/update dump data. |
| `GET` | `/operations/shifts/{shift_id}/tickets` | List shift tickets. |
| `GET` | `/operations/sites/{site_id}/material-flow` | Get site material flow summary. |
| `POST` | `/operations/shifts` | Create shift. |
| `POST` | `/operations/shifts/{shift_id}/end` | End shift. |
| `GET` | `/operations/sites/{site_id}/active-shift` | Get active shift. |
| `GET` | `/operations/shifts/{shift_id}/summary` | Get shift summary. |
| `POST` | `/operations/handovers` | Create handover. |
| `POST` | `/operations/handovers/{handover_id}/acknowledge` | Acknowledge handover. |
| `POST` | `/operations/incidents` | Create incident. |
| `GET` | `/operations/shifts/{shift_id}/incidents` | List shift incidents. |

## Monitoring

Routes live under `/monitoring`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/monitoring/prisms` | Create slope monitoring prism. |
| `POST` | `/monitoring/prisms/readings` | Record prism reading. |
| `GET` | `/monitoring/sites/{site_id}/slope-alerts` | Get slope alerts. |
| `POST` | `/monitoring/bores` | Create monitoring bore. |
| `POST` | `/monitoring/bores/readings` | Record bore reading. |
| `POST` | `/monitoring/dust-monitors` | Create dust monitor. |
| `POST` | `/monitoring/dust-monitors/readings` | Record dust reading. |
| `GET` | `/monitoring/sites/{site_id}/dust-exceedances` | Get dust exceedances. |
| `POST` | `/monitoring/hazard-zones` | Create hazard zone. |
| `POST` | `/monitoring/fatigue-events` | Record fatigue event. |
| `GET` | `/monitoring/operators/{operator_id}/fatigue-score` | Get fatigue score. |

## Reporting and CSV Export

Reporting route groups:

- `/reporting`
- `/reports`
- `/csv`

Useful route examples:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/reporting/dashboard/{schedule_version_id}` | Get reporting dashboard data. |
| `GET` | `/reporting/types` | List report types. |
| `POST` | `/reporting/generate/{report_type}` | Generate report data. |
| `POST` | `/reporting/pack` | Generate report pack. |
| `POST` | `/reporting/export/json/{report_type}` | Export report as JSON. |
| `POST` | `/reporting/export/csv/{report_type}` | Export report as CSV. |
| `POST` | `/reporting/export/html/{report_type}` | Export report as HTML. |
| `POST` | `/reporting/export/pdf/{report_type}` | Export report as PDF where WeasyPrint works. |
| `GET` | `/csv/templates` | List CSV templates. |
| `GET` | `/csv/export/flows/{version_id}` | Export flow results. |
| `GET` | `/csv/export/inventory/{version_id}` | Export inventory balances. |
| `GET` | `/csv/export/decisions/{version_id}` | Export decision explanations. |
| `GET` | `/csv/export/surface/{surface_id}` | Export surface. |
| `GET` | `/csv/export/string/{string_id}` | Export CAD string. |

## Integrations

Routes live under `/integration`.

Current integration areas include:

- survey actuals
- lab quality
- fleet actual tonnes
- equipment hours
- cycle times
- survey geometry
- stockpile volume
- maintenance windows and availability
- dispatch targets
- BI extracts
- connector definitions
- connector test/sync actions
- webhooks
- webhook deliveries
- external ID mappings
- delayed lab result imports

Use OpenAPI docs for exact request bodies.

## WebSocket

Routes live under `/ws`.

| Endpoint | Purpose |
| --- | --- |
| `/ws/connect` | WebSocket connection endpoint. |
| `/ws/changes/{schedule_version_id}` | Get change records for a schedule version. |
| `/ws/presence/{schedule_version_id}` | Get presence records for a schedule version. |
| `/ws/presence/{schedule_version_id}/count` | Get presence count. |

## Smoke Test Script

With the backend running:

```bash
python verify_full_flow.py
```

The script logs in, seeds data, checks network nodes and resources, runs optimization, reads schedule tasks, and fetches dashboard reporting data.
