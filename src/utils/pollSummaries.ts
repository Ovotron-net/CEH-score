import type {PollResult} from '@/api/polls';

export interface PollSummary {
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

export function groupIntoSummaries(results: PollResult[]): PollSummary[] {
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