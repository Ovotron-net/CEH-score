# WebGL Readiness Shield Design

## Goal

Add one cinematic, data-driven particle hero to the CEH Tracker dashboard without redesigning the surrounding product UI. The hero turns real preparation data into an intelligent swarm that assembles into a defensive shield, then settles into a restrained ambient state.

The feature must preserve fast access to dashboard content, work in dark and light themes, remain understandable without WebGL, and avoid turning a daily-use dashboard into a marketing page.

## Design Read

This is a preserve-mode redesign of a cybersecurity study dashboard for technical learners. The new hero uses a precise dark-tech visual language while the existing product interface remains restrained.

- `DESIGN_VARIANCE: 7`: an asymmetric split gives the hero a stronger composition without disrupting the dashboard grid.
- `MOTION_INTENSITY: 8`: GPU particle choreography is the feature, but motion is contained to the hero and has a static reduced-motion mode.
- `VISUAL_DENSITY: 6`: the hero carries useful progress information and does not introduce landing-page whitespace or decorative content.

The existing Tailwind, Radix, semantic-token, and Lucide system remains the only application design system. Fluent, Carbon, Motion, GSAP, and a second icon family are not introduced for this isolated feature.

## Scope

### Included

- Replace the compact dashboard title block with an asymmetric Split Core hero.
- Add a direct Three.js particle renderer as an isolated, dynamically imported client component.
- Drive shield behavior from the existing current average, study streak, and assessed-domain coverage.
- Support dark theme, light theme, reduced motion, mobile, WebGL failure, empty data, and loading states.
- Add focused unit, component, accessibility, browser, and performance verification.

### Excluded

- A full application redesign.
- A blocking cinematic intro or route transition.
- Persistent particles behind every route.
- Scroll hijacking, a custom cursor, audio, decorative telemetry, or a second animation library.
- Changes to routes, navigation labels, forms, charts, API contracts, or stored data.
- An invented composite readiness percentage.

## Hero Composition

The hero uses the approved Split Core composition.

- Desktop uses a two-column grid. The left side contains the existing `Dashboard` page heading, a short functional summary, the real current average, its existing readiness label, and one contextual action. The right side contains the particle shield.
- The headline remains `Dashboard` to preserve route identity and heading behavior.
- The summary is no longer than 20 words and explains that assessment progress shapes the shield.
- If assessments exist, the action links to Analytics. If no assessments exist, it links to Add Assessment.
- Mobile below 768px collapses to one column, keeps copy first, and uses a shorter reserved canvas region below it.
- Existing stat cards, charts, recent assessments, and quick actions remain below the hero.

The hero uses the current emerald primary token as its only accent. Backgrounds, text, and borders use existing semantic tokens. Cards retain the established 12-16px radius family. The feature does not add gradient text, generic glassmorphism, outer neon glow, decorative status dots, version labels, fake system metadata, or a scroll cue.

## Data Semantics

The particle system visualizes existing values without replacing their textual presentation.

### Current average

`calculateStats(assessments).averageScore` is displayed as the real percentage and passed to the renderer as a normalized value from 0 to 1. It controls shield cohesion. A low score still produces a visible shield; it increases drift and reduces edge stability rather than hiding the object.

The textual readiness label comes from the existing `getReadinessLevel` function. The renderer does not calculate or display a separate readiness score.

### Study streak

`calculateStats(assessments).studyStreak` controls orbital regularity. The visual input is capped at 14 days so unusually long streaks do not create extreme shader values. A larger streak produces more coherent orbit paths and less random displacement.

### Domain coverage

Coverage is the count of distinct known CEH domains represented by domain-specific assessments divided by `CEH_DOMAINS.length`. It controls how many shield sectors receive the stable target pattern. Full-exam results do not create domain coverage because they contain no measured domain result.

The component exposes all three values as normal text. The canvas is `aria-hidden` and never carries unique information.

## Particle Choreography

The visual has three states.

1. **Swarm:** Particles begin in a loose, coordinated orbital field around the shield center.
2. **Assembly:** On the first visible render, particles accelerate toward precomputed shield target positions and assemble once over approximately 1.6 seconds.
3. **Stable field:** The completed shield breathes subtly while a minority of particles continue orbital paths. Pointer proximity creates a localized deflection that springs back into formation.

The motion communicates preparation becoming structured defense. It does not loop the assembly sequence automatically. Pointer interaction updates shader uniforms directly and never writes continuous values to React state.

Reduced motion skips the swarm and assembly states. It renders one fully assembled frame, disables pointer response, and stops the animation loop.

## WebGL Architecture

Add `three` as the only new runtime dependency. Use direct Three.js rather than React Three Fiber so the renderer remains a small imperative leaf outside the React reconciliation path.

### Component boundaries

- `ReadinessHero` owns semantic copy, real data labels, actions, loading, empty, and fallback presentation.
- `ReadinessShield` is a dynamically imported client-only boundary that reserves the canvas region.
- `ReadinessShieldScene` owns Three.js setup, geometry, shader material, uniforms, resize handling, pointer handling, visibility control, frame scheduling, and disposal.
- A pure mapping function converts dashboard statistics into bounded visual parameters and is tested independently.

