# CEH Tracker — Score Analytics

A dashboard for tracking Certified Ethical Hacker (CEH v13) exam preparation. Record practice, mock, and official assessment scores, visualize progress across the CEH domains, compare results on a leaderboard, and participate in community polls.

## Features

- **Dashboard** — key stats (average, best score, study streak), score trend, and domain radar.
- **Assessments** — record and manage assessment results (practice / mock / official).
- **Analytics** — performance trends and per-domain breakdowns.
- **Leaderboard** — compare scores across attempts.
- **Community Polls** — vote on polls and view aggregated poll analytics.
- **CEH Topics** — reference for the CEH domains.
- **Settings** — profile name, target score, exam date, and theme (dark / light).

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Radix UI primitives
- **Data fetching:** TanStack Query
- **Charts:** Recharts
- **Database:** PostgreSQL via [Drizzle ORM](https://orm.drizzle.team/)
- **API client:** generated from `openapi.yaml` with [Orval](https://orval.dev/)
- **Validation:** Zod
- **Testing:** Vitest + Testing Library (unit) and Playwright (e2e)

## Prerequisites

- Node.js `>= 22.18.0` and npm `>= 10`
- A PostgreSQL database

## Getting Started

1. **Install dependencies**

   ```bash
   npm ci
   ```

2. **Configure environment**

   Create a `.env.local` file in the project root with your database connection:

   ```bash
   DATABASE_URL=postgresql://user:password@localhost:5432/ceh_score
   ```

   The connection string is resolved in this order: `DATABASE_PUBLIC_URL` → `DATABASE_URL` → the individual `PGUSER` / `PGPASSWORD` / `PGHOST` / `PGPORT` / `PGDATABASE` variables.

3. **Apply database migrations**

   ```bash
   npm run db:migrate
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   The app runs at [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                  | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| `npm run dev`           | Start the Next.js dev server                          |
| `npm run build`         | Production build                                      |
| `npm run start`         | Start the production server                           |
| `npm run lint`          | Run ESLint                                            |
| `npm run generate`      | Regenerate the API client from `openapi.yaml` (Orval) |
| `npm run db:generate`   | Generate a new Drizzle migration from the schema      |
| `npm run db:migrate`    | Apply pending migrations                              |
| `npm run db:studio`     | Open Drizzle Studio                                   |
| `npm test`              | Run unit tests, then e2e tests                        |
| `npm run test:watch`    | Run Vitest in watch mode                              |
| `npm run test:coverage` | Unit tests with coverage                              |
| `npm run test:e2e`      | Run Playwright e2e tests                              |
| `npm run test:e2e:ui`   | Run Playwright in UI mode                             |

## Project Structure

```
src/
  api/          API client + Orval-generated hooks
  app/          Next.js App Router pages and API routes
  components/   UI components (incl. charts and shadcn-style primitives)
  data/         CEH domain reference data
  db/           Drizzle schema and connection
  hooks/        Data hooks (assessments, polls, settings)
  lib/          Auth, rate limiting, notifications
  utils/        Score calculations and poll summaries
  views/        Page-level views (Dashboard, Assessments, etc.)
drizzle/        SQL migrations
e2e/            Playwright smoke tests
openapi.yaml    API contract (source for the generated client)
```

## API

The HTTP API is defined in [openapi.yaml](openapi.yaml) (`CEH Score API`) and implemented as Next.js route handlers under `src/app/api/`:

- `assessments` — CRUD for assessment records
- `settings` — user profile and preferences
- `polls` — poll voting and results
- `health` — health check at `/api/health`

After changing `openapi.yaml`, regenerate the typed client with `npm run generate`.

The API has two deployment modes:

- **Public single-user UI (supported browser mode):** set `ALLOW_OPEN_API=true` and leave `API_SECRET` unset. **All reads and writes to the shared assessments, settings, and polls data are unauthenticated.** Anyone who can reach the deployment can view or change that data.
- **Bearer-protected API only:** set `API_SECRET` and leave `ALLOW_OPEN_API` unset. Non-health API requests require `Authorization: Bearer <API_SECRET>`. This mode is incompatible with the browser UI: browser mutations do not send the bearer secret, and the pages do not have session authentication. Do not treat `API_SECRET` as UI access control.

Never place `API_SECRET` in a `NEXT_PUBLIC_*` variable or serialize it into page props, HTML, JavaScript, React Query dehydration, or any other hydration payload. Private browser access requires page and API session authentication, which is not implemented.

## Testing

- **Unit tests** (Vitest): `npm run test:watch`
- **E2E tests** (Playwright): `npm run test:e2e`

Playwright starts the dev server automatically. The smoke tests stub the `/api/**` routes so they run without a live database.

## Deployment

The project is configured for [Railway](https://railway.app/) (see [railway.toml](railway.toml)) and [Vercel](https://vercel.com/) (see [vercel.json](vercel.json)):

- **Build:** `npm ci && npm run build`
- **Start:** `npm run start`
- **Health check:** `/api/health`

Set the database environment variables in your hosting provider and run migrations against the production database before or during deploy.

For the supported public single-user UI deployment, configure:

```dotenv
ALLOW_OPEN_API=true
# API_SECRET is intentionally unset
```

This is an explicit public-data decision: every shared assessment, setting, and poll read or write is unauthenticated. If that risk is unacceptable, do not expose the UI; session authentication must be implemented before a private UI deployment is supported.
