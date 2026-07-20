# WebGL Readiness Shield Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a data-driven Three.js particle shield to the dashboard hero while preserving dashboard usability, accessibility, hydration, themes, and performance.

**Architecture:** The existing Dashboard query remains the only data source. Pure utilities convert assessments into bounded visual parameters, a semantic `ReadinessHero` renders all information as HTML, and one dynamically imported client leaf owns Three.js and its frame loop. The WebGL canvas is decorative and can fail, pause, or become static without affecting dashboard content.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 3, TanStack Query, Three.js, Vitest, Testing Library, Playwright, axe-core.

## Global Constraints

- Preserve the existing Tailwind, Radix, semantic-token, and Lucide design system. Do not add Fluent, Carbon, Motion, GSAP, React Three Fiber, or another icon family.
- Add `three` as the only new runtime dependency.
- Keep `Dashboard` as the single page-level `h1` and preserve all existing routes, query hydration, stat cards, charts, forms, and navigation behavior.
- Display only real values. Do not invent a readiness percentage or unmeasured domain score.
- Use exact `DOMAIN_NAMES` membership for domain coverage. `Full Exam`, unknown legacy labels, and duplicates do not increase coverage.
- Use emerald `primary` as the only accent and existing CSS variables for both themes. Do not add gradient text, outer neon glow, generic glassmorphism, or fake telemetry.
- Keep the canvas `aria-hidden`. Average, readiness label, streak, and coverage must remain readable as HTML.
- Reduced motion renders one assembled frame and schedules no persistent animation loop.
- Use one `THREE.Points` draw call. Particle movement runs in the vertex shader, not in React state or a per-particle JavaScript loop.
- Cap device pixel ratio at 1.5 on desktop and 1.25 on mobile. Use approximately 12,000-18,000 particles on capable desktops and 3,000-6,000 on mobile.
- Pause while offscreen or hidden. Cleanup must cancel RAF, remove listeners, disconnect observers, and dispose Three.js resources.
- Use ASCII in source and visible copy. Do not introduce em-dash or en-dash characters.
- Preserve unrelated worktree changes. Do not commit unless the user explicitly requests a commit.

---

### Task 1: Map Assessment Data To Visual Parameters

**Files:**
- Create: `src/utils/readinessVisual.ts`
- Create: `src/utils/readinessVisual.test.ts`

**Interfaces:**
- Consumes: `Assessment` from `src/types/index.ts`; `DOMAIN_NAMES` from `src/data/cehDomains.ts`.
- Produces: `calculateDomainCoverage(assessments: Assessment[]): DomainCoverage`.
- Produces: `mapReadinessVisualParameters(metrics: ReadinessMetrics): ReadinessVisualParameters`.

- [ ] **Step 1: Capture the pre-feature production baseline**

Before changing source or dependencies, run `npm run build`, start the fixture-backed production server on port 3100, and capture a Lighthouse JSON report:

```powershell
npm run build
$env:E2E_FIXTURES='true'; $env:ALLOW_OPEN_API='true'; $env:API_SECRET=$null; $env:PORT='3100'; npm run start
```

In a second terminal:

```powershell
npx --yes lighthouse http://127.0.0.1:3100 `
  --only-categories=performance,accessibility `
  --output=json `
  --output-path="C:\Users\terti\AppData\Local\Temp\opencode\ceh-readiness-baseline.json" `
  --chrome-flags="--headless --no-sandbox"
```

Expected: the build and Lighthouse command succeed. Preserve the baseline report until Task 5 records the comparison.

- [ ] **Step 2: Write the failing utility tests**

Create `src/utils/readinessVisual.test.ts`:

```ts
import {describe, expect, it} from 'vitest';
import type {Assessment} from '../types';
import {
    calculateDomainCoverage,
    mapReadinessVisualParameters,
} from './readinessVisual';

function assessment(domain: string, id = domain): Assessment {
    return {
        id,
        date: '2026-07-18',
        type: 'practice',
        score: 80,
        maxScore: 100,
        percentage: 80,
        timeTaken: 60,
        domain,
        notes: '',
        passed: true,
        createdAt: '2026-07-18T12:00:00.000Z',
    };
}

describe('calculateDomainCoverage', () => {
    it('counts distinct known domains and excludes full exams and unknown labels', () => {
        const result = calculateDomainCoverage([
            assessment('Cryptography', 'known-1'),
            assessment('Cryptography', 'known-2'),
            assessment('Full Exam', 'full'),
            assessment('Network Security', 'legacy'),
        ]);

        expect(result).toEqual({covered: 1, total: 20, ratio: 0.05});
    });

    it('returns zero coverage for no assessments', () => {
        expect(calculateDomainCoverage([])).toEqual({covered: 0, total: 20, ratio: 0});
    });
});

describe('mapReadinessVisualParameters', () => {
    it('returns a visible neutral field for empty data', () => {
        expect(mapReadinessVisualParameters({
            averageScore: 0,
            studyStreak: 0,
            coveredDomains: 0,
            totalDomains: 20,
            hasAssessments: false,
        })).toEqual({
            cohesion: 0.42,
            orbitRegularity: 0.2,
            sectorCoverage: 0.25,
            dataPresence: 0,
        });
    });

    it('maps real data into bounded shader inputs', () => {
        expect(mapReadinessVisualParameters({
            averageScore: 75,
            studyStreak: 7,
            coveredDomains: 10,
            totalDomains: 20,
            hasAssessments: true,
        })).toEqual({
            cohesion: 0.8875,
            orbitRegularity: 0.625,
            sectorCoverage: 0.5,
            dataPresence: 1,
        });
    });

    it('clamps invalid and unusually large values', () => {
        expect(mapReadinessVisualParameters({
            averageScore: 140,
            studyStreak: 90,
            coveredDomains: 30,
            totalDomains: 20,
            hasAssessments: true,
        })).toEqual({
            cohesion: 1,
            orbitRegularity: 1,
            sectorCoverage: 1,
            dataPresence: 1,
        });
    });
});
```

- [ ] **Step 3: Run the utility test and confirm the missing-module failure**

