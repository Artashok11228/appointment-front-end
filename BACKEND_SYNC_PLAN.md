# Frontend ↔ Backend Sync Plan (Appointment Booking API)

> **Audience:** next AI coding agent in Cursor.  
> **Repo:** `appointment-front-end` (Vite + React 18 + React Router 7 + Tailwind 4).  
> **Source of truth:** OpenAPI 3.0.3 — Appointment Booking API v1.0.0 (live Laravel contract).  
> **Workspace rules:** `.cursor/rules/frontend.mdc` (Swagger-only shapes, generated client, feature folders, minimal diffs).

---

## How to use this file (mandatory)

1. Pick **one phase** only per new chat.
2. Paste the **Phase Starter Prompt** for that phase into the new chat.
3. Do **not** implement later phases early. Do **not** invent endpoints/fields.
4. After the phase: run lint; mark the phase checklist done in this file (or leave a short status note at the top of the phase).
5. If OpenAPI is missing from the repo, recreate `openapi/appointment-api.yaml` from the contract in chat history / backend before codegen.

**Recommended chat order:** P0 → P1 → P2 → P3 → P4 → P5 → P6 → P7 → P8.

**Parallel-safe later:** After P0–P2, P5 (admin services) and P4 (customer booking UI) can run in separate chats if they only consume hooks/API already shipped in P2–P3. Prefer serial for fewer merge conflicts.

---

## 0. Executive gap summary (current FE vs API)

### Current frontend reality

| Area | Today | Backend contract |
|---|---|---|
| Data store | `localStorage` (`allUsers`, `Appointments`, `EleganceStaff`) | Laravel API under `/api` + Sanctum Bearer |
| Auth | Client-side email/password match; stores full user incl. password | `POST /register`, `POST /login` → `{ data: User, token }`; `POST /logout`; `GET /me` |
| Roles | `client`, `staff` (`accountRole`), `admin` | **`customer` \| `admin` only** — no staff |
| Services | Static `src/data/services.js` (name + `$price` string, categories) | `Service`: `id`, `name`, `duration_minutes`, `price` decimal string; admin CRUD |
| Booking | Multi-service + auto-assign stylist; `date` + `time`; status `Awaiting Confirmation` | **One** `service_id` + naive `starts_at`; status starts as `confirmed` |
| Availability | Client-side stylist schedule heuristics | `GET /services/{id}/availability?date=Y-m-d` → ISO slots |
| Appointments list | Full array in memory | Paginated (`per_page=15`) + filters `status`, `service_id`, `from`, `to`, `page` |
| Cancel / reschedule | Local mutate / delete | `POST .../cancel`, `PATCH ...` with 120‑min customer lock; **409** message-only |
| Admin dashboard | Revenue, inventory fake, staff rows | `GET /admin/stats` (`by_status`, `bookings_per_day`, `top_services`, `cancellation_rate`) |
| Staff domain | Full `/staff/*` + admin Staffs CRUD | **Out of API scope — remove/disable** |

### Critical API rules the UI must obey

- Base URL: `http://localhost:8000/api` (env-configurable). Headers: `Accept: application/json`, JSON bodies `Content-Type: application/json`, auth `Authorization: Bearer <token>`.
- Token lifetime **7 days**. On **401** → clear token + redirect login.
- App timezone **UTC**. Open **Mon–Fri 09:00–17:00**. Slot grid = `service.duration_minutes`.
- Availability returns ISO with offset (`2026-11-02T09:00:00+00:00`).
- Book/reschedule body `starts_at` must be **naive** `Y-m-d H:i:s` or `Y-m-d H:i` — **never** send `T`, `Z`, or offsets (→ 422).
- Prefer: availability → pick slot → convert to naive UTC wall-clock → POST/PATCH.
- Customer cancel/reschedule blocked within **120 minutes** of `starts_at`. Admin bypasses. Only `confirmed` can cancel/reschedule. `completed` is server-side after `ends_at`.
- Login throttle **5/min**; general **60/min**.
- Status map: 200/201/204 ok; 401 auth; 403 forbidden; 404 missing; **409** illegal state (`{ message }`); **422** validation (`{ message, errors }`); 429 rate limit.
- `role` is never client-writable. Seeded: `admin@example.com` / `password`, `customer@example.com` / `password`.
- PATCH service still requires **all** write fields (treat as replace). Delete service **409** if any appointment history.

