# AssetFlow — Software Design & Development Documentation
## Part 1 of 3: Foundations, Architecture & Database Design

> Repository: `assetflow-erp_odoo` | Stack: React+Vite+Tailwind, Node/Express, MySQL, JWT+bcrypt
> This document is the single source of truth. All four developers must treat it as binding.

---

## 1. Project Overview

**AssetFlow** is a role-based Enterprise Asset & Resource Management System (a focused ERP module) that lets any organization (offices, schools, hospitals, factories) digitize:

- Master data (departments, asset categories, employee directory)
- Full asset lifecycle tracking (Available → Allocated/Reserved/Under Maintenance/Lost/Retired/Disposed)
- Allocation & transfer of assets with conflict prevention
- Time-slot booking of shared resources with overlap prevention
- Approval-gated maintenance workflow
- Scheduled audit cycles with discrepancy detection
- Real-time KPI dashboard, notifications, and activity logging

It explicitly **excludes** purchasing, invoicing, and accounting. Acquisition cost is stored only for reporting/ranking purposes.

---

## 2. Problem Analysis

Extracted core problems from the problem statement:

| # | Problem | System Response |
|---|---------|------------------|
| 1 | Manual tracking via spreadsheets/paper is error-prone | Centralized structured DB with full audit trail |
| 2 | Assets get double-allocated | Hard DB/API constraint: one active allocation per asset at a time |
| 3 | Shared resources get double-booked | Overlap-validated time-slot booking engine |
| 4 | Repairs happen without oversight | Mandatory approval gate before status flips to Under Maintenance |
| 5 | No structured verification of physical assets vs records | Audit Cycles with per-asset verification and auto-discrepancy reports |
| 6 | Nobody notices overdue returns/bookings until too late | Automated overdue detection feeding Dashboard + Notifications |
| 7 | Self-assigned admin/privilege escalation risk | Signup creates Employee only; role elevation is an exclusively Admin, in-app action |
| 8 | No visibility into utilization | Reports & Analytics screen (utilization, idle assets, heatmaps) |

---

## 3. Objectives

1. Enforce a clean, auditable asset lifecycle with explicit, validated state transitions.
2. Guarantee zero double-allocation and zero overlapping bookings at the database/API layer (not just UI).
3. Implement realistic RBAC: 4 roles, with promotion only via Admin action inside Organization Setup.
4. Provide near real-time dashboards and notifications without polling-heavy or third-party-dependent architecture (works fully offline against local MySQL).
5. Ship a codebase that 4 independent AI-assisted developers can build in parallel and merge with zero architecture drift, by fixing all contracts (API shape, error format, naming, folder layout) up front in this document.
6. Maximize hackathon rubric: Logic, Architecture, Modularity, Scalability, Security, DB Design, UI/UX, Performance, Validation, Error Handling, Approach, Maintainability, Clean Code.

---

## 4. Functional Requirements

### FR-1 Authentication
- FR-1.1 Signup creates an Employee-role account only (no role field in signup form/API).
- FR-1.2 Login via email + password, returns JWT (access token) + refresh token.
- FR-1.3 Forgot password flow (token-based reset, expiring link).
- FR-1.4 Session validation middleware on every protected route.

### FR-2 Organization Setup (Admin only)
- FR-2.1 CRUD Departments: name, head (a User), optional parent department, status.
- FR-2.2 CRUD Asset Categories: name, description, optional custom fields (JSON schema, e.g. warranty period).
- FR-2.3 Employee Directory: list/search/filter all users; Admin promotes Employee → Department Head or Asset Manager (only place role changes happen); deactivate users.

### FR-3 Asset Registration & Directory
- FR-3.1 Register asset: name, category, auto-generated Asset Tag (`AF-0001` sequential), serial number, acquisition date, acquisition cost, condition, location, photo/docs, `is_bookable` flag.
- FR-3.2 Search/filter by tag, serial number, QR value, category, status, department, location.
- FR-3.3 Display current lifecycle status.
- FR-3.4 Show per-asset allocation history + maintenance history (read-only timeline).

### FR-4 Allocation & Transfer
- FR-4.1 Allocate asset to employee or department with optional expected return date.
- FR-4.2 Block allocation if asset already has an active allocation; show current holder; offer "Request Transfer" instead.
- FR-4.3 Transfer workflow: Requested → Approved (Asset Manager/Department Head) → Re-allocated (history auto-updated) — or Rejected.
- FR-4.4 Return flow: mark returned, capture condition check-in notes, asset status → Available.
- FR-4.5 Auto-flag overdue allocations (now > expected_return_date and still Active) → feeds Dashboard + Notifications.

