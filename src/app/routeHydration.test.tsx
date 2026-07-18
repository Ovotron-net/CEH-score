// @vitest-environment node
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {pollDefinitions} from '@/data/polls';
import {allPollResultsKey, assessmentQueryKey, pollStatsKey, settingsQueryKey} from '@/data/queryKeys';

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
vi.mock('@/views/Dashboard', () => ({default: 'dashboard-view'}));
vi.mock('@/views/Analytics', () => ({default: 'analytics-view'}));
vi.mock('@/views/Assessments', () => ({default: 'assessments-view'}));
vi.mock('@/views/Topics', () => ({default: 'topics-view'}));
vi.mock('@/views/Leaderboard', () => ({default: 'leaderboard-view'}));
vi.mock('@/views/Settings', () => ({default: 'settings-view'}));
vi.mock('@/views/PollAnalytics', () => ({default: 'poll-analytics-view'}));
vi.mock('@/views/AddAssessment', () => ({default: 'add-assessment-view'}));

describe('route hydration', () => {
    beforeEach(() => vi.clearAllMocks());

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
        const route = await import('./page');

        const page = await route.default();
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
        const route = await import('./page');

        const page = await route.default();
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
