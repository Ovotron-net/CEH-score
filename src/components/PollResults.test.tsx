import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {PollResults} from './PollResults';

const query = vi.hoisted(() => ({
    poll: null as null | {
        pollQuestion: string;
        totalVotes: number;
        options: Array<{id: number; optionText: string; voteCount: number; percentage: number}>;
    },
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: vi.fn(),
    isFetching: false,
}));

vi.mock('@/hooks/usePolls', () => ({
    usePollStats: () => query,
}));

afterEach(cleanup);

beforeEach(() => {
    query.poll = null;
    query.isLoading = false;
    query.isError = false;
    query.error = null;
    query.isFetching = false;
    query.refetch.mockReset();
});

describe('PollResults', () => {
    it('announces loading and marks the results region busy', () => {
        query.isLoading = true;
        render(<PollResults pollId="poll-1"/>);

        expect(screen.getByRole('region', {name: 'Live poll results'})).toHaveAttribute('aria-busy', 'true');
        expect(screen.getByRole('status')).toHaveTextContent('Loading results');
    });

    it('shows an alert with a touch-safe retry when initial loading fails', () => {
        query.isError = true;
        query.error = new Error('Results unavailable');
        render(<PollResults pollId="poll-1"/>);

        expect(screen.getByRole('alert')).toHaveTextContent('Results unavailable');
        const retry = screen.getByRole('button', {name: 'Retry loading results'});
        expect(retry).toHaveClass('min-h-11', 'min-w-11');
        fireEvent.click(retry);
        expect(query.refetch).toHaveBeenCalledOnce();
    });

    it('uses a responsive header and touch-safe refresh target', () => {
        query.poll = {
            pollQuestion: 'Choose one',
            totalVotes: 1,
            options: [{id: 1, optionText: 'First', voteCount: 1, percentage: 100}],
        };
        render(<PollResults pollId="poll-1"/>);

        expect(screen.getByTestId('poll-results-header')).toHaveClass('flex-col', 'sm:flex-row');
        expect(screen.getByRole('button', {name: 'Refresh'})).toHaveClass('min-h-11', 'min-w-11');
    });

    it('announces background refreshes and stale-data errors', () => {
        query.poll = {pollQuestion: 'Choose one', totalVotes: 0, options: []};
        query.isFetching = true;
        query.isError = true;
        query.error = new Error('Refresh failed');
        render(<PollResults pollId="poll-1"/>);

        expect(screen.getByRole('region', {name: 'Live poll results'})).toHaveAttribute('aria-busy', 'true');
        expect(screen.getByRole('status')).toHaveTextContent('Refreshing results');
        expect(screen.getByRole('alert')).toHaveTextContent('Refresh failed');
    });
});
