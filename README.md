# Appointment Front End (Elegance)

Vite + React SPA for the Appointment Booking API. Auth, services, availability, and appointments talk to a Laravel backend via Sanctum Bearer tokens. Staff/stylist is **not** part of the API and is not in the product surface.

## Requirements

- Node.js 20+ (or Bun)
- Running Laravel Appointment API (default `http://localhost:8000`)

## Setup

```bash
cp .env.example .env
npm install
npm run generate:api   # regenerates OpenAPI types into src/shared/api/generated/
npm run dev
```

### Environment

| Variable | Example | Notes |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | Include `/api`, no trailing slash |

Frontend runs on Vite’s default port (usually `http://localhost:5173`). Point the API CORS / Sanctum config at that origin.

## Seeded users (backend)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `password` |
| Customer | `customer@example.com` | `password` |

Register creates a `customer`. Role is never client-writable.

## Auth / Remember Me

- Login/register return a Sanctum token (7-day lifetime).
- **Remember Me** → token in `localStorage` (`auth_token`).
- Without Remember Me → `sessionStorage`.
- On **401**, the client clears the token and redirects to `/login`.

Legacy browser keys (`allUsers`, `Appointments`, `EleganceStaff`, `FeedbackData`, `currentUser`) are cleared on boot and are not used for domain data.

## Booking datetime rules

Backend `APP_TIMEZONE` is **UTC**. Open hours: **Mon–Fri 09:00–17:00** UTC.

1. Load slots from `GET /services/{id}/availability?date=Y-m-d` (ISO with offset).
2. Convert the chosen slot with `isoToNaiveUtc` → `YYYY-MM-DD HH:mm:ss` (**no** `T`, `Z`, or offsets).
3. Send that naive string as `starts_at` on create/reschedule.
4. Customers cannot cancel/reschedule within **120 minutes** of `starts_at` (admin can). Only `confirmed` appointments can be modified.

Helpers live in `src/shared/lib/datetime.ts`.

## OpenAPI / codegen

- Contract: `openapi/appointment-api.yaml` (source of truth).
- Script: `npm run generate:api` → `src/shared/api/generated/schema.ts`.
- Feature code uses `openapi-fetch` + generated types under `src/features/*/api`. Do not hand-write duplicate fetch types.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run generate:api` | Regenerate API types from OpenAPI |

## Architecture

```
src/
  shared/api/          # HTTP client, ApiError, generated schema
  shared/lib/          # datetime helpers
  features/
    auth/
    services/
    availability/
    appointments/
    admin/
  Pages/               # thin route shells composing feature components
  Context/             # Auth + Message only
  data/                # marketing-only static content (artisans, gallery, …)
```

Roles in the UI: **`customer`** and **`admin`** only. `/staff/*` and `/admin/staffs` redirect away.

## Tech stack

React 18, Vite 7, React Router 7, Tailwind 4, openapi-typescript + openapi-fetch, GSAP / Three.js for marketing visuals.
