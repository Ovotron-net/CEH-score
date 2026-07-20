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
    it('preserves aggregate and consecutive-day streak behavior', () => {
        const stats = calculateStats([
            makeAssessment({id: 'a-1', date: '2026-07-18', percentage: 80}),
            makeAssessment({id: 'a-2', date: '2026-07-17', percentage: 60}),
            makeAssessment({id: 'a-3', date: '2026-07-17', percentage: 90}),
            makeAssessment({id: 'a-4', date: '2026-07-15', percentage: 70}),
        ]);

        expect(stats).toEqual({
            averageScore: 75,
            bestScore: 90,
            passRate: 100,
            totalAssessments: 4,
            studyStreak: 2,
        });
    });

    it('calculates aggregate fields in one pass', () => {
        let percentageReads = 0;
        const assessments = [70, 80, 90].map((percentage, index) => {
            const assessment = makeAssessment({id: `a-${index + 1}`});
            Object.defineProperty(assessment, 'percentage', {
                enumerable: true,
                get() {
                    percentageReads += 1;
                    return percentage;
                },
            });
            return assessment;
        });

        calculateStats(assessments);

        expect(percentageReads).toBe(assessments.length);
    });

    it('preserves the best score when all percentages are negative', () => {
        const stats = calculateStats([
            makeAssessment({id: 'a-1', percentage: -20}),
            makeAssessment({id: 'a-2', percentage: -10}),
        ]);

        expect(stats.bestScore).toBe(-10);
    });

    it('calculates consecutive local calendar days east of UTC', () => {
        const originalTimezone = process.env.TZ;
        process.env.TZ = 'Asia/Tokyo';

        try {
            const stats = calculateStats([
                makeAssessment({id: 'a-1', date: '2026-07-17'}),
                makeAssessment({id: 'a-2', date: '2026-07-18'}),
            ]);

            expect(stats.studyStreak).toBe(2);
        } finally {
            process.env.TZ = originalTimezone;
        }
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

describe('getReadinessLevel', () => {
    it('maps average score to readiness labels', () => {
        expect(getReadinessLevel(90)).toBe('Exam Ready');
        expect(getReadinessLevel(80)).toBe('Almost Ready');
        expect(getReadinessLevel(70)).toBe('Good Progress');
        expect(getReadinessLevel(60)).toBe('Developing');
        expect(getReadinessLevel(40)).toBe('Needs Work');
    });
});
