# CEH Tracker — Copilot Instructions

Next.js 15 (App Router) + React 19 dashboard for tracking CEH v13 exam prep. TypeScript, Tailwind + Radix UI, TanStack Query, Drizzle ORM over PostgreSQL, Zod validation.

## Commands

Requires Node `>= 22.18.0`, npm `>= 10`.

- **Dev server:** `npm run dev` (http://localhost:3000)
- **Build:** `npm run build` (this is what CI runs)
- **Lint:** `npm run lint` (ESLint flat config)
- **Unit tests (all):** `npx vitest run` — this is what CI runs. Note `npm test` also runs e2e; use `npx vitest run` or `npm run test:watch` for unit-only.
- **Single unit test file:** `npx vitest run src/utils/calculations.test.ts`
- **Single test by name:** `npx vitest run -t "getAverageScore"`
- **E2E (all):** `npm run test:e2e` — Playwright starts the dev server automatically
- **Single e2e:** `npx playwright test e2e/smoke.spec.ts -g "loads /"`
- **Regenerate API client:** `npm run generate` (Orval, after editing `openapi.yaml`)
- **DB:** `npm run db:generate` (new migration from schema) · `npm run db:migrate` (apply) · `npm run db:studio`

CI (`.github/workflows/ci.yml`) runs only lint, `npx vitest run`, and build — **not** `db:migrate` or Playwright e2e. Migration and e2e regressions are not caught by CI; validate them locally.

`.npmrc` intentionally uses `include=dev`. Do not switch to `omit=dev`/`production=true` — it sets `NODE_ENV=production` and breaks tests and the build.

## Architecture

Request flow (client → server):

```
views/*.tsx  →  hooks/use*.ts (TanStack Query)  →  api/*.ts (hand-written)  →  api/client.ts request()
                                                                                        │ fetch /api/*
app/api/**/route.ts (Zod validate + authenticate)  →  db (Drizzle)  →  PostgreSQL
```

- **`src/app/`** — App Router. Page files (e.g. `app/page.tsx`) are thin re-exports of the real UI in **`src/views/`**. Put page-level UI in `views/`, not in `app/`.
- **`src/app/api/**/route.ts`** — Next.js route handlers implementing the HTTP API. Grouped by resource: `assessments`, `settings`, `polls`, `health`.
- **`src/api/`** — Client-side API layer. Hand-written per-resource modules (`assessments.ts`, `settings.ts`, `polls.ts`) wrap `request()` from `client.ts` (throws `ApiError` on non-2xx). `openapi.yaml` + Orval also generate react-query hooks into `src/api/generated/` (gitignored, excluded from coverage — **never hand-edit**; run `npm run generate`).
- **`src/hooks/`** — Data hooks that call the hand-written `api/*` modules through TanStack Query.
- **`src/db/`** — `schema.ts` (Drizzle tables: `assessments`, `settings`, `pollResults`) and `index.ts` (connection). Migrations live in `drizzle/`.
- **`src/lib/`** — `auth.ts`, `rate-limit.ts`, notification helpers. **`src/utils/`** — pure score/poll calculations (unit-tested). **`src/data/`** — CEH domain reference data. **`src/types/`** — shared domain interfaces.

**DB connection** (`src/db/index.ts`): exports `db` as a Proxy over a lazily-created `pg` Pool cached on `globalThis` (survives dev hot-reload; SIGTERM/SIGINT release it once). Connection string resolves `DATABASE_PUBLIC_URL` → `DATABASE_URL` → individual `PG*` vars. `drizzle.config.ts` manually loads `.env.local`.

## Conventions

- **Path alias `@/*` → `src/*`** (tsconfig + vitest). Route handlers use `@/db`, `@/lib/...`; the `src/api/*` client modules use relative imports (`../types`). Match the surrounding file.
- **Route handler contract:** call `authenticate(request)` first and return early if it yields a response; parse the body with a Zod `safeParse`; on failure return `400` with `{error, details: parsed.error.flatten()}`; return via `NextResponse.json(...)`. See `src/app/api/assessments/route.ts`.
- **Auth** (`src/lib/auth.ts`): `authenticate()` returns `NextResponse | null`. Open mode when `API_SECRET` is unset; otherwise requires `Authorization: Bearer $API_SECRET`, compared timing-safely.
- **Never trust client-derived fields.** Compute values like `percentage` and `passed` server-side in the route handler even if the client sends them (pass mark is `>= 70`).
- **Rate limiting** (`src/lib/rate-limit.ts`): in-memory sliding window via `isAllowed(key, maxRequests, windowMs)`; key by IP + resource (see poll votes route).
- **Hooks** use shared query keys from `src/data/queryKeys.ts` and perform cache-first updates through `queryClient.setQueryData` rather than always refetching.
- **SSR guard:** client `getAll()` returns `[]` when `typeof window === 'undefined'`.
- **Tests** live beside the code they cover (`*.test.ts` next to source). Vitest uses jsdom, forces `NODE_ENV=test`, and loads `src/test/setup.ts` (jest-dom matchers). Playwright smoke tests stub `**/api/**` so they run without a database — keep e2e hermetic.
- **Code style:** 4-space indent, single quotes, semicolons, no inner spaces in import braces (`import {db} from '@/db'`).
