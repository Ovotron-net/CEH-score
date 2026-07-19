# WebGL Readiness Shield Verification

Final verification was completed on 2026-07-20 against the exact current worktree and production build with Next.js 15.5.18, Lighthouse 13.4.0, Headless Chrome 150.0.0.0 (browser build 150.0.7871.128), and mobile DevTools throttling (150 ms RTT, 1,638.4 Kbps, and 4x CPU slowdown).

## Current Architecture

The Dashboard hero is server-owned and streams behind a page-local Suspense boundary. `src/app/page.tsx` immediately renders `ReadinessHeroLoading` while `DashboardContent` is suspended on its repository work. The fallback preserves the Dashboard `h1`, a named loading status, page spacing, and the reserved readiness visual dimensions. Once ready, the boundary atomically reveals the complete `ReadinessHero` and hydrated Dashboard; it is not a global route fallback and cannot appear over another route.

Inside `DashboardContent`, `assertRepositoryHydrationAllowed()` runs before the repository read, assessments are read once, and readiness statistics are derived for the semantic `ReadinessHero`. The same array is passed to `HydratedPage` as `initialData`; the Dashboard query keeps that snapshot for the route lifetime with `staleTime: Infinity` and no focus refetch. Unit and development E2E coverage confirmed the guard blocks before a read and hydration performs no initial browser `GET /api/assessments`.

`src/components/readiness/ReadinessHero.tsx` owns the heading, summary, textual readiness values, and action. `src/components/readiness/ReadinessVisual.tsx` is the isolated client boundary: it renders a static fallback through window load and idle time, then dynamically imports `ReadinessShield`. `ReadinessShieldScene` remains the imperative Three.js leaf. The application adds no telemetry, analytics script, or readiness telemetry request.

## Automated Checks

| Check | Observed result |
| --- | --- |
| `npm run lint` | Passed. |
| `npx tsc --noEmit --incremental false` | Passed; no `.tsbuildinfo` was created. |
| `npx vitest run` | Passed: 47 test files and 225 tests. |
| `npm run build` | Passed. Dashboard: 4.78 kB route size and 127 kB first-load JavaScript; shared first-load JavaScript: 103 kB. |
| `npm run test:e2e` | Passed: 48 development Chromium tests. |
| `npm run test:e2e:production` | Passed: 2 production Chromium tests. |

## Lighthouse Evidence

Three fresh live production audits used separate Chrome profiles and saved their JSON reports under the approved temp directory:

| Run | Report | LCP | Earliest readiness request | After LCP |
| --- | --- | ---: | ---: | ---: |
| 1 | `C:\Users\terti\AppData\Local\Temp\opencode\post-suspense-live-1.json` | 2,192.689 ms | 2,716.228 ms | 523.539 ms |
| 2 | `C:\Users\terti\AppData\Local\Temp\opencode\post-suspense-live-2.json` | 2,159.242 ms | 2,714.697 ms | 555.455 ms |
| 3 | `C:\Users\terti\AppData\Local\Temp\opencode\post-suspense-live-3.json` | 2,188.337 ms | 2,756.466 ms | 568.129 ms |

| Metric | Median |
| --- | ---: |
| Performance score | 87 |
| Accessibility score | 100 |
| First Contentful Paint | 1,557.913 ms |
| Largest Contentful Paint | 2,188.337 ms |
| Total Blocking Time | 451.398 ms |
| Cumulative Layout Shift | 0 |

The median LCP passed the absolute 2,500 ms target by 311.663 ms; all three LCPs passed, every accessibility score was 100, and every CLS was below 0.1. In all runs the LCP element was the fulfilled server-owned `Progress shapes your readiness shield.` paragraph. The first readiness artifact request started after LCP in every trace.

The 451.398 ms median TBT remains a residual main-thread risk under 4x CPU slowdown; passing LCP and CLS does not make TBT a pass. No true pre-feature baseline exists. Earlier controlled variants were diagnostics, not baselines, so this evidence does not support a causal before/after performance claim.

## Bundle Isolation

`npm ls three --depth=0` resolves one valid runtime dependency, `three@0.185.1`. The exact `.next/react-loadable-manifest.json` entry for `ReadinessVisual.tsx -> ReadinessShield` is:

| Artifact | Raw bytes | Gzip bytes |
| --- | ---: | ---: |
| `static/chunks/b536a0f1.4493c535fb7041a7.js` | 348,163 | 83,331 |
| `static/chunks/bd904a5c.c7927f4f7c08bb14.js` | 191,372 | 50,551 |
| `static/chunks/4719.c0180fae8db1de12.js` | 7,491 | 3,165 |
| **Dynamic group total** | **547,026** | **137,047** |

Raw sizes came from the emitted files; gzip sizes came from `zlib.gzipSync` over those exact files. None appears in any `.next/app-build-manifest.json` route entry. Fresh production browser contexts requested all three only on `/` and none on `/assessments`, `/add`, `/analytics`, `/leaderboard`, `/polls`, `/polls/analytics`, `/settings`, or `/topics`. With `requestIdleCallback` held, the Dashboard requested zero readiness artifacts; releasing it requested the exact group above.

## Runtime Evidence

| Check | Observed result |
| --- | --- |
| Page-local Suspense | While Dashboard repository work is pending, only the Dashboard boundary renders `ReadinessHeroLoading`; the fulfilled stream replaces it with the server-owned semantic hero and hydrated content. A development E2E held a non-Dashboard `/assessments` RSC navigation for 2 seconds and observed no `[data-route-loading]` mount at any point before or after navigation. |
| Server and hydration boundary | The fulfilled server-owned hero contains the semantic copy, values, and action; the client visual is decorative and isolated. The route guard runs before the one repository read, and `initialData` preserves one stable route snapshot without an initial browser assessment GET. |
| Accessibility | Full-page Dashboard axe analysis reported zero violations in both dark and light themes; Lighthouse accessibility was 100 in all three runs. |
| Reduced-motion changes | The scene listens for media-query `change`: enabling reduced motion stops animation, snaps assembly and pointer state, and draws one visible static frame or coalesces one offscreen refresh; disabling it resumes at most one frame loop without de-assembling. Listener cleanup and parameter refresh behavior are covered. |
| Failure and lifecycle | WebGL construction/context loss retains the fallback and semantic values. Tests verify bounded visibility refresh plus geometry, material, renderer, observer, listener, timer, and animation cleanup. |
| Interaction latency | The built-production controlled Event Timing run measured 24-40 ms interactions, maximum 40 ms, below the 200 ms target. This is a lab interaction-latency/INP proxy, explicitly not a field INP measurement. |
