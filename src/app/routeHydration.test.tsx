// @vitest-environment node
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {pollDefinitions} from '@/data/polls';
import {allPollResultsKey, assessmentQueryKey, pollStatsKey, settingsQueryKey} from '@/data/queryKeys';

const repositories = vi.hoisted(() => ({
    getAssessments: vi.fn(async () => ['assessments']),
    getSettings: vi.fn(async () => ({name: 'Learner'})),
    getPollResults: vi.fn(async () => ['results']),
    getPollStats: vi.fn(async (pollId: string) => ({pollId})),
}));

vi.mock('@/data/assessmentRepository', () => ({getAssessments: repositories.getAssessments}));
vi.mock('@/data/settingsRepository', () => ({getSettings: repositories.getSettings}));
vi.mock('@/data/pollRepository', () => ({
    getPollResults: repositories.getPollResults,
    getPollStats: repositories.getPollStats,
}));
vi.mock('@/components/HydratedPage', () => ({default: 'hydrated-page'}));
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

    it('hydrates assessment-backed routes with their shared key', async () => {
        const routes = await Promise.all([
            import('./page'),
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
