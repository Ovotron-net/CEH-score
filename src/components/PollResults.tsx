'use client';

import {usePollStats} from '@/hooks/usePolls';

interface PollResultsProps {
    pollId: string;
    refreshInterval?: number;
}

export function PollResults({pollId, refreshInterval = 5000}: PollResultsProps) {
    const {poll, isLoading, isError, error, refetch, isFetching} = usePollStats(pollId, refreshInterval);

    const errorMessage = error instanceof Error ? error.message : isError ? 'Failed to load poll results' : null;

    if (isLoading && !poll) {
        return <div className="text-muted-foreground text-sm">Loading results...</div>;
    }

    if (errorMessage && !poll) {
        return <div className="text-destructive text-sm">Error: {errorMessage}</div>;
    }

    if (!poll) {
        return <div className="text-muted-foreground text-sm">No poll data available</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">{poll.pollQuestion || 'Poll Results'}</h3>
                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="text-xs px-2 py-1 bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded disabled:opacity-50 transition-colors"
                >
                    {isFetching ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            <p className="text-sm text-muted-foreground">Total votes: {poll.totalVotes}</p>

            <div className="space-y-3">
                {poll.options.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No votes yet</p>
                ) : (
                    poll.options.map((option) => (
                        <div key={option.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{option.optionText}</span>
                                <span className="text-xs text-muted-foreground">
                                    {option.voteCount} vote{option.voteCount !== 1 ? 's' : ''} ({option.percentage}%)
                                </span>
                            </div>

                            <div className="w-full h-6 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-300 ease-out flex items-center justify-center"
                                    style={{width: `${option.percentage}%`}}
                                >
                                    {option.percentage > 10 ? (
                                        <span className="text-xs font-semibold text-primary-foreground">
                                            {option.percentage}%
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {errorMessage ? (
                <p className="text-yellow-400 text-xs mt-2">Note: {errorMessage}</p>
            ) : null}
        </div>
    );
}