# AGENTS.md

## Project at a glance

- CEH-score is a Next.js 15 App Router dashboard for tracking CEH assessments, settings, and poll votes (`src/app`,
  `src/views`, `src/components`).
- Runtime data is served by internal route handlers under `src/app/api/**` and persisted in PostgreSQL through Drizzle (
  `src/db/schema.ts`, `src/db/index.ts`).
- Frontend data access follows `hooks -> api modules -> route handlers`; UI generally talks to hooks, not `fetch`
  directly (`src/hooks/useAssessments.ts`).

## Architecture and data flow

- **Routes/UI split:** page routes are thin wrappers (for example `src/app/page.tsx`) that render view components in
  `src/views/*`.
- **Global providers/layout:** `src/app/layout.tsx` wraps all pages with React Query provider (
  `src/components/providers.tsx`) and shared shell (`src/components/Layout.tsx`).
- **API pattern:** each route validates request bodies with Zod and returns JSON/HTTP status explicitly (see
  `src/app/api/assessments/route.ts`, `src/app/api/settings/route.ts`, `src/app/api/polls/[pollId]/votes/route.ts`).
- **Derived server fields:** assessment `percentage` and `passed` are computed server-side in `POST /api/assessments`.
- **Settings singleton model:** settings are effectively one row (`id = 1`) with upsert behavior (
  `src/app/api/settings/route.ts`).
- **Poll model:** poll options are stored in `poll_results`; vote endpoint increments existing option rows by
  `(pollId, optionText)`.

## Critical workflows

- Install/start:
    - `npm install`
    - `npm run dev`
- Quality/build:
    - `npm run lint`
    - `npm run build`
    - `npm run start`
- API client generation (OpenAPI -> typed React Query hooks via Orval):
    - `npm run generate`
    - Source contract: `openapi.yaml`; config: `orval.config.ts`; generated output: `src/api/generated/**`.
- Database workflow (Drizzle):
    - `npm run db:generate`
    - `npm run db:migrate`
    - `npm run db:studio`
    - Migration files live in `drizzle/`.
- Testing (Vitest unit + Playwright e2e):
    - `npm run test` (full suite: `vitest run` then Playwright e2e)
    - `npm run test:watch` / `npm run test:coverage` (Vitest)
    - `npm run test:e2e` / `npm run test:e2e:ui` (Playwright)
    - Unit tests are colocated as `src/**/*.{test,spec}.{ts,tsx}` (setup in `src/test/setup.ts`); e2e specs live in
      `e2e/`. Vitest defaults to the `jsdom` environment — add `// @vitest-environment node` for server/Node logic.
      Playwright auto-starts the dev server via its `webServer` config.
    - Run a single test: `npx vitest run <file>`, `npx vitest run -t "<name>"`, or `npx playwright test <file>`.

## Project-specific conventions to follow

- Keep API access centralized through `src/api/client.ts` (`request`, `ApiError`, `API_BASE_URL`) and module wrappers (
  `src/api/assessments.ts`, `src/api/settings.ts`, `src/api/polls.ts`).
- For generated clients, keep Orval on the custom mutator (`src/api/mutator.ts`) so generated and handwritten clients
  share error handling.
- React Query updates are often cache-first via `queryClient.setQueryData` on mutation success instead of immediate
  refetch (`src/hooks/useAssessments.ts`).
- Maintain existing import aliases (`@/...`) in app/api/components code.
- Preserve current validation strictness (Zod `safeParse` + 400 response with flattened details) in route handlers.

## Integration points and env assumptions

- Database connection resolves in this order: `DATABASE_PUBLIC_URL` -> `DATABASE_URL` -> composed `PG*` variables (
  `src/db/index.ts`).
- `NEXT_PUBLIC_API_BASE_URL` can redirect API calls away from same-origin defaults (`src/api/client.ts`).
- Poll feature behavior and component contracts are documented in `docs/POLL_API_USAGE.md` and
  `docs/POLL_COMPONENTS.md` (use these before changing poll API/component props).

## Existing AI guidance sources

- `README.md` — project overview, scripts, architecture, and conventions.
- `.github/copilot-instructions.md` — detailed Copilot guidance (commands, testing, architecture, conventions). Keep it
  and this file consistent when either changes.
- `docs/POLL_API_USAGE.md`, `docs/POLL_COMPONENTS.md`, `docs/POLL_FORM_EXAMPLE.md` — poll feature contracts and
  examples.
- No cursor/windsurf/cline or `CLAUDE.md` rule files are present.
