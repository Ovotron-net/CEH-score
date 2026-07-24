# CEH Tracker

Single-tenant dashboard for tracking **Certified Ethical Hacker (CEH v13)** exam prep. Record practice, mock, and official assessment scores, visualize progress across CEH domains, compare attempts on a leaderboard, and vote in community polls.

> **Trust model:** this is a personal score tracker, not a multi-user product. There are no accounts, sessions, or per-user ownership. The supported public UI mode (`ALLOW_OPEN_API=true`, `API_SECRET` unset) leaves **all shared assessments, settings, and poll data unauthenticated**. Anyone who can reach the deployment can read or change that data. See [SECURITY.md](SECURITY.md).

## Features

| Area | What you get |
| ---- | ------------ |
| **Dashboard** | Readiness overview (score, status, countdown), WebGL readiness shield with graceful fallback, key stats, score trend, domain radar |
| **Assessments** | Create, list, and delete practice / mock / official results |
| **Analytics** | Trends and per-domain breakdowns |
| **Leaderboard** | Compare attempts side by side |
| **Community Polls** | Vote and review aggregated results / poll analytics |
| **CEH Topics** | Reference for CEH v13 domains and topic lists |
| **Settings** | Display name, target score, exam date, dark / light theme |

## Tech stack

- **App:** [Next.js 15](https://nextjs.org/) (App Router) + React 19 + TypeScript
- **UI:** Tailwind CSS, Radix UI primitives, Recharts, Three.js (readiness shield)
- **Data:** PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/), TanStack Query
- **API:** Next.js route handlers + [OpenAPI](openapi.yaml) contract; typed client via [Orval](https://orval.dev/)
- **Validation:** Zod (routes) with matching DB `CHECK` constraints
- **Tests:** Vitest + Testing Library (unit), Playwright (e2e, a11y, production)

## Prerequisites

- Node.js `>= 22.18.0` and npm `>= 10`
- PostgreSQL database

## Getting started

### 1. Install

```bash
npm ci
```

### 2. Environment

Copy the example env file and edit as needed:

```bash
cp .env.example .env.local
```

Minimum for local UI development:

```dotenv
DATABASE_URL=postgresql://user:password@localhost:5432/ceh_score
ALLOW_OPEN_API=true
# Leave API_SECRET unset for the browser UI
```

| Variable | Purpose |
| -------- | ------- |
| `DATABASE_URL` | Preferred Postgres connection string |
| `DATABASE_PUBLIC_URL` | Alternate URL (wins over `DATABASE_URL` when set) |
| `PGUSER` / `PGPASSWORD` / `PGHOST` / `PGPORT` / `PGDATABASE` | Fallback when no full URL is set |
| `ALLOW_OPEN_API` | Set `true` for the supported public single-user UI |
| `API_SECRET` | Bearer secret for **API-only** clients; must stay unset for the browser UI |

Connection resolution order: `DATABASE_PUBLIC_URL` → `DATABASE_URL` → individual `PG*` variables.

API traffic is **same-origin only**. There is no supported cross-origin API base URL (server hydration reads the DB directly; CSP `connect-src` is `'self'`).

### 3. Migrate

```bash
npm run db:migrate
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run generate` | Regenerate API client from `openapi.yaml` (Orval) |
| `npm run db:generate` | Generate Drizzle migration from schema |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm test` | Unit tests, then e2e |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:coverage` | Unit tests with coverage |
| `npm run test:e2e` | Playwright e2e |
| `npm run test:e2e:production` | Playwright against a production-style build |
| `npm run test:e2e:ui` | Playwright UI mode |

## Project structure

```text
src/
  api/            Orval-generated client + thin API wrappers
  app/            App Router pages and route handlers under api/
  components/     UI (charts, readiness shield, shell, shadcn-style primitives)
  data/           Repositories, query contracts, CEH domain reference, e2e fixtures
  db/             Drizzle schema and connection
  hooks/          Client data hooks (assessments, polls, settings)
  lib/            Auth mode, rate limiting, query client, security logging
  utils/          Score math, domain stats, poll summaries
  views/          Page-level views
drizzle/          SQL migrations
e2e/              Playwright smoke, accessibility, and latency tests
openapi.yaml      HTTP API contract (source of truth for the typed client)
next.config.ts    Single Next config (security headers + tracing root)
SECURITY.md       Trust model, deployment checklist, vulnerability reporting
```

## API

Contract: [openapi.yaml](openapi.yaml). Implementation: `src/app/api/`.

| Surface | Role |
| ------- | ---- |
| `/api/assessments` | List / create / clear assessments |
| `/api/assessments/{id}` | Delete one assessment |
| `/api/settings` | Get / update global settings |
| `/api/polls` | List poll results |
| `/api/polls/{pollId}` | Poll stats |
| `/api/polls/{pollId}/votes` | Cast a vote |
| `/api/health` | Health check (no auth) |

Derived fields such as `percentage` and `passed` are computed on the server; clients must not send them on create.

After changing `openapi.yaml`:

```bash
npm run generate
```

### Auth modes

| Mode | Config | Use when |
| ---- | ------ | -------- |
| **Public single-user UI** (supported browser mode) | `ALLOW_OPEN_API=true`, `API_SECRET` unset | Personal dashboard exposed over HTTPS; all shared data is public to whoever can reach the app |
| **Bearer API only** | Strong `API_SECRET`, `ALLOW_OPEN_API` unset | Trusted non-browser clients sending `Authorization: Bearer <API_SECRET>` |

`API_SECRET` mode is **not** UI access control. Browser mutations do not attach the secret, pages are not login-protected, and SSR hydration is not an authorization boundary. Never put `API_SECRET` in a `NEXT_PUBLIC_*` variable or any hydration payload.

## Testing

- **Unit (Vitest):** `npm run test:watch` — includes guards that only one `next.config.*` exists so security headers cannot be shadowed.
- **E2E (Playwright):** `npm run test:e2e` — starts the dev server with `E2E_FIXTURES=true` and stubs `/api/**` so a live DB is not required for smoke tests. Also asserts security response headers (HSTS, CSP, frame deny, etc.).

```bash
npm test                 # unit + e2e
npm run test:coverage    # unit coverage only
```

## Security controls (app layer)

Documented in detail in [SECURITY.md](SECURITY.md). High level:

- Explicit public vs API-only deployment modes
- Zod validation on every mutating API route
- Server-side derived fields and DB `CHECK` constraints
- In-memory IP-based rate limiting on writes
- Response headers from `next.config.ts`: HSTS, CSP, `X-Frame-Options: DENY`, `nosniff`, referrer policy, permissions policy
- No `dangerouslySetInnerHTML` (lint-enforced)

## Deployment

Configured for [Railway](https://railway.app/) ([railway.toml](railway.toml)) and [Vercel](https://vercel.com/) ([vercel.json](vercel.json)).

| Step | Command / path |
| ---- | -------------- |
| Install / build | `npm ci && npm run build` |
| Start | `npm run start` |
| Health check | `GET /api/health` |

1. Set database env vars on the host (prefer a least-privilege Postgres role).
2. Run `npm run db:migrate` against production (before or as part of deploy).
3. For the supported public UI:

   ```dotenv
   ALLOW_OPEN_API=true
   # API_SECRET intentionally unset
   ```

4. Enforce HTTPS at the platform edge; the app also sends HSTS.

If unauthenticated shared data is unacceptable, do not expose the UI until page and API session authentication exist.

## License

Private project (`"private": true` in `package.json`). All rights reserved unless a license file is added.
