import {cleanup, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, describe, expect, it, vi} from 'vitest';
import AddAssessment from './AddAssessment';

const {push, back, useAddAssessment} = vi.hoisted(() => ({
    push: vi.fn(),
    back: vi.fn(),
    useAddAssessment: vi.fn(),
}));

vi.mock('next/navigation', () => ({useRouter: () => ({push, back})}));
vi.mock('../hooks/useAssessments', () => ({useAddAssessment}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useRealTimers();
});

describe('AddAssessment', () => {
    it('uses the local calendar date and associates labels with both selects', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 6, 18, 23, 59));
        useAddAssessment.mockReturnValue({mutateAsync: vi.fn(), isPending: false});

        render(<AddAssessment/>);

        expect(screen.getByLabelText('Date')).toHaveValue('2026-07-18');
        expect(screen.getByLabelText('Type')).toHaveAttribute('role', 'combobox');
        expect(screen.getByLabelText('Domain')).toHaveAttribute('role', 'combobox');
    });

    it('places max-score errors under the max-score field with accessible error metadata', async () => {
        useAddAssessment.mockReturnValue({mutateAsync: vi.fn(), isPending: false});
        const user = userEvent.setup();
        render(<AddAssessment/>);

        const maxScore = screen.getByLabelText('Max Score');
        await user.clear(maxScore);
        await user.type(maxScore, '0');

        expect(maxScore).toHaveAttribute('aria-invalid', 'true');
        expect(maxScore).toHaveAccessibleDescription('Max score must be at least 1');
        expect(screen.getByRole('alert')).toHaveTextContent('Max score must be at least 1');
    });

    it('places an over-limit score error under the score field', async () => {
        useAddAssessment.mockReturnValue({mutateAsync: vi.fn(), isPending: false});
        const user = userEvent.setup();
        render(<AddAssessment/>);

        const score = screen.getByLabelText('Score');
        await user.type(score, '126');

        expect(score).toHaveAttribute('aria-invalid', 'true');
        expect(score).toHaveAccessibleDescription('Score cannot exceed max score (125)');
        expect(screen.getByLabelText('Max Score')).toHaveAttribute('aria-invalid', 'false');
    });

    it('submits through the add mutation and announces progress', async () => {
        let resolveMutation!: () => void;
        const mutateAsync = vi.fn(() => new Promise<void>(resolve => {
            resolveMutation = resolve;
        }));
        useAddAssessment.mockReturnValue({mutateAsync, isPending: false});
        const user = userEvent.setup();
        render(<AddAssessment/>);

        await user.type(screen.getByLabelText('Score'), '100');
        await user.type(screen.getByLabelText('Time Taken (minutes)'), '90');
        await user.click(screen.getByRole('button', {name: 'Save Assessment'}));

        expect(screen.getByRole('status')).toHaveTextContent('Saving assessment');
        expect(mutateAsync).toHaveBeenCalledOnce();
        resolveMutation();
        await waitFor(() => expect(push).toHaveBeenCalledWith('/assessments'));
    });

    it('announces mutation failures as alerts', async () => {
        useAddAssessment.mockReturnValue({mutateAsync: vi.fn().mockRejectedValue(new Error('network')), isPending: false});
        const user = userEvent.setup();
        render(<AddAssessment/>);

        await user.type(screen.getByLabelText('Score'), '100');
        await user.type(screen.getByLabelText('Time Taken (minutes)'), '90');
        await user.click(screen.getByRole('button', {name: 'Save Assessment'}));

        expect(await screen.findByRole('alert')).toHaveTextContent('Failed to save assessment');
    });
});