Run: `npx vitest run src/utils/readinessVisual.test.ts`

Expected: FAIL because `./readinessVisual` does not exist.

- [ ] **Step 4: Implement the pure mapping module**

Create `src/utils/readinessVisual.ts`:

```ts
import {DOMAIN_NAMES} from '../data/cehDomains';
import type {Assessment} from '../types';

const KNOWN_DOMAINS = new Set(DOMAIN_NAMES);

export interface DomainCoverage {
    covered: number;
    total: number;
    ratio: number;
}

export interface ReadinessMetrics {
    averageScore: number;
    studyStreak: number;
    coveredDomains: number;
    totalDomains: number;
    hasAssessments: boolean;
}

export interface ReadinessVisualParameters {
    cohesion: number;
    orbitRegularity: number;
    sectorCoverage: number;
    dataPresence: 0 | 1;
}

function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(maximum, Math.max(minimum, value));
}

export function calculateDomainCoverage(assessments: Assessment[]): DomainCoverage {
    const coveredDomains = new Set<string>();

    for (const assessment of assessments) {
        if (KNOWN_DOMAINS.has(assessment.domain)) coveredDomains.add(assessment.domain);
    }

    const total = DOMAIN_NAMES.length;
    const covered = coveredDomains.size;
    return {covered, total, ratio: total === 0 ? 0 : covered / total};
}

export function mapReadinessVisualParameters(metrics: ReadinessMetrics): ReadinessVisualParameters {
    if (!metrics.hasAssessments) {
        return {
            cohesion: 0.42,
            orbitRegularity: 0.2,
            sectorCoverage: 0.25,
            dataPresence: 0,
        };
    }

    const normalizedAverage = clamp(metrics.averageScore, 0, 100) / 100;
    const normalizedStreak = clamp(metrics.studyStreak, 0, 14) / 14;
    const normalizedCoverage = metrics.totalDomains <= 0
        ? 0
        : clamp(metrics.coveredDomains / metrics.totalDomains, 0, 1);

    return {
        cohesion: 0.55 + normalizedAverage * 0.45,
        orbitRegularity: 0.25 + normalizedStreak * 0.75,
        sectorCoverage: normalizedCoverage,
        dataPresence: 1,
    };
}
```

- [ ] **Step 5: Run the utility tests and type check**

Run: `npx vitest run src/utils/readinessVisual.test.ts && npx tsc --noEmit`

Expected: all readiness visual tests PASS and TypeScript exits with code 0.

- [ ] **Step 6: Review the task diff**

Run: `git diff -- src/utils/readinessVisual.ts src/utils/readinessVisual.test.ts`

Expected: only the pure mapping module and its tests appear. Do not commit unless explicitly requested.

---

### Task 2: Add The Semantic Split Core Hero

**Files:**
- Create: `src/components/readiness/ReadinessHero.tsx`
- Create: `src/components/readiness/ReadinessHero.test.tsx`
- Create: `src/components/readiness/ReadinessShieldFallback.tsx`
- Create: `src/components/readiness/ReadinessShield.tsx`
- Modify: `src/views/Dashboard.tsx:3-29`
- Modify: `src/views/Dashboard.test.tsx`

**Interfaces:**
- Consumes: `ReadinessVisualParameters` and `mapReadinessVisualParameters` from Task 1.
- Produces: `ReadinessHeroState = 'loading' | 'unavailable' | 'empty' | 'ready'`.
- Produces: default `ReadinessHero(props: ReadinessHeroProps)`.
- Produces: default `ReadinessShield({parameters}: ReadinessShieldProps)` as a static fallback in this task. Task 3 upgrades its internals without changing the prop contract.

- [ ] **Step 1: Write failing semantic hero tests**

Create `src/components/readiness/ReadinessHero.test.tsx`:

```tsx
import {cleanup, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import ReadinessHero from './ReadinessHero';

vi.mock('next/link', () => ({
    default: ({children, href, ...props}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {href: string}) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

afterEach(cleanup);

describe('ReadinessHero', () => {
    it('renders real populated metrics as text', () => {
        render(<ReadinessHero
            state="ready"
            averageScore={75.2}
            studyStreak={1}
            coveredDomains={1}
            totalDomains={20}
        />);

        expect(screen.getByRole('heading', {name: 'Dashboard', level: 1})).toBeVisible();
        expect(screen.getByText('75.2%')).toBeVisible();
        expect(screen.getByText('Almost Ready')).toBeVisible();
        expect(screen.getByText('1 day')).toBeVisible();
        expect(screen.getByText('1 of 20')).toBeVisible();
        expect(screen.getByRole('link', {name: 'View analytics'})).toHaveAttribute('href', '/analytics');
        expect(screen.getByRole('link', {name: 'View analytics'})).toHaveClass('min-h-11');
    });

    it('does not invent values when data is empty', () => {
        render(<ReadinessHero
            state="empty"
            averageScore={0}
            studyStreak={0}
            coveredDomains={0}
            totalDomains={20}
        />);

        expect(screen.queryByText('0%')).not.toBeInTheDocument();
        expect(screen.queryByText('Needs Work')).not.toBeInTheDocument();
        expect(screen.getByRole('link', {name: 'Add assessment'})).toHaveAttribute('href', '/add');
    });

    it('keeps loading and unavailable states semantic without false metrics', () => {
        const {rerender} = render(<ReadinessHero
            state="loading"
            averageScore={0}
            studyStreak={0}
            coveredDomains={0}
            totalDomains={20}
        />);
        expect(screen.getByText('Loading your preparation overview.')).toBeVisible();

        rerender(<ReadinessHero
            state="unavailable"
            averageScore={0}
            studyStreak={0}
            coveredDomains={0}
            totalDomains={20}
        />);
        expect(screen.getByText('Preparation data is unavailable.')).toBeVisible();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('keeps the particle visual decorative', () => {
        const {container} = render(<ReadinessHero
            state="ready"
            averageScore={80}
            studyStreak={2}
            coveredDomains={3}
            totalDomains={20}
        />);

        expect(container.querySelector('[data-readiness-visual]')).toHaveAttribute('aria-hidden', 'true');
    });
});
```

