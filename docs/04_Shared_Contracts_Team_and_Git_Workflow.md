# AssetFlow — Shared Contracts, Team Division & Git Workflow

This is the document that lets four separate AI-assisted developers generate code independently that **merges cleanly**. If a developer prompt (see the companion `AssetFlow_Master_Prompts.md`) ever conflicts with this file, this file wins.

---

## A. Shared Contracts

### A.1 Response Envelope (mandatory for every backend endpoint)
```json
// success
{ "success": true, "data": {}, "message": "optional", "meta": { "page":1, "limit":20, "total":0 } }
// error
{ "success": false, "error": { "code": "SOME_CODE", "message": "human readable", "fields": {} } }
```
No endpoint may deviate from this shape. Frontend `api/*.js` files assume it unconditionally.

### A.2 Error Codes (extend this table, never invent ad-hoc strings elsewhere)
`VALIDATION_ERROR, UNAUTHENTICATED, FORBIDDEN_ROLE, NOT_FOUND, ASSET_ALREADY_ALLOCATED, ASSET_NOT_AVAILABLE_FOR_TRANSFER, BOOKING_OVERLAP, BOOKING_PAST_TIME, AUDIT_CYCLE_CLOSED, DUPLICATE_EMAIL, INVALID_CREDENTIALS, TOKEN_EXPIRED, SERVER_ERROR`

### A.3 Shared Enums (must be identical in backend `constants.js` and frontend `utils/constants.js`)
```js
ASSET_STATUS = ['Available','Allocated','Reserved','Under Maintenance','Lost','Retired','Disposed']
ALLOCATION_STATUS = ['Active','Returned','Overdue']
TRANSFER_STATUS = ['Requested','Approved','Rejected']
BOOKING_STATUS = ['Upcoming','Ongoing','Completed','Cancelled']
MAINTENANCE_STATUS = ['Pending','Approved','Rejected','TechnicianAssigned','InProgress','Resolved']
MAINTENANCE_PRIORITY = ['Low','Medium','High','Critical']
AUDIT_STATUS = ['Draft','InProgress','Closed']
AUDIT_ITEM_STATUS = ['Pending','Verified','Missing','Damaged']
ROLES = ['Admin','AssetManager','DepartmentHead','Employee']
```

### A.4 Shared Types (JSDoc-style, mirrored on both sides)
```js
/** @typedef {{ id:number, name:string, email:string, role:string, department_id:number|null, status:string }} User */
/** @typedef {{ id:number, asset_tag:string, name:string, category_id:number, status:string, is_bookable:boolean }} Asset */
/** @typedef {{ id:number, asset_id:number, employee_id:number|null, department_id:number|null, status:string, expected_return_date:string|null }} Allocation */
/** @typedef {{ id:number, asset_id:number, start_time:string, end_time:string, status:string }} Booking */
```

### A.5 Folder & Module Standards
- Backend: every domain module has exactly `routes.js, controller.js, service.js, repository.js, validators.js` — no extra top-level files per module.
- Frontend: every feature has a `pages/<Feature>Page.jsx` + optional `components/feature/<Feature>*.jsx` + one `api/<feature>.js`.
- No component/module reaches across domains directly — cross-domain needs go through the service layer (e.g. bookings service may call assets repository, but never assets controller).

