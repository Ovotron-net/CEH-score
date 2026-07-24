# AGENTS.md — CEH Tracker

Guidance for AI coding agents working in this repository.

## What this project is

**CEH Tracker** (`ceh-score`) is a **single-tenant** dashboard for tracking Certified Ethical Hacker (CEH v13) exam prep. Users record practice / mock / official assessment scores, view domain analytics, compare attempts, and vote in community polls.

There are **no accounts, sessions, or per-user ownership**. Settings are one global row; assessments and polls are shared globally. Read [SECURITY.md](SECURITY.md) and the trust model in [README.md](README.md) before changing auth, API surface, or deployment config.

## Stack

| Layer | Choice |
| ----- | ------ |
| App | Next.js 15 (App Router), React 19, TypeScript |
| UI | Tailwind CSS, Radix UI, Recharts, Three.js (readiness shield) |
| Data | PostgreSQL, Drizzle ORM, TanStack Query |
| API | Route handlers + [openapi.yaml](openapi.yaml); Orval optional for types |
| Validation | Zod on routes; DB `CHECK` constraints mirror bounds |
| Tests | Vitest + Testing Library (unit), Playwright (e2e / a11y / production) |

**Node `>= 22.18.0`, npm `>= 10`.** `.npmrc` uses `include=dev` — do not switch to `omit=dev` / `production=true` (it forces `NODE_ENV=production` and breaks tests/build).

## Commands

| Task | Command |
| ---- | ------- |
| Install | `npm ci` |
| Dev server | `npm run dev` → http://localhost:3000 |
| Lint | `npm run lint` |
| Unit tests (CI) | `npx vitest run` |
| Unit watch | `npm run test:watch` |
| Single unit file | `npx vitest run src/utils/calculations.test.ts` |
| Single unit by name | `npx vitest run -t "getAverageScore"` |
| E2E | `npm run test:e2e` (starts dev server; stubs `/api/**`) |
| Single e2e | `npx playwright test e2e/smoke.spec.ts -g "loads /"` |
| Production e2e | `npm run test:e2e:production` |
| Full local suite | `npm test` (= unit + e2e) |
| Build | `npm run build` |
| OpenAPI client | `npm run generate` (after editing `openapi.yaml`) |
| DB migrate | `npm run db:generate` · `npm run db:migrate` · `npm run db:studio` |

**CI** (`.github/workflows/ci.yml`): lint → `npx vitest run` → build → e2e → production e2e. It does **not** run `db:migrate`; validate migrations locally.

**Env:** copy `.env.example` → `.env.local`. Minimum for local UI:

```dotenv
DATABASE_URL=postgresql://user:password@localhost:5432/ceh_score
ALLOW_OPEN_API=true
# Leave API_SECRET unset for the browser UI
```

Connection order: `DATABASE_PUBLIC_URL` → `DATABASE_URL` → `PG*` vars. API is **same-origin only** (no cross-origin API base URL; CSP `connect-src 'self'`).

## Architecture

```
views/*.tsx
  → hooks/use*.ts (TanStack Query)
  → api/*.ts (hand-written browser clients)
  → api/client.ts request() → fetch /api/*

app/api/**/route.ts
  → guardRead / guardWrite (auth + rate limit)
  → Zod safeParse
  → data/*Repository.ts (Drizzle)
  → PostgreSQL
```

SSR hydration prefetches via `src/data/serverQueries.ts` + shared keys in `queryKeys.ts` / factories in `queryContracts.ts`.

| Path | Role |
| ---- | ---- |
| `src/app/` | App Router pages (thin) + `api/**` route handlers |
| `src/views/` | Page-level UI — put feature UI here, not in `app/` |
| `src/components/` | Charts, shell, readiness shield, shadcn-style UI |
| `src/api/` | Browser HTTP clients only — **not** for RSC |
| `src/hooks/` | Client TanStack Query hooks |
| `src/data/` | Repositories, query contracts/keys, CEH domains, e2e fixtures |
| `src/db/` | Drizzle schema + lazy `pg` Pool (`globalThis`-cached) |
| `src/lib/` | Auth, rate limit, route guard, security log, query client |
| `src/utils/` | Pure score / domain / poll math (unit-tested) |
| `src/types/` | Shared domain types |
| `drizzle/` | SQL migrations |
| `e2e/` | Playwright smoke, a11y, latency |
| `openapi.yaml` | HTTP contract source of truth for typed client gen |

## Conventions agents must follow

### Layout & imports

