'use client';

import {useMemo, useState} from 'react';
import Link from 'next/link';
import {ArrowLeft, Award, BarChart3, PieChart, RefreshCw, Trash2, Users} from 'lucide-react';
import {useAllPollResults, useDeletePoll} from '@/hooks/usePolls';
import StatCard from '@/components/StatCard';
import {VotesByPollChart} from '@/components/charts/lazy';
import {groupIntoSummaries} from '@/utils/pollSummaries';

export default function PollAnalytics() {
    const {results, isLoading, isError, error, refetch, isFetching} = useAllPollResults();
    const deletePollMutation = useDeletePoll();
    const [deleteError, setDeleteError] = useState<{
        pollId: string;
        question: string;
        message: string;
    } | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

    const errorMessage = error instanceof Error ? error.message : isError ? 'Failed to load poll data' : null;
    const deletingId = deletePollMutation.isPending ? deletePollMutation.variables ?? null : null;

    const summaries = useMemo(() => groupIntoSummaries(results), [results]);

    const totalPolls = summaries.length;
    const totalVotes = summaries.reduce((s, p) => s + p.totalVotes, 0);
    const avgVotes = totalPolls > 0 ? Math.round(totalVotes / totalPolls) : 0;
    const topPoll = summaries.length > 0 ? summaries[0] : null;

    const chartData = useMemo(() => {
        return summaries.map((p) => ({
            question: p.pollQuestion,
            visualLabel: p.pollQuestion.length > 28 ? p.pollQuestion.slice(0, 25) + '…' : p.pollQuestion,
            votes: p.totalVotes,
            pollId: p.pollId,
        }));
    }, [summaries]);

    const deletePoll = async (pollId: string, question: string) => {
        setDeleteError(null);
        setDeleteSuccess(null);
        try {
            await deletePollMutation.mutateAsync(pollId);
            setDeleteError(null);
            setDeleteSuccess(`${question} deleted successfully`);
        } catch (err) {
            setDeleteError({
                pollId,
                question,
                message: err instanceof Error ? err.message : 'Failed to delete poll',
            });
        }
    };

    const handleDelete = (pollId: string, question: string) => {
        if (confirm(`Delete poll "${question}" and all its votes? This cannot be undone.`)) {
            void deletePoll(pollId, question);
        }
    };

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '—';
        }
    };

    if (isLoading && results.length === 0) {
        return (
            <section
                aria-label="Poll analytics"
                aria-busy="true"
                className="space-y-8 p-4 sm:p-6 lg:p-8"
            >
                <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
                    Loading poll analytics...
                </p>
                <div className="space-y-4" aria-hidden="true">
                    <div className="skeleton h-10 w-64"/>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {[0, 1, 2, 3].map((item) => <div key={item} className="skeleton h-28"/>)}
                    </div>
                    <div className="skeleton h-72"/>
                </div>
            </section>
        );
    }

    return (
        <section
            aria-label="Poll analytics"
            aria-busy={isFetching || deletePollMutation.isPending}
            className="p-4 sm:p-6 lg:p-8 page-enter"
        >
            <div className="mb-8">
                <div
                    data-testid="poll-analytics-header"
                    className="mb-2 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
                >
                    <div className="p-2 rounded-lg bg-info/10 border border-info/20">
                        <PieChart className="w-6 h-6 text-info"/>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-foreground">Poll Analytics</h1>
                        <p className="text-muted-foreground mt-1">Aggregate results and insights across all community
                            polls</p>
                    </div>
                    <Link
                        href="/polls"
                        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4"/>
                        Back to Polls
                    </Link>
                </div>
            </div>

            {errorMessage ? (
                <div role="alert" className="mb-6 flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
                    <span>{errorMessage}</span>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-destructive/40 px-3 text-foreground hover:bg-destructive/10"
                        aria-label="Retry loading poll analytics"
                    >
                        Retry
                    </button>
                </div>
            ) : null}

            {deleteError ? (
                <div role="alert" className="mb-6 flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
                    <span>Could not delete {deleteError.question}: {deleteError.message}</span>
                    <button
                        type="button"
                        onClick={() => void deletePoll(deleteError.pollId, deleteError.question)}
                        disabled={deletePollMutation.isPending}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-destructive/40 px-3 text-foreground hover:bg-destructive/10 disabled:opacity-50"
                        aria-label={`Retry deleting ${deleteError.question}`}
                    >
                        Retry deletion
                    </button>
                </div>
            ) : null}

            {deleteSuccess ? (
                <p role="status" aria-live="polite" className="mb-4 text-sm text-success">
                    {deleteSuccess}
                </p>
            ) : null}

            {isFetching ? (
                <p role="status" aria-live="polite" className="mb-4 text-sm text-muted-foreground">
                    Refreshing poll analytics...
                </p>
            ) : null}

            {deletePollMutation.isPending ? (
                <p role="status" aria-live="polite" className="mb-4 text-sm text-muted-foreground">
                    Deleting poll...
                </p>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <StatCard title="Active Polls" value={totalPolls} icon={PieChart} color="blue"/>
                <StatCard title="Total Votes Cast" value={totalVotes} icon={Users} color="green"/>
                <StatCard title="Avg Votes per Poll" value={avgVotes} icon={BarChart3} color="purple"/>
                <StatCard
                    title="Top Poll (by votes)"
                    value={topPoll ? topPoll.totalVotes : 0}
                    subtitle={topPoll ? topPoll.pollQuestion : 'No polls yet'}
                    icon={Award}
                    color="yellow"
                />
            </div>

            <div className="glass-card rounded-xl p-6 mb-8">
                <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-info"/>
                        Votes by Poll
                    </h2>
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg border border-input px-3 text-xs text-foreground transition-colors hover:bg-secondary/60 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`}/>
                        Refresh
                    </button>
                </div>

                {chartData.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        No poll data yet. Cast some votes on the{' '}
                        <Link href="/polls" className="text-primary underline">Polls page</Link>.
                    </div>
                ) : (
                    <VotesByPollChart data={chartData}/>
                )}
            </div>

            <div className="glass-card rounded-xl p-6">
                <div data-testid="poll-list-header" className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <h2 className="text-xl font-semibold text-foreground">All Polls</h2>
                    <span className="text-xs text-muted-foreground">{totalPolls} poll{totalPolls === 1 ? '' : 's'}</span>
                </div>

                {summaries.length === 0 ? (
                    <div className="py-8 text-center">
                        <PieChart className="w-10 h-10 mx-auto mb-3 text-muted-foreground/60"/>
                        <p className="text-muted-foreground">No polls have been created yet.</p>
                        <Link href="/polls"
                              className="inline-flex min-h-11 items-center text-primary hover:text-primary/80 text-sm mt-2">
                            Go cast the first vote
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {summaries.map((poll) => (
                            <div
                                key={poll.pollId}
                                className="render-row border border-border rounded-xl p-4 sm:p-5 bg-background/40 hover:bg-background/60 transition-colors"
                            >
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-foreground text-lg leading-tight pr-2">
                                                {poll.pollQuestion}
                                            </h3>
                                            <span
                                                 className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded px-1.5 py-0.5 shrink-0">
                                                {poll.pollId}
                                            </span>
                                        </div>

                                        <div
                                            className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                                            <span>{poll.totalVotes} total vote{poll.totalVotes === 1 ? '' : 's'}</span>
                                            <span>•</span>
                                            <span>{poll.optionCount} option{poll.optionCount === 1 ? '' : 's'}</span>
                                            <span>•</span>
                                            <span>Last activity: {formatDate(poll.lastUpdated)}</span>
                                        </div>

                                        <div className="space-y-2 mt-3">
                                            {poll.options.map((opt) => (
                                                <div key={opt.optionText} className="flex items-center gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between text-sm mb-1">
                                                            <span
                                                                className="text-foreground truncate pr-2">{opt.optionText}</span>
                                                            <span className="text-muted-foreground tabular-nums shrink-0">
                                                                {opt.voteCount} ({opt.percentage}%)
                                                            </span>
                                                        </div>
                                                        <div
                                                            className="h-2 bg-secondary rounded-full overflow-hidden border border-border/60">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-primary/70 to-primary transition-all"
                                                                style={{width: `${opt.percentage}%`}}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col items-start md:items-end gap-2 shrink-0">
                                        <button
                                            onClick={() => handleDelete(poll.pollId, poll.pollQuestion)}
                                            disabled={deletingId === poll.pollId}
                                            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg border border-destructive/40 px-3 text-xs text-destructive transition-colors hover:border-destructive/60 hover:bg-destructive/10 disabled:opacity-50"
                                            aria-label={`Delete ${poll.pollQuestion}`}
                                        >
                                            <Trash2 className="w-3.5 h-3.5"/>
                                            {deletingId === poll.pollId ? 'Deleting…' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-6 text-xs text-muted-foreground">
                Data is aggregated from all recorded votes. Deleting a poll removes all options and vote counts for that
                poll ID.
            </div>
        </section>
    );
}