- [ ] **Step 2: Run the hero test and confirm the missing-module failure**

Run: `npx vitest run src/components/readiness/ReadinessHero.test.tsx`

Expected: FAIL because `ReadinessHero` does not exist.

- [ ] **Step 3: Implement the static shield boundary**

Create `src/components/readiness/ReadinessShieldFallback.tsx`:

```tsx
import {Shield} from 'lucide-react';

export default function ReadinessShieldFallback() {
    return (
        <div
            data-readiness-fallback
            className="flex h-full min-h-56 items-center justify-center sm:min-h-64"
            aria-hidden="true"
        >
            <div className="flex size-36 items-center justify-center rounded-full border border-primary/20 bg-primary/5 sm:size-44">
                <Shield className="size-20 text-primary/70 sm:size-24" strokeWidth={1}/>
            </div>
        </div>
    );
}
```

Create `src/components/readiness/ReadinessShield.tsx`:

```tsx
'use client';

import type {ReadinessVisualParameters} from '../../utils/readinessVisual';
import ReadinessShieldFallback from './ReadinessShieldFallback';

export interface ReadinessShieldProps {
    parameters: ReadinessVisualParameters;
}

export default function ReadinessShield({parameters}: ReadinessShieldProps) {
    void parameters;
    return <ReadinessShieldFallback/>;
}
```

- [ ] **Step 4: Implement the semantic hero**

Create `src/components/readiness/ReadinessHero.tsx`:

```tsx
'use client';

import Link from 'next/link';
import {getReadinessLevel, formatScore} from '../../utils/calculations';
import {mapReadinessVisualParameters} from '../../utils/readinessVisual';
import ReadinessShield from './ReadinessShield';

export type ReadinessHeroState = 'loading' | 'unavailable' | 'empty' | 'ready';

export interface ReadinessHeroProps {
    state: ReadinessHeroState;
    averageScore: number;
    studyStreak: number;
    coveredDomains: number;
    totalDomains: number;
}

export default function ReadinessHero({
    state,
    averageScore,
    studyStreak,
    coveredDomains,
    totalDomains,
}: ReadinessHeroProps) {
    const isReady = state === 'ready';
    const parameters = mapReadinessVisualParameters({
        averageScore,
        studyStreak,
        coveredDomains,
        totalDomains,
        hasAssessments: isReady,
    });
    const summary = state === 'loading'
        ? 'Loading your preparation overview.'
        : state === 'unavailable'
            ? 'Preparation data is unavailable.'
            : state === 'empty'
                ? 'Add an assessment to begin mapping your preparation.'
                : 'Your assessment history shapes this live readiness shield.';

    return (
        <section
            aria-label="Readiness overview"
            className="mb-8 overflow-hidden rounded-2xl border border-border/70 bg-card/60"
        >
            <div className="grid items-stretch md:grid-cols-[minmax(0,1.05fr)_minmax(18rem,.95fr)]">
                <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-9">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Dashboard</h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">{summary}</p>

                    {isReady ? (
                        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5">
                            <div>
                                <dt className="text-xs text-muted-foreground">Current average</dt>
                                <dd className="mt-1 text-3xl font-bold tabular-nums text-foreground">
                                    {formatScore(averageScore)}%
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-muted-foreground">Readiness</dt>
                                <dd className="mt-1 text-sm font-semibold text-primary">{getReadinessLevel(averageScore)}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-muted-foreground">Study streak</dt>
                                <dd className="mt-1 font-semibold tabular-nums text-foreground">
                                    {studyStreak} {studyStreak === 1 ? 'day' : 'days'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-muted-foreground">Domains assessed</dt>
                                <dd className="mt-1 font-semibold tabular-nums text-foreground">
                                    {coveredDomains} of {totalDomains}
                                </dd>
                            </div>
                        </dl>
                    ) : null}

                    {state === 'ready' || state === 'empty' ? (
                        <Link
                            href={state === 'ready' ? '/analytics' : '/add'}
                            className="mt-7 inline-flex min-h-11 w-fit items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                            {state === 'ready' ? 'View analytics' : 'Add assessment'}
                        </Link>
                    ) : null}
                </div>

                <div
                    data-readiness-visual
                    aria-hidden="true"
                    className="min-h-56 border-t border-border/50 bg-background/35 sm:min-h-64 md:min-h-80 md:border-l md:border-t-0"
                >
                    <ReadinessShield parameters={parameters}/>
                </div>
            </div>
        </section>
    );
}
```

- [ ] **Step 5: Integrate the hero with the existing Dashboard query**

Modify `src/views/Dashboard.tsx`:

```tsx
import {useMemo} from 'react';
// Keep the existing imports, remove the title-block Shield import, then add:
import ReadinessHero, {type ReadinessHeroState} from '../components/readiness/ReadinessHero';
import {calculateDomainCoverage} from '../utils/readinessVisual';

// Inside Dashboard, after calculateStats:
const domainCoverage = useMemo(() => calculateDomainCoverage(assessments), [assessments]);
const heroState: ReadinessHeroState = isLoading
    ? 'loading'
    : isError
        ? 'unavailable'
        : assessments.length === 0
            ? 'empty'
            : 'ready';

// Replace the old title block at the start of the page with:
<ReadinessHero
    state={heroState}
    averageScore={stats.averageScore}
    studyStreak={stats.studyStreak}
    coveredDomains={domainCoverage.covered}
    totalDomains={domainCoverage.total}
/>
```

Keep the current loading, error, stat-card, chart, recent-assessment, and quick-action branches unchanged after the hero.

- [ ] **Step 6: Extend the Dashboard integration test**

In `src/views/Dashboard.test.tsx`, mock the hero and add one assertion-focused test:

