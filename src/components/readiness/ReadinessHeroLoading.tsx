import ReadinessShieldFallback from './ReadinessShieldFallback';

export default function ReadinessHeroLoading() {
    return (
        <div data-route-loading className="p-4 sm:p-6 lg:p-8 page-enter">
            <section
                aria-label="Readiness overview"
                className="mb-8 overflow-hidden rounded-2xl border border-border/70 bg-card/60"
            >
                <div className="grid items-stretch md:grid-cols-[minmax(0,1.05fr)_minmax(18rem,.95fr)]">
                    <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-9">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Dashboard
                        </h1>
                        <p
                            role="status"
                            aria-label="Loading dashboard"
                            className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base"
                        >
                            Loading your preparation overview.
                        </p>
                    </div>

                    <div
                        data-readiness-visual
                        aria-hidden="true"
                        className="min-h-56 border-t border-border/50 bg-background/35 sm:min-h-64 md:min-h-80 md:border-l md:border-t-0"
                    >
                        <ReadinessShieldFallback/>
                    </div>
                </div>
            </section>
        </div>
    );
}
