# AssetFlow — Software Design & Development Documentation
## Part 2 of 3: API Documentation, Routing, Workflows & Validation

---

## Shared Response & Error Envelope (used by every endpoint — read this first)

**Success:**
```json
{
  "success": true,
  "data": { },
  "message": "Optional human-readable message",
  "meta": { "page": 1, "limit": 20, "total": 57 }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ASSET_ALREADY_ALLOCATED",
    "message": "This asset is currently held by Priya Sharma.",
    "fields": { "asset_id": "Asset AF-0114 is not available" }
  }
}
```

Standard HTTP status codes: `200` OK, `201` Created, `400` validation error, `401` unauthenticated, `403` forbidden (RBAC), `404` not found, `409` conflict (double allocation / overlap), `422` semantic validation failure, `500` server error.

All list endpoints accept `?page=&limit=&sort=&order=` and return `meta.total`.

---

## 14. API Documentation

Base URL: `/api/v1`. All routes except `/auth/signup`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` require `Authorization: Bearer <JWT>`.

### 14.1 Auth (`/auth`) — Developer 3
| Method | Route | Body | Success | Errors |
|---|---|---|---|---|
| POST | /signup | `{name,email,password}` | 201, user (role forced `Employee`) | 400 validation, 409 email exists |
| POST | /login | `{email,password}` | 200, `{user, accessToken, refreshToken}` | 400 validation, 401 invalid credentials |
| POST | /forgot-password | `{email}` | 200, generic success message | 400 validation |
| POST | /reset-password | `{token,newPassword}` | 200 | 400 invalid/expired token |
| POST | /refresh-token | `{refreshToken}` | 200, new accessToken | 401 invalid/expired |
| GET | /me | — | 200, current user profile | 401 |

### 14.2 Users / Employee Directory (`/users`) — Developer 3
| Method | Route | Notes |
|---|---|---|
| GET | /users | Admin only; filter `?department_id=&role=&status=` |
| GET | /users/:id | Admin, or self |
| PATCH | /users/:id | Admin only: update department/status |
| PATCH | /users/:id/role | Admin only: `{role: "AssetManager"|"DepartmentHead"|"Employee"}` — the ONLY role-change endpoint |
| PATCH | /users/:id/deactivate | Admin only |

### 14.3 Departments (`/departments`) — Developer 3
| Method | Route | RBAC | Notes |
|---|---|---|---|
| GET | /departments | All authenticated | tree or flat list `?flat=true` |
| POST | /departments | Admin | `{name, head_user_id?, parent_department_id?}` |
| PUT | /departments/:id | Admin | |
| PATCH | /departments/:id/status | Admin | activate/deactivate |

### 14.4 Asset Categories (`/categories`) — Developer 3
| Method | Route | RBAC |
|---|---|---|
| GET | /categories | All authenticated |
| POST | /categories | Admin |
| PUT | /categories/:id | Admin |
| DELETE | /categories/:id | Admin (blocked with 409 if assets reference it) |

### 14.5 Assets (`/assets`) — Developer 2
| Method | Route | RBAC | Notes |
|---|---|---|---|
| GET | /assets | All | filters: `?status=&category_id=&department_id=&location=&q=` (q searches tag/serial/qr) |
| GET | /assets/:id | All | includes category, current holder if allocated |
| POST | /assets | Admin, AssetManager | auto-generates `asset_tag`; `{name,category_id,serial_number?,acquisition_date?,acquisition_cost?,condition,location,photo_url?,is_bookable}` |
| PUT | /assets/:id | Admin, AssetManager | edit master fields (not status directly) |
| GET | /assets/:id/history | All | merged allocation + maintenance timeline |
| PATCH | /assets/:id/status | Admin, AssetManager | manual override (e.g. Retired/Disposed) — logged |

### 14.6 Allocations (`/allocations`) — Developer 2
| Method | Route | RBAC | Notes |
|---|---|---|---|
| GET | /allocations | All (scoped: Employee sees own, Dept Head sees dept, Admin/AM see all) | `?status=&overdue=true` |
| POST | /allocations | Admin, AssetManager, DepartmentHead(own dept) | `{asset_id, employee_id? , department_id?, expected_return_date?}`; **409 `ASSET_ALREADY_ALLOCATED`** if asset has active allocation |
| POST | /allocations/:id/return | Admin, AssetManager | `{condition_checkin_notes}` → sets Returned, asset → Available |

### 14.7 Transfer Requests (`/transfers`) — Developer 2
| Method | Route | RBAC | Notes |
|---|---|---|---|
| GET | /transfers | scoped | `?status=` |
| POST | /transfers | Employee (self, when blocked), Admin, AssetManager | `{asset_id, to_user_id}` |
| PATCH | /transfers/:id/approve | Admin, AssetManager, DepartmentHead(own dept) | re-allocates asset, closes old allocation, opens new one — all in one transaction |
| PATCH | /transfers/:id/reject | same roles | `{reason?}` |

### 14.8 Bookings (`/bookings`) — Developer 4 (backend logic co-owned with Dev 2's `assets` module)
| Method | Route | RBAC | Notes |
|---|---|---|---|
| GET | /bookings | All | `?asset_id=&from=&to=&status=` — calendar view |
| POST | /bookings | Employee+ | `{asset_id,start_time,end_time,purpose?}`; **409 `BOOKING_OVERLAP`** if intersecting active booking exists |
| PATCH | /bookings/:id/cancel | owner, Admin, AssetManager | |
| PATCH | /bookings/:id/reschedule | owner, Admin, AssetManager | `{start_time,end_time}` — internally cancel+recreate, re-validated |

### 14.9 Maintenance (`/maintenance`) — Developer 4
| Method | Route | RBAC | Notes |
|---|---|---|---|
| GET | /maintenance | scoped | `?status=&priority=&asset_id=` |
| POST | /maintenance | Employee+ | `{asset_id,issue_description,priority,photo_url?}` |
| PATCH | /maintenance/:id/approve | Admin, AssetManager | asset → Under Maintenance |
| PATCH | /maintenance/:id/reject | Admin, AssetManager | `{reason}` |
| PATCH | /maintenance/:id/assign-technician | Admin, AssetManager | `{technician_name}` |
| PATCH | /maintenance/:id/start | Admin, AssetManager | → InProgress |
| PATCH | /maintenance/:id/resolve | Admin, AssetManager | asset → Available |

### 14.10 Audits (`/audits`) — Developer 4
| Method | Route | RBAC | Notes |
|---|---|---|---|
| GET | /audits | Admin, AssetManager, assigned auditors | |
| POST | /audits | Admin, AssetManager | `{name,department_id?,location?,start_date,end_date,auditor_ids[]}` — auto-populates `audit_items` from scope |
| PATCH | /audits/:id/items/:itemId | assigned auditor | `{verification_status, notes}` |
| PATCH | /audits/:id/close | Admin, AssetManager | locks cycle, generates discrepancy_reports, updates asset statuses |
| GET | /audits/:id/discrepancies | Admin, AssetManager | |

### 14.11 Reports (`/reports`) — Developer 2
| Method | Route | RBAC |
|---|---|---|
| GET | /reports/utilization | Admin, AssetManager, DepartmentHead |
| GET | /reports/maintenance-frequency | Admin, AssetManager |
| GET | /reports/due-for-maintenance | Admin, AssetManager |
| GET | /reports/department-allocation | Admin, AssetManager, DepartmentHead |
| GET | /reports/booking-heatmap | Admin, AssetManager, DepartmentHead |
| GET | /reports/export?type=csv | Admin, AssetManager |

### 14.12 Dashboard (`/dashboard`) — Developer 2
| Method | Route | Notes |
|---|---|---|
| GET | /dashboard/kpis | role-scoped counts: available, allocated, maintenance today, active bookings, pending transfers, upcoming returns |
| GET | /dashboard/overdue | overdue returns, separate from upcoming |

### 14.13 Notifications & Logs (`/notifications`, `/activity-logs`) — Developer 3
| Method | Route | Notes |
|---|---|---|
| GET | /notifications | own notifications, `?is_read=` |
| PATCH | /notifications/:id/read | mark read |
| GET | /activity-logs | Admin only; `?entity_type=&entity_id=&user_id=` |

---

## 15. Frontend Routing

```
/                       → redirect based on auth state
/login                  → LoginPage (public)
/signup                 → SignupPage (public)
/forgot-password        → ForgotPasswordPage (public)
/dashboard              → DashboardPage (all roles)
/organization            → OrgSetupPage (Admin) — tabs: departments | categories | employees
/assets                  → AssetListPage (all)
/assets/:id              → AssetDetailPage (all)
/assets/new              → AssetFormPage (Admin, AssetManager)
/allocations              → AllocationsPage (all, scoped)
/transfers                → TransfersPage (all, scoped)
/bookings                 → BookingsPage (all)
/maintenance               → MaintenancePage (all, scoped)
/audits                    → AuditsPage (Admin, AssetManager, auditors)
/audits/:id                → AuditDetailPage
/reports                   → ReportsPage (Admin, AssetManager, DepartmentHead)
/notifications              → NotificationsPage (all)
*                           → NotFoundPage
```

`ProtectedRoute` wraps everything except public routes; `roleGuard(allowedRoles)` wraps role-restricted routes and renders a friendly "Not authorized" state (never a blank screen).

---

## 16. Backend Routing

Mounted in `app.js`:
```
/api/v1/auth
/api/v1/users
/api/v1/departments
/api/v1/categories
/api/v1/assets
/api/v1/allocations
/api/v1/transfers
/api/v1/bookings
/api/v1/maintenance
/api/v1/audits
/api/v1/reports
/api/v1/dashboard
/api/v1/notifications
/api/v1/activity-logs
```
Global middleware order: `helmet → cors → express.json → morgan(dev) → rateLimiter → routes → 404 handler → centralized errorHandler`.

---

## 17. Authentication Flow

1. Signup → password hashed with bcrypt → row inserted with `role='Employee'`.
2. Login → verify hash → issue short-lived accessToken (15 min, JWT payload `{id, role}`) + longer-lived refreshToken (7 days, stored hashed in DB or stateless with rotation).
3. Client stores accessToken in memory (React context), refreshToken in httpOnly cookie (preferred) or secure storage.
4. Every protected request: `Authorization: Bearer <accessToken>` → `auth.js` middleware verifies signature/expiry → attaches `req.user`.
5. On 401 due to expiry, client silently calls `/auth/refresh-token`, retries original request once.
6. Forgot password: generate random token, store hashed + expiry (15 min) on user row, "email" it (in local/offline dev, log the reset link to console/UI instead of a real email provider, per the "avoid unnecessary third-party APIs" rule).

---

## 18. RBAC Flow

- `req.user.role` is set only from the verified JWT — never trusted from request body.
- `rbac.js` middleware: `requireRole('Admin','AssetManager')` — 403 with `error.code = 'FORBIDDEN_ROLE'` if mismatch.
- Scoped-data rule (beyond simple role check): Department Head/Employee list endpoints add an implicit `WHERE` filter (own department / own user id) inside the **service** layer, not the controller — so it can't be bypassed by query params.
- Role changes: only `PATCH /users/:id/role` by Admin; this is enforced both by route RBAC and by the fact no other endpoint accepts a `role` field (validators strip/reject it if present).

---

## 19. Asset Lifecycle

States: `Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed`

Allowed transitions:
```
Available        → Allocated (on allocation created)
Available        → Reserved (on booking confirmed, if resource-type asset)
Available        → Under Maintenance (on maintenance request approved)
Available        → Retired (manual, Admin/AssetManager)
Allocated         → Available (on return)
Allocated         → Under Maintenance (holder raises + approved while allocated)
Under Maintenance → Available (on maintenance resolved)
Reserved          → Available (on booking end/cancel)
Available/Allocated/Reserved → Lost (via Audit close, confirmed-missing)
Any non-terminal   → Retired → Disposed (manual, sequential only)
```
Disallowed: any direct jump to `Disposed` without passing through `Retired`; any transition out of `Disposed`/`Lost` except manual Admin correction (logged as an explicit override with a note).

All transitions are executed inside the **service** layer function for that action (never a generic "set status" open door from the frontend) and written to `activity_logs`.

---

## 20. Booking Workflow

1. User selects a bookable asset + date/time range.
2. `POST /bookings` → service runs, inside a transaction:
   ```sql
   SELECT id FROM bookings
   WHERE asset_id = ? AND status IN ('Upcoming','Ongoing')
     AND start_time < ? AND end_time > ?   -- new_end, new_start (classic overlap test)
   FOR UPDATE;
   ```
   If any row returned → `409 BOOKING_OVERLAP`. Else insert.
3. A lightweight status resolver (run on read, or a scheduled job) flips `Upcoming→Ongoing` when `now ∈ [start,end)` and `Ongoing→Completed` when `now ≥ end`.
4. Reminder notification generated 30 min before `start_time` (checked by a scheduled job comparing `now` to `start_time - interval`).
5. Cancel: status → `Cancelled` (never deleted, for history/reporting).

---

## 21. Maintenance Workflow

```
Pending --(Approve: AssetManager)--> Approved --(assign)--> TechnicianAssigned --> InProgress --> Resolved
   |
   --(Reject: AssetManager, reason required)--> Rejected
