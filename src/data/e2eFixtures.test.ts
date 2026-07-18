// @vitest-environment node
import {describe, expect, it} from 'vitest';
import {
    e2eAssessmentAdapter,
    e2ePollAdapter,
    e2eSettingsAdapter,
    selectRepositoryAdapter,
} from './e2eFixtures';

describe('E2E repository fixtures', () => {
    it('selects fixtures only when fixture mode is explicitly enabled', () => {
        const databaseAdapter = {source: 'database'};
        const fixtureAdapter = {source: 'fixture'};

        expect(selectRepositoryAdapter(databaseAdapter, fixtureAdapter, 'true')).toBe(fixtureAdapter);
        expect(selectRepositoryAdapter(databaseAdapter, fixtureAdapter, 'TRUE')).toBe(databaseAdapter);
        expect(selectRepositoryAdapter(databaseAdapter, fixtureAdapter, undefined)).toBe(databaseAdapter);
    });

    it('provides deterministic serializable hydration data', async () => {
        const assessments = await e2eAssessmentAdapter.selectAll();
        await e2eSettingsAdapter.insertDefaultOnConflictDoNothing(1);
        const settings = await e2eSettingsAdapter.selectById(1);
        const polls = await e2ePollAdapter.selectResults();

        expect(assessments.length).toBeGreaterThan(1);
        expect(settings).toMatchObject({id: 1, theme: 'dark'});
        expect(polls.length).toBeGreaterThan(1);
        expect(polls.every((poll) => typeof poll.createdAt === 'string')).toBe(true);
        expect(() => JSON.stringify({assessments, settings, polls})).not.toThrow();
    });

    it('filters fixture poll rows by poll ID', async () => {
        const rows = await e2ePollAdapter.selectResults('study-method');

        expect(rows.length).toBeGreaterThan(0);
        expect(rows.every((row) => row.pollId === 'study-method')).toBe(true);
    });
});
