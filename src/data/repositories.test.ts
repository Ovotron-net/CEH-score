// @vitest-environment node
import {describe, expect, it, vi} from 'vitest';
import type {Assessment} from '@/types';
import {
    createAssessmentRepository,
    type AssessmentReadAdapter,
} from './assessmentRepository';
import {
    createSettingsRepository,
    type SettingsReadAdapter,
} from './settingsRepository';
import {
    createPollRepository,
    type PollReadAdapter,
} from './pollRepository';
import {pollDefinitions} from './polls';

vi.mock('server-only', () => ({}));

function assessment(id: string, createdAt: string): Assessment {
    return {
        id,
        date: '2026-07-18',
        type: 'practice',
        score: 80,
        maxScore: 100,
        percentage: 80,
        timeTaken: 60,
        domain: 'Network Security',
        notes: '',
        passed: true,
        createdAt,
    };
}

describe('assessment repository', () => {
    it('returns assessments newest first without mutating adapter rows', async () => {
        const rows = [
            assessment('oldest', '2026-07-16T12:00:00.000Z'),
            assessment('newest', '2026-07-18T12:00:00.000Z'),
            assessment('middle', '2026-07-17T12:00:00.000Z'),
        ];
        const adapter: AssessmentReadAdapter = {
            selectAll: vi.fn().mockResolvedValue(rows),
        };

        const repository = createAssessmentRepository(adapter);

        await expect(repository.getAssessments()).resolves.toEqual([
            expect.objectContaining({id: 'newest'}),
            expect.objectContaining({id: 'middle'}),
            expect.objectContaining({id: 'oldest'}),
        ]);
        expect(rows.map((row) => row.id)).toEqual(['oldest', 'newest', 'middle']);
    });
});

describe('settings repository', () => {
    it('initializes conflict-safely and then selects only the singleton row', async () => {
        const calls: string[] = [];
        const adapter: SettingsReadAdapter = {
            insertDefaultOnConflictDoNothing: vi.fn(async (id) => {
                calls.push(`insert-conflict-safe:${id}`);
            }),
            selectById: vi.fn(async (id) => {
                calls.push(`select:${id}`);
                return {
                    id,
                    name: 'Alex Chen',
                    targetScore: 85,
                    examDate: '',
                    theme: 'dark' as const,
                };
            }),
        };

        const repository = createSettingsRepository(adapter);

        await expect(repository.getSettings()).resolves.toEqual({
            name: 'Alex Chen',
            targetScore: 85,
            examDate: '',
            theme: 'dark',
        });
        expect(calls).toEqual(['insert-conflict-safe:1', 'select:1']);
        expect(adapter.selectById).toHaveBeenCalledWith(1);
    });
});

describe('poll repository', () => {
    it('projects result rows without user identifiers and serializes dates', async () => {
        const adapter: PollReadAdapter = {
            selectResults: vi.fn().mockResolvedValue([
                {
                    id: 7,
                    pollId: 'module-selection',
                    pollQuestion: 'Favorite module?',
                    optionText: 'Module 1',
                    voteCount: 3,
                    userId: 'private-user-id',
                    createdAt: new Date('2026-07-17T10:11:12.000Z'),
                    updatedAt: new Date('2026-07-18T10:11:12.000Z'),
                },
            ]),
        };

        const repository = createPollRepository(adapter);
        const [result] = await repository.getPollResults();

        expect(result).toEqual({
            id: 7,
            pollId: 'module-selection',
            pollQuestion: 'Favorite module?',
            optionText: 'Module 1',
            voteCount: 3,
            createdAt: '2026-07-17T10:11:12.000Z',
            updatedAt: '2026-07-18T10:11:12.000Z',
        });
        expect(result).not.toHaveProperty('userId');
    });

    it('derives poll timestamps from all option rows as ISO strings', async () => {
        const adapter: PollReadAdapter = {
            selectResults: vi.fn().mockResolvedValue([
                {
                    id: 2,
                    pollId: 'custom-poll',
                    pollQuestion: 'Question?',
                    optionText: 'B',
                    voteCount: 1,
                    userId: null,
                    createdAt: new Date('2026-07-18T10:00:00.000Z'),
                    updatedAt: new Date('2026-07-19T10:00:00.000Z'),
                },
                {
                    id: 1,
                    pollId: 'custom-poll',
                    pollQuestion: 'Question?',
                    optionText: 'A',
                    voteCount: 3,
                    userId: null,
                    createdAt: new Date('2026-07-17T10:00:00.000Z'),
                    updatedAt: new Date('2026-07-20T10:00:00.000Z'),
                },
            ]),
        };

        const stats = await createPollRepository(adapter).getPollStats('custom-poll');

        expect(stats).toMatchObject({
            totalVotes: 4,
            createdAt: '2026-07-17T10:00:00.000Z',
            updatedAt: '2026-07-20T10:00:00.000Z',
            options: [
                {id: 1, optionText: 'A', voteCount: 3, percentage: 75},
                {id: 2, optionText: 'B', voteCount: 1, percentage: 25},
            ],
        });
    });

    it('returns configured options with zero votes for an unvoted fixed poll', async () => {
        const adapter: PollReadAdapter = {
            selectResults: vi.fn().mockResolvedValue([]),
        };
        const definition = pollDefinitions['study-method'];

        const stats = await createPollRepository(adapter).getPollStats('study-method', definition);

        expect(stats).toEqual({
            pollId: 'study-method',
            pollQuestion: definition.question,
            totalVotes: 0,
            options: definition.options.map((optionText, index) => ({
                id: -(index + 1),
                optionText,
                voteCount: 0,
                percentage: 0,
            })),
            createdAt: '1970-01-01T00:00:00.000Z',
            updatedAt: '1970-01-01T00:00:00.000Z',
        });
    });

    it('returns null for an unknown poll without rows', async () => {
        const adapter: PollReadAdapter = {
            selectResults: vi.fn().mockResolvedValue([]),
        };

        await expect(createPollRepository(adapter).getPollStats('unknown')).resolves.toBeNull();
    });
});
