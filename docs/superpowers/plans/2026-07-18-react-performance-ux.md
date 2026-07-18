# React Performance and UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver server-hydrated data, lower rendering cost, correct data semantics, and repository-wide accessible responsive UI without changing CEH Tracker's visual identity.

**Architecture:** Server-only repositories provide serializable DTOs to request-local TanStack Query clients in App Router pages. Existing client views consume the hydrated cache and focused mutation hooks. Shared utilities own local-date and domain aggregation behavior; semantic CSS and component fixes provide stable, accessible rendering.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, TanStack Query 5, Drizzle/PostgreSQL, Tailwind CSS, Radix UI, Recharts, Vitest, Testing Library, Playwright.

## Global Constraints

- Production UI mode requires `ALLOW_OPEN_API=true` and `API_SECRET` unset; shared reads and writes are intentionally unauthenticated.
- Never serialize secrets or request-scoped mutable state.
- Preserve unrelated dirty worktree changes and do not hand-edit generated Orval or Drizzle metadata.
- Keep the existing cyber dashboard visual language and Lucide icons.
- Meet WCAG AA contrast and 44 by 44 CSS pixel target requirements.
- Use test-first changes for behavior and bug fixes.

---

### Task 1: Correct Shared Data Utilities

**Files:**
- Create: `src/utils/dates.ts`
- Create: `src/utils/dates.test.ts`
- Create: `src/utils/domainStats.ts`
- Create: `src/utils/domainStats.test.ts`
- Modify: `src/utils/calculations.ts`
- Modify: `src/utils/calculations.test.ts`

**Interfaces:**
- Produces: `parseLocalDate(value: string): Date`, `formatLocalDateInput(date?: Date): string`, `buildDomainStats(assessments): Map<string, {count: number; average: number}>`, optimized `calculateStats`.

- [ ] Write failing tests proving date-only strings retain their calendar day, default dates use local components, domains are indexed in one pass, empty domains remain absent, and aggregate/streak behavior is unchanged.
- [ ] Run `npx vitest run src/utils/dates.test.ts src/utils/domainStats.test.ts src/utils/calculations.test.ts` and verify failures identify missing APIs.
- [ ] Implement local component parsing/formatting, one-pass domain totals, and one-pass aggregate calculations using a `Set` for streak membership.
- [ ] Run the focused tests and verify they pass.

### Task 2: Add Server Repositories and Stable Query Contracts

**Files:**
- Create: `src/data/assessmentRepository.ts`
- Create: `src/data/settingsRepository.ts`
- Create: `src/data/pollRepository.ts`
- Create: `src/data/polls.ts`
- Create: `src/data/repositories.test.ts`
- Modify: `src/app/api/assessments/route.ts`
- Modify: `src/app/api/settings/route.ts`
- Modify: `src/app/api/polls/route.ts`
- Modify: `src/app/api/polls/[pollId]/route.ts`
- Modify: `src/hooks/useAssessments.ts`
- Modify: `src/hooks/useSettings.ts`
- Modify: `src/hooks/usePolls.ts`

**Interfaces:**
- Produces: `getAssessments()`, `getSettings()`, `getPollResults()`, `getPollStats(pollId, definition?)`; `assessmentQueryOptions`, `settingsQueryOptions`, `pollStatsQueryOptions`, `pollResultsQueryOptions`; focused query/mutation hooks.

- [ ] Write failing repository tests with injected adapters proving descending assessment order, conflict-safe singleton settings initialization, projected poll rows, ISO timestamps, and successful zero-vote fixed polls.
- [ ] Run `npx vitest run src/data/repositories.test.ts` and verify expected failures.
- [ ] Implement server-only repositories and fixed poll definitions; refactor GET handlers to delegate reads while retaining auth/error mapping.
- [ ] Split assessment/settings query and mutation hooks, retain compatibility only at existing read-and-write consumers, and use direct API imports.
- [ ] Run repository, auth, and poll summary tests.

### Task 3: Hydrate Data-Backed Routes

**Files:**
- Create: `src/lib/queryClient.ts`
- Create: `src/components/HydratedPage.tsx`
- Modify: `src/components/providers.tsx`
- Modify: all `src/app/**/page.tsx`
- Create: relevant `src/app/**/error.tsx`

**Interfaces:**
- Consumes query option factories and repository query functions from Task 2.
- Produces: request-local `makeQueryClient()` and `HydratedPage({queries, children})` with parallel `fetchQuery` and `HydrationBoundary`.

- [ ] Write a failing component/unit test proving separate QueryClients per call and parallel query start behavior.
- [ ] Implement server QueryClient defaults with retries disabled, parallel fetch, dehydration, and route error fallback.
- [ ] Wrap each page according to the approved prefetch map and mark database-backed pages dynamic.
- [ ] Verify `npx tsc --noEmit` and focused tests.