```tsx
const {useAssessmentQuery, readinessHero} = vi.hoisted(() => ({
    useAssessmentQuery: vi.fn(),
    readinessHero: vi.fn(() => <div>Readiness hero</div>),
}));

vi.mock('../components/readiness/ReadinessHero', () => ({
    default: readinessHero,
}));

it('passes real statistics and exact known-domain coverage to the hero', () => {
    useAssessmentQuery.mockReturnValue({
        data: [
            assessment('1', '2026-07-18', 'Cryptography'),
            assessment('2', '2026-07-17', 'Cryptography'),
            assessment('3', '2026-07-16', 'Full Exam'),
            assessment('4', '2026-07-15', 'Unknown Domain'),
        ],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
    });

    render(<Dashboard/>);

    expect(readinessHero).toHaveBeenCalledWith(expect.objectContaining({
        state: 'ready',
        coveredDomains: 1,
        totalDomains: 20,
    }), undefined);
});
```

Change the local factory signature to preserve existing callers while accepting a real domain:

```tsx
function assessment(id: string, date: string, domain = `Domain ${id}`): Assessment {
    return {
        id,
        date,
        type: 'practice',
        score: 100,
        maxScore: 125,
        percentage: 80,
        timeTaken: 90,
        domain,
        notes: '',
        passed: true,
        createdAt: `${date}T12:00:00.000Z`,
    };
}
```

- [ ] **Step 7: Run focused tests and type checking**

Run: `npx vitest run src/utils/readinessVisual.test.ts src/components/readiness/ReadinessHero.test.tsx src/views/Dashboard.test.tsx && npx tsc --noEmit`

Expected: all focused tests PASS and TypeScript exits with code 0.

- [ ] **Step 8: Review the semantic hero in both query states**

Run: `git diff -- src/components/readiness src/views/Dashboard.tsx src/views/Dashboard.test.tsx`

Expected: one semantic hero, one static visual fallback, and no query or route changes. Do not commit unless explicitly requested.

---

### Task 3: Add The Isolated Three.js Particle Scene

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/components/readiness/ReadinessHero.tsx`
- Modify: `src/components/readiness/ReadinessShield.tsx`
- Create: `src/components/readiness/ReadinessShield.test.tsx`
- Create: `src/components/readiness/ReadinessShieldScene.tsx`
- Create: `src/components/readiness/ReadinessShieldScene.test.tsx`

**Interfaces:**
- Consumes: `ReadinessVisualParameters` from Task 1.
- Produces: `ReadinessShieldScene({parameters, onReady, onUnavailable})`.
- Produces: a dynamic boundary that keeps the existing `ReadinessShieldProps` contract.
- The scene emits only discrete ready/unavailable callbacks. Pointer, resize, time, and theme values never enter React state.

- [ ] **Step 1: Install the verified runtime dependency**

Run: `npm install three`

Expected: `three` appears under `dependencies`, `package-lock.json` updates, and no animation or React Three Fiber package is added.

Run: `npm ls three`

Expected: one resolved `three` version under `ceh-score` with no invalid peer dependency.

- [ ] **Step 2: Write the failing dynamic-boundary test**

Create `src/components/readiness/ReadinessShield.test.tsx`:

```tsx
import {cleanup, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import type {ReadinessVisualParameters} from '../../utils/readinessVisual';

const scene = vi.hoisted(() => vi.fn(({onReady}: {onReady: () => void}) => (
    <button type="button" onClick={onReady}>Ready scene</button>
)));

vi.mock('./ReadinessShieldScene', () => ({default: scene}));

import ReadinessShield from './ReadinessShield';

const parameters: ReadinessVisualParameters = {
    cohesion: 0.9,
    orbitRegularity: 0.7,
    sectorCoverage: 0.5,
    dataPresence: 1,
};

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ReadinessShield', () => {
    it('shows the fallback until the scene reports ready', async () => {
        const {container} = render(<ReadinessShield parameters={parameters}/>);
        expect(container.querySelector('[data-readiness-fallback]')).toBeVisible();

        screen.getByRole('button', {name: 'Ready scene'}).click();
        await waitFor(() => expect(container.querySelector('[data-readiness-fallback]')).not.toBeVisible());
    });

    it('keeps the fallback when the scene becomes unavailable', async () => {
        scene.mockImplementationOnce(({onUnavailable}: {onUnavailable: () => void}) => (
            <button type="button" onClick={onUnavailable}>Fail scene</button>
        ));
        const {container} = render(<ReadinessShield parameters={parameters}/>);

        screen.getByRole('button', {name: 'Fail scene'}).click();
        await waitFor(() => expect(container.querySelector('[data-readiness-fallback]')).toBeVisible());
    });
});
```

- [ ] **Step 3: Write failing scene lifecycle tests with local browser mocks**

Create `src/components/readiness/ReadinessShieldScene.test.tsx`. Build local deterministic mocks for `requestAnimationFrame`, `cancelAnimationFrame`, `ResizeObserver`, `IntersectionObserver`, `matchMedia`, and the Three.js constructors used by the scene. The required assertions are:

```tsx
it('creates one point cloud, caps pixel ratio, and disposes every resource', () => {
    const {unmount} = render(<ReadinessShieldScene
        parameters={parameters}
        onReady={onReady}
        onUnavailable={onUnavailable}
    />);

    expect(three.scene.add).toHaveBeenCalledTimes(1);
    expect(three.renderer.setPixelRatio).toHaveBeenCalledWith(expect.any(Number));
    expect(three.renderer.setPixelRatio.mock.calls[0][0]).toBeLessThanOrEqual(1.5);

    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalled();
    expect(three.geometry.dispose).toHaveBeenCalledOnce();
    expect(three.material.dispose).toHaveBeenCalledOnce();
    expect(three.renderer.dispose).toHaveBeenCalledOnce();
    expect(resizeObserver.disconnect).toHaveBeenCalledOnce();
    expect(intersectionObserver.disconnect).toHaveBeenCalledOnce();
});

it('renders once and schedules no persistent frame for reduced motion', () => {
    reducedMotion = true;
    render(<ReadinessShieldScene
        parameters={parameters}
        onReady={onReady}
        onUnavailable={onUnavailable}
    />);

    expect(three.renderer.render).toHaveBeenCalledOnce();
    expect(requestAnimationFrame).not.toHaveBeenCalled();
});

