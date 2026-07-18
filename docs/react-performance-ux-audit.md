# React Performance and UX Audit

Audit date: 2026-07-18. Scope: the current Next.js browser application and API. Statuses mean **Implemented** (changed by the optimization work), **Already compliant** (the existing design already satisfies the rule), or **Inapplicable** (the rule's triggering feature is absent or intentionally out of scope).

## Vercel React Best Practices

All 70 rule IDs from the Vercel React Best Practices inventory are represented exactly once below.

### Eliminating Waterfalls

| Rule | Status | Evidence |
| --- | --- | --- |
| `async-cheap-condition-before-await` | Already compliant | Authentication, validation, and empty-state checks precede database or mutation work in `src/app/api/**/route.ts`. |
| `async-defer-await` | Implemented | Route handlers and repositories defer reads/writes until their validated branches; see `src/app/api/assessments/route.ts`. |
| `async-parallel` | Implemented | `src/components/HydratedPage.tsx` starts independent route queries together with `Promise.all`. |
| `async-dependencies` | Inapplicable | Route prefetches are independent; there is no partial-dependency promise graph. |
| `async-api-routes` | Already compliant | API handlers perform only the required authenticated operation and avoid sequential independent I/O in `src/app/api/**/route.ts`. |
| `async-suspense-boundaries` | Inapplicable | Required page reads intentionally resolve before dehydration so failures reach `src/app/error.tsx`; no optional streaming region exists. |

### Bundle Size

| Rule | Status | Evidence |
| --- | --- | --- |
| `bundle-barrel-imports` | Implemented | Hooks import app API modules directly; chart modules are loaded from direct paths in `src/components/charts/lazy.tsx`. |
| `bundle-analyzable-paths` | Already compliant | Route imports and all dynamic chart import paths are static string literals in `src/app/**/page.tsx` and `src/components/charts/lazy.tsx`. |
| `bundle-dynamic-imports` | Implemented | Recharts views use `next/dynamic` in `src/components/charts/lazy.tsx`. |
| `bundle-defer-third-party` | Inapplicable | No analytics, tag manager, chat, or other client-side third-party script is installed. |
| `bundle-conditional` | Implemented | Domain topic chips mount only when expanded in `src/components/DomainCard.tsx`. |
| `bundle-preload` | Implemented | Analytics chunks preload on link focus, pointer enter, and touch start in `src/components/Sidebar.tsx`. |

### Server-Side Performance

| Rule | Status | Evidence |
| --- | --- | --- |
| `server-auth-actions` | Inapplicable | There are no Server Actions; API routes call `authenticate` in `src/app/api/**/route.ts`. |
| `server-cache-react` | Inapplicable | Each required repository read occurs once per route render; request-local React cache deduplication would add no reuse. |
| `server-cache-lru` | Inapplicable | Mutable personal data must not be cached across requests; React Query browser freshness is configured in `src/lib/queryClient.ts`. |
| `server-dedup-props` | Already compliant | Each page hydrates one shared query payload rather than duplicating records through multiple props; see `src/components/HydratedPage.tsx`. |
| `server-hoist-static-io` | Already compliant | Static CEH and poll definitions are module constants in `src/data/cehDomains.ts` and `src/data/polls.ts`. |
| `server-no-shared-module-state` | Implemented | `makeQueryClient()` creates a request-local cache in `src/components/HydratedPage.tsx`. |
| `server-serialization` | Implemented | Repositories return serializable DTOs and poll projections omit user identifiers; see `src/data/*Repository.ts`. |
| `server-parallel-fetching` | Implemented | Multi-query pages pass independent reads to the parallel executor in `src/components/HydratedPage.tsx`. |
| `server-parallel-nested-fetching` | Implemented | Fixed poll queries are created together in `src/app/polls/page.tsx` and fetched in parallel. |
| `server-after-nonblocking` | Inapplicable | Page and API request paths contain no nonessential analytics or notification work requiring `after()`. |

### Client Data Fetching

| Rule | Status | Evidence |
| --- | --- | --- |
| `client-swr-dedup` | Already compliant | TanStack Query provides equivalent keyed deduplication through contracts in `src/hooks/use*.ts`. |
| `client-event-listeners` | Already compliant | The drawer installs one conditional keydown listener and removes it in `src/components/ClientShell.tsx`. |
| `client-passive-event-listeners` | Inapplicable | No wheel, touchmove, or scroll listener is registered. |
| `client-localstorage-schema` | Inapplicable | Persistent theme state uses the `ceh-theme` cookie; the application does not use localStorage. |

### Re-render Optimization

| Rule | Status | Evidence |
| --- | --- | --- |
| `rerender-defer-reads` | Already compliant | Event handlers consume local values directly; no broad state subscription exists only for callback reads. |
| `rerender-memo` | Implemented | Repeated expandable domain rows are isolated with `memo` in `src/components/DomainCard.tsx`. |
| `rerender-memo-with-default-value` | Already compliant | Memoized components use primitive defaults; no inline object/array default invalidates memoization. |
| `rerender-dependencies` | Already compliant | Effects depend on primitive booleans/functions in `src/components/ClientShell.tsx` and `src/components/PollForm.tsx`. |
| `rerender-derived-state` | Implemented | Views derive filtered and aggregate values with focused query data in `src/views/Assessments.tsx` and `src/views/Analytics.tsx`. |
| `rerender-derived-state-no-effect` | Already compliant | Percentages, filters, rankings, and summaries are derived during render rather than synchronized by effects. |
| `rerender-functional-setstate` | Implemented | Form field updates use functional setters in `src/views/AddAssessment.tsx`. |
| `rerender-lazy-state-init` | Inapplicable | Initial local state is cheap primitive/form data with no expensive initializer. |
| `rerender-simple-expression-in-memo` | Implemented | Simple percentage/pass calculations remain direct expressions in `src/views/AddAssessment.tsx`. |
| `rerender-split-combined-hooks` | Implemented | Read and mutation hooks are separated in `src/hooks/useAssessments.ts`, `useSettings.ts`, and `usePolls.ts`. |
| `rerender-move-effect-to-event` | Already compliant | Voting, navigation, deletion, and saving logic runs from event handlers; effects only manage external synchronization/cleanup. |
| `rerender-transitions` | Inapplicable | No non-urgent update both blocks urgent interaction and requires preserving stale content. |
| `rerender-use-deferred-value` | Implemented | Assessment and topic searches defer filtering in `src/views/Assessments.tsx` and `src/views/Topics.tsx`. |
| `rerender-use-ref-transient-values` | Implemented | Focus restoration and timeout handles use refs in `src/components/ClientShell.tsx` and `src/components/PollForm.tsx`. |
| `rerender-no-inline-components` | Already compliant | Reusable render components are module-level; views do not declare component types inside render functions. |

### Rendering Performance

| Rule | Status | Evidence |
| --- | --- | --- |
| `rendering-animate-svg-wrapper` | Implemented | Domain chevron rotation is applied to its wrapper in `src/components/DomainCard.tsx`. |
| `rendering-content-visibility` | Implemented | Long assessment/ranking rows use `.render-row` containment from `src/app/globals.css`. |
| `rendering-hoist-jsx` | Already compliant | Static navigation and domain data are module constants; there is no large repeated static JSX allocation. |
| `rendering-svg-precision` | Inapplicable | SVG paths come from Lucide/Recharts dependencies rather than repository-authored high-precision assets. |
| `rendering-hydration-no-flicker` | Implemented | The server reads `ceh-theme` before paint in `src/app/layout.tsx`; no client-only theme repair is required. |
| `rendering-hydration-suppress-warning` | Inapplicable | Server and client markup is deterministic and uses no intentional hydration mismatch. |
| `rendering-activity` | Inapplicable | Hidden UI does not preserve expensive state that warrants React Activity; collapsed topic content is intentionally unmounted. |
| `rendering-conditional-render` | Implemented | Conditional status/content branches use explicit ternaries or boolean comparisons across `src/views/` and `src/components/`. |
| `rendering-usetransition-loading` | Inapplicable | Network pending state comes from TanStack mutations and disables the initiating control; it is not a local transition. |
| `rendering-resource-hints` | Inapplicable | There are no external critical origins or late-discovered fonts/assets to hint. |
| `rendering-script-defer-async` | Inapplicable | The application adds no raw third-party `<script>` elements. |

### JavaScript Performance

| Rule | Status | Evidence |
| --- | --- | --- |
| `js-batch-dom-css` | Already compliant | UI state changes classes through React; the only direct body style update is one drawer scroll-lock assignment in `src/components/ClientShell.tsx`. |
| `js-index-maps` | Implemented | Domain aggregation builds one `Map` in `src/utils/domainStats.ts`. |
| `js-cache-property-access` | Already compliant | Aggregate loops store frequently used values locally in `src/utils/calculations.ts` and `src/views/Analytics.tsx`. |
| `js-cache-function-results` | Inapplicable | No repeated expensive pure function has stable cross-request inputs suitable for a module cache. |
| `js-cache-storage` | Inapplicable | The application does not repeatedly read localStorage/sessionStorage. |
| `js-combine-iterations` | Implemented | Assessment totals and domain totals use single-pass loops in `src/utils/calculations.ts` and `src/utils/domainStats.ts`. |
| `js-length-check-first` | Already compliant | Empty arrays return before chart/list work in `src/components/charts/*.tsx` and utility functions. |
| `js-early-exit` | Already compliant | Authentication, validation, empty charts, and errors return early throughout route handlers and charts. |
| `js-hoist-regexp` | Already compliant | Validation regexes are schema/module expressions, not recreated inside hot loops. |
| `js-min-max-loop` | Implemented | Analytics computes best score in its aggregate loop in `src/views/Analytics.tsx`. |
| `js-set-map-lookups` | Implemented | Streak and domain membership use `Set`/`Map` in `src/utils/calculations.ts` and `src/utils/domainStats.ts`. |
| `js-tosorted-immutable` | Implemented | Rankings and charts clone query arrays before sorting in `src/views/Leaderboard.tsx` and `src/components/charts/ScoreTrend.tsx`. |
| `js-flatmap-filter` | Implemented | Measured domain chart rows use one `flatMap` in `src/views/Analytics.tsx`. |
| `js-request-idle-callback` | Inapplicable | No noncritical CPU-heavy browser task needs idle scheduling. |

### Advanced Patterns

| Rule | Status | Evidence |
| --- | --- | --- |
| `advanced-effect-event-deps` | Inapplicable | The codebase does not use `useEffectEvent`. |
| `advanced-event-handler-refs` | Inapplicable | No long-lived external subscription needs a changing React event handler. |
| `advanced-init-once` | Already compliant | Providers initialize the browser QueryClient once in `src/components/providers.tsx`. |
| `advanced-use-latest` | Inapplicable | No stable callback passed to an external lifecycle reads changing props. |

## Critical and High UI/UX Rules

The tables cover the critical/high web rules and explicitly dispose of adjacent native-only rules from those categories.

### Accessibility (Critical)

| Rule | Status | Evidence |
| --- | --- | --- |
| `color-contrast` | Implemented | Semantic dark/light tokens were corrected in `src/app/globals.css` and consumed through `tailwind.config.js`. |
| `focus-states` | Implemented | Global `:focus-visible` plus component rings are defined in `src/app/globals.css` and `src/components/ui/`. |
| `alt-text` | Inapplicable | No meaningful raster/content images are rendered; Lucide icons accompany text or labeled controls. |
| `aria-labels` | Implemented | Icon-only drawer, delete, retry, and dialog controls have accessible names in `src/components/` and `src/views/`. |
| `keyboard-nav` | Implemented | Native controls, drawer focus trap/Escape handling, and inert closed navigation are in `src/components/ClientShell.tsx` and `Sidebar.tsx`. |
| `form-labels` | Implemented | Assessment/settings/search controls have associated labels in `src/views/AddAssessment.tsx`, `Settings.tsx`, and `Topics.tsx`. |
| `skip-links` | Implemented | `src/components/ClientShell.tsx` provides a visible-on-focus skip link to `#main-content`. |
| `heading-hierarchy` | Implemented | Route metadata/heading tests and page views enforce one route `h1`; see `src/app/metadata.test.ts`. |
| `color-not-only` | Implemented | Pass/fail, errors, selected states, and chart values include text/shape semantics; see `src/views/Assessments.tsx` and chart data tables. |
| `dynamic-type` | Already compliant | Responsive layouts wrap content and avoid fixed-height text containers across `src/views/`; browser zoom is not disabled. |
| `reduced-motion` | Implemented | `prefers-reduced-motion` removes nonessential animation/transition behavior in `src/app/globals.css`. |
| `voiceover-sr` | Implemented | Landmarks, status/alert regions, chart summaries, and semantic tables define screen-reader order in `src/components/` and `src/views/`. |
| `escape-routes` | Implemented | Mobile navigation and Radix dialogs close with Escape and expose close/cancel controls in `src/components/ClientShell.tsx` and `ui/dialog.tsx`. |
| `keyboard-shortcuts` | Inapplicable | The app has no custom shortcuts or drag-and-drop interaction that could override system keys. |

### Touch and Interaction (Critical)

| Rule | Status | Evidence |
| --- | --- | --- |
| `touch-target-size` | Implemented | Active workflow controls use at least `min-h-11`/`min-w-11`; icon variants are 44px in `src/components/ui/button.tsx`. The isolated route-error retry in `src/app/error.tsx` uses the WCAG 2.5.8 size/spacing exception with no adjacent target. |
| `touch-spacing` | Implemented | Action groups use `gap-2` or larger throughout `src/views/` and `src/components/`. |
| `hover-vs-tap` | Already compliant | Every hover treatment supplements a native link/button/input click or tap action. |
| `loading-buttons` | Implemented | Save, vote, refresh, and delete controls disable and expose pending text/status in `src/views/` and poll components. |
| `error-feedback` | Implemented | Field-associated errors and retryable operation errors use `role="alert"`; see `src/views/AddAssessment.tsx`. |
| `cursor-pointer` | Already compliant | Native buttons/links provide browser pointer semantics; custom poll labels explicitly use `cursor-pointer` in `src/components/PollForm.tsx`. |
| `gesture-conflicts` | Already compliant | Primary content uses normal vertical document scrolling with no custom swipe regions. |
| `tap-delay` | Inapplicable | Modern browser controls and the viewport default do not incur the legacy 300ms delay; no custom touch handler blocks taps. |
| `standard-gestures` | Inapplicable | No native-app gesture vocabulary or custom swipe/pinch gesture is implemented. |
| `system-gestures` | Already compliant | No edge gesture interception, touchmove cancellation, or zoom prevention exists. |
| `press-feedback` | Implemented | Buttons/links expose hover, focus, active Radix, or pending/disabled state styles in `src/components/ui/` and views. |
| `haptic-feedback` | Inapplicable | This is a web dashboard without native haptic APIs. |
| `gesture-alternative` | Inapplicable | No task depends on a gesture-only interaction. |
| `safe-area-awareness` | Inapplicable | The app has no bottom-fixed primary action or full-screen installed-app chrome; mobile navigation stays inside the viewport. |
| `no-precision-required` | Implemented | Icon actions have 44px hit areas and text actions use padded controls across the active UI. |
| `swipe-clarity` | Inapplicable | No swipe action exists. |
| `drag-threshold` | Inapplicable | No draggable interaction exists. |

### Performance (High)

| Rule | Status | Evidence |
| --- | --- | --- |
| `image-optimization` | Inapplicable | No content images are shipped. |
| `image-dimension` | Inapplicable | No content images can cause image layout shift. |
| `font-loading` | Already compliant | `src/app/globals.css` uses the system font stack, so no web-font blocking occurs. |
| `font-preload` | Inapplicable | No web font is downloaded. |
| `critical-css` | Already compliant | Next.js bundles the root stylesheet imported by `src/app/layout.tsx`. |
| `lazy-loading` | Implemented | Heavy Recharts modules are route/component split in `src/components/charts/lazy.tsx`. |
| `UX: bundle-splitting` | Implemented | Next route splitting plus dynamic chart chunks keeps Recharts out of unrelated initial routes. |
| `third-party-scripts` | Inapplicable | No third-party browser scripts are present. |
| `reduce-reflows` | Already compliant | State changes are class-based; no repeated interleaved DOM measurement/write loop exists. |
| `content-jumping` | Implemented | Chart and page skeletons reserve dimensions in `src/components/charts/ChartSkeleton.tsx` and loading views. |
| `lazy-load-below-fold` | Inapplicable | There is no below-fold image/media content. |
| `virtualize-lists` | Inapplicable | Current personal datasets are small; `.render-row` containment is used and pagination/virtualization is a documented non-goal. |
| `main-thread-budget` | Implemented | Aggregates use one-pass utilities and filtering is deferred; see `src/utils/` and search views. |
| `progressive-loading` | Implemented | Dashboard/analytics/chart loading uses dimension-preserving skeletons and named status regions. |
| `input-latency` | Implemented | Search rendering uses `useDeferredValue` in assessment/topic views. |
| `tap-feedback-speed` | Already compliant | CSS interaction states are immediate and local mutations expose pending state synchronously. |
| `debounce-throttle` | Inapplicable | There are no scroll/resize handlers; deferred rendering, not network search, handles text input frequency. |
| `offline-support` | Inapplicable | Offline/PWA operation is outside this database-backed dashboard's scope; failures show recovery UI. |
| `network-fallback` | Implemented | Query errors retain the page shell and show inline retry paths throughout `src/views/`. |

### Style Selection (High)

| Rule | Status | Evidence |
| --- | --- | --- |
| `style-match` | Already compliant | The focused cyber dashboard treatment matches the CEH security-learning product across `src/app/globals.css`. |
| `consistency` | Implemented | Shared semantic tokens, cards, controls, and route spacing are used across `src/views/` and `src/components/ui/`. |
| `no-emoji-icons` | Already compliant | The application uses the Lucide SVG icon family. |
| `color-palette-from-product` | Already compliant | Security-oriented dark surfaces and green/info/status semantics are centralized in `src/app/globals.css`. |
| `effects-match-style` | Already compliant | Glow, glass, border, radius, and shadow treatments use a consistent restrained cyber style. |
| `platform-adaptive` | Already compliant | Native web controls and responsive sidebar/drawer behavior follow browser conventions. |
| `state-clarity` | Implemented | Focus, hover, selected, pending, disabled, error, and success states use semantic styles and ARIA state. |
| `elevation-consistent` | Already compliant | Cards/dialogs use shared border/radius/shadow primitives in `src/components/ui/`. |
| `dark-mode-pairing` | Implemented | Paired semantic light/dark tokens and pre-paint cookie application are in `src/app/globals.css` and `layout.tsx`. |
| `icon-style-consistent` | Already compliant | Lucide outline icons are used throughout the product. |
| `system-controls` | Already compliant | Forms use native inputs or accessible Radix primitives in `src/components/ui/`. |
| `blur-purpose` | Already compliant | Blur is limited to card/surface separation; overlays use an explicit scrim. |
| `primary-action` | Already compliant | Routes visually prioritize one task while keeping destructive/secondary actions subordinate in `src/views/`. |

### Layout and Responsive Design (High)

| Rule | Status | Evidence |
| --- | --- | --- |
| `viewport-meta` | Already compliant | Next.js emits the responsive viewport default; no zoom-disabling metadata exists. |
| `mobile-first` | Implemented | Base single-column layouts expand at `sm`, `md`, and `lg` throughout `src/views/`. |
| `breakpoint-consistency` | Already compliant | Tailwind's shared breakpoint scale is used rather than ad hoc media queries. |
| `readable-font-size` | Already compliant | Inputs remain operable and zoom is permitted; compact dashboard labels are supplementary rather than body-copy forms. |
| `line-length-control` | Implemented | Page/content containers use `max-w-*`, including `AddAssessment`, `Leaderboard`, and `Topics`. |
| `horizontal-scroll` | Implemented | 375px E2E coverage asserts no document overflow; only the leaderboard table owns local `overflow-x-auto`. |
| `spacing-scale` | Already compliant | Tailwind's 4px spacing scale is used consistently. |
| `touch-density` | Implemented | Mobile controls use 44px targets with explicit gaps and wrapping action groups. |
| `container-width` | Already compliant | Routes consistently constrain desktop content with `max-w-2xl`, `max-w-4xl`, or `max-w-7xl`. |
| `z-index-management` | Already compliant | Sticky header, backdrop, drawer, skip link, and dialog use a small ordered Tailwind z-index set. |
| `fixed-element-offset` | Already compliant | The mobile header is sticky in normal flow; no content sits beneath a fixed bottom bar. |
| `scroll-behavior` | Already compliant | Main content owns normal scrolling; only data-table overflow is locally constrained. |
| `viewport-units` | Implemented | `body` uses `min-height: 100dvh` and the shell uses minimum-height behavior in `src/app/globals.css`. |
| `orientation-support` | Implemented | Wrapping grids/actions and max-width containers remain operable without orientation-specific assumptions. |
| `content-priority` | Implemented | Mobile routes show headings/core data first and move secondary columns into responsive stacks. |
| `visual-hierarchy` | Already compliant | Heading scale, section spacing, card grouping, text labels, and status icons establish hierarchy beyond color. |

### Navigation (High)

| Rule | Status | Evidence |
| --- | --- | --- |
| `bottom-nav-limit` | Inapplicable | The app uses a drawer/sidebar, not bottom navigation. |
| `drawer-usage` | Already compliant | The mobile drawer contains top-level destinations; page actions remain in content. |
| `back-behavior` | Already compliant | Next links preserve browser history and the add form's Cancel uses `router.back()` in `src/views/AddAssessment.tsx`. |
| `deep-linking` | Already compliant | Every major screen has a stable App Router URL under `src/app/`. |
| `tab-bar-ios` | Inapplicable | This is not a native iOS app. |
| `top-app-bar-android` | Inapplicable | This is not a native Android app. |
| `nav-label-icon` | Already compliant | Every primary navigation destination has a Lucide icon and text label in `src/components/Sidebar.tsx`. |
| `nav-state-active` | Implemented | Active destinations expose visual state and `aria-current="page"` in `src/components/Sidebar.tsx`. |
| `nav-hierarchy` | Already compliant | One primary sidebar/drawer is distinct from in-page actions and poll analytics links. |
| `modal-escape` | Implemented | Drawer/dialog surfaces have visible close controls and Escape behavior. |
| `search-accessible` | Implemented | Contextual assessment/topic search has visible or accessible labels in `src/views/Assessments.tsx` and `Topics.tsx`. |
| `breadcrumb-web` | Inapplicable | Navigation depth is at most two levels; poll analytics provides a clear back link instead. |
| `state-preservation` | Already compliant | Browser history and React Query preserve server data; no custom navigation resets history. |
| `gesture-nav-support` | Already compliant | No custom edge gesture conflicts with browser or OS navigation. |
| `tab-badge` | Inapplicable | There is no unread/pending navigation state. |
| `overflow-menu` | Inapplicable | Page actions fit or wrap; no action row is compressed beyond available width. |
| `bottom-nav-top-level` | Inapplicable | There is no bottom navigation. |
| `adaptive-navigation` | Implemented | Desktop uses a persistent sidebar and smaller screens use a modal drawer in `src/components/Sidebar.tsx`. |
| `back-stack-integrity` | Already compliant | Navigation uses Next links/router history and never rewrites the stack to home. |
| `navigation-consistency` | Already compliant | `src/components/ClientShell.tsx` renders the same primary navigation around every route. |
| `avoid-mixed-patterns` | Already compliant | Sidebar and drawer are responsive forms of the same hierarchy, not competing patterns. |
| `modal-vs-navigation` | Already compliant | The drawer exposes primary links but destination content is always a URL route, not a modal workflow. |
| `focus-on-route-change` | Implemented | `src/components/ClientShell.tsx` focuses the destination `h1` after client navigation; Playwright verifies the behavior. |
| `persistent-nav` | Already compliant | The desktop sidebar or mobile menu trigger remains available on every route. |
| `destructive-nav-separation` | Inapplicable | No destructive action or logout appears in primary navigation. |
| `empty-nav-state` | Inapplicable | All navigation destinations are always available. |

## Verification

Results captured from this worktree on 2026-07-18:

| Check | Result |
| --- | --- |
| `npm run lint` | Passed. |
| `npx tsc --noEmit` | Passed. |
| `npx vitest run` | Passed: 40 files, 172 tests. |
| `npm run build` | Passed with Next.js 15.5.18. |
| `npm run test:e2e` | Passed: 43 Chromium tests, including axe checks for every route in both themes. |
| `npm run test:e2e:production` | Passed: built-production hydration and real assessment mutation. |
| OpenAPI YAML parse | Passed with the installed `yaml` parser. |

Latest production route output:

| Route | Size | First Load JS |
| --- | ---: | ---: |
| `/` | 4.31 kB | 126 kB |
| `/_not-found` | 152 B | 103 kB |
| `/add` | 43.3 kB | 156 kB |
| `/analytics` | 5.4 kB | 121 kB |
| `/api/assessments` | 152 B | 103 kB |
| `/api/assessments/[id]` | 152 B | 103 kB |
| `/api/health` | 152 B | 103 kB |
| `/api/polls` | 152 B | 103 kB |
| `/api/polls/[pollId]` | 152 B | 103 kB |
| `/api/polls/[pollId]/votes` | 152 B | 103 kB |
| `/api/settings` | 152 B | 103 kB |
| `/assessments` | 5.17 kB | 125 kB |
| `/leaderboard` | 10 kB | 129 kB |
| `/polls` | 5.41 kB | 125 kB |
| `/polls/analytics` | 7.47 kB | 127 kB |
| `/settings` | 4.65 kB | 121 kB |
| `/topics` | 5.68 kB | 122 kB |

Shared first-load JavaScript is 102 kB.