### FR-5 Resource Booking
- FR-5.1 Calendar view of a bookable asset's existing bookings.
- FR-5.2 Overlap validation: reject any request whose `[start,end)` interval intersects an existing non-cancelled booking for the same resource. Back-to-back (end == start of next) is allowed.
- FR-5.3 Booking statuses: Upcoming, Ongoing, Completed, Cancelled (derived/updated by a status-resolution job, not user-editable directly for Ongoing/Completed).
- FR-5.4 Cancel / reschedule (reschedule = cancel + new booking, re-validated).
- FR-5.5 Reminder notification generated before slot start (configurable lead time, default 30 min).

### FR-6 Maintenance Management
- FR-6.1 Raise request: asset, issue description, priority (Low/Medium/High/Critical), optional photo.
- FR-6.2 Workflow: Pending → Approved/Rejected (Asset Manager) → Technician Assigned → In Progress → Resolved.
- FR-6.3 On Approved: asset status → Under Maintenance. On Resolved: asset status → Available.
- FR-6.4 Maintenance history retained per asset.

### FR-7 Asset Audit
- FR-7.1 Create Audit Cycle: scope (department and/or location), date range.
- FR-7.2 Assign one or more auditors.
- FR-7.3 Auditor marks each in-scope asset: Verified / Missing / Damaged (with notes).
- FR-7.4 Auto-generate discrepancy report entries for Missing/Damaged items.
- FR-7.5 Close Audit Cycle: locks cycle (no further edits), updates asset statuses (e.g. Missing → Lost).
- FR-7.6 Audit history retained per cycle.

### FR-8 Reports & Analytics
- FR-8.1 Asset utilization trend (most-used vs idle, based on booking/allocation duration).
- FR-8.2 Maintenance frequency by asset/category.
- FR-8.3 Assets due for maintenance or nearing retirement (age/condition heuristic).
- FR-8.4 Department-wise allocation summary.
- FR-8.5 Resource booking heatmap (peak usage windows).
- FR-8.6 Export reports (CSV at minimum; PDF optional stretch).

### FR-9 Activity Logs & Notifications
- FR-9.1 Notification events: Asset Assigned, Maintenance Approved/Rejected, Booking Confirmed/Cancelled/Reminder, Transfer Approved, Overdue Return Alert, Audit Discrepancy Flagged.
- FR-9.2 Full activity log: actor, action, entity type/id, timestamp, metadata — immutable, append-only.

### FR-10 Dashboard
- FR-10.1 KPI cards: Assets Available, Assets Allocated, Maintenance Today, Active Bookings, Pending Transfers, Upcoming Returns.
- FR-10.2 Overdue returns shown in a visually distinct section from upcoming returns.
- FR-10.3 Quick actions: Register Asset, Book Resource, Raise Maintenance Request (role-gated visibility).

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | Passwords hashed with bcrypt (cost ≥ 10); JWT signed with strong secret from env; RBAC enforced server-side on every route, never trust client role claims alone beyond the signed token; parameterized SQL only (no string concatenation) |
| Performance | Paginate all list endpoints (default 20/page); index all foreign keys and frequently filtered columns; avoid N+1 queries |
| Scalability | Stateless API servers (JWT, no server-side session store) so instances can scale horizontally; DB uses normalized 3NF schema with room for read-replica later |
| Offline-friendliness | No mandatory third-party/cloud API calls in the critical path; app works fully on a LAN with local MySQL; optional service-worker caching for read-only dashboard data (stretch) |
| Usability | Responsive down to tablet width (≥768px); consistent design tokens; inline field-level validation errors |
| Maintainability | Modular folder structure per domain (assets, bookings, maintenance, audits...); consistent naming; JSDoc on non-trivial functions |
| Reliability | All state-changing transitions wrapped in DB transactions (e.g. allocate = check conflict + insert allocation + update asset status, atomically) |

---

## 6. User Roles

| Role | Assigned By | Key Capabilities |
|---|---|---|
| **Admin** | Seeded (first account) / existing Admin | Full org setup, all analytics, promotes Employees to Department Head/Asset Manager, everything Asset Manager can do |
| **Asset Manager** | Admin (via Employee Directory) | Register/allocate assets, approve transfers, approve maintenance requests, approve returns/condition notes, act as auditor |
| **Department Head** | Admin (via Employee Directory) | View department's allocated assets, approve allocation/transfer requests within department, book shared resources on behalf of department |
| **Employee** | Self-signup (default role) | View own allocated assets, book resources, raise maintenance requests, initiate return/transfer requests |

