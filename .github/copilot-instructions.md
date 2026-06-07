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

### Authentication in every route handler
All route handlers call `authenticate(request)` from `@/lib/auth` as the **first** operation. Returns `null` on success or a `401` `NextResponse` when `API_SECRET` is set and the header is missing/wrong:
```ts
const authError = authenticate(request);
if (authError) return authError;
```
When `API_SECRET` is not set (development), the function is a no-op.

### Dynamic route params are async (Next.js 15)
In App Router route handlers, `params` is a `Promise` and must be awaited:
```ts
export async function POST(
  request: Request,
  { params }: { params: Promise<{ pollId: string }> },
) {
  const { pollId } = await params;
```

### Unique constraint violation handling
PostgreSQL unique violations have error code `'23505'`. Route handlers that insert data with a unique key detect this specifically and return `409`:
```ts
const isUniqueViolation =
  typeof err === 'object' && err !== null && 'code' in err &&
  (err as { code: string }).code === '23505';
if (isUniqueViolation) return NextResponse.json({ error: '...' }, { status: 409 });
```

### Settings singleton
`settings` is always a single row with `id = 1`. `GET` upserts with `onConflictDoNothing`; `PUT` upserts with `onConflictDoUpdate`. Never insert additional rows.

### Poll votes upsert
`POST /api/polls/[pollId]/votes` upserts on the `(pollId, optionText)` unique index — incrementing `voteCount` atomically via `sql\`${pollResults.voteCount} + 1\`` on conflict. Rate-limited to 5 requests per IP per poll per 60 seconds using `isAllowed()` from `@/lib/rate-limit`; exceeding the limit returns `429`.

### Assessment date format
The `date` field must match `/^\d{4}-\d{2}-\d{2}$/` (ISO date, validated by Zod in the route handler).

### Poll feature docs
Before modifying poll API or poll components, read:
- `docs/POLL_API_USAGE.md` — `pollsApi` function signatures and usage patterns
- `docs/POLL_COMPONENTS.md` — component prop contracts