### Domain model mapping (old → new)

```
FE appointment.date + appointment.time     → Appointment.starts_at / ends_at (ISO in responses)
FE appointment.items[0].service            → Appointment.service (nested) + service_id
FE multi-service booking                   → single service_id per appointment (book once per service)
FE stylist / staff                         → DELETE from product surface (no API)
FE status "Awaiting Confirmation"|Pending… → confirmed | cancelled | completed only
FE role "client"                           → "customer"
FE price "$80"                             → API number write / string "80.00" read
```

### Target architecture (per `.cursor/rules/frontend.mdc`)

```
src/
  shared/                 # only if used in 2+ features
    api/                  # generated client + http wrapper / auth header / error normalize
    lib/datetime.ts       # isoToNaiveUtc, format display, lock-window helpers
    ui/                   # truly shared presentational pieces if needed
  features/
    auth/{api,hooks,components}
    services/{api,hooks,components}
    availability/{api,hooks,components}
    appointments/{api,hooks,components}
    admin/{api,hooks,components}
  pages/ or keep Pages/   # thin route shells composing features
  Context/                # slim: Auth session only; avoid localStorage domain stores
```

- **Components → hooks → generated API.** No hand-written fetch duplicates of OpenAPI.
- Prefer TypeScript for new API/feature layer; existing JSX pages can be migrated incrementally per phase.

---

## 1. Non-goals / explicit removals

Do **not** keep wiring these to the live API (no endpoints exist):

- Staff accounts, staff schedule, stylist assignment, `/staff/*` routes, `StaffContext`, admin Staffs page.
- Guest booking without auth (API books as token user only).
- Multi-service single appointment payload.
- Client-chosen `role` on register.
- Phone as auth field (User schema has no phone).
- Local fake inventory / “low stock”.
- Statuses outside `confirmed|cancelled|completed`.
- Changing `service_id` on reschedule (API allows only `starts_at`).

**Removal strategy:** disable routes + nav in P1; delete dead code in P8 (or earlier when unused). Do not rewrite staff into “fake admin” — remove it.

---

## 2. Suggested OpenAPI placement & codegen

- Save contract as: `openapi/appointment-api.yaml` (repo root).
- Generate client into e.g. `src/shared/api/generated/` via openapi-typescript / orval / openapi-fetch — pick **one** tool already compatible with Vite; document the npm script in P0.
- Rule: regenerate when YAML changes; never hand-edit generated files.

---

# PHASES

---

## Phase 0 — Contract, tooling, env, generated client

**Status:** done — OpenAPI in-repo; `openapi-typescript` + `openapi-fetch`; `generate:api`; shared client + datetime helpers. No feature UI changes.

**Goal:** OpenAPI is in-repo; codegen works; env base URL exists; zero feature UI changes required beyond smoke import.

**Depends on:** nothing.

### Tasks

- [x] **P0.1** Add `openapi/appointment-api.yaml` with the full Appointment Booking API contract (the OpenAPI pasted by the product owner).
- [x] **P0.2** Add `.env.example` + Vite env: `VITE_API_BASE_URL=http://localhost:8000/api`.
- [x] **P0.3** Choose and wire codegen (prefer typed client from OpenAPI). Add scripts: `generate:api`, run once, commit generated output or CI-generate — follow repo convention; document in README snippet.
- [x] **P0.4** Create thin `src/shared/api/client.ts` (or `.js`) that:
  - uses base URL from env
  - always sets `Accept: application/json`
  - attaches Bearer token from a single token storage key (e.g. `auth_token`)
  - parses JSON; maps HTTP errors into a small `ApiError` shape: `{ status, message, errors? }`
