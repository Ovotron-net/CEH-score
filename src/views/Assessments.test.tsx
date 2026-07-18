import {cleanup, render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, describe, expect, it, vi} from 'vitest';
import type {Assessment} from '@/types';
import Assessments from './Assessments';

const {useAssessmentQuery, useDeleteAssessment} = vi.hoisted(() => ({
    useAssessmentQuery: vi.fn(),
    useDeleteAssessment: vi.fn(),
}));

vi.mock('../hooks/useAssessments', () => ({useAssessmentQuery, useDeleteAssessment}));
vi.mock('next/link', () => ({
    default: ({children, href, ...props}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a href={String(href)} {...props}>{children}</a>
    ),
}));

function assessment(id: string, domain: string, notes = ''): Assessment {
    return {
        id,
        date: '2026-07-18',
        type: 'practice',
        score: 100,
        maxScore: 125,
        percentage: 80,
        timeTaken: 90,
        domain,
        notes,
        passed: true,
        createdAt: '2026-07-18T12:00:00.000Z',
    };
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('Assessments', () => {
    it('filters assessments through the labeled search field', async () => {
        useAssessmentQuery.mockReturnValue({data: [
            assessment('1', 'Cloud Computing'),
            assessment('2', 'System Hacking', 'Practice privilege escalation'),
        ], isLoading: false, isError: false});
        useDeleteAssessment.mockReturnValue({mutateAsync: vi.fn(), isPending: false});
        const user = userEvent.setup();

        render(<Assessments/>);
        await user.type(screen.getByRole('searchbox', {name: 'Search assessments by domain or notes'}), 'PRIVILEGE');

        expect(screen.getByText('System Hacking')).toBeInTheDocument();
        expect(screen.queryByText('Cloud Computing')).not.toBeInTheDocument();
    });

    it('requires inline confirmation before deleting an assessment', async () => {
        const mutateAsync = vi.fn().mockResolvedValue(undefined);
        useAssessmentQuery.mockReturnValue({data: [assessment('1', 'Cloud Computing')], isLoading: false, isError: false});
        useDeleteAssessment.mockReturnValue({mutateAsync, isPending: false});
        const user = userEvent.setup();

        render(<Assessments/>);
        await user.click(screen.getByRole('button', {name: 'Delete Cloud Computing assessment'}));

        expect(mutateAsync).not.toHaveBeenCalled();
        const confirmation = screen.getByRole('group', {name: 'Confirm deletion'});
        const confirmButton = within(confirmation).getByRole('button', {name: 'Confirm delete'});
        expect(confirmButton).toHaveFocus();
        await user.click(confirmButton);
        expect(mutateAsync).toHaveBeenCalledWith('1');
    });

    it('restores the delete trigger focus when confirmation is cancelled', async () => {
        useAssessmentQuery.mockReturnValue({data: [assessment('1', 'Cloud Computing')], isLoading: false, isError: false});
        useDeleteAssessment.mockReturnValue({mutateAsync: vi.fn(), isPending: false});
        const user = userEvent.setup();

        render(<Assessments/>);
        await user.click(screen.getByRole('button', {name: 'Delete Cloud Computing assessment'}));
        await user.click(screen.getByRole('button', {name: 'Cancel'}));

        await waitFor(() => expect(screen.getByRole('button', {name: 'Delete Cloud Computing assessment'})).toHaveFocus());
    });

    it('restores the delete trigger and announces a failed deletion', async () => {
        useAssessmentQuery.mockReturnValue({data: [assessment('1', 'Cloud Computing')], isLoading: false, isError: false});
        useDeleteAssessment.mockReturnValue({mutateAsync: vi.fn().mockRejectedValue(new Error('unavailable')), isPending: false});
        const user = userEvent.setup();

        render(<Assessments/>);
        await user.click(screen.getByRole('button', {name: 'Delete Cloud Computing assessment'}));
        await user.click(screen.getByRole('button', {name: 'Confirm delete'}));

        expect(await screen.findByRole('alert')).toHaveTextContent('Delete failed');
        await waitFor(() => expect(screen.getByRole('button', {name: 'Delete Cloud Computing assessment'})).toHaveFocus());
    });

    it('announces successful deletion and moves focus to the stable status', async () => {
        useAssessmentQuery.mockReturnValue({data: [assessment('1', 'Cloud Computing')], isLoading: false, isError: false});
        useDeleteAssessment.mockReturnValue({mutateAsync: vi.fn().mockResolvedValue(undefined), isPending: false});
        const user = userEvent.setup();

        render(<Assessments/>);
        await user.click(screen.getByRole('button', {name: 'Delete Cloud Computing assessment'}));
        await user.click(screen.getByRole('button', {name: 'Confirm delete'}));

        const status = await screen.findByRole('status');
        expect(status).toHaveTextContent('Cloud Computing assessment deleted');
        await waitFor(() => expect(status).toHaveFocus());
    });

    it('uses an h2 for the empty-state subsection', () => {
        useAssessmentQuery.mockReturnValue({data: [], isLoading: false, isError: false});
        useDeleteAssessment.mockReturnValue({mutateAsync: vi.fn(), isPending: false});

        render(<Assessments/>);

        expect(screen.getByRole('heading', {level: 2, name: 'No assessments found'})).toBeInTheDocument();
    });

    it('disables only the row currently being deleted', () => {
        useAssessmentQuery.mockReturnValue({data: [
            assessment('1', 'Cloud Computing'),
            assessment('2', 'System Hacking'),
        ], isLoading: false, isError: false});
        useDeleteAssessment.mockReturnValue({mutateAsync: vi.fn(), isPending: true, variables: '1'});

        render(<Assessments/>);

        expect(screen.getByRole('button', {name: 'Deleting Cloud Computing assessment'})).toBeDisabled();
        expect(screen.getByRole('button', {name: 'Delete System Hacking assessment'})).toBeEnabled();
    });

    it('shows a query error with a retry action instead of an empty state', async () => {
        const refetch = vi.fn();
        useAssessmentQuery.mockReturnValue({data: undefined, isLoading: false, isError: true, refetch});
        useDeleteAssessment.mockReturnValue({mutateAsync: vi.fn(), isPending: false});
        const user = userEvent.setup();

        render(<Assessments/>);
        expect(screen.getByRole('alert')).toHaveTextContent('Unable to load assessments');
        expect(screen.queryByText('No assessments found')).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', {name: 'Try again'}));
        expect(refetch).toHaveBeenCalledOnce();
    });

    it('marks assessment cards as render rows and uses semantic foreground text', () => {
        useAssessmentQuery.mockReturnValue({data: [assessment('1', 'Cloud Computing')], isLoading: false, isError: false});
        useDeleteAssessment.mockReturnValue({mutateAsync: vi.fn(), isPending: false});

        const {container} = render(<Assessments/>);

        expect(container.querySelector('.render-row')).toBeInTheDocument();
        expect(screen.getByRole('heading', {name: 'Assessments'})).toHaveClass('text-foreground');
    });
});
