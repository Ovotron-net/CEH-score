// @vitest-environment node
import {afterEach, describe, expect, it, vi} from 'vitest';

const insert = vi.hoisted(() => vi.fn(() => {
    throw new Error('database unavailable');
}));

vi.mock('@/db', () => ({
    db: {
        insert,
        select: () => ({from: () => ({orderBy: async () => []})}),
        delete: async () => undefined,
    },
}));
vi.mock('server-only', () => ({}));

import {POST} from './route';

describe('assessment route E2E fixtures', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        insert.mockClear();
    });

    it('accepts a deterministic fixture write without accessing the database', async () => {
        vi.stubEnv('E2E_FIXTURES', 'true');
        const response = await POST(new Request('http://localhost/api/assessments', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: 'production-smoke-assessment',
                date: '2026-07-18',
                type: 'practice',
                score: 100,
                maxScore: 125,
                timeTaken: 120,
                domain: 'Full Exam',
                notes: 'Production smoke browser mutation',
            }),
        }));

        expect(response.status).toBe(201);
        await expect(response.json()).resolves.toMatchObject({
            id: 'production-smoke-assessment',
            percentage: 80,
            passed: true,
            createdAt: '2026-07-18T12:00:00.000Z',
        });
        expect(insert).not.toHaveBeenCalled();
    });

    it('rejects timeTaken above the 7-day maximum', async () => {
        vi.stubEnv('E2E_FIXTURES', 'true');
        const response = await POST(new Request('http://localhost/api/assessments', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: 'too-long',
                date: '2026-07-18',
                type: 'practice',
                score: 10,
                maxScore: 100,
                timeTaken: 10_081,
                domain: 'Full Exam',
            }),
        }));

        expect(response.status).toBe(400);
        expect(insert).not.toHaveBeenCalled();
    });
});
