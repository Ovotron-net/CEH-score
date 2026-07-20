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

CI (`.github/workflows/ci.yml`) runs lint, `npx vitest run`, build, `npm run test:e2e`, and `npm run test:e2e:production`. It does **not** run `db:migrate`, so validate migrations locally.

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
- **`src/api/`** — Browser-only HTTP clients (`assessments.ts`, `settings.ts`, `polls.ts`) wrapping `request()` from `client.ts`. Do not call these from RSC — use repositories. OpenAPI/Orval generation is optional offline tooling (`npm run generate`); runtime hooks use the hand-written modules.
- **`src/hooks/`** — Client TanStack Query hooks; option factories live in `src/data/queryContracts.ts`.
- **`src/data/`** — Repositories (read **and** write adapters over Drizzle + E2E fixtures), `serverQueries.ts` (SSR prefetch descriptors), domain reference data, query keys.
- **`src/db/`** — `schema.ts` (Drizzle tables: `assessments`, `settings`, `pollResults`) and `index.ts` (connection). Migrations live in `drizzle/`.
- **`src/lib/`** — `auth.ts`, `rate-limit.ts`, `routeGuard.ts`, errors. **`src/utils/`** — pure score/poll calculations (unit-tested). **`src/types/`** — shared domain interfaces (including poll DTOs).

**DB connection** (`src/db/index.ts`): exports `db` as a Proxy over a lazily-created `pg` Pool cached on `globalThis` (survives dev hot-reload; SIGTERM/SIGINT release it once). Connection string resolves `DATABASE_PUBLIC_URL` → `DATABASE_URL` → individual `PG*` vars. `drizzle.config.ts` manually loads `.env.local`.

## Conventions

- **Path alias `@/*` → `src/*`** (tsconfig + vitest). Route handlers use `@/db`, `@/lib/...`; the `src/api/*` client modules use relative imports (`../types`). Match the surrounding file.
- **Route handler contract:** use `guardRead` / `guardWrite` from `src/lib/routeGuard.ts` (auth first, then rate-limit on writes); parse body with Zod `safeParse`; on failure return `400` with `{error, details: parsed.error.flatten()}`; call repository methods — do not open `db` in routes. Map domain errors via `toErrorResponse`.
- **Auth** (`src/lib/auth.ts`): `authenticate()` returns `NextResponse | null`. Open mode is used when `API_SECRET` is unset in development/test, or in production only when `ALLOW_OPEN_API=true`; otherwise production fails closed. When `API_SECRET` is set, requests require `Authorization: Bearer $API_SECRET`, compared timing-safely.
- **Never trust client-derived fields.** Derive `percentage` / `passed` in the assessment repository (`deriveAssessmentFields`) even if the client sends them (pass mark is `>= 70`).
- **Rate limiting** (`src/lib/rate-limit.ts`): in-memory fixed window via `isAllowed(key, maxRequests, windowMs)`; key by IP + resource via `guardWrite`.
- **Hooks** use factories from `src/data/queryContracts.ts` (keys from `queryKeys.ts`) and perform cache-first updates through `queryClient.setQueryData` rather than always refetching.
- **Browser API guard:** client `getAll()` / settings `get` throw when `typeof window === 'undefined'` so accidental RSC use fails loud.
- **Tests** live beside the code they cover (`*.test.ts` next to source). Vitest uses jsdom, forces `NODE_ENV=test`, and loads `src/test/setup.ts` (jest-dom matchers). Playwright smoke tests stub `**/api/**` so they run without a database — keep e2e hermetic.
- **Code style:** 4-space indent, single quotes, semicolons, no inner spaces in import braces (`import {db} from '@/db'`).