RBAC is enforced both by route middleware (backend, authoritative) and by conditional UI rendering (frontend, cosmetic only).

---

## 7. Complete Workflow (End-to-End)

1. Admin logs in (seeded account) → sets up Departments, Asset Categories.
2. Admin promotes selected Employees to Department Head / Asset Manager via Employee Directory.
3. Asset Manager registers a new asset → status `Available`.
4. Asset Manager (or Department Head, within their department) allocates the asset to an employee/department, OR flags it `is_bookable` as a shared resource.
   - If already allocated → blocked, shown current holder, offered "Request Transfer".
5. Employees book bookable shared resources by time slot → overlapping requests auto-rejected.
6. If an asset needs repair, the current holder raises a Maintenance Request → Asset Manager approves/rejects → on approval asset → `Under Maintenance` → technician assigned → in progress → resolved → asset → `Available`.
7. Assets are transferred (Requested → Approved → Re-allocated) or returned (condition check-in → `Available`). Overdue allocations/bookings auto-flagged.
8. Periodic Audit Cycles: Admin/Asset Manager creates cycle, assigns auditors, auditors verify assets, discrepancies auto-generated, cycle closed → statuses updated (e.g. `Lost`).
9. All of the above emits Notifications and Activity Log entries, and feeds the Dashboard KPIs and Reports.

---

## 8. System Architecture

```
┌──────────────────────┐        HTTPS/JSON (JWT Bearer)        ┌──────────────────────┐
│   React + Vite SPA   │ ─────────────────────────────────────▶│  Express.js REST API │
│  (Tailwind, Router)  │◀───────────────────────────────────── │   (Node.js, layered) │
└──────────────────────┘                                        └──────────┬───────────┘
                                                                            │ mysql2 (pooled)
                                                                 ┌──────────▼───────────┐
                                                                 │     MySQL 8 (local)  │
                                                                 └───────────────────────┘
```

**Backend layering (per module):** `routes → controllers → services → models/repositories → MySQL`
- **routes**: define endpoint + attach middleware (auth, RBAC, validation)
- **controllers**: parse request, call service, shape response (no business logic)
- **services**: business logic, transactions, cross-entity rules (conflict checks, overlap checks)
- **models/repositories**: raw SQL queries only, no business logic

**Frontend layering:** `pages → feature components → shared components`, with a single `api/` layer (axios instance + one file per domain) and a `context/` for auth state. No component calls `fetch`/`axios` directly — always via `api/*.js`.

Cross-cutting: a shared `response envelope`, `error format`, and `validation format` (see Shared Contracts document) are used by **every** endpoint so all 4 developers' modules are wire-compatible without coordination meetings.

---

## 9. Folder Structure

```
assetflow-erp_odoo/
├── client/                          # Developer 1 owns this
│   ├── src/
│   │   ├── api/                     # one file per domain: auth.js, assets.js, bookings.js...
│   │   ├── assets/                  # images, icons
│   │   ├── components/
│   │   │   ├── common/              # Button, Input, Modal, Table, Card, Badge, Sidebar, Navbar
│   │   │   └── feature/             # per-module components (AssetCard, BookingCalendar...)
│   │   ├── context/                 # AuthContext, NotificationContext
│   │   ├── hooks/                   # useAuth, useFetch, usePagination
│   │   ├── pages/                   # one per screen (Login, Dashboard, OrgSetup, Assets, ...)
│   │   ├── routes/                  # AppRouter.jsx, ProtectedRoute.jsx, roleGuard.js
│   │   ├── utils/                   # formatDate, validators, constants (STATUS enums)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                          # Developer 2 (business modules) + Developer 3 (auth/db/core)
│   ├── src/
│   │   ├── config/                  # db.js, env.js, constants.js
│   │   ├── middlewares/             # auth.js, rbac.js, validate.js, errorHandler.js
│   │   ├── modules/
│   │   │   ├── auth/                # Dev 3
│   │   │   ├── users/               # Dev 3 (employee directory, roles)
│   │   │   ├── departments/         # Dev 3
│   │   │   ├── categories/          # Dev 3
│   │   │   ├── assets/              # Dev 2
│   │   │   ├── allocations/         # Dev 2
│   │   │   ├── transfers/           # Dev 2
│   │   │   ├── bookings/            # Dev 4 (with Dev 2 support)
│   │   │   ├── maintenance/         # Dev 4
│   │   │   ├── audits/              # Dev 4
│   │   │   ├── notifications/       # Dev 3
│   │   │   ├── activityLogs/        # Dev 3
│   │   │   └── reports/             # Dev 2
│   │   │       each module: routes.js, controller.js, service.js, repository.js, validators.js
│   │   ├── utils/                   # responseEnvelope.js, asyncHandler.js, tagGenerator.js
│   │   ├── app.js
│   │   └── server.js
│   ├── database/
│   │   ├── schema.sql                # full DDL, Developer 3 owns
│   │   ├── seed.sql                  # demo data
│   │   └── migrations/               # numbered .sql files
│   └── package.json
│
├── docs/                             # this SDD and all supporting docs
├── .env.example
├── .gitignore
└── README.md
```

