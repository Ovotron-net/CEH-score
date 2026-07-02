import {describe, expect, it} from 'vitest';
import type {Assessment} from '@/types';
import {
    calculatePercentage,
    calculateStats,
    formatScore,
    getAverageScore,
    getBestScore,
    getPassRate,
    getReadinessLevel,
    getScoreColor,
    isPassed,
} from './calculations';

function makeAssessment(overrides: Partial<Assessment> = {}): Assessment {
    return {
        id: 'a-1',
        date: '2026-01-15',
        type: 'practice',
        score: 90,
        maxScore: 125,
        percentage: 72,
        timeTaken: 120,
        domain: 'Full Exam',
        notes: '',
        passed: true,
        createdAt: '2026-01-15T12:00:00.000Z',
        ...overrides,
    };
}

describe('calculatePercentage', () => {
    it('rounds score to a percentage', () => {
        expect(calculatePercentage(98, 125)).toBe(78);
    });

    it('returns 0 when max score is 0', () => {
        expect(calculatePercentage(10, 0)).toBe(0);
    });
});

describe('isPassed', () => {
    it('uses a 70% pass threshold', () => {
        expect(isPassed(70)).toBe(true);
        expect(isPassed(69)).toBe(false);
    });
});

describe('assessment aggregates', () => {
    const assessments = [
        makeAssessment({id: 'a-1', percentage: 80, passed: true}),
        makeAssessment({id: 'a-2', percentage: 60, passed: false}),
        makeAssessment({id: 'a-3', percentage: 90, passed: true}),
    ];

    it('computes average score', () => {
        expect(getAverageScore(assessments)).toBe(76.7);
    });

    it('computes best score', () => {
        expect(getBestScore(assessments)).toBe(90);
    });

    it('computes pass rate', () => {
        expect(getPassRate(assessments)).toBe(67);
    });

    it('returns zeros for empty input', () => {
        expect(getAverageScore([])).toBe(0);
        expect(getBestScore([])).toBe(0);
        expect(getPassRate([])).toBe(0);
    });
});

describe('calculateStats', () => {
    it('counts consecutive study days as a streak', () => {
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

        const stats = calculateStats([
            makeAssessment({date: today}),
            makeAssessment({id: 'a-2', date: yesterday}),
        ]);

        expect(stats.totalAssessments).toBe(2);
        expect(stats.studyStreak).toBe(2);
        expect(stats.bestScore).toBe(72);
    });
});

describe('formatScore', () => {
    it('formats integers without decimals', () => {
        expect(formatScore(85)).toBe('85');
    });

    it('formats fractional scores to one decimal', () => {
        expect(formatScore(76.7)).toBe('76.7');
    });
});

describe('getScoreColor', () => {
    it('maps score bands to theme colors', () => {
        expect(getScoreColor(90)).toBe('hsl(var(--primary))');
        expect(getScoreColor(75)).toBe('hsl(var(--accent))');
        expect(getScoreColor(65)).toBe('#ffd700');
        expect(getScoreColor(50)).toBe('#ff4444');
    });
});

describe('getReadinessLevel', () => {
    it('maps average score to readiness labels', () => {
        expect(getReadinessLevel(90)).toBe('Exam Ready');
        expect(getReadinessLevel(80)).toBe('Almost Ready');
        expect(getReadinessLevel(70)).toBe('Good Progress');
        expect(getReadinessLevel(60)).toBe('Developing');
        expect(getReadinessLevel(40)).toBe('Needs Work');
    });
});