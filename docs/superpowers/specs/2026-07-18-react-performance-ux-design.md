# React Performance and UX Optimization Design

## Goal

Optimize the full CEH Tracker Next.js application against the Vercel React Best Practices and UI/UX Pro Max guidance. Improve first render, bundle behavior, rendering cost, accessibility, responsive behavior, and feedback without redesigning the product or changing its core workflows.

## Deployment Model

CEH Tracker is a public, single-user application. Production UI deployments require `ALLOW_OPEN_API=true` and `API_SECRET` unset. This intentionally permits unauthenticated reads and writes to the shared assessments, settings, and polls data. `API_SECRET` is not a browser authentication mechanism and must never be serialized into page HTML or client JavaScript. README, environment, security, and OpenAPI documentation will describe this supported trust model consistently.

If private access is required later, session authentication must guard both pages and API routes before server-prefetched data can be exposed.

## Architecture

### Server data access

Create server-only repository functions for assessment, settings, and poll reads. API route handlers and App Router pages will reuse these functions instead of pages making internal HTTP requests. Repository calls return only fields required by consumers.

Each data-backed page creates a request-local TanStack Query client, fetches its independent queries in parallel, dehydrates successful results, and renders the existing client view inside a `HydrationBoundary`. No mutable QueryClient or request data lives at module scope. A failed required read renders a route error state with a retry path rather than omitting the query and triggering a browser waterfall.

Prefetch map:

- Dashboard, Analytics, Assessments, and Topics: assessments.
- Leaderboard: assessments and settings in parallel.
- Settings: assessments and settings in parallel.
- Polls: the three fixed poll-stat DTOs in parallel. An unvoted fixed poll returns a successful zero-vote DTO containing its configured question and options rather than a 404.
- Poll Analytics: projected poll-result DTOs using the same serializable shape and query key on server and client. Summary aggregation remains client-side and is not stored under the raw-results key.
- Add Assessment: no read prefetch.

All database-backed page rendering is dynamic so build output never captures mutable database content. Reading the theme cookie in the root layout also makes the full application dynamic; this is an accepted tradeoff for correct pre-paint theming.

### Client state

Export stable query keys and query option factories. Split query hooks from mutation hooks so mutation-only views do not issue reads and read-only views do not subscribe to mutation state. Preserve React Query cache updates and invalidation semantics.

The API client remains responsible for browser mutations and background refreshes. Application hooks import assessment, settings, and poll modules directly rather than using the local API barrel.

### Theme

Persist the selected theme in a `ceh-theme` cookie when settings are updated. Set `Path=/`, `SameSite=Lax`, a one-year maximum age, and `Secure` in production. The root layout reads the cookie and emits the correct root class and color scheme before paint. The global settings query and post-hydration theme flicker are removed. Database settings remain the authoritative form value; after settings load, a stale cookie is reconciled to the stored setting without flashing the page.

## Performance Changes

- Import the global stylesheet from the root layout.
- Parallelize independent server reads and defer work to branches where needed.
- Change settings GET to perform conflict-safe singleton initialization, followed by a targeted row select. Concurrent initialization must not surface a unique-key error.
- Retain static `next/dynamic` Recharts loaders. Analytics and Poll Analytics navigation links preload their specific chart modules on focus, pointer enter, and touch start without adding Recharts to unrelated initial bundles.
- Build domain indexes in one pass for Topics and Domain Radar.
- Combine assessment aggregate passes and use `Set` membership for streak calculation.
- Avoid in-place sorting of query cache data.
- Use deferred search values for potentially expensive assessment/topic filtering.
- Apply `content-visibility: auto` and intrinsic size containment to long list rows.
- Mount domain topic chips only while expanded.
- Remove trivial memoization and unnecessary callback wrappers.
- Keep health checks side-effect free; deployment notification does not run from the health route.

## Data Correctness

- Parse `YYYY-MM-DD` assessment dates as local calendar dates and generate default form dates locally.
- Do not invent domain scores from full-exam results. Charts display measured domain values only and show a useful empty state when none exist.
- Do not mutate React Query arrays while ranking.
- Preserve API ordering and ensure recent assessments use the newest records.
- Project poll analytics responses to fields required for aggregation and omit user identifiers.

## UI and Accessibility

The existing cyber dashboard visual language, semantic tokens, Lucide icon family, and information hierarchy remain. Changes are corrective rather than a redesign.

