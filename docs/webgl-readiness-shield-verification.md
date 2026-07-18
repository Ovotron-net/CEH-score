# WebGL Readiness Shield Verification

Observed on 2026-07-18 with Node.js 26.5.0, npm 11.13.0, Next.js 15.5.18, Vitest 4.1.9, Playwright 1.61.1, and Three.js 0.185.1.

## Automated Checks

| Check | Observed result |
| --- | --- |
| `npm run lint` | Passed with exit code 0. |
| `npx tsc --noEmit --incremental false` | Passed with exit code 0; no `.tsbuildinfo` file was found afterward. |
| `npx vitest run` | Passed: 44 test files and 211 tests. |
| `npm run build` | Passed with exit code 0. Dashboard output: 7.67 kB route size and 130 kB first-load JavaScript; shared first-load JavaScript: 103 kB. |
| `npm run test:e2e` | Passed: 46 Chromium tests. |
| `npm run test:e2e:production` | Passed: 1 production Chromium test. |

## Bundle Isolation

`npm ls three` resolved one valid dependency: `three@0.185.1`.

The final `.next/react-loadable-manifest.json` maps `ReadinessHero.tsx -> ReadinessShield` to these production artifacts:

| Artifact | Raw bytes | Gzip bytes |
| --- | ---: | ---: |
| `static/chunks/b536a0f1.7c1c391c6165df5f.js` | 348,162 | 83,330 |
| `static/chunks/bd904a5c.b2708ebc3e63dc81.js` | 191,371 | 50,550 |
| `static/chunks/4719.5672a6950f6030b2.js` | 7,239 | 3,098 |
| **Dynamic group total** | **546,772** | **136,978** |

The byte counts came from the final emitted files. Gzip counts came from Node `zlib.gzipSync` over those exact artifacts.

The Dashboard keeps the static fallback through window load, then mounts the dynamic boundary through `requestIdleCallback` with a 500 ms timeout or a 50 ms timer fallback when the idle API is unavailable. A production browser made zero readiness requests before the held idle callback and requested all three files after it ran. Fresh browser contexts requested none on `/analytics`, `/settings`, `/add`, `/polls`, or `/polls/analytics`. None of the three filenames appeared in `.next/app-build-manifest.json` route entries.

With JavaScript disabled, the server-rendered Dashboard showed `Dashboard`, `75.2%`, `Almost Ready`, `1 day`, `1 of 20`, and `View analytics`. The semantic readiness content therefore did not depend on loading the dynamic group.

## Lighthouse

All four reports were produced by Lighthouse 13.4.0 against `http://127.0.0.1:3100/` with Headless Chrome 149.0.0.0:

| Variant | Report | Fetch time |
| --- | --- | --- |
| Immediate WebGL | `C:\Users\terti\AppData\Local\Temp\opencode\ceh-readiness-lighthouse-remote-corrected.json` | `2026-07-18T12:17:53.801Z` |
| Fallback only | `C:\Users\terti\AppData\Local\Temp\opencode\ceh-readiness-lighthouse-fallback-only.json` | `2026-07-18T12:31:48.432Z` |
| Prior deferred WebGL | `C:\Users\terti\AppData\Local\Temp\opencode\ceh-readiness-lighthouse-deferred.json` | `2026-07-18T12:55:52.997Z` |
| Final deferred WebGL | `C:\Users\terti\AppData\Local\Temp\opencode\ceh-readiness-lighthouse-final.json` | `2026-07-18T13:41:17.510Z` |

Final report values:

| Metric | Final value |
| --- | ---: |
| Performance score | 72 |
| Accessibility score | 100 |
| First Contentful Paint | 750.824 ms |
| Largest Contentful Paint | 4,220.236 ms |
| Cumulative Layout Shift | 0.0002275643333300318 |
| Total Blocking Time | 548.5 ms |

Exact single-run comparisons:

| Metric | Immediate WebGL | Fallback only | Prior deferred | Final deferred | Final vs immediate | Final vs fallback | Final vs prior deferred |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Performance score | 59 | 82 | 78 | 72 | +13 | -10 | -6 |
| Accessibility score | 100 | 100 | 100 | 100 | 0 | 0 | 0 |
| First Contentful Paint | 810 ms | 752.684 ms | 761.268 ms | 750.824 ms | -59.176 ms | -1.860 ms | -10.444 ms |
| Largest Contentful Paint | 4,597 ms | 3,665.026 ms | 3,654.402 ms | 4,220.236 ms | -376.764 ms | +555.210 ms | +565.834 ms |
| Cumulative Layout Shift | 0 | 0 | 0 | 0.0002275643333300318 | +0.0002275643333300318 | +0.0002275643333300318 | +0.0002275643333300318 |
| Total Blocking Time | 1,299.5 ms | 338 ms | 462.5 ms | 548.5 ms | -751 ms | +210.5 ms | +86 ms |

For timing metrics, a negative comparison is faster. These are separate single runs, and fallback-only is not a true pre-feature baseline. The final LCP point estimate is 555.210 ms slower than fallback-only but 376.764 ms faster than immediate WebGL; the data is insufficient to attribute that variance to the feature. The cautious conclusion is: **no material feature-specific LCP regression observed**. This wording is not a claim that the fallback comparison improved or that statistical equivalence was established.

The approved absolute LCP target of less than 2,500 ms is not met. Final LCP is 4,220.236 ms, which is 1,720.236 ms over the target.

The pre-feature baseline report remains absent at `C:\Users\terti\AppData\Local\Temp\opencode\ceh-readiness-baseline.json` after its earlier Windows Chrome `EPERM` failure. The fallback-only report is a controlled feature variant, not a pre-feature baseline, so no pre-feature performance comparison is available.

## Runtime Checks

| Check | Observed result |
| --- | --- |
| Deferred load and status | Before the held idle callback, the fallback was visible, no status node was mounted, and no readiness chunk was requested. After idle, status changed `loading -> ready`, all three chunks loaded, and the fallback wrapper was hidden. |
| Reduced motion | The fixture-backed production canvas made exactly 1 WebGL draw. Over the next 400 ms it added 0 RAF schedules and 0 draws, with 0 pending RAF callbacks. |
| Static visibility | A theme refresh while the reduced-motion canvas was offscreen added 0 draws. Returning onscreen added exactly 1 queued static draw and no persistent RAF. The hidden-document equivalent is covered by the passing scene unit test. |
| Animated offscreen pause | Draw count remained 26 for 400 ms while offscreen and the instrumented cancellation count was 1. Returning onscreen resumed draws to 43; the scene unit test verifies repeated resume signals leave at most one scene frame pending. |
| Pointer strength | Unit tests verify pointer force starts at 0, ignores touch, eases toward full strength after mouse input, and decays below 0.001 after pointer leave; the shader multiplies pointer force by the scalar strength uniform. |
| Unavailable status | Context loss produced `loading -> ready -> unavailable`; renderer construction failure ended at `unavailable`. Both cases exposed the fallback and removed the canvas, and context loss left `75.2%` visible. A retained ready callback cannot leave terminal `unavailable`. |
| Resource lifecycle | The passing scene unit test asserted 1 point cloud and disposal of geometry, material, renderer, `ResizeObserver`, `IntersectionObserver`, and theme observer on unmount. |
