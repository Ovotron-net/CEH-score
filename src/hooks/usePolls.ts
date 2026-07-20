import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import * as pollsApi from '@/api/polls';
import type {PollResult} from '@/types';
import {
    pollResultsQueryOptions,
    pollStatsQueryOptions,
} from '@/data/queryContracts';
import {allPollResultsKey, pollStatsKey} from '@/data/queryKeys';

export {pollResultsQueryOptions, pollStatsQueryOptions};

export function usePollStats(pollId: string, refreshInterval = 5000) {
    const query = useQuery({
        ...pollStatsQueryOptions(pollId),
        refetchInterval: refreshInterval,
    });

    return {
        poll: query.data ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        isFetching: query.isFetching,
    };
}

export function useAllPollResults() {
    const query = useQuery(pollResultsQueryOptions());

    return {
        results: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        isFetching: query.isFetching,
    };
}

export function useVotePoll() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: pollsApi.vote,
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({queryKey: pollStatsKey(variables.pollId)});
            qc.invalidateQueries({queryKey: allPollResultsKey});
        },
    });
}

export function useDeletePoll() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: pollsApi.deletePoll,
        onMutate: async (pollId) => {
            await qc.cancelQueries({queryKey: allPollResultsKey});
            const previous = qc.getQueryData<PollResult[]>(allPollResultsKey);
            qc.setQueryData<PollResult[]>(
                allPollResultsKey,
                (prev) => prev?.filter((r) => r.pollId !== pollId) ?? [],
            );
            return {previous};
        },
        onError: (_err, _pollId, context) => {
            if (context?.previous) {
                qc.setQueryData(allPollResultsKey, context.previous);
            }
        },
        onSettled: () => {
            qc.invalidateQueries({queryKey: allPollResultsKey});
            qc.invalidateQueries({queryKey: ['poll-stats']});
        },
    });
}
