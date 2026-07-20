// @vitest-environment node
import {describe, expect, it, vi} from 'vitest';
import {getAll as getAssessments} from '@/api/assessments';
import {get as getSettings} from '@/api/settings';
import {getPollStats} from '@/api/polls';
import {
    assessmentQueryOptions,
    pollResultsQueryOptions,
    pollStatsQueryOptions,
    settingsQueryOptions,
} from '@/data/queryContracts';

vi.mock('server-only', () => ({}));

describe('query contracts', () => {
    it('exposes stable assessment options backed by the browser API', () => {
        expect(assessmentQueryOptions()).toMatchObject({
            queryKey: ['assessments'],
            queryFn: getAssessments,
        });
        expect(assessmentQueryOptions().queryKey).toEqual(assessmentQueryOptions().queryKey);
    });

    it('exposes stable settings options backed by the browser API', () => {
        expect(settingsQueryOptions()).toMatchObject({
            queryKey: ['settings'],
            queryFn: getSettings,
        });
    });

    it('exposes stable poll options backed by browser APIs', () => {
        const statsOptions = pollStatsQueryOptions('study-method');

        expect(statsOptions.queryKey).toEqual(['poll-stats', 'study-method']);
        expect(pollResultsQueryOptions().queryKey).toEqual(['poll-results']);
        expect(pollResultsQueryOptions().queryFn).toBeTypeOf('function');

        expect(statsOptions.queryFn).toBeTypeOf('function');
        expect(statsOptions.queryFn).not.toBe(getPollStats);
    });
});