---

## 10. Repository Structure & Branching

- Repository name: `assetflow-erp_odoo`
- Default branch: `main` (protected, production-ready only)
- Integration branch: `develop` (protected, all feature branches merge here first)
- Feature branches: `feature/<module>-<short-desc>` e.g. `feature/assets-registration`, `feature/bookings-overlap-check`
- Fix branches: `fix/<module>-<short-desc>`
- Merge order into `main`: only via reviewed PR from `develop`, at agreed milestones.

(Full beginner-level Git walkthrough is in `AssetFlow_GitHub_Workflow.md`.)

---

## 11. Database Design (Design Principles)

- Engine: MySQL 8, InnoDB, `utf8mb4`.
- 3rd Normal Form throughout; no repeating groups; lookup values (status, priority, role) stored as `ENUM` for integrity + speed, with app-layer constants mirroring them exactly (see Shared Contracts).
- Every table: `id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY`, `created_at`, `updated_at` (except pure join tables).
- Soft-delete not used for core entities (Assets, Users) — a `status`/`is_active` column represents lifecycle instead, since "deleted" doesn't make sense for a physical asset; audit trail is preserved via `activity_logs`.
- All FKs use `ON DELETE RESTRICT` (never cascade-delete master data) except join/history tables tied 1:1 to a parent action.
- Concurrency-sensitive writes (allocate, book) use a DB transaction with a `SELECT ... FOR UPDATE` (or unique index) so two simultaneous requests can't both succeed — this is the actual enforcement of "no double allocation / no overlap," not just app logic.

---

## 12. ER Diagram

```
departments ──┬──< users >──┬── asset_allocations >── assets ──< asset_categories
   (self FK:   │             │         │                  │
   parent_id)  │             │         └──< transfer_requests
               │             │
               │             ├──< bookings >── assets
               │             ├──< maintenance_requests >── assets
               │             ├──< audit_cycle_auditors >── audit_cycles ──< audit_items >── assets
               │             │                                        └──< discrepancy_reports
               │             ├──< notifications
               │             └──< activity_logs

Legend: A ──< B  means "A has many B" (one-to-many)
        A >── B  means "B has many A" reversed read direction (same FK, other side)
```

Key relationships:
- `departments.head_user_id → users.id` (a Department Head)
- `departments.parent_department_id → departments.id` (self-referencing hierarchy)
- `users.department_id → departments.id`
- `assets.category_id → asset_categories.id`
- `asset_allocations.asset_id → assets.id`, `.employee_id → users.id`, `.department_id → departments.id`
- `transfer_requests.asset_id → assets.id`, `.from_user_id/.to_user_id → users.id`
- `bookings.asset_id → assets.id`, `.booked_by → users.id`
- `maintenance_requests.asset_id → assets.id`, `.raised_by/.approved_by → users.id`
- `audit_cycles.department_id → departments.id`
- `audit_items.audit_cycle_id → audit_cycles.id`, `.asset_id → assets.id`
- `discrepancy_reports.audit_item_id → audit_items.id`

---

## 13. Complete Table Design

### 13.1 `departments`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| name | VARCHAR(120) | NOT NULL, UNIQUE |
| head_user_id | BIGINT UNSIGNED | NULL, FK → users.id |
| parent_department_id | BIGINT UNSIGNED | NULL, FK → departments.id |
| status | ENUM('Active','Inactive') | NOT NULL DEFAULT 'Active' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

