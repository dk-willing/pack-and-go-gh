# Pack & Go – GH

A logistics and transportation platform for Ghana — moving everything from
standard parcels to bulk goods, heavy-duty equipment, and oversized cargo,
with intercity and long-distance capability.

This repository is the **foundation stage** of the platform: project
structure, tooling, base architecture, and a placeholder UI/API surface
that future feature work will build on. It does not yet implement the
delivery lifecycle (quotes, bookings, payments, tracking, etc.) — see
[`docs/architecture.md`](./docs/architecture.md) for what's deliberately
deferred.

## Tech stack

| Layer      | Technology |
|------------|------------|
| Frontend   | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| Backend    | Node.js, Express, TypeScript |
| Database   | MongoDB with Mongoose |
| API style  | REST, versioned under `/api/v1`, JSON |
| Validation | Zod |

## Project structure

```text
pack-and-go-gh/
├── apps/
│   ├── web/            # Next.js frontend (customer-facing site)
│   └── api/             # Express REST API
├── packages/
│   ├── types/           # Shared TypeScript types (API response envelope, roles, ...)
│   └── config/          # Shared constants (API prefix, app name)
├── docs/
│   └── architecture.md
├── .env.example
└── package.json          # npm workspaces root
```

See `docs/architecture.md` for the reasoning behind this layout and the
conventions each new feature should follow.

## Local setup

### Prerequisites

- Node.js 18.18+ (built and tested on Node 22)
- npm 10+
- A MongoDB instance (local or Atlas)

### Install

From the repository root (npm workspaces installs both apps and shared
packages in one step):

```bash
npm install
```

### Environment variables

Copy the example file and fill in real values:

```bash
cp .env.example apps/api/.env
```

The frontend only needs one public variable, which you can set in
`apps/web/.env.local`:

```text
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

See `.env.example` at the repo root for the full list of variables the API
requires (it validates all of them at startup and will refuse to boot if
one is missing).

### Run the backend

```bash
npm run dev:api
```

Starts the Express API on `http://localhost:4000` (or whatever `PORT` is
set to), connected to MongoDB. Health check:

```bash
curl http://localhost:4000/api/v1/health
```

### Run the frontend

```bash
npm run dev:web
```

Starts the Next.js app on `http://localhost:3000`.

### Build for production

```bash
npm run build:api   # builds shared packages, then apps/api → apps/api/dist
npm run build:web   # builds apps/web → apps/web/.next
```

## Environment variables reference

| Variable | Used by | Description |
|---|---|---|
| `NODE_ENV` | api | `development` \| `test` \| `production` |
| `PORT` | api | Port the Express server listens on |
| `API_VERSION` | api | API version segment (`v1`) |
| `MONGODB_URI` | api | MongoDB connection string |
| `JWT_ACCESS_SECRET` | api | Secret for signing access tokens (auth not yet implemented) |
| `JWT_REFRESH_SECRET` | api | Secret for signing refresh tokens (auth not yet implemented) |
| `JWT_ACCESS_EXPIRES_IN` | api | Access token lifetime, e.g. `15m` |
| `JWT_REFRESH_EXPIRES_IN` | api | Refresh token lifetime, e.g. `7d` |
| `CORS_ORIGIN` | api | Allowed origin for the frontend |
| `RATE_LIMIT_WINDOW_MS` | api | Rate limit window in milliseconds |
| `RATE_LIMIT_MAX_REQUESTS` | api | Max requests per window per client |
| `NEXT_PUBLIC_API_URL` | web | Base URL the frontend calls the API on |

Never commit a real `.env` file — only `.env.example` is tracked in git.

## What's next

This foundation intentionally does not implement delivery requests,
quotes, bookings, payments, shipments, tracking, driver/vehicle
management, or authentication. Those are separate feature tasks that build
on top of this structure — see `docs/architecture.md` for the full list of
planned entities and where each future feature should live.
