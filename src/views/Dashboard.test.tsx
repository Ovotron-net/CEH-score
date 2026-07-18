import {cleanup, render, screen, within} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import type {Assessment} from '@/types';
import Dashboard from './Dashboard';

const {useAssessmentQuery} = vi.hoisted(() => ({useAssessmentQuery: vi.fn()}));

vi.mock('../hooks/useAssessments', () => ({useAssessmentQuery}));
vi.mock('next/link', () => ({
    default: ({children, href, ...props}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a href={String(href)} {...props}>{children}</a>
    ),
}));
vi.mock('../components/charts/lazy', () => ({
    ScoreTrend: () => <div>Score trend</div>,
    DomainRadar: () => <div>Domain radar</div>,
}));

function assessment(id: string, date: string): Assessment {
    return {
        id,
        date,
        type: 'practice',
        score: 100,
        maxScore: 125,
        percentage: 80,
        timeTaken: 90,
        domain: `Domain ${id}`,
        notes: '',
        passed: true,
        createdAt: `${date}T12:00:00.000Z`,
    };
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('Dashboard', () => {
    it('shows an accessible loading state', () => {
        useAssessmentQuery.mockReturnValue({data: undefined, isLoading: true, isError: false});

        render(<Dashboard/>);

        expect(screen.getByRole('status', {name: 'Loading dashboard'})).toBeInTheDocument();
    });

    it('distinguishes an assessment error from an empty result and retries', () => {
        const refetch = vi.fn();
        useAssessmentQuery.mockReturnValue({data: undefined, isLoading: false, isError: true, refetch});

        render(<Dashboard/>);

        expect(screen.getByRole('alert')).toHaveTextContent('Unable to load assessments');
        screen.getByRole('button', {name: 'Try again'}).click();
        expect(refetch).toHaveBeenCalledOnce();
        expect(screen.queryByText('No assessments yet')).not.toBeInTheDocument();
    });

    it('uses the first five assessments from the descending API without mutating the query data', () => {
        const source = [
            assessment('6', '2026-07-18'),
            assessment('5', '2026-07-17'),
            assessment('4', '2026-07-16'),
            assessment('3', '2026-07-15'),
            assessment('2', '2026-07-14'),
            assessment('1', '2026-07-13'),
        ];
        const originalOrder = source.map(({id}) => id);
        useAssessmentQuery.mockReturnValue({data: source, isLoading: false, isError: false});

        render(<Dashboard/>);

        const recent = screen.getByRole('region', {name: 'Recent assessments'});
        expect(within(recent).getAllByText(/Domain /).map(node => node.textContent)).toEqual([
            'Domain 6',
            'Domain 5',
            'Domain 4',
            'Domain 3',
            'Domain 2',
        ]);
        expect(within(recent).queryByText('Domain 1')).not.toBeInTheDocument();
        expect(source.map(({id}) => id)).toEqual(originalOrder);
    });

    it('shows the empty state only after a successful empty query', () => {
        useAssessmentQuery.mockReturnValue({data: [], isLoading: false, isError: false});

        render(<Dashboard/>);

        expect(screen.getByText('No assessments yet')).toBeInTheDocument();
    });

    it('provides a touch-safe View All action', () => {
        useAssessmentQuery.mockReturnValue({data: [], isLoading: false, isError: false});

        render(<Dashboard/>);

        expect(screen.getByRole('link', {name: 'View All'})).toHaveClass('min-h-11');
    });
});
