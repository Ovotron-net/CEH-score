import {cleanup, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {PollForm} from './PollForm';

const vote = vi.hoisted(() => ({
    isPending: false,
    mutateAsync: vi.fn(),
}));

vi.mock('@/hooks/usePolls', () => ({
    useVotePoll: () => vote,
}));

afterEach(cleanup);

beforeEach(() => {
    vote.isPending = false;
    vote.mutateAsync.mockReset();
});

describe('PollForm', () => {
    it('uses comfortable option targets and semantic foreground colors', () => {
        render(<PollForm pollId="poll-1" question="Choose one" options={['First', 'Second']}/>);

        expect(screen.getByText('Choose one')).toHaveClass('text-foreground');
        expect(screen.getByText('Choose one')).not.toHaveClass('text-white');
        expect(screen.getByLabelText('First').closest('label')).toHaveClass('min-h-11');
    });

    it('announces submission progress and marks the form busy', () => {
        vote.isPending = true;
        render(<PollForm pollId="poll-1" question="Choose one" options={['First']}/>);

        expect(screen.getByRole('form', {name: 'Choose one'})).toHaveAttribute('aria-busy', 'true');
        expect(screen.getByRole('status')).toHaveTextContent('Submitting vote');
    });

    it('announces successful votes politely', async () => {
        vote.mutateAsync.mockResolvedValue({});
        const user = userEvent.setup();
        render(<PollForm pollId="poll-1" question="Choose one" options={['First']}/>);

        await user.click(screen.getByLabelText('First'));
        await user.click(screen.getByRole('button', {name: 'Submit Vote'}));

        expect(await screen.findByRole('status')).toHaveTextContent('Vote submitted successfully');
        expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    });

    it('announces vote failures as alerts', async () => {
        vote.mutateAsync.mockRejectedValue(new Error('Vote service unavailable'));
        const user = userEvent.setup();
        render(<PollForm pollId="poll-1" question="Choose one" options={['First']}/>);

        await user.click(screen.getByLabelText('First'));
        await user.click(screen.getByRole('button', {name: 'Submit Vote'}));

        expect(await screen.findByRole('alert')).toHaveTextContent('Vote service unavailable');
    });
});
