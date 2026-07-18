import {describe, expect, it} from 'vitest';
import type {Assessment} from '../types';
import {
    calculateDomainCoverage,
    mapReadinessVisualParameters,
} from './readinessVisual';

function assessment(domain: string, id = domain): Assessment {
    return {
        id,
        date: '2026-07-18',
        type: 'practice',
        score: 80,
        maxScore: 100,
        percentage: 80,
        timeTaken: 60,
        domain,
        notes: '',
        passed: true,
        createdAt: '2026-07-18T12:00:00.000Z',
    };
}

describe('calculateDomainCoverage', () => {
    it('counts distinct known domains and excludes full exams and unknown labels', () => {
        const result = calculateDomainCoverage([
            assessment('Cryptography', 'known-1'),
            assessment('Cryptography', 'known-2'),
            assessment('Full Exam', 'full'),
            assessment('Network Security', 'legacy'),
        ]);

        expect(result).toEqual({covered: 1, total: 20, ratio: 0.05});
    });

    it('returns zero coverage for no assessments', () => {
        expect(calculateDomainCoverage([])).toEqual({covered: 0, total: 20, ratio: 0});
    });
});

describe('mapReadinessVisualParameters', () => {
    it('returns a visible neutral field for empty data', () => {
        expect(mapReadinessVisualParameters({
            averageScore: 0,
            studyStreak: 0,
            coveredDomains: 0,
            totalDomains: 20,
            hasAssessments: false,
        })).toEqual({
            cohesion: 0.42,
            orbitRegularity: 0.2,
            sectorCoverage: 0.25,
            dataPresence: 0,
        });
    });

    it('maps real data into bounded shader inputs', () => {
        expect(mapReadinessVisualParameters({
            averageScore: 75,
            studyStreak: 7,
            coveredDomains: 10,
            totalDomains: 20,
            hasAssessments: true,
        })).toEqual({
            cohesion: 0.8875,
            orbitRegularity: 0.625,
            sectorCoverage: 0.5,
            dataPresence: 1,
        });
    });

    it('clamps invalid and unusually large values', () => {
        expect(mapReadinessVisualParameters({
            averageScore: 140,
            studyStreak: 90,
            coveredDomains: 30,
            totalDomains: 20,
            hasAssessments: true,
        })).toEqual({
            cohesion: 1,
            orbitRegularity: 1,
            sectorCoverage: 1,
            dataPresence: 1,
        });
    });
});
