'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {ArrowLeft, Award, BarChart3, PieChart, RefreshCw, Trash2, Users} from 'lucide-react';
import {pollsApi} from '@/api';
import type {PollResult} from '@/api/polls';
import StatCard from '@/components/StatCard';
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

interface PollSummary {
    pollId: string;
    pollQuestion: string;
    totalVotes: number;
    optionCount: number;
    options: Array<{
        optionText: string;
        voteCount: number;
        percentage: number;
    }>;
    lastUpdated: string;
}

function groupIntoSummaries(results: PollResult[]): PollSummary[] {
    const byPoll = new Map<string, PollResult[]>();

    for (const r of results) {
        const list = byPoll.get(r.pollId) ?? [];
        list.push(r);
        byPoll.set(r.pollId, list);
    }

    return Array.from(byPoll.entries()).map(([pollId, rows]) => {
        const totalVotes = rows.reduce((sum, r) => sum + r.voteCount, 0);
        const sorted = [...rows].sort((a, b) => b.voteCount - a.voteCount);

        const options = sorted.map((r) => ({
            optionText: r.optionText,
            voteCount: r.voteCount,
            percentage: totalVotes > 0 ? Math.round((r.voteCount / totalVotes) * 100) : 0,
        }));

        // Use the most recent updatedAt among options as last activity
        const last = sorted.reduce((acc, r) => {
            const t = new Date(r.updatedAt).getTime();
            return t > acc ? t : acc;
        }, 0);

        return {
            pollId,
            pollQuestion: rows[0]?.pollQuestion ?? pollId,
            totalVotes,
            optionCount: rows.length,
            options,
            lastUpdated: last ? new Date(last).toISOString() : new Date().toISOString(),
        };
    }).sort((a, b) => b.totalVotes - a.totalVotes);
}

export default function PollAnalytics() {
    const [results, setResults] = useState<PollResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const all = await pollsApi.getAllResults();
            setResults(all);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load poll data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const summaries = useMemo(() => groupIntoSummaries(results), [results]);

    const totalPolls = summaries.length;
    const totalVotes = summaries.reduce((s, p) => s + p.totalVotes, 0);
    const avgVotes = totalPolls > 0 ? Math.round(totalVotes / totalPolls) : 0;
    const topPoll = summaries.length > 0 ? summaries[0] : null;

    const chartData = useMemo(() => {
        return summaries.map((p) => ({
            name: p.pollQuestion.length > 28 ? p.pollQuestion.slice(0, 25) + '…' : p.pollQuestion,
            votes: p.totalVotes,
            pollId: p.pollId,
        }));
    }, [summaries]);

    const handleDelete = async (pollId: string, question: string) => {
        if (!confirm(`Delete poll "${question}" and all its votes? This cannot be undone.`)) {
            return;
        }

        setDeletingId(pollId);
        try {
            await pollsApi.deletePoll(pollId);
            // Refetch to get fresh data
            await loadAll();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete poll');
        } finally {
            setDeletingId(null);
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

    if (loading && results.length === 0) {
        return (
            <div className="p-6 lg:p-8">
                <div className="flex items-center justify-center py-16">
                    <div className="spinner"/>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 page-enter">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-cyber-blue/10 border border-cyber-blue/20">
                        <PieChart className="w-6 h-6 text-cyber-blue"/>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white">Poll Analytics</h1>
                        <p className="text-cyber-muted mt-1">Aggregate results and insights across all community
                            polls</p>
                    </div>
                    <Link
                        href="/polls"
                        className="inline-flex items-center gap-2 text-sm text-cyber-muted hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4"/>
                        Back to Polls
                    </Link>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Active Polls"
                    value={totalPolls}
                    icon={PieChart}
                    color="blue"
                />
                <StatCard
                    title="Total Votes Cast"
                    value={totalVotes}
                    icon={Users}
                    color="green"
                />
                <StatCard
                    title="Avg Votes per Poll"
                    value={avgVotes}
                    icon={BarChart3}
                    color="purple"
                />
                <StatCard
                    title="Top Poll (by votes)"
                    value={topPoll ? topPoll.totalVotes : 0}
                    subtitle={topPoll ? topPoll.pollQuestion : 'No polls yet'}
                    icon={Award}
                    color="yellow"
                />
            </div>

            {/* Votes by Poll Chart */}
            <div className="glass-card rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-cyber-blue"/>
                        Votes by Poll
                    </h2>
                    <button
                        onClick={loadAll}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/60 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
                        Refresh
                    </button>
                </div>

                {chartData.length === 0 ? (
                    <div className="py-12 text-center text-cyber-muted">
                        No poll data yet. Cast some votes on the <Link href="/polls"
                                                                       className="text-cyber-green hover:underline">Polls
                        page</Link>.
                    </div>
                ) : (
                    <div className="h-72 -mx-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{top: 10, right: 10, left: 0, bottom: 40}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                                <XAxis
                                    dataKey="name"
                                    tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}}
                                    angle={-25}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}}/>
                                <Tooltip
                                    contentStyle={{
                                        background: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 8
                                    }}
                                    labelStyle={{color: 'hsl(var(--foreground))'}}
                                />
                                <Bar dataKey="votes" fill="#00d4ff" radius={[4, 4, 0, 0]}/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Detailed Poll List */}
            <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">All Polls</h2>
                    <span className="text-xs text-cyber-muted">{totalPolls} poll{totalPolls === 1 ? '' : 's'}</span>
                </div>

                {summaries.length === 0 ? (
                    <div className="py-8 text-center">
                        <PieChart className="w-10 h-10 mx-auto mb-3 text-cyber-muted/60"/>
                        <p className="text-cyber-muted">No polls have been created yet.</p>
                        <Link href="/polls"
                              className="text-cyber-green hover:text-cyber-green/80 text-sm mt-2 inline-block">
                            Go cast the first vote →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {summaries.map((poll) => (
                            <div
                                key={poll.pollId}
                                className="border border-border rounded-xl p-5 bg-background/40 hover:bg-background/60 transition-colors"
                            >
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-white text-lg leading-tight pr-2">
                                                {poll.pollQuestion}
                                            </h3>
                                            <span
                                                className="text-[10px] uppercase tracking-wider text-cyber-muted border border-border rounded px-1.5 py-0.5 shrink-0">
                        {poll.pollId}
                      </span>
                                        </div>

                                        <div
                                            className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-cyber-muted mb-3">
                                            <span>{poll.totalVotes} total vote{poll.totalVotes === 1 ? '' : 's'}</span>
                                            <span>•</span>
                                            <span>{poll.optionCount} option{poll.optionCount === 1 ? '' : 's'}</span>
                                            <span>•</span>
                                            <span>Last activity: {formatDate(poll.lastUpdated)}</span>
                                        </div>

                                        {/* Options breakdown */}
                                        <div className="space-y-2 mt-3">
                                            {poll.options.map((opt, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between text-sm mb-1">
                                                            <span
                                                                className="text-foreground truncate pr-2">{opt.optionText}</span>
                                                            <span className="text-cyber-muted tabular-nums shrink-0">
                                {opt.voteCount} ({opt.percentage}%)
                              </span>
                                                        </div>
                                                        <div
                                                            className="h-2 bg-secondary rounded-full overflow-hidden border border-border/60">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-cyber-green/70 to-cyber-green transition-all"
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
                                            className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 disabled:opacity-50 transition-colors"
                                            title="Delete this poll"
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

            <div className="mt-6 text-xs text-cyber-muted">
                Data is aggregated from all recorded votes. Deleting a poll removes all options and vote counts for that
                poll ID.
            </div>
        </div>
    );
}
