# Architecture

This document is the reference point for anyone (human or agent) adding a
feature to Pack & Go – GH. It explains what's already in place and the
conventions new work should follow.

## System overview

Two independently deployable applications share a small amount of code
through npm workspaces:

```text
apps/web  (Next.js)  ──HTTP (JSON)──▶  apps/api  (Express)  ──▶  MongoDB
     │                                      │
     └──────────── packages/types ──────────┘
     └──────────── packages/config ─────────┘
```

- **`apps/web`** never talks to MongoDB directly and never embeds business
  logic — it only calls `apps/api` over HTTP through the centralized API
  client (`apps/web/lib/apiClient.ts`).
- **`apps/api`** owns all business logic and data access.
- **`packages/types`** and **`packages/config`** hold only what must
  genuinely stay identical on both sides (the API response envelope, role
  enum, the API version prefix). They are built to `dist/` and consumed as
  normal npm packages — do not import their `.ts` source directly across
  the app boundary.

## Backend architecture

Every request flows through the same pipeline:

```text
Request → Route → Middleware → Validation → Controller → Service → Model → Response
```

- **Routes** (`src/routes/`) — declare paths and HTTP methods only. No
  logic. `src/routes/index.ts` is the v1 router aggregator; each resource
  gets its own `*.routes.ts` mounted there.
- **Middleware** (`src/middleware/`) — cross-cutting concerns: security
  headers, CORS, rate limiting, 404 handling, centralized error handling.
  Auth/authorization middleware will be added here when auth is
  implemented.
- **Validators** (`src/validators/`) — Zod schemas per resource, run
  before the controller. Empty in the foundation stage; add one file per
  resource as each feature lands (e.g. `deliveryRequest.validator.ts`).
- **Controllers** (`src/controllers/`) — translate HTTP ⇄ service calls.
  Thin: parse input, call a service, send a response via `sendSuccess()`
  or throw an `ApiError`. No business logic and no direct database calls.
- **Services** (`src/services/`) — business logic. Framework-agnostic (no
  `req`/`res`), so they can be reused outside an HTTP handler later (a
  background job, a script). Empty in the foundation stage.
- **Models** (`src/models/`) — Mongoose schemas, one file per entity. None
  exist yet; see "Planned entities" below for what's coming and roughly
  when.

### Error handling

- Throw `ApiError.badRequest()/notFound()/unauthorized()/...` (see
  `src/utils/ApiError.ts`) for any expected, operational failure.
  `asyncHandler()` wraps async controllers so a thrown/rejected error is
  automatically forwarded to `next()`.
- `src/middleware/errorHandler.ts` is the single place that turns an error
  into an HTTP response. `ApiError`s return their intended status code and
  message; anything else is logged in full server-side and returns a
  generic message to the client, in every environment — no stack traces
  or internal details ever reach the response body.

### API conventions

- Everything is mounted under `/api/v1` (`API_PREFIX` in
  `packages/config`).
- Every response — success or error — matches
  `ApiResponse<T>` from `packages/types`:

  ```json
  { "success": true, "message": "...", "data": { } }
  { "success": false, "message": "...", "errors": { "field": ["reason"] } }
  ```

- Controllers respond via `sendSuccess(res, statusCode, message, data)` —
  never `res.json()` directly — so the envelope can't drift.

### Environment & configuration

`src/config/env.ts` validates every environment variable with Zod at
process startup and exits with a readable error if something required is
missing or malformed, rather than failing confusingly at runtime.
`src/config/database.ts` owns the Mongoose connection and also exits the
process if the initial connection fails, so misconfiguration is caught
immediately.

### Security foundation already in place

- `helmet()` for security headers.
- `cors()` restricted to `CORS_ORIGIN`, with credentials enabled (needed
  for the HTTP-only cookie auth strategy planned below).
- `express.json({ limit: "10kb" })` — request body size limit.
- `express-rate-limit` applied globally; add stricter, endpoint-specific
  limiters (e.g. on a future login endpoint) alongside it.
- No secrets committed — `.env` is gitignored, `.env.example` documents
  the shape only.

### Authentication (prepared, not implemented)

The architecture is ready for, but does not yet implement:

- Password hashing (bcrypt or argon2 — not yet a dependency).
- Access/refresh JWT pair, secrets already validated via `env.ts`.
- HTTP-only cookies (`cookie-parser` already wired into `app.ts`; CORS
  already allows credentials).