### Task 4: Fix Theme, Global Styling, and Motion

**Files:**
- Modify: `src/app/layout.tsx`
- Delete: `src/components/ThemeApplier.tsx`
- Modify: `src/api/settings.ts`
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.js`
- Modify: `src/views/Settings.tsx`

**Interfaces:**
- Produces: pre-paint `ceh-theme` cookie contract and semantic status colors.

- [ ] Write failing tests for cookie serialization and Settings selected-state/accessibility behavior.
- [ ] Import global CSS, read `ceh-theme` in layout, set root class/color scheme, and write the cookie after successful setting updates.
- [ ] Replace low-contrast tokens, add semantic status tokens, long-row containment, accessible skeleton utilities, and reduced-motion overrides.
- [ ] Remove post-hydration `ThemeApplier` and verify dark/light component tests.

### Task 5: Correct Rendering and Data Views

**Files:**
- Modify: `src/views/Dashboard.tsx`
- Modify: `src/views/Analytics.tsx`
- Modify: `src/views/Assessments.tsx`
- Modify: `src/views/Leaderboard.tsx`
- Modify: `src/views/Topics.tsx`
- Modify: `src/views/PollAnalytics.tsx`
- Modify: `src/views/AddAssessment.tsx`
- Modify: `src/components/DomainCard.tsx`
- Modify: `src/components/charts/*.tsx`
- Modify: `src/components/charts/lazy.tsx`

**Interfaces:**
- Consumes local-date/domain utilities and focused hooks.
- Produces: measured-only chart data, semantic leaderboard table, deferred search, accurate newest records, accessible chart summaries, and intent chart preload functions.

- [ ] Write failing tests for non-mutating leaderboard ranking, newest dashboard records, keyboard domain expansion, measured-only radar data, chart text equivalents, and field validation associations.
- [ ] Implement corrected computations and rendering with `useDeferredValue`, conditional topic mounting, semantic table markup, local dates, and no fabricated scores.
- [ ] Add chart summaries/hidden tables, empty states, fixed dimensions, and static preload exports invoked on analytics navigation intent.
- [ ] Run all focused component and utility tests.

### Task 6: Complete Navigation, Forms, and Mutation Feedback

**Files:**
- Modify: `src/components/ClientShell.tsx`
- Modify: `src/components/Sidebar.tsx`
- Modify: `src/components/PollForm.tsx`
- Modify: `src/components/PollResults.tsx`
- Modify: `src/views/Assessments.tsx`
- Modify: `src/views/Settings.tsx`
- Modify: `src/views/PollAnalytics.tsx`
- Modify: `src/components/ui/{button,dialog,toast}.tsx`

**Interfaces:**
- Produces: skip link/main focus target, inert/focus-restoring mobile drawer, 44px targets, announced async states, confirmed/awaited destructive actions, retryable errors.

- [ ] Write failing interaction tests for closed drawer inertness, focus restoration, `aria-current`, delete confirmation/pending state, clear-all failure persistence, and poll status announcements.
- [ ] Implement native/semantic interactions, focus management, body scroll lock, status/alert regions, pending control disabling, and visible retry paths.
- [ ] Run focused interaction tests and axe checks.

### Task 7: Responsive and Metadata Pass

**Files:**
- Modify: all `src/app/**/page.tsx`
- Modify: affected files in `src/views/`
- Modify: `src/components/Sidebar.tsx`
- Modify: `src/components/StatCard.tsx`

**Interfaces:**
- Produces route-specific metadata and 375px-safe layouts.

- [ ] Add route metadata assertions and small-viewport E2E checks that initially fail.
- [ ] Export unique titles, use one `h1` per page, replace hard-coded foreground classes, stack/wrap narrow headers/forms/stat grids, and constrain intentional table scrolling locally.
- [ ] Verify E2E at desktop and 375px with no page-level horizontal overflow.

### Task 8: Deployment Contract, Audit Matrix, and Final Verification

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `SECURITY.md`
- Modify: `openapi.yaml`
- Create: `docs/react-performance-ux-audit.md`
- Modify: `e2e/smoke.spec.ts`

**Interfaces:**
- Produces consistent public deployment documentation and full rule disposition.

- [ ] Document `ALLOW_OPEN_API=true`, unset `API_SECRET`, and the unauthenticated shared-write risk consistently.
- [ ] Record every Vercel rule and every critical/high UI/UX rule as implemented, already compliant, or inapplicable with evidence.
- [ ] Update deterministic E2E fixtures for server repositories and assert no initial browser data GET after hydration.
- [ ] Run `npm run lint`, `npx tsc --noEmit`, `npx vitest run`, `npm run build`, and `npm run test:e2e`; fix all regressions without weakening tests.
