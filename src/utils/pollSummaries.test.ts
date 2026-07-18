import {describe, expect, it} from 'vitest';
import type {PollResult} from '@/api/polls';
import {groupIntoSummaries} from './pollSummaries';

function makeResult(overrides: Partial<PollResult> = {}): PollResult {
    return {
        id: 1,
        pollId: 'module-selection',
        pollQuestion: 'Favorite module?',
        optionText: 'Module 1',
        voteCount: 3,
        userId: null,
        createdAt: '2026-01-01T10:00:00.000Z',
        updatedAt: '2026-01-02T10:00:00.000Z',
        ...overrides,
    };
}

describe('groupIntoSummaries', () => {
    it('groups options by poll and computes percentages', () => {
        const summaries = groupIntoSummaries([
            makeResult({id: 1, optionText: 'Module 1', voteCount: 3}),
            makeResult({id: 2, optionText: 'Module 2', voteCount: 1}),
            makeResult({
                id: 3,
                pollId: 'difficulty-level',
                pollQuestion: 'How hard?',
                optionText: 'Hard',
                voteCount: 5,
            }),
        ]);

        expect(summaries).toHaveLength(2);

        const moduleSummary = summaries.find(s => s.pollId === 'module-selection');
        const difficultySummary = summaries.find(s => s.pollId === 'difficulty-level');

        expect(moduleSummary).toBeDefined();
        expect(difficultySummary).toBeDefined();

        expect(difficultySummary?.totalVotes).toBe(5);
        expect(moduleSummary?.options).toEqual([
            {optionText: 'Module 1', voteCount: 3, percentage: 75},
            {optionText: 'Module 2', voteCount: 1, percentage: 25},
        ]);
    });

    it('returns an empty list when there are no results', () => {
        expect(groupIntoSummaries([])).toEqual([]);
    });
});
