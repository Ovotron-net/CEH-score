import {describe, expect, it} from 'vitest';
import type {Assessment} from '@/types';
import {buildDomainStats} from './domainStats';

function makeAssessment(overrides: Partial<Assessment> = {}): Assessment {
    return {
        id: 'a-1',
        date: '2026-07-18',
        type: 'practice',
        score: 100,
        maxScore: 125,
        percentage: 80,
        timeTaken: 120,
        domain: 'Reconnaissance',
        notes: '',
        passed: true,
        createdAt: '2026-07-18T12:00:00.000Z',
        ...overrides,
    };
}

describe('buildDomainStats', () => {
    it('builds counts and rounded averages for measured domains', () => {
        const stats = buildDomainStats([
            makeAssessment({id: 'a-1', domain: 'Reconnaissance', percentage: 80}),
            makeAssessment({id: 'a-2', domain: 'System Hacking', percentage: 75}),
            makeAssessment({id: 'a-3', domain: 'Reconnaissance', percentage: 85}),
        ]);

        expect(stats).toEqual(new Map([
            ['Reconnaissance', {count: 2, average: 82.5}],
            ['System Hacking', {count: 1, average: 75}],
        ]));
        expect(stats.has('Cloud Computing')).toBe(false);
    });

    it('indexes each assessment once', () => {
        const reads = [0, 0, 0];
        const source = [
            makeAssessment({id: 'a-1'}),
            makeAssessment({id: 'a-2'}),
            makeAssessment({id: 'a-3'}),
        ];
        const assessments = new Proxy(source, {
            get(target, property, receiver) {
                if (typeof property === 'string' && /^\d+$/.test(property)) {
                    reads[Number(property)] += 1;
                }
                return Reflect.get(target, property, receiver);
            },
        });

        buildDomainStats(assessments);

        expect(reads).toEqual([1, 1, 1]);
    });

    it('returns no entries when there are no assessments', () => {
        expect(buildDomainStats([])).toEqual(new Map());
    });
});