- [x] **P0.5** Add `src/shared/lib/datetime.js|ts` helpers:
  - `isoToNaiveUtc(iso)` → `"YYYY-MM-DD HH:mm:ss"` **without** converting to browser local if APP_TIMEZONE is UTC
  - `formatAppointmentDisplay(iso)` for UI
  - `isWithinModificationLock(startsAtIso, now = Date.now(), lockMinutes = 120)` for customer UX disable
  - constants: open hours Mon–Fri 09–17 UTC (document; do not invent different hours)
- [x] **P0.6** Smoke: import generated types/`operations` in a throwaway or shared index; `npm run lint` passes.

### Acceptance

- YAML present; `generate:api` succeeds; client can be imported; env documented; datetime helper unit-tested mentally with cookbook example: `"2026-11-10T09:45:00+00:00"` → `"2026-11-10 09:45:00"`.

### Out of scope

Login UI, booking UI, deleting staff.

### Phase 0 starter prompt

```text
Read BACKEND_SYNC_PLAN.md Phase 0 and .cursor/rules/frontend.mdc.
Implement ONLY Phase 0: place OpenAPI YAML, Vite env, API codegen, shared HTTP client with Bearer + ApiError, and datetime helpers (isoToNaiveUtc, lock window).
Do not change auth/booking UI yet. List files you will touch first. After: run lint.
```

---

## Phase 1 — Domain alignment: roles, routes, kill staff surface

**Status:** done — roles are `customer` | `admin`; `/staff/*` redirects home; Staff Management nav removed. Auth still localStorage until P2 (expected).

**Goal:** App role model matches API (`customer` | `admin`). Staff product surface removed from routing/nav so later API work cannot accidentally depend on it.

**Depends on:** P0 recommended (not strictly required for route edits).

### Tasks

- [x] **P1.1** Inventory all `staff` / `accountRole` / `client` / stylist references (`main.jsx`, `ProtectedRoute`, Header, AdminSidebar, StaffLayout, StaffContext, AppointmentContext).
- [x] **P1.2** Change protected customer role checks from `client` → `customer`.
- [x] **P1.3** Remove or redirect `/staff/*` routes; remove staff entries from login redirect (`LoginInput`).
- [x] **P1.4** Remove admin nav link to Staffs; leave page file for P8 delete if needed.
- [x] **P1.5** Update copy/labels that say “client” to “customer” where user-facing or auth-related.
- [x] **P1.6** Document temporary broken state: auth still localStorage until P2 — that’s OK.

### Acceptance

- No reachable staff dashboard for any role.
- `ProtectedRoute` understands `customer` and `admin` only.
- Lint clean.

### Out of scope

Real Sanctum login; deleting all staff files yet (can stub).

### Phase 1 starter prompt

```text
Read BACKEND_SYNC_PLAN.md Phase 1.
Align roles to customer|admin and remove/disable the entire staff surface (routes, nav, login redirects).
Do not implement Sanctum yet unless already present. Minimal diffs. List files first; run lint after.
```

---

## Phase 2 — Auth feature (Sanctum) replacing localStorage users

**Goal:** Register/login/logout/me work against API; token persisted; 401 handled globally.

**Depends on:** P0 (client), P1 (roles).

### API ops to wire (generated only)

| op | method path | notes |
|---|---|---|
| `register` | POST `/register` | body: `name`, `email`, `password`, `password_confirmation` — **no phone, no role** |
| `login` | POST `/login` | wrong creds → **422** on `email`, not 401 |
| `logout` | POST `/logout` | **204** empty |
| `me` | GET `/me` | `{ data: User }` — bootstrap session |

### Tasks

- [ ] **P2.1** `features/auth/api` wrappers around generated client (no duplicate types).
- [ ] **P2.2** Rewrite `AuthContext` (or `features/auth` provider):
  - store `token` + `user` (`id,name,email,role`)
  - on boot: if token → `GET /me`; on fail clear session
  - `login`/`register` save token; never store password
  - `logout` call API then clear; ignore network error still clear local