- Path alias `@/*` → `src/*`. Match surrounding file style for relative vs `@/` imports.
- Code style: **4-space indent**, single quotes, semicolons, no spaces inside import braces: `import {db} from '@/db'`.
- Tests live next to source: `*.test.ts` / `*.test.tsx`.

### API routes

1. Use `guardRead` / `guardWrite` from `src/lib/routeGuard.ts` (auth first; rate-limit on writes).
2. Validate bodies with Zod `safeParse`; on failure return `400` with `{error, details: parsed.error.flatten()}`.
3. Call **repositories** — do not open `db` directly in routes.
4. Map domain errors with `toErrorResponse` / helpers in `src/lib/errors.ts`.

### Auth & security (non-negotiable)

- Modes: public UI (`ALLOW_OPEN_API=true`, `API_SECRET` unset) **or** bearer API-only (`API_SECRET` set). Production without either fails closed (503).
- **Never** put `API_SECRET` in `NEXT_PUBLIC_*`, page props, dehydrated Query state, logs, or client code.
- **Never** trust client-derived fields: compute `percentage` / `passed` server-side (pass mark `>= 70`) even if the client sends them.
- Do not add `dangerouslySetInnerHTML` (`react/no-danger` lint).
- Keep a **single** `next.config.ts` (tests guard against shadowed configs that would drop security headers).
- CSP intentionally allows Vercel Speed Insights (`va.vercel-scripts.com`, `vitals.vercel-insights.com`); do not broaden further without updating `next-config-security.test.ts`.
- Rate-limit IP extraction trusts `x-real-ip` / XFF only when `TRUST_PROXY_HEADERS=true` or on Vercel/Railway (see `src/lib/rate-limit.ts`).
- Fixed polls (`src/data/polls.ts` definitions) reject free-form `optionText`; custom poll IDs may still use free-form options up to the cap.
- Do not introduce multi-user auth half-measures without an explicit product decision; current model is intentional single-tenant shared data.
- Do not add a GitHub Pages static export workflow; production is Railway/Vercel with `npm run build` / `npm run start` + Postgres.

### Client vs server data

- Browser clients in `src/api/*` throw if `typeof window === 'undefined'` — accidental RSC use should fail loud.
- RSC / route handlers use repositories (`src/data/*Repository.ts`), not browser API modules.
- Hooks use `queryContracts` factories; prefer `queryClient.setQueryData` for cache updates when already done that way in neighboring code.

### OpenAPI

- Runtime hooks use **hand-written** `src/api/{assessments,settings,polls}.ts`.
- After changing `openapi.yaml`, run `npm run generate`. Keep route Zod schemas aligned with the contract.

### Database

- Schema: `src/db/schema.ts` — tables `assessments`, `settings`, `pollResults`.
- New columns/constraints → update schema → `npm run db:generate` → review SQL → `npm run db:migrate`.
- Mirror validation bounds with DB `CHECK` constraints.

### Testing

- Vitest: jsdom, `NODE_ENV=test`, setup in `src/test/setup.ts`.
- Playwright: hermetic smoke (stubs `**/api/**`, `E2E_FIXTURES=true`); keep e2e free of a live DB requirement for smoke paths.
- Prefer unit tests for pure utils and repository/route contracts; add view tests when changing user-visible behavior.

## Do / don't quick list

**Do**

- Put page UI in `src/views/`, thin pages in `src/app/`.
- Validate every mutation with Zod; derive server fields in repositories.
- Run `npx vitest run` (and targeted e2e) before claiming a fix is done.
- Read `SECURITY.md` when touching auth, headers, CSP, rate limits, or env docs.

**Don't**

- Call `src/api/*` from server components.
- Commit secrets or write `.env.local`.
- Assume `API_SECRET` protects the browser UI.
- Add a second Next config or weaken CSP/`connect-src` without an explicit need and header tests.
- Scope-creep multi-tenant auth unless the user asks for it.

## Related docs

- [README.md](README.md) — setup, scripts, API table, deploy
- [SECURITY.md](SECURITY.md) — trust model, checklist, reporting
- [.github/copilot-instructions.md](.github/copilot-instructions.md) — shorter Copilot-focused twin of this file
- `docs/` — design/plans (performance, WebGL readiness shield)

## Deploy notes

- Railway (`railway.toml`) and Vercel (`vercel.json`).
- Build: `npm ci && npm run build`; start: `npm run start`; health: `GET /api/health`.
- Run migrations against the target DB before or as part of deploy.
- Public UI deploy: `ALLOW_OPEN_API=true`, `API_SECRET` unset, HTTPS at the edge.
