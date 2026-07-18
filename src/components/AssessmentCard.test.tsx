import {cleanup, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import type {Assessment} from '@/types';
import AssessmentCard from './AssessmentCard';

afterEach(cleanup);

const assessment: Assessment = {
    id: 'assessment-1',
    date: '2026-01-01',
    type: 'practice',
    score: 80,
    maxScore: 100,
    percentage: 80,
    timeTaken: 60,
    domain: 'Full Exam',
    notes: '',
    passed: true,
    createdAt: '2026-01-01T12:00:00.000Z',
};

describe('AssessmentCard', () => {
    it('renders a date-only assessment on its local calendar date', () => {
        const originalTimezone = process.env.TZ;
        process.env.TZ = 'America/Los_Angeles';

        try {
            render(<AssessmentCard assessment={assessment}/>);
            expect(screen.getByText('Jan 1, 2026')).toBeInTheDocument();
        } finally {
            process.env.TZ = originalTimezone;
        }
    });
});
