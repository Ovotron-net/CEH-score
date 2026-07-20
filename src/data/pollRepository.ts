import 'server-only';

import {eq, sql} from 'drizzle-orm';
import {db} from '@/db';
import {pollResults} from '@/db/schema';
import {ConflictError, isPgUniqueViolation, ValidationError} from '@/lib/errors';
import type {PollCreateInput, PollResult, PollStats, PollVoteInput} from '@/types';
import {e2ePollAdapter, selectRepositoryAdapter} from './e2eFixtures';
import {getPollDefinition, type PollDefinition} from './polls';

const MAX_OPTIONS_PER_POLL = 20;

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

export interface PollAdapter {
    selectResults(pollId?: string): Promise<PollRow[]>;
    insert(row: {
        pollId: string;
        pollQuestion: string;
        optionText: string;
        userId: string | null;
        voteCount: number;
    }): Promise<PollRow>;
    voteUpsert(input: {
        pollId: string;
        pollQuestion: string;
        optionText: string;
        userId: string | null;
    }): Promise<PollRow>;
    deleteByPollId(pollId: string): Promise<void>;
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

const databaseAdapter: PollAdapter = {
    selectResults(pollId) {
        const query = db.select(projection).from(pollResults);
        return pollId
            ? query.where(eq(pollResults.pollId, pollId)).orderBy(pollResults.createdAt)
            : query.orderBy(pollResults.createdAt);
    },
    async insert(row) {
        const [created] = await db.insert(pollResults).values(row).returning(projection);
        return created;
    },
    async voteUpsert(input) {
        const [result] = await db
            .insert(pollResults)
            .values({
                pollId: input.pollId,
                pollQuestion: input.pollQuestion,
                optionText: input.optionText,
                userId: input.userId,
                voteCount: 1,
            })
            .onConflictDoUpdate({
                target: [pollResults.pollId, pollResults.optionText],
                set: {
                    voteCount: sql`${pollResults.voteCount} + 1`,
                    updatedAt: new Date(),
                },
            })
            .returning(projection);
        return result;
    },
    async deleteByPollId(pollId) {
        await db.delete(pollResults).where(eq(pollResults.pollId, pollId));
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

export function createPollRepository(adapter: PollAdapter) {
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

        async createPollResult(input: PollCreateInput): Promise<PollResult> {
            try {
                return projectRow(await adapter.insert({
                    pollId: input.pollId,
                    pollQuestion: input.pollQuestion,
                    optionText: input.optionText,
                    userId: input.userId || null,
                    voteCount: 1,
                }));
            } catch (err) {
                if (isPgUniqueViolation(err) || err instanceof ConflictError) {
                    throw new ConflictError(
                        'A poll option with this text already exists for this poll.',
                    );
                }
                throw err;
            }
        },

        async vote(input: PollVoteInput): Promise<PollResult> {
            const existingRows = await adapter.selectResults(input.pollId);
            const resolvedPollQuestion = input.pollQuestion ?? existingRows[0]?.pollQuestion;

            if (!resolvedPollQuestion) {
                throw new ValidationError(
                    'pollQuestion is required for a new pollId when no existing poll metadata is present.',
                );
            }

            const isExistingOption = existingRows.some((row) => row.optionText === input.optionText);
            if (!isExistingOption && existingRows.length >= MAX_OPTIONS_PER_POLL) {
                throw new ValidationError('This poll has reached the maximum number of options.');
            }

            return projectRow(await adapter.voteUpsert({
                pollId: input.pollId,
                pollQuestion: resolvedPollQuestion,
                optionText: input.optionText,
                userId: input.userId || null,
            }));
        },

        async deletePoll(pollId: string): Promise<void> {
            await adapter.deleteByPollId(pollId);
        },
    };
}

function repository() {
    return createPollRepository(selectRepositoryAdapter(databaseAdapter, e2ePollAdapter));
}

export const getPollResults = (pollId?: string) => repository().getPollResults(pollId);
export const createPollResult = (input: PollCreateInput) => repository().createPollResult(input);
export const votePoll = (input: PollVoteInput) => repository().vote(input);
export const deletePoll = (pollId: string) => repository().deletePoll(pollId);

export function getPollStats(pollId: string, definition = getPollDefinition(pollId)) {
    return repository().getPollStats(pollId, definition);
}
