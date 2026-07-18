import Link from 'next/link';
import {formatScore, getReadinessLevel} from '../../utils/calculations';
import {mapReadinessVisualParameters} from '../../utils/readinessVisual';
import ReadinessVisual from './ReadinessVisual';

export type ReadinessHeroState = 'loading' | 'unavailable' | 'empty' | 'ready';

export interface ReadinessHeroProps {
    state: ReadinessHeroState;
    averageScore: number;
    studyStreak: number;
    coveredDomains: number;
    totalDomains: number;
}

export default function ReadinessHero({
    state,
    averageScore,
    studyStreak,
    coveredDomains,
    totalDomains,
}: ReadinessHeroProps) {
    const isReady = state === 'ready';
    const parameters = mapReadinessVisualParameters({
        averageScore,
        studyStreak,
        coveredDomains,
        totalDomains,
        hasAssessments: isReady,
    });
    const summary = state === 'loading'
        ? 'Loading your preparation overview.'
        : state === 'unavailable'
            ? 'Preparation data is unavailable.'
            : state === 'empty'
                ? 'Add an assessment to begin mapping your preparation.'
                : 'Progress shapes your readiness shield.';

    return (
        <section
            aria-label="Readiness overview"
            className="mb-8 overflow-hidden rounded-2xl border border-border/70 bg-card/60"
        >
            <div className="grid items-stretch md:grid-cols-[minmax(0,1.05fr)_minmax(18rem,.95fr)]">
                <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-9">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Dashboard</h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">{summary}</p>

                    {isReady ? (
                        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5">
                            <div>
                                <dt className="text-xs text-muted-foreground">Current average</dt>
                                <dd className="mt-1 text-3xl font-bold tabular-nums text-foreground">
                                    {formatScore(averageScore)}%
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-muted-foreground">Readiness</dt>
                                <dd className="mt-1 text-sm font-semibold text-primary">
                                    {getReadinessLevel(averageScore)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-muted-foreground">Study streak</dt>
                                <dd className="mt-1 font-semibold tabular-nums text-foreground">
                                    {studyStreak} {studyStreak === 1 ? 'day' : 'days'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-muted-foreground">Domains assessed</dt>
                                <dd className="mt-1 font-semibold tabular-nums text-foreground">
                                    {coveredDomains} of {totalDomains}
                                </dd>
                            </div>
                        </dl>
                    ) : null}

                    {state === 'ready' || state === 'empty' ? (
                        <Link
                            href={state === 'ready' ? '/analytics' : '/add'}
                            className="mt-7 inline-flex min-h-11 w-fit items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                            {state === 'ready' ? 'View analytics' : 'Add assessment'}
                        </Link>
                    ) : null}
                </div>

                <div
                    data-readiness-visual
                    aria-hidden="true"
                    className="min-h-56 border-t border-border/50 bg-background/35 sm:min-h-64 md:min-h-80 md:border-l md:border-t-0"
                >
                    <ReadinessVisual parameters={parameters}/>
                </div>
            </div>
        </section>
    );
}