Index: `idx_dept_parent (parent_department_id)`

### 13.2 `users`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| name | VARCHAR(120) | NOT NULL |
| email | VARCHAR(160) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| role | ENUM('Admin','AssetManager','DepartmentHead','Employee') | NOT NULL DEFAULT 'Employee' |
| department_id | BIGINT UNSIGNED | NULL, FK → departments.id |
| status | ENUM('Active','Inactive') | NOT NULL DEFAULT 'Active' |
| reset_token | VARCHAR(255) | NULL |
| reset_token_expires | TIMESTAMP | NULL |
| created_at / updated_at | TIMESTAMP | as above |

Indexes: `idx_users_dept (department_id)`, `idx_users_role (role)`

### 13.3 `asset_categories`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT UNSIGNED | PK |
| name | VARCHAR(100) | NOT NULL, UNIQUE |
| description | VARCHAR(255) | NULL |
| custom_fields | JSON | NULL (e.g. `{"warranty_months": 24}`) |
| created_at / updated_at | TIMESTAMP | |

### 13.4 `assets`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT UNSIGNED | PK |
| asset_tag | VARCHAR(20) | NOT NULL, UNIQUE (e.g. `AF-0001`, generated server-side) |
| name | VARCHAR(150) | NOT NULL |
| category_id | BIGINT UNSIGNED | NOT NULL, FK → asset_categories.id |
| serial_number | VARCHAR(100) | NULL, UNIQUE |
| qr_code_value | VARCHAR(150) | NULL, UNIQUE |
| acquisition_date | DATE | NULL |
| acquisition_cost | DECIMAL(12,2) | NULL |
| condition | ENUM('New','Good','Fair','Poor','Damaged') | NOT NULL DEFAULT 'New' |
| location | VARCHAR(150) | NULL |
| photo_url | VARCHAR(255) | NULL |
| is_bookable | BOOLEAN | NOT NULL DEFAULT FALSE |
| status | ENUM('Available','Allocated','Reserved','Under Maintenance','Lost','Retired','Disposed') | NOT NULL DEFAULT 'Available' |
| created_at / updated_at | TIMESTAMP | |

Indexes: `idx_assets_category`, `idx_assets_status`, `idx_assets_location`

### 13.5 `asset_allocations`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT UNSIGNED | PK |
| asset_id | BIGINT UNSIGNED | NOT NULL, FK → assets.id |
| employee_id | BIGINT UNSIGNED | NULL, FK → users.id |
| department_id | BIGINT UNSIGNED | NULL, FK → departments.id |
| allocated_date | DATE | NOT NULL |
| expected_return_date | DATE | NULL |
| actual_return_date | DATE | NULL |
| condition_checkin_notes | VARCHAR(500) | NULL |
| status | ENUM('Active','Returned','Overdue') | NOT NULL DEFAULT 'Active' |
| allocated_by | BIGINT UNSIGNED | NOT NULL, FK → users.id |
| created_at / updated_at | TIMESTAMP | |

**Business constraint:** at most one row with `status='Active'` per `asset_id` — enforced in service layer via transaction (`SELECT ... FOR UPDATE` on the asset row) since MySQL has no native "partial unique index"; a nightly/cron-equivalent job (or on-read check) flips `Active`→`Overdue` when `expected_return_date < CURRENT_DATE`.

Index: `idx_alloc_asset_status (asset_id, status)`, `idx_alloc_employee`

### 13.6 `transfer_requests`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT UNSIGNED | PK |
| asset_id | BIGINT UNSIGNED | NOT NULL, FK → assets.id |
| from_user_id | BIGINT UNSIGNED | NULL, FK → users.id |
| to_user_id | BIGINT UNSIGNED | NOT NULL, FK → users.id |
| requested_by | BIGINT UNSIGNED | NOT NULL, FK → users.id |
| status | ENUM('Requested','Approved','Rejected') | NOT NULL DEFAULT 'Requested' |
| approved_by | BIGINT UNSIGNED | NULL, FK → users.id |
| requested_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| resolved_at | TIMESTAMP | NULL |

### 13.7 `bookings`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT UNSIGNED | PK |
| asset_id | BIGINT UNSIGNED | NOT NULL, FK → assets.id (must have `is_bookable=TRUE`) |
| booked_by | BIGINT UNSIGNED | NOT NULL, FK → users.id |
| department_id | BIGINT UNSIGNED | NULL, FK → departments.id |
| purpose | VARCHAR(255) | NULL |
| start_time | DATETIME | NOT NULL |
| end_time | DATETIME | NOT NULL, CHECK (end_time > start_time) |
| status | ENUM('Upcoming','Ongoing','Completed','Cancelled') | NOT NULL DEFAULT 'Upcoming' |
| created_at / updated_at | TIMESTAMP | |

