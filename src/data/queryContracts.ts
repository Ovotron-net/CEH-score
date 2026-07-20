/**
 * Client React Query option factories. Keys are shared with serverDescriptors
 * via queryKeys.ts so hydration and hooks stay aligned.
 */

import {queryOptions} from '@tanstack/react-query';
import * as assessmentsApi from '@/api/assessments';
import * as pollsApi from '@/api/polls';
import * as settingsApi from '@/api/settings';
import {
    allPollResultsKey,
    assessmentQueryKey,
    pollStatsKey,
    settingsQueryKey,
} from '@/data/queryKeys';

export function assessmentQueryOptions() {
    return queryOptions({
        queryKey: assessmentQueryKey,
        queryFn: assessmentsApi.getAll,
    });
}

export function settingsQueryOptions() {
    return queryOptions({
        queryKey: settingsQueryKey,
        queryFn: settingsApi.get,
    });
}

export function pollStatsQueryOptions(pollId: string) {
    return queryOptions({
        queryKey: pollStatsKey(pollId),
        queryFn: () => pollsApi.getPollStats(pollId),
    });
}

export function pollResultsQueryOptions(pollId?: string) {
    return queryOptions({
        queryKey: pollId ? [...allPollResultsKey, pollId] as const : allPollResultsKey,
        queryFn: () => pollsApi.getAllResults(pollId),
    });
}