it('pauses offscreen and resumes with at most one frame', () => {
    render(<ReadinessShieldScene
        parameters={parameters}
        onReady={onReady}
        onUnavailable={onUnavailable}
    />);

    intersectionObserver.trigger(false);
    expect(cancelAnimationFrame).toHaveBeenCalled();

    intersectionObserver.trigger(true);
    intersectionObserver.trigger(true);
    expect(pendingFrames.size).toBe(1);
});

it('updates theme uniforms without rebuilding geometry', () => {
    render(<ReadinessShieldScene
        parameters={parameters}
        onReady={onReady}
        onUnavailable={onUnavailable}
    />);
    const geometryCount = three.BufferGeometry.mock.calls.length;

    document.documentElement.className = 'light';
    themeObserver.trigger();

    expect(three.uniformColor.setHSL).toHaveBeenCalled();
    expect(three.BufferGeometry).toHaveBeenCalledTimes(geometryCount);
});

it('falls back on renderer construction or context loss', () => {
    three.WebGLRenderer.mockImplementationOnce(() => {
        throw new Error('WebGL unavailable');
    });
    const {rerender} = render(<ReadinessShieldScene
        parameters={parameters}
        onReady={onReady}
        onUnavailable={onUnavailable}
    />);
    expect(onUnavailable).toHaveBeenCalledOnce();

    three.WebGLRenderer.mockImplementation(() => three.renderer);
    rerender(<ReadinessShieldScene
        parameters={{...parameters, cohesion: 0.8}}
        onReady={onReady}
        onUnavailable={onUnavailable}
    />);
    fireEvent(document.querySelector('canvas')!, new Event('webglcontextlost'));
    expect(onUnavailable).toHaveBeenCalled();
});
```

Use `vi.hoisted()` for the Three.js mock surface, a `Map<number, FrameRequestCallback>` for pending frames, and `vi.unstubAllGlobals()` plus `cleanup()` after every test. Do not add these mocks to global test setup.

- [ ] **Step 4: Run the new tests and confirm they fail against the static boundary**

Run: `npx vitest run src/components/readiness/ReadinessShield.test.tsx src/components/readiness/ReadinessShieldScene.test.tsx`

Expected: FAIL because the scene does not exist and the boundary has no readiness lifecycle.

- [ ] **Step 5: Upgrade the shield boundary to discrete loading, ready, and unavailable states**

Replace the default export in `src/components/readiness/ReadinessShield.tsx` and import the standalone fallback:

```tsx
import {useState} from 'react';
import ReadinessShieldScene from './ReadinessShieldScene';
import ReadinessShieldFallback from './ReadinessShieldFallback';

export default function ReadinessShield({parameters}: ReadinessShieldProps) {
    const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');

    return (
        <div className="relative h-full min-h-56 sm:min-h-64 md:min-h-80">
            <div className={status === 'ready' ? 'invisible absolute inset-0' : 'absolute inset-0'}>
                <ReadinessShieldFallback/>
            </div>
            {status !== 'unavailable' ? (
                <ReadinessShieldScene
                    parameters={parameters}
                    onReady={() => setStatus('ready')}
                    onUnavailable={() => setStatus('unavailable')}
                />
            ) : null}
        </div>
    );
}
```

Continuous values remain inside Three.js. These state changes occur only when initialization succeeds or fails.

- [ ] **Step 6: Isolate the complete shield chunk behind `next/dynamic` and a local error boundary**

Modify `src/components/readiness/ReadinessHero.tsx` so `ReadinessShield` and Three.js are absent from the initial Dashboard module graph. Remove the static `ReadinessShield` import from Task 2 and replace it with:

```tsx
import {Component, type ErrorInfo, type ReactNode} from 'react';
import dynamic from 'next/dynamic';
import ReadinessShieldFallback from './ReadinessShieldFallback';

const ReadinessShield = dynamic(() => import('./ReadinessShield'), {
    ssr: false,
    loading: () => <ReadinessShieldFallback/>,
});

class ReadinessVisualBoundary extends Component<
    {children: ReactNode},
    {failed: boolean}
> {
    state = {failed: false};

    static getDerivedStateFromError() {
        return {failed: true};
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        if (process.env.NODE_ENV !== 'production') console.error(error, info);
    }

    render() {
        return this.state.failed ? <ReadinessShieldFallback/> : this.props.children;
    }
}

// Wrap the visual instance:
<ReadinessVisualBoundary>
    <ReadinessShield parameters={parameters}/>
</ReadinessVisualBoundary>
```

The fallback stays in its own module so the static Hero import cannot make the Three.js scene reachable from the initial bundle.

- [ ] **Step 7: Implement the Three.js scene as one point draw call**

Create `src/components/readiness/ReadinessShieldScene.tsx` with these exact responsibilities:

```tsx
'use client';

import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import type {ReadinessVisualParameters} from '../../utils/readinessVisual';

interface ReadinessShieldSceneProps {
    parameters: ReadinessVisualParameters;
    onReady: () => void;
    onUnavailable: () => void;
}

const vertexShader = `
attribute vec3 aSeed;
attribute vec3 aTarget;
attribute float aSector;
attribute float aRandom;
uniform float uTime;
uniform float uAssembly;
uniform float uCohesion;
uniform float uOrbitRegularity;
uniform float uSectorCoverage;
uniform float uDataPresence;
uniform vec2 uPointer;
varying float vAlpha;

void main() {
    float activeSector = step(aSector, uSectorCoverage + 0.001);
    float stability = mix(0.42, uCohesion, activeSector);
    float assembled = smoothstep(0.0, 1.0, uAssembly) * stability;
    float orbitAngle = uTime * mix(0.32, 0.12, uOrbitRegularity) + aRandom * 6.28318;
    vec3 orbit = vec3(cos(orbitAngle), sin(orbitAngle * 0.83), sin(orbitAngle))
        * (0.10 + (1.0 - uOrbitRegularity) * 0.16);
    vec3 position = mix(aSeed + orbit, aTarget, assembled);
    vec2 delta = position.xy - uPointer * vec2(2.1, 1.7);
    float pointerForce = max(0.0, 0.55 - length(delta)) * 0.18;
    position.xy += normalize(delta + vec2(0.0001)) * pointerForce;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = clamp(10.0 / -viewPosition.z, 1.2, 3.2);
    vAlpha = mix(0.28, 0.92, activeSector)
        * mix(0.65, 1.0, stability)
        * mix(0.72, 1.0, uDataPresence);
}
`;

