import 'server-only';

import type {QueryKey} from '@tanstack/react-query';
import {getAssessments} from '@/data/assessmentRepository';
import {getPollResults, getPollStats} from '@/data/pollRepository';
import {getSettings} from '@/data/settingsRepository';
import {getPollDefinition} from '@/data/polls';
import {
    allPollResultsKey,
    assessmentQueryKey,
    pollStatsKey,
    settingsQueryKey,
} from '@/data/queryKeys';

export type ServerQueryDescriptor<TData = unknown> = {
    queryKey: QueryKey;
    queryFn: () => Promise<TData>;
};

/** Server-side prefetch descriptors (repositories). Keys match queryContracts client options. */
export const serverQueries = {
    assessments: (): ServerQueryDescriptor => ({
        queryKey: assessmentQueryKey,
        queryFn: getAssessments,
    }),
    settings: (): ServerQueryDescriptor => ({
        queryKey: settingsQueryKey,
        queryFn: getSettings,
    }),
    pollResults: (): ServerQueryDescriptor => ({
        queryKey: allPollResultsKey,
        queryFn: getPollResults,
    }),
    pollStats: (pollId: string): ServerQueryDescriptor => ({
        queryKey: pollStatsKey(pollId),
        queryFn: () => getPollStats(pollId, getPollDefinition(pollId)),
    }),
};
