// @vitest-environment node
import {Suspense, type ReactElement} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {pollDefinitions} from '@/data/polls';
import {allPollResultsKey, assessmentQueryKey, pollStatsKey, settingsQueryKey} from '@/data/queryKeys';
import DashboardPage from './page';

const {assessments, repositories} = vi.hoisted(() => {
    const assessments = [{
        id: 'assessment-1',
        date: '2026-07-18',
        type: 'practice' as const,
        score: 94,
        maxScore: 125,
        percentage: 75.2,
        timeTaken: 90,
        domain: 'Cryptography',
        notes: '',
        passed: true,
        createdAt: '2026-07-18T12:00:00.000Z',
    }];

    return {
        assessments,
        repositories: {
            getAssessments: vi.fn(async () => assessments),
            getSettings: vi.fn(async () => ({name: 'Learner'})),
            getPollResults: vi.fn(async () => ['results']),
            getPollStats: vi.fn(async (pollId: string) => ({pollId})),
        },
    };
});

vi.mock('@/data/assessmentRepository', () => ({getAssessments: repositories.getAssessments}));
vi.mock('@/data/settingsRepository', () => ({getSettings: repositories.getSettings}));
vi.mock('@/data/pollRepository', () => ({
    getPollResults: repositories.getPollResults,
    getPollStats: repositories.getPollStats,
}));
vi.mock('@/components/HydratedPage', () => ({default: 'hydrated-page'}));
vi.mock('@/components/readiness/ReadinessHero', () => ({default: 'readiness-hero'}));
vi.mock('@/components/readiness/ReadinessHeroLoading', () => ({default: 'readiness-hero-loading'}));
vi.mock('@/views/Dashboard', () => ({default: 'dashboard-view'}));
vi.mock('@/views/Analytics', () => ({default: 'analytics-view'}));
vi.mock('@/views/Assessments', () => ({default: 'assessments-view'}));
vi.mock('@/views/Topics', () => ({default: 'topics-view'}));
vi.mock('@/views/Leaderboard', () => ({default: 'leaderboard-view'}));
vi.mock('@/views/Settings', () => ({default: 'settings-view'}));
vi.mock('@/views/PollAnalytics', () => ({default: 'poll-analytics-view'}));
vi.mock('@/views/AddAssessment', () => ({default: 'add-assessment-view'}));

type DashboardContentElement = ReactElement<{
    className: string;
    children: [
        ReactElement<{
            state: string;
            averageScore: number;
            studyStreak: number;
            coveredDomains: number;
            totalDomains: number;
        }>,
        ReactElement<{
            queries: Array<{
                queryKey: readonly unknown[];
                queryFn: typeof repositories.getAssessments;
                initialData: readonly unknown[];
            }>;
            children: ReactElement;
        }>,
    ];
}>;

async function renderDashboardContent() {
    const boundary = DashboardPage();
    expect(boundary).not.toBeInstanceOf(Promise);
    expect(boundary.type).toBe(Suspense);
    expect(boundary.props.fallback).toMatchObject({type: 'readiness-hero-loading'});

    const content = boundary.props.children as ReactElement;
    expect(content.type).toEqual(expect.any(Function));
    return await (content.type as (props: unknown) => Promise<DashboardContentElement>)(content.props);
}