const fragmentShader = `
uniform vec3 uColor;
varying float vAlpha;

void main() {
    float distanceFromCenter = distance(gl_PointCoord, vec2(0.5));
    float alpha = smoothstep(0.5, 0.12, distanceFromCenter) * vAlpha;
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(uColor, alpha);
}
`;

function particleBudget(): number {
    const connection = (navigator as Navigator & {connection?: {saveData?: boolean}}).connection;
    if (window.innerWidth < 768 || connection?.saveData) return 4000;
    if ((navigator.hardwareConcurrency ?? 4) >= 8 && window.innerWidth >= 1280) return 16000;
    return 12000;
}

function parseHslChannels(value: string): [number, number, number] | null {
    const match = value.trim().match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
    return match ? [Number(match[1]) / 360, Number(match[2]) / 100, Number(match[3]) / 100] : null;
}

function createAttributes(count: number) {
    const seeds = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);
    const sectors = new Float32Array(count);
    const randoms = new Float32Array(count);

    for (let index = 0; index < count; index += 1) {
        const offset = index * 3;
        const radius = 1.8 + Math.random() * 1.8;
        const angle = Math.random() * Math.PI * 2;
        const elevation = (Math.random() - 0.5) * 2.8;
        seeds[offset] = Math.cos(angle) * radius;
        seeds[offset + 1] = elevation;
        seeds[offset + 2] = Math.sin(angle) * radius * 0.45;

        const y = 1.9 - Math.random() * 3.8;
        const lowerHalf = y < 0;
        const width = lowerHalf
            ? 1.55 * Math.sqrt(Math.max(0, (y + 1.9) / 1.9))
            : 1.45 + (y / 1.9) * 0.18;
        targets[offset] = (Math.random() * 2 - 1) * width;
        targets[offset + 1] = y;
        targets[offset + 2] = (Math.random() - 0.5) * 0.18;
        sectors[index] = (Math.floor(((Math.atan2(targets[offset + 1], targets[offset]) + Math.PI) / (Math.PI * 2)) * 8) + 0.5) / 8;
        randoms[index] = Math.random();
    }

    return {seeds, targets, sectors, randoms};
}

