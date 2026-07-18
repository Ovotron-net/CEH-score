import {beforeEach, describe, expect, it, vi} from 'vitest';

const loaded = vi.hoisted(() => ({
    scoreTrend: 0,
    passFail: 0,
    scoreDistribution: 0,
    domainRadar: 0,
    domainBar: 0,
    votesByPoll: 0,
}));

vi.mock('next/dynamic', () => ({
    default: vi.fn(() => () => null),
}));
vi.mock('./ScoreTrend', () => {
    loaded.scoreTrend += 1;
    return {default: () => null};
});
vi.mock('./PassFail', () => {
    loaded.passFail += 1;
    return {default: () => null};
});
vi.mock('./ScoreDistribution', () => {
    loaded.scoreDistribution += 1;
    return {default: () => null};
});
vi.mock('./DomainRadar', () => {
    loaded.domainRadar += 1;
    return {default: () => null};
});
vi.mock('./DomainBarChart', () => {
    loaded.domainBar += 1;
    return {default: () => null};
});
vi.mock('./VotesByPollChart', () => {
    loaded.votesByPoll += 1;
    return {default: () => null};
});

describe('chart preloads', () => {
    beforeEach(() => {
        Object.keys(loaded).forEach((key) => {
            loaded[key as keyof typeof loaded] = 0;
        });
        vi.resetModules();
    });

    it('does not import chart modules when the lazy entrypoint loads', async () => {
        await import('./lazy');
        expect(loaded).toEqual({
            scoreTrend: 0,
            passFail: 0,
            scoreDistribution: 0,
            domainRadar: 0,
            domainBar: 0,
            votesByPoll: 0,
        });
    });

    it('preloads only the charts for the requested analytics route', async () => {
        const {preloadAnalyticsCharts, preloadPollAnalyticsChart} = await import('./lazy');

        await preloadAnalyticsCharts();
        expect(loaded).toMatchObject({
            scoreTrend: 1,
            passFail: 1,
            scoreDistribution: 1,
            domainRadar: 1,
            domainBar: 1,
            votesByPoll: 0,
        });

        await preloadPollAnalyticsChart();
        expect(loaded.votesByPoll).toBe(1);
    });
});
