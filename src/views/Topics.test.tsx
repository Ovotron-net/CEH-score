import {cleanup, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, describe, expect, it, vi} from 'vitest';
import type {Assessment} from '@/types';
import Topics from './Topics';

const {useAssessmentQuery} = vi.hoisted(() => ({useAssessmentQuery: vi.fn()}));

vi.mock('../hooks/useAssessments', () => ({useAssessmentQuery}));

function assessment(id: string, percentage: number): Assessment {
    return {
        id,
        date: '2026-07-18',
        type: 'practice',
        score: percentage,
        maxScore: 100,
        percentage,
        timeTaken: 90,
        domain: 'Cloud Computing',
        notes: '',
        passed: percentage >= 70,
        createdAt: '2026-07-18T12:00:00.000Z',
    };
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('Topics', () => {
    it('distinguishes loading from query errors', () => {
        useAssessmentQuery.mockReturnValue({data: undefined, isLoading: true, isError: false});
        const {rerender} = render(<Topics/>);
        expect(screen.getByRole('status', {name: 'Loading topic statistics'})).toBeInTheDocument();

        useAssessmentQuery.mockReturnValue({data: undefined, isLoading: false, isError: true});
        rerender(<Topics/>);
        expect(screen.getByRole('alert')).toHaveTextContent('Failed to load assessments');
        expect(screen.queryByRole('status', {name: 'Loading topic statistics'})).not.toBeInTheDocument();
    });

    it('passes precomputed counts and averages to domain cards', () => {
        useAssessmentQuery.mockReturnValue({data: [assessment('1', 71), assessment('2', 80)], isLoading: false, isError: false});

        render(<Topics/>);

        expect(screen.getByText('2 assessments')).toBeInTheDocument();
        expect(screen.getByText('Avg: 75.5%')).toBeInTheDocument();
        expect(screen.getByText('2', {selector: '[data-testid="domain-assessment-count"]'})).toBeInTheDocument();
    });

    it('provides a visible search label and filters topic content', async () => {
        useAssessmentQuery.mockReturnValue({data: [], isLoading: false, isError: false});
        const user = userEvent.setup();
        render(<Topics/>);

        const search = screen.getByRole('searchbox', {name: 'Search domains and topics'});
        expect(screen.getByText('Search domains and topics')).toBeVisible();
        await user.type(search, 'serverless');

        expect(screen.getByRole('heading', {name: 'Cloud Computing'})).toBeInTheDocument();
        expect(screen.queryByRole('heading', {name: 'System Hacking'})).not.toBeInTheDocument();
    });
});