export default function ReadinessShieldScene({
    parameters,
    onReady,
    onUnavailable,
}: ReadinessShieldSceneProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const parametersRef = useRef(parameters);
    const onReadyRef = useRef(onReady);
    const onUnavailableRef = useRef(onUnavailable);
    parametersRef.current = parameters;
    onReadyRef.current = onReady;
    onUnavailableRef.current = onUnavailable;

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvas?.parentElement;
        if (!canvas || !container) return;

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: false, powerPreference: 'high-performance'});
        } catch {
            onUnavailableRef.current();
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 20);
        camera.position.z = 6;
        const geometry = new THREE.BufferGeometry();
        const attributes = createAttributes(particleBudget());
        geometry.setAttribute('position', new THREE.BufferAttribute(attributes.targets, 3));
        geometry.setAttribute('aSeed', new THREE.BufferAttribute(attributes.seeds, 3));
        geometry.setAttribute('aTarget', new THREE.BufferAttribute(attributes.targets, 3));
        geometry.setAttribute('aSector', new THREE.BufferAttribute(attributes.sectors, 1));
        geometry.setAttribute('aRandom', new THREE.BufferAttribute(attributes.randoms, 1));

        const uniforms = {
            uTime: {value: 0},
            uAssembly: {value: 0},
            uCohesion: {value: parametersRef.current.cohesion},
            uOrbitRegularity: {value: parametersRef.current.orbitRegularity},
            uSectorCoverage: {value: parametersRef.current.sectorCoverage},
            uDataPresence: {value: parametersRef.current.dataPresence},
            uPointer: {value: new THREE.Vector2(20, 20)},
            uColor: {value: new THREE.Color()},
        };
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        const points = new THREE.Points(geometry, material);
        scene.add(points);

        let disposed = false;
        let visible = true;
        let documentVisible = document.visibilityState !== 'hidden';
        let frameId: number | null = null;
        let activeTime = 0;
        let previousTime: number | null = null;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const updateTheme = () => {
            const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary');
            const hsl = parseHslChannels(primary);
            if (hsl) uniforms.uColor.value.setHSL(...hsl);
        };

        const renderFrame = (time: number) => {
            frameId = null;
            if (disposed || !visible || !documentVisible) return;
            const delta = previousTime === null ? 0 : Math.min(50, time - previousTime);
            previousTime = time;
            activeTime += delta;
            uniforms.uTime.value = activeTime / 1000;
            uniforms.uAssembly.value = reducedMotion ? 1 : Math.min(1, activeTime / 1600);
            uniforms.uCohesion.value = parametersRef.current.cohesion;
            uniforms.uOrbitRegularity.value = parametersRef.current.orbitRegularity;
            uniforms.uSectorCoverage.value = parametersRef.current.sectorCoverage;
            uniforms.uDataPresence.value = parametersRef.current.dataPresence;
            renderer.render(scene, camera);
            if (!reducedMotion) frameId = requestAnimationFrame(renderFrame);
        };

        const start = () => {
            if (disposed || reducedMotion || !visible || !documentVisible || frameId !== null) return;
            previousTime = null;
            frameId = requestAnimationFrame(renderFrame);
        };
        const stop = () => {
            if (frameId !== null) cancelAnimationFrame(frameId);
            frameId = null;
            previousTime = null;
        };
        renderer.debug.onShaderError = () => {
            stop();
            onUnavailableRef.current();
        };
        const resize = () => {
            const {width, height} = container.getBoundingClientRect();
            if (width <= 0 || height <= 0) return;
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 768 ? 1.25 : 1.5));
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            if (reducedMotion) renderer.render(scene, camera);
        };
        const onPointerMove = (event: PointerEvent) => {
            if (reducedMotion || event.pointerType === 'touch') return;
            const bounds = canvas.getBoundingClientRect();
            uniforms.uPointer.value.set(
                ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
                -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
            );
        };
        const onPointerLeave = () => uniforms.uPointer.value.set(20, 20);
        const onVisibilityChange = () => {
            documentVisible = document.visibilityState !== 'hidden';
            documentVisible ? start() : stop();
        };
        const onContextLost = () => {
            stop();
            onUnavailableRef.current();
        };

        const resizeObserver = new ResizeObserver(resize);
        const intersectionObserver = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            visible ? start() : stop();
        });
        const themeObserver = new MutationObserver(updateTheme);
        resizeObserver.observe(container);
        intersectionObserver.observe(container);
        themeObserver.observe(document.documentElement, {attributes: true, attributeFilter: ['class', 'style']});
        canvas.addEventListener('pointermove', onPointerMove, {passive: true});
        canvas.addEventListener('pointerleave', onPointerLeave, {passive: true});
        canvas.addEventListener('webglcontextlost', onContextLost);
        document.addEventListener('visibilitychange', onVisibilityChange);

        updateTheme();
        resize();
        if (reducedMotion) renderFrame(0);
        else start();
        onReadyRef.current();

        return () => {
            disposed = true;
            stop();
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            themeObserver.disconnect();
            canvas.removeEventListener('pointermove', onPointerMove);
            canvas.removeEventListener('pointerleave', onPointerLeave);
            canvas.removeEventListener('webglcontextlost', onContextLost);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            data-readiness-canvas
            className="block size-full min-h-56 sm:min-h-64 md:min-h-80"
        />
    );
}
```

During implementation, keep the effect one-time by retaining the empty dependency array and callback/parameter refs. If ESLint flags ref assignment rules, use the repository's supported React pattern rather than disabling hooks linting broadly.

- [ ] **Step 8: Run scene, boundary, hero, and Dashboard tests**

Run: `npx vitest run src/components/readiness/ReadinessShieldScene.test.tsx src/components/readiness/ReadinessShield.test.tsx src/components/readiness/ReadinessHero.test.tsx src/views/Dashboard.test.tsx`

Expected: all focused tests PASS. Reduced-motion assertions show no pending frame; cleanup assertions show every observer and resource disposed.

- [ ] **Step 9: Run type checking, lint, and production build**

Run: `npx tsc --noEmit && npm run lint && npm run build`

Expected: all commands exit with code 0. Build output contains a separate dynamically loaded readiness/Three.js chunk, and unrelated routes do not import `three`.

- [ ] **Step 10: Review the WebGL isolation diff**

Run: `git diff -- package.json package-lock.json src/components/readiness`

Expected: one runtime dependency, one dynamic boundary, one point scene, no second motion system, and complete lifecycle cleanup. Do not commit unless explicitly requested.

---

### Task 4: Add Browser, Accessibility, And Failure Coverage

**Files:**
- Modify: `e2e/smoke.spec.ts`
- Modify: `e2e/accessibility.spec.ts`

**Interfaces:**
- Consumes: `section[aria-label="Readiness overview"]`, `[data-readiness-canvas]`, and `[data-readiness-fallback]` from earlier tasks.
- Produces: deterministic browser coverage for real metrics, mobile layout, reduced motion, both themes, WebGL failure, and console errors.

- [ ] **Step 1: Add populated hero assertions to the existing dashboard smoke test**

Scope all repeated labels to avoid conflicts with the existing Current Average stat card:

```ts
const readiness = page.getByRole('region', {name: 'Readiness overview'});
await expect(readiness.getByRole('heading', {name: 'Dashboard', level: 1})).toBeVisible();
await expect(readiness.getByText('75.2%')).toBeVisible();
await expect(readiness.getByText('Almost Ready')).toBeVisible();
await expect(readiness.getByText('1 day')).toBeVisible();
await expect(readiness.getByText('1 of 20')).toBeVisible();
await expect(readiness.getByRole('link', {name: 'View analytics'})).toBeVisible();
```

The fixture expectation is intentionally `1 of 20`: only `Cryptography` exactly matches `DOMAIN_NAMES`; `Network Security` and `Web Application Security` are unknown legacy labels.

- [ ] **Step 2: Add a WebGL-unavailable browser test**

Add before navigation:

```ts
test('dashboard remains complete when WebGL is unavailable', async ({page}) => {
    await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...args) {
            if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null;
            return Reflect.apply(original, this, [type, ...args]);
        } as typeof original;
    });

    await page.goto('/');
    const readiness = page.getByRole('region', {name: 'Readiness overview'});
    await expect(readiness.getByText('75.2%')).toBeVisible();
    await expect(readiness.getByRole('link', {name: 'View analytics'})).toBeVisible();
    await expect(readiness.locator('[data-readiness-fallback]')).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
});
```

- [ ] **Step 3: Add reduced-motion and mobile containment assertions**

```ts
test('dashboard readiness visual respects reduced motion', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.goto('/');
    const readiness = page.getByRole('region', {name: 'Readiness overview'});
    await expect(readiness).toBeVisible();
    await expect(readiness.locator('[data-readiness-canvas], [data-readiness-fallback]')).toHaveCount(1);
});