- [ ] **P2.3** Token storage: `localStorage` vs `sessionStorage` based on Remember Me (token only, not password).
- [ ] **P2.4** Update `RegisterInput`: drop phone validation; send `password_confirmation`; min password **8**; map 422 `errors` to fields; on success auto-login with returned token (API returns token on 201).
- [ ] **P2.5** Update `LoginInput`: map 422 credential errors; redirect `admin` → `/admin/dashboard`, `customer` → `/` or `/account`.
- [ ] **P2.6** Global 401 interceptor / handler: clear session → `/login` (per cookbook).
- [ ] **P2.7** Remove seeded `admin@admin.com` local user logic and `allUsers` persistence for auth.
- [ ] **P2.8** Manual verify with seeded `customer@example.com` / `admin@example.com` + `password`.

### Acceptance

- Register creates customer; login returns Bearer session; refresh page keeps session via `/me`; logout revokes; wrong password shows field error; no passwords in storage.

### Out of scope

Booking, services CRUD UI.

### Phase 2 starter prompt

```text
Read BACKEND_SYNC_PLAN.md Phase 2 and openapi/appointment-api.yaml Auth paths.
Replace localStorage auth with Sanctum: register/login/logout/me via generated client.
Update Register/Login forms to API shapes (no phone; password_confirmation; 8+ chars).
Handle 401/422. Roles customer|admin only. List files first; lint after.
```

---

## Phase 3 — Services + Availability data layer

**Goal:** Authenticated app can list/get services and fetch day slots from API. Replace static catalog as the booking source of truth.

**Depends on:** P0, P2.

### API ops

| op | path | notes |
|---|---|---|
| `listServices` | GET `/services` | full list, ordered by name |
| `getService` | GET `/services/{service}` | |
| `getServiceAvailability` | GET `/services/{service}/availability?date=` | empty on weekends/closed; past slots omitted |

Admin mutations deferred to **Phase 5**.

### Tasks

- [ ] **P3.1** `features/services/api` + hooks: `useServices`, `useService(id)`.
- [ ] **P3.2** `features/availability/api` + `useServiceAvailability(serviceId, dateYmd)` with loading/empty/error.
- [ ] **P3.3** Stop using `src/data/services.js` for booking/admin flows (marketing Home gallery may keep static images temporarily — mark TODO; do not claim API prices from static file).
- [ ] **P3.4** Normalize display of `price` string (`"80.00"`) — never assume `$` prefix from API.
- [ ] **P3.5** Slot picker helper: map `TimeSlot[]` → UI options; on select keep both ISO and naive form for submit.

### Acceptance

- Logged-in user can load services from API and see slots for a weekday date; weekend → empty list without crashing.

### Out of scope

POST appointments; admin service forms.

### Phase 3 starter prompt

```text
Read BACKEND_SYNC_PLAN.md Phase 3 and OpenAPI Services + Availability.
Add feature hooks/api for list/get services and availability by date using generated client only.
Decouple booking data source from src/data/services.js. No booking POST yet. Lint after.
```

---

## Phase 4 — Customer appointments (book, list, cancel, reschedule)

**Goal:** End-to-end customer booking flow matches `x-frontend-cookbook.suggestedFlows.customerBooking`.

**Depends on:** P2, P3.

### API ops

| op | path | notes |
|---|---|---|
| `createAppointment` | POST `/appointments` | `{ service_id, starts_at: naive }` → 201 `confirmed` |
| `listAppointments` | GET `/appointments` | customer sees own; page size 15; nested service+user |
| `getAppointment` | GET `/appointments/{id}` | owner/admin |
| `rescheduleAppointment` | PATCH `/appointments/{id}` | `{ starts_at }` only; 409 conflicts |
| `cancelAppointment` | POST `/appointments/{id}/cancel` | no body; 409 conflicts |

### Tasks

