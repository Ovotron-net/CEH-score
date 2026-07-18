'use client';

import {useMemo, useState} from 'react';
import Link from 'next/link';
import {PlusCircle, Trophy} from 'lucide-react';
import {useAssessmentQuery} from '../hooks/useAssessments';
import {useSettingsQuery} from '../hooks/useSettings';
import {format} from 'date-fns';
import {parseLocalDate} from '../utils/dates';

type Period = 'all' | 'month' | 'week';

const PERIOD_LABELS: Record<Period, string> = {all: 'All Time', month: 'This Month', week: 'This Week'};

function cutoffDate(period: Period): Date | null {
    if (period === 'all') return null;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (period === 'week') d.setDate(d.getDate() - 7);
    if (period === 'month') d.setDate(d.getDate() - 30);
    return d;
}

const getRankLabel = (rank: number) => `#${rank}`;

const scoreColor = (pct: number) =>
    pct >= 90 ? 'text-success' : pct >= 80 ? 'text-info' : pct >= 70 ? 'text-warning' : 'text-destructive';

export default function Leaderboard() {
    const assessmentsQuery = useAssessmentQuery();
    const settingsQuery = useSettingsQuery();
    const [period, setPeriod] = useState<Period>('all');

    const entries = useMemo(() => {
        const assessments = assessmentsQuery.data ?? [];
        const cutoff = cutoffDate(period);
        return assessments
            .filter(a => !cutoff || parseLocalDate(a.date) >= cutoff)
            .slice()
            .sort((a, b) => b.percentage - a.percentage)
            .map((a, i) => ({...a, rank: i + 1}));
    }, [assessmentsQuery.data, period]);

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto page-enter">
            {(assessmentsQuery.isLoading || settingsQuery.isLoading) && (
                <div role="status" aria-label="Loading leaderboard" className="mb-6 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                    Loading leaderboard...
                </div>
            )}
            {(assessmentsQuery.isError || settingsQuery.isError) && (
                <div role="alert" className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                    {assessmentsQuery.isError
                        ? 'Failed to load assessments. Your rankings are unavailable. Check your connection.'
                        : 'Failed to load profile settings. Rankings are still available.'}
                </div>
            )}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Trophy className="w-7 h-7 text-warning"/>
                        Leaderboard
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Your personal best scores <span className="text-primary">for {settingsQuery.data?.name ?? 'you'}</span>
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:flex">
                    {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            aria-pressed={period === p}
                            className={`min-h-11 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                period === p
                                    ? 'bg-warning/10 text-warning border border-warning/30'
                                     : 'bg-card text-muted-foreground border border-input hover:text-foreground'
                            }`}
                        >
                            {PERIOD_LABELS[p]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top 3 podium */}
            {entries.length >= 1 && (
                <div
                    className={`grid gap-4 mb-8 ${entries.length >= 3 ? 'grid-cols-1 sm:grid-cols-3' : entries.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-sm mx-auto' : 'grid-cols-1 max-w-xs mx-auto'}`}>
                    {entries.slice(0, 3).map((entry, i) => (
                        <div
                            key={entry.id}
                            className={`bg-card border rounded-xl p-5 text-center card-enter ${
                                i === 0 ? 'border-warning/30 shadow-[0_0_20px_hsl(var(--warning)/0.1)]' :
                                    i === 1 ? 'border-muted-foreground/30' :
                                        'border-orange-700/30'
                            }`}
                        >
                            <div className="text-2xl font-bold text-foreground mb-2">{getRankLabel(entry.rank)}</div>
                            <p className="text-muted-foreground text-xs mb-1 truncate">{entry.domain}</p>
                            <p className={`text-2xl font-bold ${scoreColor(entry.percentage)}`}>{entry.percentage}%</p>
                            <p className="text-muted-foreground text-xs mt-1">{entry.score}/{entry.maxScore} correct</p>
                            <p className="text-muted-foreground text-xs mt-0.5">{format(parseLocalDate(entry.date), 'MMM d, yyyy')}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Full rankings */}
            {!assessmentsQuery.isLoading && !assessmentsQuery.isError && entries.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                    <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30"/>
                    <p className="mb-3">No assessments for this period</p>
                    <Link
                        href="/add"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-lg text-sm font-medium transition-all"
                    >
                        <PlusCircle className="w-4 h-4"/>
                        Add Assessment
                    </Link>
                </div>
            ) : entries.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-border bg-card">
                    <table aria-label="Assessment rankings" className="min-w-[640px] w-full border-collapse text-sm">
                        <thead className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            <tr className="border-b border-border">
                                <th scope="col" className="px-5 py-3">Rank</th>
                                <th scope="col" className="px-5 py-3">Domain</th>
                                <th scope="col" className="px-5 py-3 text-right">Score</th>
                                <th scope="col" className="px-5 py-3 text-right">%</th>
                                <th scope="col" className="px-5 py-3 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map(entry => (
                                <tr key={entry.id} className="render-row border-b border-border last:border-0 hover:bg-secondary transition-colors">
                                    <td className="px-5 py-4 text-foreground font-medium">{getRankLabel(entry.rank)}</td>
                                    <th scope="row" className="px-5 py-4 text-left text-foreground font-medium">{entry.domain}</th>
                                    <td className="px-5 py-4 text-right text-muted-foreground">{entry.score}/{entry.maxScore}</td>
                                    <td className={`px-5 py-4 text-right font-medium ${scoreColor(entry.percentage)}`}>{entry.percentage}%</td>
                                    <td className="px-5 py-4 text-right text-muted-foreground">{format(parseLocalDate(entry.date), 'MMM d, yy')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
}



