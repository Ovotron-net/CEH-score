/** Canonical score presentation thresholds and Tailwind class helpers. */

export const PASS_MARK = 70;

export function isPassingScore(percentage: number): boolean {
    return percentage >= PASS_MARK;
}

/** Binary pass/fail badge classes. */
export function passBadgeClass(percentage: number): string {
    return isPassingScore(percentage)
        ? 'bg-primary/10 text-primary border-primary/20'
        : 'bg-destructive/10 text-destructive border-destructive/20';
}

/** Multi-band score tone for leaderboards and detailed cards. */
export function scoreToneClass(percentage: number): string {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 80) return 'text-info';
    if (percentage >= PASS_MARK) return 'text-warning';
    return 'text-destructive';
}

export function scorePercentageClass(percentage: number): string {
    return isPassingScore(percentage) ? 'text-primary' : 'text-destructive';
}
