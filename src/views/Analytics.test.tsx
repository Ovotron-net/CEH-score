import {cleanup, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, describe, expect, it, vi} from 'vitest';
import type {Assessment} from '@/types';
import Analytics from './Analytics';

const {useAssessmentQuery} = vi.hoisted(() => ({useAssessmentQuery: vi.fn()}));

vi.mock('../hooks/useAssessments', () => ({useAssessmentQuery}));
vi.mock('../components/charts/lazy', () => ({
    ScoreTrend: ({assessments, limit}: {assessments: Assessment[]; limit: number}) => (
        <p>{assessments.length === 0 ? 'No score trend data yet.' : `Score trend limited to ${limit}`}</p>
    ),
    PassFail: ({assessments}: {assessments: Assessment[]}) => (
        <p>{assessments.length === 0 ? 'No pass or fail data yet.' : 'Pass and fail chart'}</p>
    ),
    ScoreDistribution: ({assessments}: {assessments: Assessment[]}) => (
        <p>{assessments.length === 0 ? 'No score distribution data yet.' : 'Score distribution chart'}</p>
    ),
    DomainRadar: ({assessments}: {assessments: Assessment[]}) => (
        <p>{assessments.length === 0 ? 'No domain assessment data yet.' : 'Domain radar chart'}</p>
    ),
    DomainBarChart: ({data}: {data: Array<{name: string; score: number}>}) => (
        data.length === 0
            ? <p>No domain performance data yet.</p>
            : <ul>{data.map(item => <li key={item.name}>{item.name}: {item.score}%</li>)}</ul>
    ),
}));

function assessment(id: string, domain: string, percentage: number, passed = percentage >= 70): Assessment {
    return {
        id,
        date: '2026-07-18',
        type: 'practice',
        score: percentage,
        maxScore: 100,
        percentage,
        timeTaken: 90,
        domain,
        notes: '',
        passed,
        createdAt: '2026-07-18T12:00:00.000Z',
    };
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('Analytics', () => {
    it('does not introduce a nested main landmark', () => {
        useAssessmentQuery.mockReturnValue({data: [], isLoading: false, isError: false});

        const {container} = render(<Analytics/>);

        expect(container.querySelector('main')).not.toBeInTheDocument();
    });

    it('shows a named, dimension-reserving skeleton while assessments load', () => {
        useAssessmentQuery.mockReturnValue({data: undefined, isLoading: true, isError: false});

        render(<Analytics/>);

        expect(screen.getByRole('heading', {level: 1, name: 'Analytics'})).toHaveClass('text-foreground');
        const loading = screen.getByRole('status', {name: 'Loading analytics'});
        const skeletons = loading.querySelectorAll('[aria-hidden="true"]');
        expect(skeletons).toHaveLength(9);
        expect(skeletons[0]).toHaveClass('h-24');
        expect(skeletons[3]).toHaveClass('h-[300px]');
    });

    it('shows a retryable error instead of empty analytics', async () => {
        const refetch = vi.fn();
        useAssessmentQuery.mockReturnValue({data: undefined, isLoading: false, isError: true, refetch});
        const user = userEvent.setup();

        render(<Analytics/>);

        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Unable to load analytics');
        expect(alert).toHaveClass('text-destructive');
        await user.click(within(alert).getByRole('button', {name: 'Try again'}));
        expect(refetch).toHaveBeenCalledOnce();
        expect(screen.queryByRole('heading', {name: 'Score Over Time'})).not.toBeInTheDocument();
        expect(screen.queryByText(/No .* data yet\./)).not.toBeInTheDocument();
    });

    it('calculates summary metrics in one pass through the assessments', () => {
        let percentageReads = 0;
        let passedReads = 0;
        const tracked = [
            assessment('1', 'Scanning Networks', 72, true),
            assessment('2', 'Cloud Computing', 91, true),
            assessment('3', 'Full Exam', 84, false),
        ].map(item => ({
            ...item,
            get percentage() {
                percentageReads += 1;
                return item.percentage;
            },
            get passed() {
                passedReads += 1;
                return item.passed;
            },
        }));
        useAssessmentQuery.mockReturnValue({data: tracked, isLoading: false, isError: false});

        render(<Analytics/>);

        const summary = screen.getByRole('region', {name: 'Performance summary'});
        expect(within(summary).getByText('82.3%')).toBeInTheDocument();
        expect(within(summary).getByText('91%')).toBeInTheDocument();
        expect(within(summary).getByText('67%')).toBeInTheDocument();
        expect(percentageReads).toBe(tracked.length * 2);
        expect(passedReads).toBe(tracked.length);
    });

    it('uses semantic status colors and a responsive one-to-three-column stats grid', () => {
        useAssessmentQuery.mockReturnValue({
            data: [assessment('1', 'Scanning Networks', 80)],
            isLoading: false,
            isError: false,
        });

        render(<Analytics/>);

        const summary = screen.getByRole('region', {name: 'Performance summary'});
        expect(summary).toHaveClass('grid-cols-1', 'sm:grid-cols-3');
        expect(within(summary).getByText('80%', {selector: '.text-primary'})).toBeInTheDocument();
        expect(within(summary).getByText('80%', {selector: '.text-warning'})).toBeInTheDocument();
        expect(within(summary).getByText('100%', {selector: '.text-success'})).toBeInTheDocument();
    });

    it('charts only measured CEH domains without inventing full-exam fallback scores', () => {
        useAssessmentQuery.mockReturnValue({
            data: [
                assessment('1', 'Scanning Networks', 70),
                assessment('2', 'Scanning Networks', 90),
                assessment('3', 'Cloud Computing', 91),
                assessment('4', 'Full Exam', 42),
            ],
            isLoading: false,
            isError: false,
        });

        render(<Analytics/>);

        const domainSection = screen.getByRole('heading', {level: 2, name: 'Domain Performance'}).parentElement;
        expect(domainSection).not.toBeNull();
        expect(within(domainSection!).getAllByRole('listitem').map(item => item.textContent)).toEqual([
            'Networks: 80%',
            'Computing: 91%',
        ]);
        expect(within(domainSection!).queryByText(/42%/)).not.toBeInTheDocument();
    });

    it('retains the chart layout, heading hierarchy, and honest empty states', () => {
        useAssessmentQuery.mockReturnValue({data: [], isLoading: false, isError: false});

        render(<Analytics/>);

        const charts = screen.getByRole('region', {name: 'Analytics charts'});
        expect(charts).toHaveClass('grid-cols-1', 'lg:grid-cols-2');
        expect(within(charts).getAllByRole('heading', {level: 2}).map(heading => heading.textContent)).toEqual([
            'Score Over Time',
            'Pass / Fail Ratio',
            'Score Distribution',
            'Domain Performance',
            'Improvement Trend',
            'Domain Radar',
        ]);
        expect(within(charts).getAllByText(/No .* data yet\./)).toHaveLength(6);
    });
});