Index: `idx_bookings_asset_time (asset_id, start_time, end_time)` — critical for overlap query performance.

### 13.8 `maintenance_requests`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT UNSIGNED | PK |
| asset_id | BIGINT UNSIGNED | NOT NULL, FK → assets.id |
| raised_by | BIGINT UNSIGNED | NOT NULL, FK → users.id |
| issue_description | VARCHAR(1000) | NOT NULL |
| priority | ENUM('Low','Medium','High','Critical') | NOT NULL DEFAULT 'Medium' |
| photo_url | VARCHAR(255) | NULL |
| status | ENUM('Pending','Approved','Rejected','TechnicianAssigned','InProgress','Resolved') | NOT NULL DEFAULT 'Pending' |
| approved_by | BIGINT UNSIGNED | NULL, FK → users.id |
| technician_name | VARCHAR(120) | NULL |
| resolved_at | TIMESTAMP | NULL |
| created_at / updated_at | TIMESTAMP | |

### 13.9 `audit_cycles`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT UNSIGNED | PK |
| name | VARCHAR(150) | NOT NULL |
| department_id | BIGINT UNSIGNED | NULL, FK → departments.id |
| location | VARCHAR(150) | NULL |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| status | ENUM('Draft','InProgress','Closed') | NOT NULL DEFAULT 'Draft' |
| created_by | BIGINT UNSIGNED | NOT NULL, FK → users.id |
| closed_at | TIMESTAMP | NULL |

### 13.10 `audit_cycle_auditors` (join table)
| Column | Type | Constraints |
|---|---|---|
| audit_cycle_id | BIGINT UNSIGNED | PK part, FK → audit_cycles.id |
| auditor_id | BIGINT UNSIGNED | PK part, FK → users.id |

### 13.11 `audit_items`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT UNSIGNED | PK |
| audit_cycle_id | BIGINT UNSIGNED | NOT NULL, FK → audit_cycles.id |
| asset_id | BIGINT UNSIGNED | NOT NULL, FK → assets.id |
| verification_status | ENUM('Pending','Verified','Missing','Damaged') | NOT NULL DEFAULT 'Pending' |
| notes | VARCHAR(500) | NULL |
| verified_by | BIGINT UNSIGNED | NULL, FK → users.id |
| verified_at | TIMESTAMP | NULL |

Unique: `(audit_cycle_id, asset_id)`

### 13.12 `discrepancy_reports`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT UNSIGNED | PK |
| audit_item_id | BIGINT UNSIGNED | NOT NULL, FK → audit_items.id |
| issue_type | ENUM('Missing','Damaged') | NOT NULL |
| description | VARCHAR(500) | NULL |
| resolution_status | ENUM('Open','Resolved') | NOT NULL DEFAULT 'Open' |
| created_at | TIMESTAMP | |

### 13.13 `notifications`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT UNSIGNED | PK |
| user_id | BIGINT UNSIGNED | NOT NULL, FK → users.id |
| type | VARCHAR(60) | NOT NULL (e.g. `ASSET_ASSIGNED`, `BOOKING_REMINDER`) |
| message | VARCHAR(255) | NOT NULL |
| related_entity_type | VARCHAR(50) | NULL |
| related_entity_id | BIGINT UNSIGNED | NULL |
| is_read | BOOLEAN | NOT NULL DEFAULT FALSE |
| created_at | TIMESTAMP | |

Index: `idx_notif_user_read (user_id, is_read)`

### 13.14 `activity_logs`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT UNSIGNED | PK |
| user_id | BIGINT UNSIGNED | NOT NULL, FK → users.id |
| action | VARCHAR(100) | NOT NULL (e.g. `ASSET_ALLOCATED`) |
| entity_type | VARCHAR(50) | NOT NULL |
| entity_id | BIGINT UNSIGNED | NOT NULL |
| details | JSON | NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

Index: `idx_log_entity (entity_type, entity_id)`, `idx_log_user`

*(Full DDL with exact `CREATE TABLE` statements belongs in `server/database/schema.sql`, owned by Developer 3, generated 1:1 from the tables above — no deviation without updating this doc first.)*
