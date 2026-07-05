# CEH Score Tracker

A Next.js 15 dashboard for tracking **Certified Ethical Hacker (CEH)** exam preparation — log practice
assessments, monitor progress against a target score, explore per-domain performance, and run community polls.

## Features

- **Assessment tracking** — record practice, mock, and official attempts with score, time taken, and CEH domain
- **Analytics** — trend charts and stats powered by Recharts
- **Topics / domains** — per-domain breakdown across the CEH knowledge areas
- **Leaderboard** — compare assessment results
- **Polls** — create polls and cast rate-limited votes with atomic vote counting
- **Settings** — configurable display name, target score, exam date, and dark/light theme

## Tech Stack

| Concern            | Technology                                               |
| ------------------ | -------------------------------------------------------- |
| Framework          | [Next.js 15](https://nextjs.org/) (App Router), React 19 |
| Language           | TypeScript                                               |
| Data fetching      | [TanStack Query](https://tanstack.com/query)             |
| Database           | PostgreSQL via [Drizzle ORM](https://orm.drizzle.team/)  |
| Validation         | [Zod](https://zod.dev/)                                  |
| UI                 | Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/)       |
| API client codegen | [Orval](https://orval.dev/) (from `openapi.yaml`)        |
| Testing            | Vitest + Testing Library, Playwright (e2e)               |

## Getting Started

### Prerequisites

- Node.js `>=22.18.0` and npm `>=10`
- A PostgreSQL database

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (see below), then apply migrations
npm run db:migrate

# 3. Start the dev server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Environment variables

The database connection string is resolved in this order:

1. `DATABASE_PUBLIC_URL`
2. `DATABASE_URL`
3. Individual `PG*` vars — `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, `PGDATABASE`

Optional:

- `NEXT_PUBLIC_API_BASE_URL` — redirect API calls away from the same-origin default
- `API_SECRET` — when set, all route handlers require a matching auth header (no-op in development when unset)

## Scripts

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build (also validates TypeScript)
npm run start        # Start the production server
npm run lint         # ESLint

npm run generate     # Regenerate the Orval API client from openapi.yaml

npm run db:generate  # Generate Drizzle migration files from schema changes
npm run db:migrate   # Apply pending migrations
npm run db:studio    # Open Drizzle Studio (DB browser UI)

npm run test         # Run unit (Vitest) + e2e (Playwright)
npm run test:watch   # Vitest in watch mode
npm run test:coverage# Vitest with coverage
npm run test:e2e     # Playwright e2e tests
npm run test:e2e:ui  # Playwright in UI mode
```

## Architecture

Request flow follows a clear layered path:

```
Browser
  └─ src/hooks/use*.ts        (TanStack Query — data fetching + cache)
       └─ src/api/*.ts         (thin HTTP wrappers over request() in client.ts)
            └─ src/app/api/**/route.ts   (Zod validation → Drizzle → JSON)
                 └─ src/db/    (Drizzle ORM — schema + lazy singleton client)
```

| Layer            | Path                      | Responsibility                                  |
| ---------------- | ------------------------- | ----------------------------------------------- |
| Page routes      | `src/app/*/page.tsx`      | Render view components                          |
| Views            | `src/views/*.tsx`         | Page-level client components                    |
| API handlers     | `src/app/api/**/route.ts` | Zod validation → Drizzle operations → JSON      |
| Query hooks      | `src/hooks/use*.ts`       | TanStack Query wrappers with optimistic updates |
| API modules      | `src/api/*.ts`            | HTTP wrappers over `request()`                  |
| Generated client | `src/api/generated/`      | Orval-generated hooks (gitignored)              |
| DB schema        | `src/db/schema.ts`        | Drizzle table definitions                       |
| Types            | `src/types/index.ts`      | Shared TypeScript interfaces                    |
| UI components    | `src/components/ui/`      | shadcn/ui primitives                            |

The `@/` path alias maps to `src/`.

### Database schema

- `assessments` — logged attempts; `percentage` and `passed` are computed server-side in `POST /api/assessments`
- `settings` — a single row (`id = 1`) managed via upsert
- `poll_results` — poll options with atomic vote increments on the `(pollId, optionText)` unique index

## Conventions

- **Server-computed fields:** clients never send `percentage` or `passed` — the API derives them
  (`passed` when `percentage >= 70`).
- **Validation:** every route handler validates the request body with Zod before touching the DB; invalid input
  returns `400` with flattened error details.
- **Auth first:** route handlers call `authenticate(request)` as their first operation.
- **Cache-first mutations:** hooks update the query cache with `setQueryData` rather than refetching.
- **Orval client:** `openapi.yaml` is the source of truth — run `npm run generate` after any spec change; the
  generated `src/api/generated/` output is gitignored.

## Poll feature

Before changing the poll API or components, see:

- [docs/POLL_API_USAGE.md](docs/POLL_API_USAGE.md)
- [docs/POLL_COMPONENTS.md](docs/POLL_COMPONENTS.md)
- [docs/POLL_FORM_EXAMPLE.md](docs/POLL_FORM_EXAMPLE.md)

## Deployment

Deployment configuration is included for **Railway** (`railway.toml`) and **Vercel** (`vercel.json`). Ensure the
database environment variables are set in your hosting provider and that migrations are applied.