- Replace hard-coded white foregrounds with semantic foreground tokens so light mode remains readable.
- Introduce accessible semantic status colors and improve muted text contrast in both themes.
- Add a skip link, route-specific titles, `aria-current`, and one page-level heading per route.
- Make the mobile navigation inaccessible while closed, trap focus while open, and restore focus for every close path.
- Convert domain expanders to native buttons with `aria-expanded` and `aria-controls`.
- Ensure interactive targets are at least 44 by 44 CSS pixels. Any exception must be documented and satisfy WCAG 2.5.8 spacing requirements.
- Add visible focus rings to handwritten inputs and controls.
- Expose selected state for period and theme controls.
- Associate all labels, validation text, and status messages with their controls.
- Confirm destructive assessment deletion, await clear-all completion, disable pending actions, and expose recoverable failures.
- Replace blocking full-page spinner swaps with accessible, dimension-reserving skeletons or named status regions.
- Add reduced-motion CSS that removes nonessential translations, rotations, and pulsing while retaining static state feedback.
- Make stat grids, form rows, headers, and action groups stack or wrap at narrow widths.
- Render leaderboard rankings as a semantic, horizontally scrollable table.
- Give every chart a concise screen-reader summary and an associated visually hidden table or structured list containing every plotted label and value; preserve visible empty/error states.
- Meet WCAG AA: normal text contrast is at least 4.5:1, large text and meaningful non-text graphics are at least 3:1, and focus indicators remain visible in both themes.
- On route changes, focus the main content heading. While the mobile drawer is open, lock background scrolling and make background content inert; while closed, make drawer links inert.

## Error Handling

Required server query failures render a route error boundary and do not silently fall through to a client retry. Background client failures use inline error states with retry controls. Empty states render only after successful reads. Mutation errors remain visible until the user retries or dismisses them. Query retries are disabled during server rendering and retain the existing single retry in the browser. No production error path depends solely on console logging.

## Testing

Follow test-first changes for behavior and bug fixes:

- Unit tests for local-date parsing, aggregate calculations, domain indexing, query option behavior, and projected poll summaries.
- Component tests for domain keyboard expansion, selected-state semantics, chart summaries, destructive confirmation, pending/error feedback, and semantic leaderboard markup.
- Route/repository tests use injected database adapters to verify conflict-safe settings initialization, projected poll fields, empty fixed-poll DTOs, and error mapping without a live database.
- E2E runs in a deterministic fixture-data mode consumed by server repositories and browser API handlers. Coverage verifies route titles/headings, no initial browser GET for hydrated data, mutations, mobile navigation focus, responsive overflow, both themes, reduced motion, and critical form labels/statuses.

Verification commands:

```text
npm run lint
npx tsc --noEmit
npx vitest run
npm run build
npm run test:e2e
```

Browser validation covers desktop and 375px mobile layouts, keyboard navigation, reduced motion, dark and light themes, and absence of horizontal page overflow.

The implementation records an audit matrix for all 70 Vercel rules and all critical/high UI/UX rules. Each rule is marked implemented, already compliant, or inapplicable with a file reference or reason. Production build route/chunk output is captured before and after; no unrelated route may gain Recharts in its initial bundle.

## Non-Goals

- Multi-user identity, authorization, or tenant isolation.
- A new visual brand or design system.
- Database pagination or list virtualization unless realistic data volume demonstrates that containment is insufficient.
- Replacing TanStack Query, Recharts, Tailwind, Radix, or the API contract wholesale.
- Editing generated Orval or Drizzle metadata by hand.

## Acceptance Criteria

- Data-backed routes render hydrated initial data without a post-hydration read waterfall.
- Independent server reads execute concurrently and no request-scoped mutable state is shared.
- Global CSS and the selected theme apply before visible content.
- No critical or high accessibility defect identified by the repository-wide audit remains unresolved; documented exceptions must include rationale and compensating behavior.
- Mobile layouts work at 375px without page-level horizontal overflow; data tables own intentional local scrolling.
- Empty, loading, error, pending, and success states are distinguishable and announced.
- Charts never fabricate domain values and expose equivalent text data.
- Public deployment documentation requires `API_SECRET` unset, states that shared writes are unauthenticated, and a production-mode smoke test covers one hydrated read and one mutation.
- Empty fixed polls hydrate as successful zero-vote data; settings initialization remains correct under two concurrent requests.
- Automated axe checks report no critical or serious violations on all routes in both themes, supplemented by keyboard and screen-reader-semantic checks for charts and navigation.
- The completed rule matrix accounts for every Vercel rule and every critical/high UI/UX rule.
- Existing unit tests pass, new regressions are covered, lint/typecheck/build pass, and Playwright smoke coverage passes.
