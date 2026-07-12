# AssetFlow — Software Design & Development Documentation
## Part 3 of 3: UI Guidelines, Coding Standards, Security, Ops & Delivery

---

## 27. UI Guidelines

**Color Palette** (Tailwind config custom tokens):
| Token | Hex | Use |
|---|---|---|
| primary-600 | #2563EB | primary actions, links, active nav |
| primary-50 | #EFF6FF | hover backgrounds |
| success-600 | #16A34A | Available, Approved, Resolved |
| warning-600 | #D97706 | Reserved, Pending, upcoming returns |
| danger-600 | #DC2626 | Lost, Rejected, overdue, errors |
| neutral-900/700/500/200/50 | grays | text/borders/backgrounds |
| info-600 | #0891B2 | Under Maintenance, informational badges |

Status badge color mapping is centralized in one `utils/statusColors.js` — never hardcoded per component.

**Typography**: Inter (system-ui fallback). Scale: `text-2xl` page titles, `text-lg` section headers, `text-sm` body/table, `text-xs` meta/labels. Consistent `font-medium` for labels, `font-semibold` for headers.

**Spacing**: Tailwind's default 4px scale; page padding `p-6`, card padding `p-4`, form field vertical gap `space-y-4`, section gap `space-y-6`.

**Icons**: one icon library only — `lucide-react` (or a single equivalent) — no mixing icon sets.

**Layout**: fixed left `Sidebar` (collapsible on tablet ≥768px to icon-only), top `Navbar` (breadcrumb + user menu + notification bell with unread badge). Below 768px is out of required scope but sidebar should collapse to a hamburger drawer if time permits.

**Cards**: `rounded-lg border border-neutral-200 shadow-sm p-4 bg-white`; KPI cards show icon + big number + label + trend/subtext.

**Tables**: sticky header, zebra-free (use border-bottom only), row hover `bg-neutral-50`, right-aligned numeric columns, status column always a colored badge, pagination controls bottom-right.

**Forms**: label above input, `border-neutral-300 focus:ring-2 focus:ring-primary-600 rounded-md`, inline error text in `danger-600` directly below the field (never a toast-only error for field-level issues), disabled submit button until required fields are valid, loading spinner on submit button during request.

**Buttons**: `primary` (solid primary-600), `secondary` (outline neutral), `danger` (solid danger-600) — three variants only, defined once in `components/common/Button.jsx`.

**Responsive behavior**: grid-based KPI cards (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), tables become horizontally scrollable (not squeezed) on tablet, forms go single-column below `lg`.

---

## 28. Coding Standards

- **JavaScript/React**: functional components + hooks only, no class components.
- ESLint + Prettier enforced (shared config committed at repo root: `.eslintrc.json`, `.prettierrc`); 2-space indent, single quotes, semicolons required, max line length 100 (soft).
- One component = one file = one default export; component file name matches component name (`AssetCard.jsx`).
- No inline business logic in JSX — extract to hooks/services.
- Backend: async/await only (no raw `.then` chains); every controller wrapped in a shared `asyncHandler` so errors funnel to the central error middleware — no repeated try/catch boilerplate.
- SQL only via parameterized queries (`?` placeholders with `mysql2`), never string interpolation.
- Every module's `service.js` functions are pure business logic + throw typed errors (`AppError(code, message, status)`); `controller.js` just catches nothing itself (handled centrally) and formats the envelope.
- Comment "why", not "what"; JSDoc block on any function with non-obvious business rules (e.g. overlap check, allocation conflict).

---

## 29. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| DB tables/columns | snake_case, plural tables | `asset_allocations`, `expected_return_date` |
| JS variables/functions | camelCase | `getActiveAllocation()` |
| React components | PascalCase | `AssetAllocationForm.jsx` |
| API routes | kebab-case, plural nouns | `/audit-cycles`, `/activity-logs` |
| Env vars | UPPER_SNAKE_CASE | `DB_HOST`, `JWT_ACCESS_SECRET` |
| Constants/enums (JS) | UPPER_SNAKE_CASE | `ASSET_STATUS.UNDER_MAINTENANCE` |
| Branches | `feature/<module>-<desc>`, `fix/<module>-<desc>` | `feature/bookings-overlap-check` |
| Commits | Conventional Commits | `feat(bookings): add overlap validation` |
| PR titles | `[Module] Short description` | `[Bookings] Add overlap validation + tests` |

---

## 30. Environment Variables

