# Copilot Instructions – CEH Score Tracker

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build (also validates TypeScript)
npm run lint         # ESLint via Next.js lint runner
npm run generate     # Regenerate Orval API client from openapi.yaml

npm run db:generate  # Generate Drizzle migration files from schema changes
npm run db:migrate   # Apply pending migrations to the database
npm run db:studio    # Open Drizzle Studio (DB browser UI)
```

> There is no test runner configured. Validate changes with `npm run lint` and `npm run build`.

---

## Architecture

### Request flow

```
Browser
  └─ src/hooks/use*.ts          (TanStack Query — data fetching + cache management)
       └─ src/api/*.ts           (thin HTTP wrappers using request() from client.ts)
            └─ /api/* route handlers   (src/app/api/**/ — server-side, Drizzle + Zod)
                 └─ src/db/           (Drizzle ORM — schema, lazy singleton db client)
```

### Key layers

| Layer | Path | Responsibility |
|---|---|---|
| Page routes | `src/app/*/page.tsx` | Render `src/views/*.tsx` page components |
| API handlers | `src/app/api/**/route.ts` | Zod validation → Drizzle DB operations → JSON response |
| Query hooks | `src/hooks/use*.ts` | TanStack Query wrappers; optimistic cache updates via `setQueryData` |
| API modules | `src/api/*.ts` | Thin HTTP wrappers calling `request()` from `src/api/client.ts` |
| Generated client | `src/api/generated/` | Orval-generated React Query hooks from `openapi.yaml`; **gitignored** |
| DB schema | `src/db/schema.ts` | Drizzle table definitions (source of truth for DB shape) |
| Types | `src/types/index.ts` | Shared TypeScript interfaces (`Assessment`, `UserSettings`, `CEHDomain`) |
| Views | `src/views/*.tsx` | Page-level client components (consumed by `app/*/page.tsx`) |
| UI components | `src/components/ui/` | shadcn/ui primitives |

### Database

- PostgreSQL via `drizzle-orm/node-postgres`
- Schema tables: `assessments`, `settings`, `poll_results`
- DB client (`src/db/index.ts`) is a **lazy singleton** using a Proxy — safe to import at module scope in route handlers
- Connection string resolution order: `DATABASE_PUBLIC_URL` → `DATABASE_URL` → individual `PG*` env vars (`PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, `PGDATABASE`)

---

## Key Conventions

### Server-computed fields
`percentage` and `passed` are **never sent by the client** — they are computed in `POST /api/assessments`:
```ts
const percentage = Math.round((score / maxScore) * 100);
const passed = percentage >= 70;
```

### Zod validation in all API routes
Every route handler validates `request.json()` with a Zod schema before touching the DB. Invalid input returns `400` with `parsed.error.flatten()`.

### Path alias
`@/` maps to `src/`. Use `@/db`, `@/components`, etc. in all imports within `src/`.

### SSR guard in API modules
Some API modules guard against server-side execution by returning a safe default for their return type:
```ts
// assessments.ts — returns empty array
if (typeof window === 'undefined') return [];

// settings.ts — returns typed default object
if (typeof window === 'undefined') {
  return { name: 'Author', targetScore: 85, examDate: '', theme: 'dark' };
}
```
Return the appropriate empty/default value for the function's return type. Add this guard to any function that may be called inside a `useQuery` or during SSR; mutation/event-driven functions don't need it.

### Orval-generated client
- Source of truth: `openapi.yaml`
- Run `npm run generate` after any spec change
- Output (`src/api/generated/`) is gitignored; do not edit generated files
- Uses `src/api/mutator.ts` (`customFetch`) as the fetch adapter, which bridges to the same `ApiError` class used by hand-written API modules

### TanStack Query cache updates
Mutations use `qc.setQueryData` for optimistic local updates rather than refetching — keep this pattern when adding new mutations.

### No `pages/` directory
This project uses **Next.js App Router only** (`src/app/`). Do not use `getServerSideProps`, `getStaticProps`, or `pages/` patterns.
