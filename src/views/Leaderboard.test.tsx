import {cleanup, fireEvent, render, screen, within} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import type {Assessment} from '@/types';
import Leaderboard from './Leaderboard';

const {useAssessmentQuery, useSettingsQuery} = vi.hoisted(() => ({
    useAssessmentQuery: vi.fn(),
    useSettingsQuery: vi.fn(),
}));

vi.mock('../hooks/useAssessments', () => ({useAssessmentQuery}));
vi.mock('../hooks/useSettings', () => ({useSettingsQuery}));
vi.mock('next/link', () => ({
    default: ({children, href, ...props}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a href={String(href)} {...props}>{children}</a>
    ),
}));

function assessment(id: string, domain: string, percentage: number, date = '2026-07-18'): Assessment {
    return {
        id,
        date,
        type: 'practice',
        score: percentage,
        maxScore: 100,
        percentage,
        timeTaken: 90,
        domain,
        notes: '',
        passed: percentage >= 70,
        createdAt: `${date}T12:00:00.000Z`,
    };
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useRealTimers();
});

describe('Leaderboard', () => {
    it('sorts a copy and renders a semantic, horizontally scrollable table', () => {
        const source = [assessment('1', 'Cloud Computing', 75), assessment('2', 'System Hacking', 95)];
        useAssessmentQuery.mockReturnValue({data: source, isLoading: false, isError: false});
        useSettingsQuery.mockReturnValue({data: {name: 'Alex', targetScore: 85, examDate: '', theme: 'dark'}, isLoading: false, isError: false});

        const {container} = render(<Leaderboard/>);
        const rows = screen.getAllByRole('row');

        expect(within(rows[1]).getByText('System Hacking')).toBeInTheDocument();
        expect(within(rows[2]).getByText('Cloud Computing')).toBeInTheDocument();
        expect(source.map(({id}) => id)).toEqual(['1', '2']);
        expect(screen.getByRole('table', {name: 'Assessment rankings'})).toBeInTheDocument();
        expect(container.querySelector('.overflow-x-auto')).toBeInTheDocument();
        expect(container.querySelectorAll('.render-row')).toHaveLength(2);
        expect(container.textContent).not.toMatch(/[🥇🥈🥉]/u);
    });

    it('exposes the selected period with aria-pressed and applies a local cutoff', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 6, 18, 12));
        useAssessmentQuery.mockReturnValue({data: [
            assessment('1', 'Recent', 80, '2026-07-17'),
            assessment('2', 'Old', 90, '2026-06-01'),
        ], isLoading: false, isError: false});
        useSettingsQuery.mockReturnValue({data: {name: 'Alex'}, isLoading: false, isError: false});
        render(<Leaderboard/>);

        expect(screen.getByRole('button', {name: 'All Time'})).toHaveAttribute('aria-pressed', 'true');
        fireEvent.click(screen.getByRole('button', {name: 'This Week'}));

        expect(screen.getByRole('button', {name: 'This Week'})).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getAllByText('Recent')).toHaveLength(2);
        expect(screen.queryByText('Old')).not.toBeInTheDocument();
    });

    it('distinguishes loading and errors from an empty leaderboard', () => {
        useSettingsQuery.mockReturnValue({data: undefined, isLoading: true, isError: false});
        useAssessmentQuery.mockReturnValue({data: undefined, isLoading: true, isError: false});
        const {rerender} = render(<Leaderboard/>);
        expect(screen.getByRole('status', {name: 'Loading leaderboard'})).toBeInTheDocument();

        useSettingsQuery.mockReturnValue({data: undefined, isLoading: false, isError: false});
        useAssessmentQuery.mockReturnValue({data: undefined, isLoading: false, isError: true});
        rerender(<Leaderboard/>);
        expect(screen.getByRole('alert')).toHaveTextContent('Failed to load assessments');
        expect(screen.queryByText('No assessments for this period')).not.toBeInTheDocument();
    });
});