- Role-based authorization using `UserRole` from `packages/types`
  (`customer` | `driver` | `operations` | `admin`).

When auth is implemented, it should add: a `User` model, an
`auth.routes.ts` / `auth.controller.ts` / `auth.service.ts`, and an
`authenticate` / `authorize(...roles)` middleware pair in
`src/middleware/`.

## Frontend architecture

- App Router (`apps/web/app/`). Each route segment is a plain
  placeholder page today; feature logic gets added to these same files
  incrementally rather than restructuring them.
- **Components** (`apps/web/components/`) are the reusable UI primitives:
  `Button`, `Card`, `Container`, `SectionHeading`, `Field` (Input/Select/
  Textarea/Label), `Modal`, `States` (Loading/Error/Empty), `Navbar`,
  `Footer`, plus two brand-specific pieces: `RouteLine` (hero motif) and
  `RouteStepper` (used for the delivery lifecycle, and reusable for any
  future genuinely-sequential UI).
- **API client** (`apps/web/lib/apiClient.ts`) is the only place `fetch()`
  is called. Resource-specific clients (`deliveryRequestApi`, `quoteApi`,
  `bookingApi`, ...) should be added here as thin wrappers around
  `apiClient.get/post/patch/delete`, following the `healthApi` example
  already in the file. Never call `fetch()` directly from a component.
- **Hooks** (`apps/web/hooks/`) wrap an API client call with loading/error
  state for use in client components, following the `useHealthCheck`
  example.
- **Types** (`apps/web/types/`) — frontend-only types (component props,
  page view-models). Anything that must match the backend's shape belongs
  in `packages/types` instead.

### Design system

- **Palette**: deep navy (`#0E1B2A`) as the base/trust tone, a cool paper
  background (`#F4F6F5`, deliberately not a warm cream), an amber "route"
  accent (`#E8A33D`) used sparingly, and a transit green (`#2F9E68`)
  reserved for in-progress/success states. Defined as Tailwind theme
  tokens in `apps/web/tailwind.config.js`.
- **Type**: Space Grotesk for display/headings, IBM Plex Sans for body
  text — loaded via `app/globals.css`.
- **Motif**: a "route" — a line from a pickup point to a destination — is
  the platform's one recurring visual idea. It appears once, boldly, as
  the homepage hero illustration (`RouteLine`), and is reused functionally
  (not decoratively) as the five-stage delivery-lifecycle stepper
  (`RouteStepper`), which is a legitimate numbered sequence.
- Card weight (`Card` component's `light`/`bold` variant) is used instead
  of identical cards everywhere — heavier cargo categories (heavy-duty
  equipment, oversized cargo) render as visually heavier.

## Database approach

MongoDB via Mongoose. No models exist yet — the foundation stage only
establishes the connection (`src/config/database.ts`). Models are added
one at a time, alongside the feature that needs them, following this
rough grouping (not a strict order — later features may need entities
from an earlier group too):

1. **Identity** — `User`, `Customer`, `Business`, `Driver`, `Vehicle`
2. **Core lifecycle** — `DeliveryRequest`, `Cargo`, `Quote`, `Booking`,
   `Shipment`, `TrackingEvent`, `ProofOfDelivery`
3. **Money** — `Payment`, `Invoice`
4. **Operations** — `MaintenanceRecord`, `Incident`, `Claim`,
   `SupportTicket`, `Notification`, `AuditLog`

Each model should live in its own file in `src/models/`
(`User.model.ts`, `DeliveryRequest.model.ts`, ...) — no single file
should hold more than one entity's schema.

## Development conventions

- **TypeScript everywhere**, `strict: true` in both apps. Avoid `any`
  unless there's a specific, commented reason.
- **No business logic in routes or controllers** — it belongs in a
  service.
- **No giant files** — one model per file, one resource per
  routes/controller/service/validator file.
- **Shared types only when they must match across the HTTP boundary.**
  Default to keeping a type local to the app that owns it.
- **Every new backend response goes through `sendSuccess()` /
  `ApiError`** so the envelope stays consistent without individual
  developers having to remember the shape.
- **Every new frontend network call goes through `apiClient`**, not a
  bare `fetch()`.
