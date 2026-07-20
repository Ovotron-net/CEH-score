'use client';

import {usePollStats} from '@/hooks/usePolls';
import {PollOptionBars} from './PollOptionBars';

interface PollResultsProps {
    pollId: string;
    refreshInterval?: number;
}

export function PollResults({pollId, refreshInterval = 5000}: PollResultsProps) {
    const {poll, isLoading, isError, error, refetch, isFetching} = usePollStats(pollId, refreshInterval);
    const errorMessage = error instanceof Error ? error.message : isError ? 'Failed to load poll results' : null;

    return (
        <section
            aria-label="Live poll results"
            aria-busy={isLoading || isFetching}
            className="space-y-4"
        >
            {isLoading && !poll ? (
                <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
                    Loading results...
                </p>
            ) : null}

            {errorMessage && !poll ? (
                <div role="alert" className="space-y-3 text-sm text-destructive">
                    <p>Error: {errorMessage}</p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-destructive/40 px-3 text-foreground hover:bg-destructive/10"
                        aria-label="Retry loading results"
                    >
                        Retry
                    </button>
                </div>
            ) : null}

            {!isLoading && !errorMessage && !poll ? (
                <p className="text-sm text-muted-foreground">No poll data available</p>
            ) : null}

            {poll ? (
                <>
                    <div
                        data-testid="poll-results-header"
                        className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"
                    >
                        <h3 className="text-base font-semibold text-foreground">
                            {poll.pollQuestion || 'Poll Results'}
                        </h3>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border bg-secondary px-3 text-xs text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
                        >
                            {isFetching ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>

                    <p className="text-sm text-muted-foreground">Total votes: {poll.totalVotes}</p>

                    <PollOptionBars options={poll.options}/>

                    {isFetching ? (
                        <p role="status" aria-live="polite" className="text-xs text-muted-foreground">
                            Refreshing results...
                        </p>
                    ) : null}

                    {errorMessage ? (
                        <p role="alert" className="mt-2 text-xs text-destructive">
                            Refresh error: {errorMessage}
                        </p>
                    ) : null}
                </>
            ) : null}
        </section>
    );
}
