import 'server-only';

import {eq} from 'drizzle-orm';
import {db} from '@/db';
import {pollResults} from '@/db/schema';
import type {PollResult, PollStats} from '@/api/polls';
import {e2ePollAdapter, selectRepositoryAdapter} from './e2eFixtures';
import {getPollDefinition, type PollDefinition} from './polls';

interface PollRow {
    id: number;
    pollId: string;
    pollQuestion: string;
    optionText: string;
    voteCount: number;
    userId?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface PollReadAdapter {
    selectResults(pollId?: string): Promise<PollRow[]>;
}

const projection = {
    id: pollResults.id,
    pollId: pollResults.pollId,
    pollQuestion: pollResults.pollQuestion,
    optionText: pollResults.optionText,
    voteCount: pollResults.voteCount,
    createdAt: pollResults.createdAt,
    updatedAt: pollResults.updatedAt,
};

const databaseAdapter: PollReadAdapter = {
    selectResults(pollId) {
        const query = db.select(projection).from(pollResults);
        return pollId
            ? query.where(eq(pollResults.pollId, pollId)).orderBy(pollResults.createdAt)
            : query.orderBy(pollResults.createdAt);
    },
};

function toIsoString(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function projectRow(row: PollRow): PollResult {
    return {
        id: row.id,
        pollId: row.pollId,
        pollQuestion: row.pollQuestion,
        optionText: row.optionText,
        voteCount: row.voteCount,
        createdAt: toIsoString(row.createdAt),
        updatedAt: toIsoString(row.updatedAt),
    };
}

export function createPollRepository(adapter: PollReadAdapter) {
    return {
        async getPollResults(pollId?: string): Promise<PollResult[]> {
            return (await adapter.selectResults(pollId)).map(projectRow);
        },

        async getPollStats(
            pollId: string,
            definition?: PollDefinition,
        ): Promise<PollStats | null> {
            const rows = await adapter.selectResults(pollId);

            if (rows.length === 0) {
                if (!definition) return null;

                const epoch = new Date(0).toISOString();
                return {
                    pollId,
                    pollQuestion: definition.question,
                    totalVotes: 0,
                    options: definition.options.map((optionText, index) => ({
                        id: -(index + 1),
                        optionText,
                        voteCount: 0,
                        percentage: 0,
                    })),
                    createdAt: epoch,
                    updatedAt: epoch,
                };
            }

            const totalVotes = rows.reduce((sum, row) => sum + row.voteCount, 0);
            const sortedRows = [...rows].sort((a, b) => a.optionText.localeCompare(b.optionText));
            const createdAt = rows.reduce((min, row) => {
                const value = toIsoString(row.createdAt);
                return value < min ? value : min;
            }, toIsoString(rows[0].createdAt));
            const updatedAt = rows.reduce((max, row) => {
                const value = toIsoString(row.updatedAt);
                return value > max ? value : max;
            }, toIsoString(rows[0].updatedAt));

            return {
                pollId,
                pollQuestion: rows[0].pollQuestion,
                totalVotes,
                options: sortedRows.map((row) => ({
                    id: row.id,
                    optionText: row.optionText,
                    voteCount: row.voteCount,
                    percentage: totalVotes > 0 ? Math.round((row.voteCount / totalVotes) * 100) : 0,
                })),
                createdAt,
                updatedAt,
            };
        },
    };
}

const repository = createPollRepository(selectRepositoryAdapter(databaseAdapter, e2ePollAdapter));

export const getPollResults = repository.getPollResults;

export function getPollStats(pollId: string, definition = getPollDefinition(pollId)) {
    return repository.getPollStats(pollId, definition);
}
