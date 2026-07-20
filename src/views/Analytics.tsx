'use client';

import {useMemo} from 'react';
import {useAssessmentQuery} from '../hooks/useAssessments';
import {PassFail, ScoreDistribution, ScoreTrend, DomainRadar, DomainBarChart} from '../components/charts/lazy';
import {CEH_DOMAINS} from '../data/cehDomains';
import {calculateStats} from '../utils/calculations';
import {buildDomainStats} from '../utils/domainStats';

export default function Analytics() {
    const {data: assessments = [], isLoading, isError, refetch} = useAssessmentQuery();

    const stats = useMemo(() => calculateStats(assessments), [assessments]);

    const domainBarData = useMemo(() => {
        const domainStats = buildDomainStats(assessments);
        return CEH_DOMAINS.flatMap(domain => {
            const measured = domainStats.get(domain.name);
            return measured ? [{
                name: domain.name.split(' ').at(-1) ?? domain.name,
                score: Math.round(measured.average),
            }] : [];
        });
    }, [assessments]);

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto page-enter">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
                <p className="text-muted-foreground text-sm mt-1">Detailed performance analysis</p>
            </div>

            {isLoading ? (
                <div role="status" aria-label="Loading analytics" className="space-y-6">
                    <span className="sr-only">Loading analytics</span>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[0, 1, 2].map(item => (
                            <div key={item} aria-hidden="true" className="h-24 animate-pulse rounded-xl bg-card"/>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {[0, 1, 2, 3, 4, 5].map(item => (
                            <div key={item} aria-hidden="true" className="h-[300px] animate-pulse rounded-xl bg-card"/>
                        ))}
                    </div>
                </div>
            ) : isError ? (
                <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-destructive">
                    <h2 className="font-semibold">Unable to load analytics</h2>
                    <p className="mt-1 text-sm">Assessment data is unavailable. Check your connection and try again.</p>
                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="mt-4 min-h-11 rounded-lg border border-destructive/40 px-4 text-sm font-medium"
                    >
                        Try again
                    </button>
                </div>
            ) : (
                <>
                    <section aria-label="Performance summary" className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
                        {[
                            {label: 'Average Score', value: `${stats.averageScore}%`, color: 'text-primary'},
                            {label: 'Best Score', value: `${stats.bestScore}%`, color: 'text-warning'},
                            {label: 'Pass Rate', value: `${stats.passRate}%`, color: 'text-success'},
                        ].map(item => (
                            <div key={item.label} className="bg-card border border-border rounded-xl p-4 text-center card-enter">
                                <p className="text-muted-foreground text-xs mb-1">{item.label}</p>
                                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                            </div>
                        ))}
                    </section>

                    <section aria-label="Analytics charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-foreground font-semibold mb-4">Score Over Time</h2>
                            <ScoreTrend assessments={assessments} limit={20}/>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-foreground font-semibold mb-4">Pass / Fail Ratio</h2>
                            <PassFail assessments={assessments}/>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-foreground font-semibold mb-4">Score Distribution</h2>
                            <ScoreDistribution assessments={assessments}/>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-foreground font-semibold mb-4">Domain Performance</h2>
                            <DomainBarChart data={domainBarData}/>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-foreground font-semibold mb-4">Improvement Trend</h2>
                            <ScoreTrend assessments={assessments} limit={assessments.length}/>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-foreground font-semibold mb-4">Domain Radar</h2>
                            <DomainRadar assessments={assessments}/>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
