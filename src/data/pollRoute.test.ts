// @vitest-environment node
import {afterEach, describe, expect, it, vi} from 'vitest';
import type {PollStats} from '@/api/polls';

const {getPollStats} = vi.hoisted(() => ({
    getPollStats: vi.fn(),
}));

vi.mock('@/data/pollRepository', () => ({getPollStats}));

import {GET} from '@/app/api/polls/[pollId]/route';

describe('poll stats GET boundary', () => {
    afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllEnvs();
    });

    it('returns not found for an unknown poll', async () => {
        vi.stubEnv('API_SECRET', '');
        getPollStats.mockResolvedValue(null);

        const response = await GET(
            new Request('http://localhost/api/polls/unknown'),
            {params: Promise.resolve({pollId: 'unknown'})},
        );

        expect(response.status).toBe(404);
        await expect(response.json()).resolves.toEqual({error: 'Poll not found.'});
    });

    it('returns a successful zero-vote fixed poll DTO', async () => {
        vi.stubEnv('API_SECRET', '');
        const stats: PollStats = {
            pollId: 'study-method',
            pollQuestion: "What's your preferred study method?",
            totalVotes: 0,
            options: [],
            createdAt: '1970-01-01T00:00:00.000Z',
            updatedAt: '1970-01-01T00:00:00.000Z',
        };
        getPollStats.mockResolvedValue(stats);

        const response = await GET(
            new Request('http://localhost/api/polls/study-method'),
            {params: Promise.resolve({pollId: 'study-method'})},
        );

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual(stats);
    });
});