describe('route hydration', () => {
    beforeEach(() => vi.clearAllMocks());
    afterEach(() => vi.unstubAllEnvs());

    it.each([
        {
            name: 'API_SECRET is set',
            env: {ALLOW_OPEN_API: 'true', API_SECRET: 'secret-key'},
            error: 'Repository hydration requires API_SECRET to be unset',
        },
        {
            name: 'open API mode is not explicit',
            env: {ALLOW_OPEN_API: '', API_SECRET: ''},
            error: 'Repository hydration requires ALLOW_OPEN_API=true',
        },
    ])('blocks the dashboard repository read in production when $name', async ({env, error}) => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('ALLOW_OPEN_API', env.ALLOW_OPEN_API);
        vi.stubEnv('API_SECRET', env.API_SECRET);
        await expect(renderDashboardContent()).rejects.toThrow(error);

        expect(repositories.getAssessments).not.toHaveBeenCalled();
    });

    it('reads dashboard assessments exactly once in the allowed production mode', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('ALLOW_OPEN_API', 'true');
        vi.stubEnv('API_SECRET', '');
        await renderDashboardContent();

        expect(repositories.getAssessments).toHaveBeenCalledOnce();
    });

    it('hydrates non-dashboard assessment routes with their shared key', async () => {
        const routes = await Promise.all([
            import('./analytics/page'),
            import('./assessments/page'),
            import('./topics/page'),
        ]);

        for (const route of routes) {
            expect(route.dynamic).toBe('force-dynamic');
            const page = await route.default();
            expect(page.props.queries).toEqual([{
                queryKey: assessmentQueryKey,
                queryFn: repositories.getAssessments,
            }]);
        }
    });

    it('fetches dashboard assessments once and composes its server hero before hydration with the same data', async () => {
        const page = await renderDashboardContent();
        const [hero, hydratedPage] = page.props.children;

        expect(repositories.getAssessments).toHaveBeenCalledOnce();
        expect(page.type).toBe('div');
        expect(page.props.className).toBe('p-4 sm:p-6 lg:p-8 page-enter');
        expect(hero.type).toBe('readiness-hero');
        expect(hero.props).toMatchObject({
            state: 'ready',
            averageScore: 75.2,
            studyStreak: 1,
            coveredDomains: 1,
            totalDomains: 20,
        });
        expect(hydratedPage.type).toBe('hydrated-page');
        expect(hydratedPage.props.queries).toEqual([{
            queryKey: assessmentQueryKey,
            queryFn: repositories.getAssessments,
            initialData: assessments,
        }]);
        expect(hydratedPage.props.queries[0].initialData).toBe(assessments);
        expect(hydratedPage.props.children.type).toBe('dashboard-view');
    });

    it('renders the dashboard hero empty state from a successful empty server read', async () => {
        repositories.getAssessments.mockResolvedValueOnce([]);
        const page = await renderDashboardContent();
        const [hero, hydratedPage] = page.props.children;

        expect(repositories.getAssessments).toHaveBeenCalledOnce();
        expect(hero.props).toMatchObject({
            state: 'empty',
            averageScore: 0,
            studyStreak: 0,
            coveredDomains: 0,
            totalDomains: 20,
        });
        expect(hydratedPage.props.queries[0].initialData).toEqual([]);
    });

    it('hydrates leaderboard and settings with assessments and settings', async () => {
        const routes = await Promise.all([
            import('./leaderboard/page'),
            import('./settings/page'),
        ]);

        for (const route of routes) {
            expect(route.dynamic).toBe('force-dynamic');
            const page = await route.default();
            expect(page.props.queries).toEqual([
                {queryKey: assessmentQueryKey, queryFn: repositories.getAssessments},
                {queryKey: settingsQueryKey, queryFn: repositories.getSettings},
            ]);
        }
    });

    it('hydrates the fixed polls with all three repository stats', async () => {
        const route = await import('./polls/page');

        expect(route.dynamic).toBe('force-dynamic');
        expect(route.metadata).toMatchObject({
            title: 'Community Polls | CEH Tracker',
            description: expect.any(String),
        });
        const page = await route.default();
        expect(page.props.queries.map((query: {queryKey: readonly unknown[]}) => query.queryKey)).toEqual(
            Object.keys(pollDefinitions).map(pollStatsKey),
        );

        await Promise.all(page.props.queries.map((query: {queryFn: () => Promise<unknown>}) => query.queryFn()));
        expect(repositories.getPollStats.mock.calls).toEqual(
            Object.entries(pollDefinitions).map(([pollId, definition]) => [pollId, definition]),
        );
    });

    it('hydrates poll analytics with projected poll results', async () => {
        const route = await import('./polls/analytics/page');

        expect(route.dynamic).toBe('force-dynamic');
        const page = await route.default();
        expect(page.props.queries).toEqual([{
            queryKey: allPollResultsKey,
            queryFn: repositories.getPollResults,
        }]);
    });

    it('does not prefetch reads for the add-assessment route', async () => {
        const route = await import('./add/page');

        expect(route.default).toBe('add-assessment-view');
        expect(repositories.getAssessments).not.toHaveBeenCalled();
    });
});