`.env.example` (committed; real `.env` is gitignored):
```
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=assetflow_user
DB_PASSWORD=change_me
DB_NAME=assetflow_db

# Auth
JWT_ACCESS_SECRET=change_me_access
JWT_REFRESH_SECRET=change_me_refresh
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
BCRYPT_SALT_ROUNDS=10

# Client
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 31. Security Practices

- Passwords: bcrypt, ≥10 salt rounds, never logged, never returned in any API response.
- JWT secrets long/random, stored only in `.env`, separate secrets for access vs refresh tokens, short-lived access tokens.
- All inputs validated/sanitized server-side (defense in depth even though frontend also validates).
- Parameterized SQL everywhere → no SQL injection surface.
- `helmet` for HTTP security headers; CORS locked to the known frontend origin (not `*`) in production config.
- Rate limiting on `/auth/login` and `/auth/forgot-password` to blunt brute force.
- RBAC enforced server-side on every route — the frontend hiding a button is a UX nicety, not a security boundary.
- File uploads validated by MIME type + size, stored outside web-root or served via a controlled static route, filenames randomized (never trust client-provided filename).
- No secrets committed to Git (`.env` gitignored; `.env.example` has placeholders only).
- Activity log is append-only (no update/delete endpoint exposed) so it remains a trustworthy audit trail.

---

## 32. Performance Optimization

- Pagination on every list endpoint; default limit 20, hard cap 100.
- Composite indexes matching real query patterns (see §13 indexes, especially `bookings(asset_id, start_time, end_time)` and `asset_allocations(asset_id, status)`).
- Avoid N+1: use JOINs or a single batched query for list+relation data (e.g. assets with category name) instead of per-row queries.
- Debounce search inputs on the frontend (300ms) before firing API calls.
- Memoize expensive derived UI computations (`useMemo`) for dashboard/report charts.
- Connection pooling via `mysql2/promise` createPool (not a new connection per request).
- Lazy-load report charts and route-based code-splitting (`React.lazy`) for non-critical pages.

---

## 33. Scalability Strategy

- Stateless backend (JWT-based auth, no in-memory session) → horizontally scalable behind a load balancer if ever needed.
- Domain-module folder structure (§9) means new modules (e.g. "Asset Insurance" later) bolt on without touching existing ones.
- DB normalized to 3NF now, with clear extension points (e.g. `asset_categories.custom_fields JSON` absorbs category-specific fields without schema churn).
- Read-heavy endpoints (dashboard, reports) are structured as isolated service functions that could later be moved behind caching (Redis) or a read replica without touching controllers.
- Bulk operations (e.g. audit item generation) done as batched inserts, not row-by-row loops.

---

## 34. Offline Strategy

- No mandatory calls to any third-party cloud API in the core request path (auth, assets, bookings, maintenance, audits all resolve against local MySQL only).
- Password reset "email" step, in absence of a mail server, surfaces the reset link directly in-app/console for local/offline demo use rather than depending on an external SMTP/cloud provider.
- Static assets (icons, fonts) bundled locally via Vite build, not pulled from a CDN at runtime, so the app functions on an isolated LAN.
- (Stretch) a service worker can cache the last-fetched dashboard/report payloads for read-only viewing during a brief connectivity gap; write actions always require a live connection to the local API (no offline write queue, to avoid consistency issues with the allocation/booking conflict rules).

---

## 35. Testing Checklist

**Backend (per module):**
- [ ] Unit tests for service-layer business rules (allocation conflict, booking overlap, lifecycle transitions)
- [ ] Integration test: signup → forced Employee role
- [ ] Integration test: double allocation attempt → 409
- [ ] Integration test: overlapping booking attempt → 409; back-to-back booking → 201
- [ ] Integration test: maintenance approve → asset status flips to Under Maintenance; resolve → Available
- [ ] Integration test: audit close generates discrepancy_reports and updates statuses
- [ ] RBAC test: Employee cannot hit Admin-only routes (403)
- [ ] Validation test: invalid email/password/date formats rejected with correct error shape

**Frontend:**
- [ ] Form validation shows inline errors, disables submit while invalid
- [ ] Protected routes redirect unauthenticated users to `/login`
- [ ] Role-gated UI elements hidden/shown correctly per role
- [ ] Responsive check at 1280px, 1024px, 768px
- [ ] Empty states (no assets, no bookings) render helpful messaging, not blank screens
- [ ] Error responses from API surface as user-friendly messages, not raw JSON/stack traces

**End-to-end (manual, pre-demo):**
- [ ] Full workflow walkthrough (see §36 Demo Flow) completes without console errors

---

## 36. Demo Flow (for judging)

1. **Login as Admin** → show Dashboard KPIs.
2. **Organization Setup**: create a Department, an Asset Category, promote an Employee to Asset Manager.
3. **Login as Asset Manager** → register a new Asset (show auto-generated tag).
4. **Allocate** the asset to an Employee → attempt to allocate the *same* asset again as a different user → show the conflict block + "Request Transfer" path.
5. **Booking**: book a shared resource for a slot → attempt an overlapping booking → show rejection; then book a back-to-back slot → show success.
6. **Maintenance**: raise a request as Employee → approve as Asset Manager → show asset flips to Under Maintenance → resolve → back to Available.
7. **Audit**: create an audit cycle, mark one asset Missing → close cycle → show it becomes Lost and appears in a discrepancy report.
8. **Dashboard/Notifications**: show overdue return highlighted separately, and the notification feed reflecting everything just done.
9. **Reports**: show one or two charts (utilization, department allocation).

---

## 37. Deployment Strategy

- **Local/hackathon demo**: `npm run dev` for client (Vite) and server (nodemon) against a local MySQL instance created from `server/database/schema.sql` + `seed.sql`.
- **Production-style packaging (optional stretch)**: `npm run build` client → served as static files by Express in production mode (single deployable Node process) OR served via Nginx; backend run with `pm2` or similar process manager for restarts.
- Environment-specific config purely via `.env` (never hardcoded), so the same codebase runs local/dev/prod.
- Database migrations tracked as numbered `.sql` files under `server/database/migrations/` — never edit `schema.sql` directly once seeded data exists; add a new migration.

---

## 38. Future Scope

- Purchasing/procurement and accounting integration (explicitly out of scope now).
- QR-code label generation/printing and mobile QR scanning for check-in/check-out.
- Push/email notifications via a proper mail provider once "avoid third-party APIs" constraint is lifted post-hackathon.
- Multi-organization (tenant) support.
- Mobile app (React Native) reusing the same API.
- Configurable approval chains (multi-level) for high-value asset transfers.
- Predictive maintenance scheduling based on usage/failure history.