- [ ] **P4.1** Replace `AppointmentContext` localStorage CRUD with hooks calling API (`features/appointments`). Keep a thin provider only if cross-tree cache needed; prefer query-style hooks.
- [ ] **P4.2** Rewrite booking UI (`AppointmentForm` / contact form / user Booking):
  - auth required to book
  - select **one** service (not multi)
  - pick calendar date (respect Mon–Fri UX)
  - load availability; pick slot
  - submit naive `starts_at` via `isoToNaiveUtc`
  - on 422 `starts_at` → show message + refresh availability
- [ ] **P4.3** Customer appointment list: map API fields (`starts_at`, `status`, nested `service.price`) into cards; pagination (`page`, `meta`).
- [ ] **P4.4** Cancel: confirm modal → POST cancel; handle 409 `message` toast; hide/disable if not `confirmed` or within 120‑min lock (customer).
- [ ] **P4.5** Reschedule: reopen slot picker for **same** `service_id`; PATCH; handle 409/422.
- [ ] **P4.6** Remove stylist assignment, `items[]`, guest booking paths, old statuses from customer UI.
- [ ] **P4.7** Filters optional: `status`, `from`, `to` for customer “My appointments”.

### Acceptance

- Cookbook flow works against local backend: login → services → availability → book → list → reschedule/cancel with correct error UX.
- No localStorage `Appointments` key used.

### Out of scope

Admin stats; service admin CRUD.

### Phase 4 starter prompt

```text
Read BACKEND_SYNC_PLAN.md Phase 4 and OpenAPI Appointments + x-frontend-cookbook.customerBooking.
Replace localStorage AppointmentContext with API-backed customer book/list/cancel/reschedule.
Enforce single service, availability→naive starts_at, statuses confirmed|cancelled|completed, 120‑min lock UX, 409/422 handling.
List files first; lint after. Do not build admin CRUD in this phase.
```

---

## Phase 5 — Admin services catalog CRUD

**Goal:** Admin can manage services per API.

**Depends on:** P2, P3.

### API ops

| op | notes |
|---|---|
| `createService` | POST `/services` — admin; unique name |
| `replaceService` / `updateService` | PUT/PATCH — send **all** of `name`, `duration_minutes`, `price` (number) |
| `deleteService` | 204 or **409** with message if history exists |

### Tasks

- [ ] **P5.1** Admin Services page (new route e.g. `/admin/services`) or repurpose Configuration/extra nav — prefer dedicated Services admin.
- [ ] **P5.2** Table: name, duration, price; actions edit/delete.
- [ ] **P5.3** Create/Edit form validation matching `ServiceWrite`.
- [ ] **P5.4** Delete confirm; show 409 message when history blocks delete.
- [ ] **P5.5** 403 handling if non-admin hits mutations.
- [ ] **P5.6** Wire AdminSidebar nav; remove reliance on static `services.js` for admin.

### Acceptance

- Admin CRUD works; customer can see new services in booking list after refresh.

### Out of scope

Staff; inventory.

### Phase 5 starter prompt

```text
Read BACKEND_SYNC_PLAN.md Phase 5 and OpenAPI service write/delete semantics (PATCH requires all fields; delete 409 on history).
Build admin services CRUD UI + hooks using generated client. Add admin nav. Minimal unrelated refactors. Lint after.
```

---

## Phase 6 — Admin appointments + stats dashboard

**Goal:** Admin sees all appointments (filters/pagination) and dashboard from `GET /admin/stats`. Remove fake revenue/inventory/staff widgets that contradict API.

**Depends on:** P2, P4 (appointments shape), P5 optional.

### API ops

| op | notes |
|---|---|
| `listAppointments` | admin sees all; filters status/service_id/from/to/page |
| `getAppointment` | |
| `rescheduleAppointment` / `cancelAppointment` | admin **not** subject to 120‑min lock |
| `getAdminStats` | `by_status`, `bookings_per_day` (30 days), `top_services` (≤5), `cancellation_rate` |