test.describe('mobile readiness hero', () => {
    test.use({viewport: {width: 375, height: 812}});

    test('collapses without horizontal overflow', async ({page}) => {
        await page.goto('/');
        await expect(page.getByRole('region', {name: 'Readiness overview'})).toBeVisible();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
    });
});
```

The scene unit test proves that reduced motion schedules no RAF. The browser test verifies that reduced-motion rendering preserves semantic content and a visual fallback or canvas. Do not compare screenshots of random particle positions.

- [ ] **Step 4: Extend dashboard accessibility coverage without exposing the canvas**

In `e2e/accessibility.spec.ts`, keep the existing all-routes, both-themes axe loop and add Dashboard-specific checks:

```ts
if (route.path === '/') {
    const readiness = page.getByRole('region', {name: 'Readiness overview'});
    await expect(readiness.getByText('75.2%')).toBeVisible();
    await expect(readiness.locator('canvas')).toHaveAttribute('aria-hidden', 'true');
}
```

If WebGL is unavailable in CI and the canvas is not mounted, accept the fallback instead while still requiring all text and zero serious or critical axe violations.

- [ ] **Step 5: Run browser suites**

Run: `npm run test:e2e`

Expected: all smoke and accessibility tests PASS in Chromium, including dark/light axe scans, 375px containment, reduced motion, and forced WebGL failure.

Run: `npm run test:e2e:production`

Expected: all `@production` tests PASS and server-hydrated dashboard behavior remains intact.

- [ ] **Step 6: Review the browser test diff**

Run: `git diff -- e2e/smoke.spec.ts e2e/accessibility.spec.ts`

Expected: assertions use real fixture values, repeated text is region-scoped, and no random-particle screenshot baseline is introduced. Do not commit unless explicitly requested.

---

### Task 5: Verify Performance And Update Audit Evidence

**Files:**
- Modify: `docs/react-performance-ux-audit.md`
- Create: `docs/webgl-readiness-shield-verification.md`

**Interfaces:**
- Consumes: production build output, route chunks, Lighthouse reports, and complete automated test results.
- Produces: reproducible evidence that the visual is isolated, static under reduced motion, and within the approved quality targets.

- [ ] **Step 1: Capture final automated verification**

Run serially to avoid resource contention:

```powershell
npm run lint
npx tsc --noEmit
npx vitest run
npm run build
npm run test:e2e
npm run test:e2e:production
```

Expected: every command exits with code 0. Record exact test counts and route/build output for the verification document.

- [ ] **Step 2: Verify dependency and route isolation**

Run: `npm ls three`

Expected: one valid Three.js dependency.

Inspect `.next/static/chunks` through the build output or bundle tooling and verify:

- Three.js exists only in a dynamically loaded readiness chunk.
- Dashboard semantic HTML is present before that chunk loads.
- Analytics, Settings, Add Assessment, and Poll routes do not eagerly import the readiness chunk.

Record the added readiness chunk's compressed and uncompressed size in the verification document using actual build artifacts. Do not estimate.

- [ ] **Step 3: Run Lighthouse against a production server**

Start the production server on port 3100 in one terminal:

Run: `$env:E2E_FIXTURES='true'; $env:ALLOW_OPEN_API='true'; $env:API_SECRET=$null; $env:PORT='3100'; npm run start`

In another terminal, run:

```powershell
npx --yes lighthouse http://127.0.0.1:3100 `
  --only-categories=performance,accessibility `
  --output=json `
  --output-path="C:\Users\terti\AppData\Local\Temp\opencode\ceh-readiness-lighthouse.json" `
  --chrome-flags="--headless --no-sandbox"
```

Expected: Lighthouse completes successfully. Record LCP, CLS, Total Blocking Time, performance score, and accessibility score. The acceptance thresholds are CLS below 0.1, no material LCP regression from the existing audit baseline, and no interaction path that plausibly exceeds the INP target of 200ms.

- [ ] **Step 4: Verify runtime pausing and reduced motion manually**

Using browser DevTools on the production build:

1. Enable reduced motion, reload Dashboard, and confirm the scene renders once with no continuing RAF activity.
2. Disable reduced motion, scroll the hero fully offscreen, and confirm the renderer stops scheduling frames.
3. Return to the hero and confirm exactly one frame loop resumes without replaying elapsed hidden time.
4. Switch the root theme class between `dark` and `light`, and confirm point color updates without creating another geometry or canvas.
5. Simulate WebGL context loss and confirm the static Shield fallback replaces the canvas while dashboard controls remain usable.

- [ ] **Step 5: Write measured verification evidence**

Create `docs/webgl-readiness-shield-verification.md` only after Steps 1-4 have produced values. Include these exact sections:

- `Automated Checks`: ESLint, TypeScript, Vitest test count, production build, development Playwright test count, and production Playwright test count.
- `Bundle Isolation`: readiness chunk bytes, compressed bytes, dynamic Three.js loading, and unrelated-route inspection.
- `Lighthouse`: performance score, accessibility score, LCP, CLS, Total Blocking Time, and the baseline comparison captured before implementation.
- `Runtime Checks`: reduced motion, offscreen pause, hidden-tab pause, one-loop resume, theme uniform update, and context-loss fallback.

Write the observed result beside every field. Do not create the file with blank fields or template markers. If a metric cannot be collected, state the exact command failure and keep the task incomplete.

- [ ] **Step 6: Update stale audit statements**

Modify `docs/react-performance-ux-audit.md` so it no longer claims the application has no relevant media, resize handling, or WebGL bundle. Add links to:

- `docs/superpowers/specs/2026-07-18-webgl-readiness-shield-design.md`
- `docs/webgl-readiness-shield-verification.md`

Document that `ResizeObserver`, `IntersectionObserver`, reduced motion, dynamic import isolation, one point draw call, and complete scene disposal are implemented in the readiness feature.

- [ ] **Step 7: Run final whitespace and worktree review**

Run: `git diff --check`

Expected: no whitespace errors.

Run: `git status --short`

Expected: intended readiness files, dependency lock changes, browser tests, and documentation are visible alongside any pre-existing unrelated changes. Do not stage or commit unless explicitly requested.

---

## Completion Criteria

- All five tasks are complete in order with their focused tests passing before broader verification.
- The real fixture values render as `75.2%`, `Almost Ready`, `1 day`, and `1 of 20`.
- Empty and unavailable states do not show false zero percentages or readiness classifications.
- The scene is one dynamically loaded Three.js point cloud with no per-frame React state.
- Reduced motion, offscreen pause, hidden-tab pause, context loss, renderer failure, and cleanup are proven by tests or measured runtime checks.
- Dark and light themes, 375px mobile layout, keyboard access, single `h1`, single `main`, and axe scans pass.
- Lint, TypeScript, unit tests, production build, development E2E, and production E2E all pass.
- Bundle and Lighthouse evidence contains actual values and no placeholders.