The scene uses one `THREE.Points` draw call. One buffer contains seed positions and another contains shield target positions. A custom vertex shader interpolates between swarm and shield states and applies bounded noise, orbit, and pointer displacement. The fragment shader renders soft circular points without loading textures or image assets.

The scene does not touch application data fetching. It receives serializable numeric props from the dashboard view.

## Lifecycle And Performance

- Dynamically import the Three.js leaf with server rendering disabled. Semantic hero content renders immediately.
- Reserve desktop and mobile canvas dimensions in CSS to prevent layout shift.
- Use tiered particle budgets based on viewport size and conservative device capability signals. Target approximately 12,000-18,000 points on capable desktop devices and 3,000-6,000 on mobile.
- Cap renderer pixel ratio at 1.5 on desktop and 1.25 on mobile.
- Keep particle motion in the vertex shader. JavaScript updates only a small uniform set per frame.
- Use `ResizeObserver` for the containing element instead of global layout polling.
- Use `IntersectionObserver` and `document.visibilityState` to pause rendering when the hero is offscreen or the tab is hidden.
- Remove observers and listeners, cancel the animation frame, dispose geometry and material, and dispose the renderer during cleanup.
- Do not add Motion or GSAP. Three.js owns the hero frame loop and no other library competes for it.
- Preserve dashboard LCP by rendering meaningful text and the static placeholder before the WebGL chunk finishes loading.

The feature targets INP below 200ms, CLS below 0.1, and no material regression to the existing page LCP. Final verification records the added client chunk size and a Lighthouse comparison.

## Themes

The renderer derives its point, edge, and background-adjacent colors from the existing CSS variables rather than hard-coded theme colors. Theme changes update scene uniforms without rebuilding geometry.

- Dark mode uses the existing dark background and emerald primary token with restrained luminance.
- Light mode uses the existing light background and darker primary token so particles remain visible without glow.
- The hero never forces a section-level theme inversion.
- WebGL clearing remains transparent so the semantic page background is authoritative.

## Accessibility And Input

- The hero retains one page-level `h1` and normal document reading order.
- The canvas is decorative and uses `aria-hidden="true"`.
- Average, readiness label, streak, and domain coverage are available as text outside the canvas.
- The call to action remains a normal keyboard-accessible link with the existing focus treatment and a minimum 44 by 44 CSS pixel target.
- Pointer effects are optional. Touch input does not require dragging and does not block page scrolling.
- `prefers-reduced-motion: reduce` renders a static shield and creates no persistent animation loop.
- WebGL failure does not announce an error because the visual is decorative. The semantic hero remains complete.

## UI States

### Loading

The semantic hero and reserved visual region render immediately. The visual region shows the existing Lucide Shield icon in a static token-based composition until the WebGL chunk and scene are ready. There is no spinner.

### Empty data

The hero states that no assessment data exists, shows no percentage or readiness classification, and provides an `Add assessment` link. The visual renders a calm, partially assembled neutral shield and does not imply measured progress.

### WebGL unavailable

If renderer construction or shader compilation fails, the static Shield fallback remains. The failure is contained and dashboard content continues normally. Development logging may record the error; no raw technical message is shown to the user.

### Runtime loss

Handle `webglcontextlost` by stopping the frame loop and showing the static fallback. Dispose the old scene during unmount; a remount or route revisit may attempt initialization again.

## Testing

### Unit and component tests

- Verify bounded parameter mapping for empty, low, threshold, high, and unusually large inputs.
- Verify full-exam records do not count as domain coverage.
- Verify semantic copy and actions for loading, empty, populated, and failed visual states.
- Verify the canvas is decorative and real values remain textual.
- Verify reduced motion requests a static scene.
- Mock Three.js to verify setup, resize, pause, context loss, and complete cleanup without leaked animation frames or listeners.

### Browser tests

- Verify desktop and 375px mobile layouts have no horizontal overflow.
- Verify dark and light modes retain readable hero text and visible fallback content.
- Verify reduced motion produces no continuously changing canvas frames.
- Verify simulated WebGL failure leaves the dashboard usable.
- Verify there are no accessibility violations, uncaught exceptions, or console errors during normal initialization.
- Verify navigation focus behavior and the existing single-main landmark contract remain unchanged.

### Performance checks

- Run the production build and record the dashboard route chunk impact.
- Run Lighthouse before and after the feature on desktop and mobile profiles.
- Confirm CLS remains below 0.1 and INP remains below 200ms.
- Confirm the renderer pauses offscreen and while the document is hidden.

## Acceptance Criteria

- The dashboard hero uses the Split Core composition and fits without obscuring primary content.
- Real assessment data visibly changes shield cohesion, orbit regularity, and active sectors.
- No invented readiness percentage or unmeasured domain score appears.
- The assembly runs once, then settles into restrained ambient motion.
- Reduced motion, empty data, WebGL failure, context loss, mobile, dark mode, and light mode all have intentional behavior.
- The canvas is decorative and every represented value is available as text.
- Three.js is isolated to a dynamically imported client leaf and is absent from unrelated route bundles.
- The scene uses one point draw call, bounded particle budgets, capped pixel ratio, visibility pausing, and complete disposal.
- Existing dashboard workflows, charts, navigation, accessibility behavior, and server hydration remain intact.
- Unit tests, browser tests, lint, type checking, production build, and performance checks pass.