### Tasks

- [ ] **P6.1** Refactor `Pages/Admin/Appointments.jsx` to API pagination + filters; drop stylist filters/columns; statuses only API enums.
- [ ] **P6.2** View modal: show nested `user` + `service` + ISO times.
- [ ] **P6.3** Admin cancel/reschedule actions with 409 toasts; no “change stylist” / multi-item edit.
- [ ] **P6.4** Rebuild `Pages/Admin/Dashboard.jsx` around `getAdminStats` (cards + simple day series + top services). Remove inventory/staff-today blocks or replace only with API-backed data.
- [ ] **P6.5** Remove admin ability to set arbitrary custom statuses / delete appointment locally (no delete endpoint — use cancel).

### Acceptance

- Admin login → stats match backend; appointments list paginates; cancel/reschedule work without lock for admin.

### Out of scope

User profile update API (not in OpenAPI).

### Phase 6 starter prompt

```text
Read BACKEND_SYNC_PLAN.md Phase 6 and OpenAPI /appointments + /admin/stats.
Rewire admin appointments list/filters/pagination and dashboard to API. Remove staff/inventory/fake metrics. Admin bypasses modification lock in UX. Lint after.
```

---

## Phase 7 — Hardening: errors, UX rules, account page, cleanup of auth edge cases

**Goal:** Production-like client behavior for the contract’s status map and booking rules.

**Depends on:** P2–P6 mostly done.

### Tasks

- [ ] **P7.1** Centralize handlers: 401 logout; 403 toast; 404; 409 message toast; 422 field bind; 429 “try later”.
- [ ] **P7.2** Disable cancel/reschedule buttons for customers when `!confirmed` or within lock; still show reason.
- [ ] **P7.3** Date picker: discourage weekends; empty availability copy for closed days.
- [ ] **P7.4** Account page (`/account`): show `GET /me` data; remove phone/password local update that calls non-existent APIs — if no update endpoint in OpenAPI, make profile **read-only** or ask human before inventing.
- [ ] **P7.5** Remove “Forgot password” dead link or hide until API exists.
- [ ] **P7.6** Ensure `completed` appointments are display-only.
- [ ] **P7.7** Rate-limit UX on login (disable submit briefly on 429).

### Acceptance

- No calls to undefined endpoints; account page doesn’t fake-update server fields; error UX consistent.

### Phase 7 starter prompt

```text
Read BACKEND_SYNC_PLAN.md Phase 7.
Harden status handling (401/403/409/422/429), customer lock-window UX, closed-day empty states, and account page without inventing endpoints missing from OpenAPI. Lint after.
```

---

## Phase 8 — Dead code removal & structure finish

**Goal:** Repo matches feature architecture; no localStorage domain leftovers; staff gone.

**Depends on:** P4–P7.

### Tasks

- [ ] **P8.1** Delete `StaffContext`, Staff pages/layouts/components, admin Staffs modals, artisan/stylist booking coupling if unused.
- [ ] **P8.2** Delete localStorage keys usage: `Appointments`, `allUsers`, `EleganceStaff`, password-bearing user blobs.
- [ ] **P8.3** Move remaining page shells to compose `features/*` hooks; shared only when 2+ consumers.
- [ ] **P8.4** Update README: how to run FE+BE, env, codegen, seeded users, booking datetime rules.
- [ ] **P8.5** Final lint + production build (`npm run build`).
- [ ] **P8.6** Manual E2E checklist (below) all green.

### Acceptance

- Build passes; no imports of deleted staff modules; README accurate.

### Phase 8 starter prompt

```text
Read BACKEND_SYNC_PLAN.md Phase 8.
Remove staff/localStorage dead code, finish feature-folder alignment, update README, run lint + build, and verify the manual E2E checklist in the plan. No new features.
```

---

## 3. Manual E2E checklist (Definition of Done for sync)

### Customer

