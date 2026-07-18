'use client';

import {useMemo} from 'react';
import Link from 'next/link';
import {Activity, BookOpen, Clock, Shield, Target, TrendingUp, Trophy, Zap} from 'lucide-react';
import {useAssessmentQuery} from '../hooks/useAssessments';
import {calculateStats, formatScore} from '../utils/calculations';
import {formatLocalDateDisplay} from '../utils/dates';
import StatCard from '../components/StatCard';
import {DomainRadar, ScoreTrend} from '../components/charts/lazy';

export default function Dashboard() {
    const {data: assessments = [], isLoading, isError, refetch} = useAssessmentQuery();
    const stats = useMemo(() => calculateStats(assessments), [assessments]);
    const recentAssessments = assessments.slice(0, 5);

    return (
        <div className="p-4 sm:p-6 lg:p-8 page-enter">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Shield className="w-6 h-6 text-primary"/>
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
                        <p className="text-muted-foreground mt-1">Track your CEH exam preparation progress</p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div role="status" aria-label="Loading dashboard" className="space-y-6 py-4">
                    <span className="sr-only">Loading dashboard</span>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
                        {[0, 1, 2, 3].map(item => (
                            <div key={item} className="h-32 animate-pulse rounded-xl bg-card"/>
                        ))}
                    </div>
                    <div className="h-72 animate-pulse rounded-xl bg-card" aria-hidden="true"/>
                </div>
            ) : isError ? (
                <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-destructive">
                    <h2 className="font-semibold">Unable to load assessments</h2>
                    <p className="mt-1 text-sm">Your dashboard data is unavailable. Check your connection and try again.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <StatCard title="Current Average" value={formatScore(stats.averageScore)} icon={Target} color="green"/>
                <StatCard title="Best Score" value={formatScore(stats.bestScore)} icon={Trophy} color="yellow"/>
                <StatCard title="Total Assessments" value={stats.totalAssessments.toString()} icon={Activity}
                          color="blue"/>
                <StatCard title="Study Streak" value={`${stats.studyStreak} days`} icon={Zap} color="purple"/>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                <div className="xl:col-span-2">
                    <ScoreTrend assessments={assessments} limit={10}/>
                </div>
                <div>
                    <DomainRadar assessments={assessments}/>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section aria-label="Recent assessments" className="glass-card rounded-xl p-4 sm:p-6 cyber-glow card-enter">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                            <Clock className="w-5 h-5 text-info"/>
                            Recent Assessments
                        </h2>
                        <Link href="/assessments"
                              className="inline-flex min-h-11 items-center text-primary hover:text-primary/80 text-sm font-medium transition-colors">
                            View All
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentAssessments.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50"/>
                                <p>No assessments yet</p>
                                <Link href="/add"
                                      className="text-primary hover:text-primary/80 text-sm mt-2 inline-block transition-colors">
                                    Add your first assessment
                                </Link>
                            </div>
                        ) : (
                            recentAssessments.map((assessment) => (
                                <div key={assessment.id}
                                     className="bg-card/50 rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-foreground capitalize">{assessment.type}</span>
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${assessment.percentage >= 70 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                      {assessment.percentage}%
                    </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-1">{assessment.domain}</div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-foreground">{assessment.score}/{assessment.maxScore}</span>
                                        <span
                                            className="text-muted-foreground">{formatLocalDateDisplay(assessment.date)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <div className="glass-card rounded-xl p-4 sm:p-6 cyber-glow-blue card-enter">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-info"/>
                        Quick Actions
                    </h2>
                    <div className="space-y-3">
                        <Link href="/add"
                              className="w-full flex items-center justify-between p-4 bg-primary/10 hover:bg-primary/15 border border-primary/20 hover:border-primary/30 rounded-lg transition-all group">
                            <div>
                                <div className="font-medium text-primary">Add Assessment</div>
                                <div className="text-sm text-muted-foreground mt-1">Record a new practice test</div>
                            </div>
                            <Target className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform"/>
                        </Link>
                        <Link href="/analytics"
                              className="w-full flex items-center justify-between p-4 bg-info/10 hover:bg-info/15 border border-info/20 hover:border-info/30 rounded-lg transition-all group">
                            <div>
                                <div className="font-medium text-info">View Analytics</div>
                                <div className="text-sm text-muted-foreground mt-1">Analyze your performance trends
                                </div>
                            </div>
                            <TrendingUp
                                className="w-5 h-5 text-info group-hover:translate-x-1 transition-transform"/>
                        </Link>
                        <Link href="/topics"
                              className="w-full flex items-center justify-between p-4 bg-warning/10 hover:bg-warning/15 border border-warning/20 hover:border-warning/30 rounded-lg transition-all group">
                            <div>
                                <div className="font-medium text-warning">Study Topics</div>
                                <div className="text-sm text-muted-foreground mt-1">Review CEH domains and weak areas
                                </div>
                            </div>
                            <BookOpen
                                className="w-5 h-5 text-warning group-hover:translate-x-1 transition-transform"/>
                        </Link>
                    </div>
                </div>
            </div>
                </>
            )}
        </div>
    );
}