```
- On `Approved`: asset.status → `Under Maintenance` (transaction with the maintenance row update).
- On `Resolved`: asset.status → `Available`; `resolved_at` timestamped.
- Reject requires a `reason` (min 10 chars) so the requester understands why.

---

## 22. Audit Workflow

1. Admin/AssetManager creates cycle with scope (department and/or location) + date range + auditors.
2. System auto-populates `audit_items` = all assets matching scope, `verification_status='Pending'`.
3. Each assigned auditor updates items they've physically checked: `Verified`, `Missing`, `Damaged` (+ notes).
4. On `PATCH /audits/:id/close`:
   - Cycle must have zero `Pending` items, or Admin confirms a forced close (items left `Pending` are excluded from discrepancy generation but flagged in the closure summary).
   - For every `Missing`/`Damaged` item → insert `discrepancy_reports` row.
   - For every `Missing` item → asset.status → `Lost`. For `Damaged` → asset.condition → `Damaged` (status unchanged unless Admin also marks Under Maintenance).
   - Cycle.status → `Closed`, `closed_at` set; no further edits permitted (enforced server-side, 409 on attempted edit).

---

## 23. Notification Workflow

Trigger points (each writes one `notifications` row per relevant recipient, inside the same transaction as the state change that caused it):

| Event | Recipients |
|---|---|
| Asset Assigned | employee/department head |
| Transfer Approved/Rejected | requester, new holder |
| Maintenance Approved/Rejected | requester |
| Booking Confirmed/Cancelled | booker |
| Booking Reminder (T-30min) | booker — generated by scheduled job |
| Overdue Return Alert | holder + their Department Head — generated by scheduled/on-read job |
| Audit Discrepancy Flagged | Admin, AssetManager |

Notifications are read via `GET /notifications`, marked read individually; frontend polls or uses a lightweight interval (no third-party push service, per offline-friendly constraint).

---

## 24. Dashboard Logic

KPI queries (role-scoped by adding a `WHERE department_id = :userDept` for Department Head/Employee where relevant):
- **Assets Available** = `COUNT(assets WHERE status='Available')`
- **Assets Allocated** = `COUNT(assets WHERE status='Allocated')`
- **Maintenance Today** = `COUNT(maintenance_requests WHERE status IN ('Approved','TechnicianAssigned','InProgress') AND DATE(created_at)=CURDATE() OR resolved_at IS NULL)` (in-progress today)
- **Active Bookings** = `COUNT(bookings WHERE status IN ('Upcoming','Ongoing'))`
- **Pending Transfers** = `COUNT(transfer_requests WHERE status='Requested')`
- **Upcoming Returns** = `COUNT(asset_allocations WHERE status='Active' AND expected_return_date BETWEEN CURDATE() AND CURDATE()+7)`
- **Overdue Returns** (separate card/section) = same table `WHERE status='Active' AND expected_return_date < CURDATE()`

All KPI endpoints must run as indexed, single-purpose queries (no full table scans) — this is a scoring criterion (Performance).

---

## 25. Reports Logic

- **Utilization trend**: ratio of (days allocated + hours booked) vs total days in period, per asset; idle = assets with zero allocation/booking activity in the period.
- **Maintenance frequency**: `COUNT(maintenance_requests) GROUP BY asset_id/category_id` over a date range.
- **Due for maintenance/retirement**: heuristic — condition IN ('Fair','Poor') OR age (now - acquisition_date) > category threshold (configurable, default 5 years).
- **Department allocation summary**: `COUNT(asset_allocations WHERE status='Active') GROUP BY department_id`.
- **Booking heatmap**: bucket bookings by hour-of-day × day-of-week, `COUNT(*)`.
- **Export**: CSV generated server-side (no external service), streamed as `text/csv` attachment.

---

## 26. Validation Rules

General rule: **every** write endpoint validates with `express-validator` in a dedicated `validators.js` per module; controllers never trust raw `req.body`.

| Field | Rule | Error message |
|---|---|---|
| email | valid email format, required | "Please enter a valid email address." |
| password | min 8 chars, at least 1 letter + 1 number | "Password must be at least 8 characters and include a letter and a number." |
| name (any entity) | required, 2–150 chars, trimmed | "Name is required (2–150 characters)." |
| asset_tag | server-generated only, never accepted from client | n/a (rejected if present: "Asset tag cannot be set manually.") |
| category_id / department_id / any FK | must exist and be Active | "Selected department is inactive or does not exist." |
| expected_return_date | must be a future date if provided | "Expected return date must be in the future." |
| booking start_time/end_time | end_time > start_time; both required; start_time ≥ now (no past bookings) | "End time must be after start time." / "Bookings cannot be made in the past." |
| booking overlap | see §20 | "This resource is already booked from 09:00–10:00. Please choose another slot." |
| allocation conflict | see §19/§14.6 | "Asset AF-0114 is currently held by Priya Sharma. Request a transfer instead." |
| priority (maintenance) | one of Low/Medium/High/Critical | "Please select a valid priority level." |
| role (via /users/:id/role) | one of AssetManager/DepartmentHead/Employee, actor must be Admin | "You are not authorized to change roles." |
| audit close with pending items | warn, require explicit `force=true` confirm | "N assets have not been verified yet. Close anyway?" |
| file/photo upload | type in (jpg,png,pdf), size ≤ 5MB | "Only JPG, PNG, or PDF files up to 5MB are allowed." |
| pagination params | page ≥ 1, 1 ≤ limit ≤ 100 | silently clamps to valid range rather than erroring |

Edge cases explicitly handled:
- Deactivating a department that still has active users/assets → 409, must reassign first.
- Deleting a category referenced by assets → 409 blocked.
- Approving a transfer for an asset that was, in the interim, sent to maintenance → 409 `ASSET_NOT_AVAILABLE_FOR_TRANSFER`.
- Two simultaneous booking requests for the same slot → DB-level transaction ensures only one succeeds; loser gets 409, not a silent double-write.
- Reset password token reused or expired → 400 with generic message (no user enumeration).