### A.6 Component Standards (Frontend)
- Shared primitives live only in `components/common/`: `Button, Input, Select, Modal, Table, Card, Badge, Sidebar, Navbar, Spinner, EmptyState, ErrorBanner`.
- Every list page uses the shared `Table` + `EmptyState` + pagination component — never a bespoke table per page.
- Every async page shows `Spinner` while loading and `ErrorBanner` (using the error envelope's `message`) on failure — never a blank page.

### A.7 Validation Format
Backend validation errors always populate `error.fields` keyed by field name, one message per field, matching the exact rules in SDD §26. Frontend renders these directly under the corresponding input — no re-deriving validation text on the frontend.

### A.8 Naming Convention Cross-Reference
See SDD Part 3 §29 — binding for all four developers.

---

## B. Team Division (4 Developers)

### Developer 1 — Frontend
- **Owns**: `client/` entirely.
- **Can modify**: everything under `client/src/**`, `client/index.html`, `client/tailwind.config.js`, `client/vite.config.js`.
- **Should not touch**: anything under `server/`.
- **Depends on**: API contracts in SDD Part 2 §14 (can build against mock data matching the exact response envelope until backend endpoints land).
- **Deliverables**: all 10 screens per the problem statement, responsive down to tablet, full RBAC-aware navigation, form validation matching §26, empty/error/loading states.
- **Timeline** (relative, hackathon-scale): Day 1 — shared components + routing + auth pages; Day 2 — Org Setup, Assets, Allocations, Bookings; Day 3 — Maintenance, Audits, Reports, Notifications, polish.

### Developer 2 — Backend (Core Business Modules)
- **Owns**: `server/src/modules/assets`, `allocations`, `transfers`, `reports`, `dashboard` under `server/src/config`, `middlewares` (shared, coordinate with Dev 3).
- **Can modify**: those module folders, plus proposing (not unilaterally changing) shared `utils/`.
- **Should not touch**: `auth`, `users`, `departments`, `categories` modules (Dev 3's); `bookings`, `maintenance`, `audits` (Dev 4's).
- **Deliverables**: asset CRUD + tag generation, allocation conflict logic (transactional), transfer workflow, reports queries, dashboard KPI queries.
- **Timeline**: Day 1 — asset CRUD + schema alignment with Dev 3; Day 2 — allocations + transfers + conflict transaction; Day 3 — reports + dashboard + integration testing with Dev 1/4.

### Developer 3 — Database + Authentication + Core APIs
- **Owns**: `server/database/*` (schema, seed, migrations — the authoritative DDL), `server/src/modules/auth`, `users`, `departments`, `categories`, `notifications`, `activityLogs`, and shared `middlewares/auth.js`, `middlewares/rbac.js`.
- **Can modify**: those, plus is the sole owner of `schema.sql` (others request changes via them, never edit directly).
- **Should not touch**: business modules owned by Dev 2/4.
- **Deliverables**: full schema matching SDD Part 1 §13 exactly, seed data for demo, JWT auth + refresh flow, RBAC middleware, Org Setup APIs (departments/categories/employee directory + role promotion), notifications + activity log write/read.
- **Timeline**: Day 1 — schema + auth + RBAC (unblocks everyone else); Day 2 — departments/categories/users + notifications; Day 3 — activity logs, hardening, support integration.

### Developer 4 — Booking + Maintenance + Integration + Testing
- **Owns**: `server/src/modules/bookings`, `maintenance`, `audits`.
- **Can modify**: those modules; also owns end-to-end integration testing across all modules and the testing checklist (SDD Part 3 §35).
- **Should not touch**: other developers' modules except to open a PR comment/issue if a contract mismatch is found.
- **Deliverables**: booking overlap engine, maintenance approval workflow, audit cycle engine + discrepancy generation, plus running the full integration test pass and demo-flow rehearsal (§36) before submission.
- **Timeline**: Day 1 — bookings module (needs assets from Dev 2, schema from Dev 3) + overlap logic; Day 2 — maintenance + audits; Day 3 — full integration pass, bug triage across all 4 members' code, demo rehearsal.

**Merge discipline**: nobody edits another developer's owned files directly. Cross-module needs (e.g. Dev 4 needs an assets repository function) are requested via a short PR comment/issue, implemented by the owning developer, and consumed by import — this is what prevents merge conflicts and architecture drift between the 4 AI-assisted workstreams.

---

## C. GitHub Workflow (Absolute Beginner Level)

### C.1 Create the Repository
1. One team member (the "owner") goes to https://github.com, clicks the **+** icon (top right) → **New repository**.
2. Repository name: `assetflow-erp_odoo`. Visibility: Private (recommended) or Public. Check "Add a README". Click **Create repository**.

### C.2 Invite Collaborators
1. In the repo, go to **Settings → Collaborators and teams**.
2. Click **Add people**, enter each teammate's GitHub username or email, click **Add**.
3. Each invited teammate receives an email/notification with an **Accept invitation** link — they click it and confirm.

### C.3 Everyone Clones the Repo
Each developer, on their own machine, opens a terminal and runs:
```bash
git clone https://github.com/<owner-username>/assetflow-erp_odoo.git
cd assetflow-erp_odoo
```
`git clone` downloads a full copy of the repository (all files + history) to your computer.

### C.4 Create the `develop` Branch (owner does this once)
```bash
git checkout -b develop      # create and switch to a new branch called develop
git push -u origin develop   # push it to GitHub and set it as the branch's upstream
```
- `git checkout -b <name>` creates a new branch from your current branch and switches to it.
- `git push -u origin <name>` uploads that branch to GitHub (`origin` is the default name for the remote repository); `-u` remembers this pairing so future `git push`/`git pull` on this branch need no extra arguments.

Then, in GitHub, go to **Settings → Branches** and set `main` and `develop` as protected (require PRs before merging).

### C.5 Each Developer Creates a Feature Branch
```bash
git checkout develop          # make sure you start from develop
git pull origin develop       # get the latest changes first
git checkout -b feature/assets-registration   # e.g. Developer 2's first task
```
- `git pull origin develop` fetches new commits from GitHub's `develop` branch and merges them into your local `develop` — always do this before branching off, to avoid starting from stale code.

### C.6 Daily Work Loop
```bash
git status                       # see what files changed
git add .                        # stage all changed files for commit
git commit -m "feat(assets): add asset registration endpoint"   # save a snapshot with a message
git pull origin develop --rebase # (optional but recommended) replay your work on top of latest develop
git push origin feature/assets-registration   # upload your branch to GitHub
```
- `git status`: shows modified/staged/untracked files.
- `git add .`: stages everything in the current folder; use `git add <file>` to stage selectively.
- `git commit -m "<message>"`: records a snapshot of staged changes with a description.
- `git pull --rebase`: reapplies your local commits on top of the newest `develop`, keeping history clean (avoids a messy "merge commit" for simple cases).
- `git push origin <branch>`: uploads your commits to that branch on GitHub.

### C.7 Commit Message Convention (Conventional Commits)
`<type>(<module>): <short description>`
Types: `feat` (new feature), `fix` (bug fix), `docs`, `refactor`, `test`, `chore`.
Example: `fix(bookings): correct overlap check for back-to-back slots`

### C.8 Creating a Pull Request (PR)
1. Push your feature branch (as above).
2. On GitHub, you'll see a banner "Compare & pull request" for your branch — click it (or go to **Pull requests → New pull request**).
3. Base branch: `develop`. Compare branch: your `feature/...` branch.
4. Title format: `[Module] Short description` e.g. `[Bookings] Add overlap validation + tests`.
5. In the description, list: what changed, how it was tested, any screenshots (for UI).
6. Click **Create pull request**.

### C.9 Reviewing a PR
- A teammate (ideally not the author) opens the **Files changed** tab, reads the diff, and either:
  - Clicks **Review changes → Comment** to leave notes without blocking,
  - **Request changes** if something's wrong (author must fix and push again — the PR updates automatically),
  - **Approve** if it looks good.

### C.10 Merging a PR
1. Once approved (and no requested changes are pending), click **Merge pull request** on GitHub.
2. Choose "Squash and merge" (recommended — combines all commits in the PR into one clean commit on `develop`) or a standard merge.
3. Click **Confirm merge**, then **Delete branch** (cleans up the now-merged feature branch on GitHub).
4. Locally, everyone updates: `git checkout develop && git pull origin develop`.

### C.11 Resolving Merge Conflicts
A conflict happens when two branches changed the *same lines* of the *same file*. Git will mark it like:
```
<<<<<<< HEAD
your version
=======
their version
>>>>>>> feature/other-branch
```
Steps:
1. Open the conflicted file, decide which lines to keep (or combine both), delete the `<<<<<<<`, `=======`, `>>>>>>>` markers.
2. `git add <file>` to mark it resolved.
3. `git commit` to finish the merge (if mid-merge) or continue the rebase with `git rebase --continue`.
4. Push again.

**How this project avoids most conflicts in the first place**: strict per-developer folder ownership (Section B above) means two people are rarely editing the same file. The only shared files (`schema.sql`, `constants.js`, `middlewares/*`) have a single named owner (Developer 3) who applies requested changes — nobody else edits them directly.

### C.12 Branch Structure Summary
```
main        ← production-ready, protected, merged from develop at milestones only
 └─ develop ← integration branch, protected, all feature/fix branches merge here
     ├─ feature/assets-registration
     ├─ feature/bookings-overlap-check
     ├─ feature/auth-jwt-refresh
     ├─ fix/audits-close-validation
     └─ ...
```

### C.13 Quick Git Command Reference
| Command | What it does |
|---|---|
| `git clone <url>` | Download a repo to your machine |
| `git status` | Show changed/staged files |
| `git add .` / `git add <file>` | Stage changes for commit |
| `git commit -m "msg"` | Save a snapshot of staged changes |
| `git checkout -b <branch>` | Create + switch to a new branch |
| `git checkout <branch>` | Switch to an existing branch |
| `git pull origin <branch>` | Download + merge latest remote changes |
| `git push origin <branch>` | Upload local commits to GitHub |
| `git log --oneline` | View commit history compactly |
| `git diff` | See unstaged changes line-by-line |
| `git merge <branch>` | Merge another branch into current one |
| `git rebase --continue` | Continue a rebase after resolving conflicts |