1. Register new user → lands authenticated as `customer`.
2. Login `customer@example.com` / `password`.
3. List services from API.
4. Pick weekday date → slots appear; Sunday → empty.
5. Book slot → appointment `confirmed` with nested service.
6. List appointments (paginated if >15).
7. Reschedule to another free slot (naive body).
8. Cancel outside 120‑min window succeeds; inside window → 409 message.
9. Logout → 401 on next protected call; redirect login.

### Admin

1. Login `admin@example.com` / `password`.
2. CRUD service; delete blocked with 409 when history exists.
3. See all users’ appointments; filter by status/date.
4. Cancel/reschedule inside 120‑min window succeeds.
5. `/admin/stats` renders by_status, 30-day series, top_services, cancellation_rate.

### Negative tests

1. Book ISO `starts_at` with `T+offset` → 422 (client must not send this).
2. Double-book same slot → 422 unavailable; UI refreshes slots.
3. Customer hits admin routes → redirect/403.
4. Expired/revoked token → login.

---

## 4. File touch map (orientation for agents)

| Path (current) | Fate |
|---|---|
| `src/Context/AuthContext.jsx` | Rewrite → Sanctum session (P2) |
| `src/Context/AppointmentContext.jsx` | Replace with API hooks (P4); delete localStorage |
| `src/Context/StaffContext.jsx` | Remove (P1 disable, P8 delete) |
| `src/Components/LoginInput.jsx` / `RegisterInput.jsx` | API shapes (P2) |
| `src/Components/AppointmentForm.jsx` (+ Contact variant) | Single-service + availability (P4) |
| `src/Components/UserPanel Components/Booking.jsx` / `AppointmentCards.jsx` | API field mapping (P4) |
| `src/Pages/Admin/Dashboard.jsx` | `getAdminStats` (P6) |
| `src/Pages/Admin/Appointments.jsx` | Paginated API (P6) |
| `src/Pages/Admin/Staffs.jsx` + staff components | Delete (P8) |
| `src/Pages/Staff/**` | Delete (P8) |
| `src/main.jsx` | Routes/roles (P1, P5 services route) |
| `src/data/services.js` | Marketing-only or remove from booking (P3+) |
| `src/shared/**`, `src/features/**` | Create (P0+) |

---

## 5. Decision log / open questions (do not invent)

Ask a human before coding if needed:

1. **Profile update / password change:** not in OpenAPI — keep read-only or wait for backend.
2. **Marketing home static services images:** keep decorative static content vs bind to API names.
3. **TS migration scope:** new code TS vs whole repo — prefer TS for `shared/` + `features/` only unless asked.
4. **Codegen tool choice:** ~~orval vs openapi-typescript + openapi-fetch~~ — **picked:** `openapi-typescript` + `openapi-fetch` (P0).
5. **Remember Me:** token in localStorage vs sessionStorage only (both OK; document).

---

## 6. Agent anti-patterns (do not do)

- Hand-writing `fetch('/api/...')` types that duplicate OpenAPI.
- Sending browser-local timezone-converted `starts_at` when APP_TIMEZONE is UTC.
- Reintroducing staff/stylist because old UI had it.
- Mapping old statuses (`Pending`, `Checked In`) into API.
- Treating PATCH service as partial.
- Assuming appointment delete endpoint exists.
- Implementing multiple phases in one chat without being asked.
- Editing this plan’s API facts to match old FE — **FE must change**.

---

## 7. Progress tracker

| Phase | Status | Notes |
|---|---|---|
| P0 Contract & client | done | openapi-typescript + openapi-fetch; generated schema committed |
| P1 Roles & remove staff surface | done | Auth still localStorage until P2; staff files kept for P8 |
| P2 Auth Sanctum | pending | |
| P3 Services & availability | pending | |
| P4 Customer appointments | pending | |
| P5 Admin services CRUD | pending | |
| P6 Admin appointments & stats | pending | |
| P7 Hardening | pending | |
| P8 Dead code & README | pending | |

---

*End of plan. Next agent: start at the first `pending` phase unless the user names another.*
