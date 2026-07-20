interface PollOption {
    optionText: string;
    voteCount: number;
    percentage: number;
    id?: number;
}

interface PollOptionBarsProps {
    options: PollOption[];
    /** denser bars for analytics cards */
    compact?: boolean;
    emptyLabel?: string;
}

export function PollOptionBars({
    options,
    compact = false,
    emptyLabel = 'No votes yet',
}: PollOptionBarsProps) {
    if (options.length === 0) {
        return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
    }

    return (
        <div className={compact ? 'space-y-2' : 'space-y-3'}>
            {options.map((option) => (
                <div key={option.id ?? option.optionText} className={compact ? 'flex items-center gap-3' : 'space-y-1'}>
                    {compact ? (
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-foreground truncate pr-2">{option.optionText}</span>
                                <span className="text-muted-foreground tabular-nums shrink-0">
                                    {option.voteCount} ({option.percentage}%)
                                </span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden border border-border/60">
                                <div
                                    className="h-full bg-gradient-to-r from-primary/70 to-primary transition-all"
                                    style={{width: `${option.percentage}%`}}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-medium text-foreground">{option.optionText}</span>
                                <span className="text-xs text-muted-foreground">
                                    {option.voteCount} vote{option.voteCount !== 1 ? 's' : ''} ({option.percentage}%)
                                </span>
                            </div>
                            <div className="h-6 w-full overflow-hidden rounded-full bg-secondary">
                                <div
                                    className="flex h-full items-center justify-center bg-gradient-to-r from-primary/70 to-primary transition-all duration-300 ease-out"
                                    style={{width: `${option.percentage}%`}}
                                >
                                    {option.percentage > 10 ? (
                                        <span className="text-xs font-semibold text-primary-foreground">
                                            {option.percentage}%
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
