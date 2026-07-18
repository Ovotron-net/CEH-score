import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {PollResult} from '@/api/polls';
import PollAnalytics from './PollAnalytics';

const state = vi.hoisted(() => ({
    query: {
        results: [] as PollResult[],
        isLoading: false,
        isError: false,
        error: null as Error | null,
        refetch: vi.fn(),
        isFetching: false,
    },
    deletion: {
        isPending: false,
        variables: undefined as string | undefined,
        mutateAsync: vi.fn(),
    },
}));
const chartRender = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/usePolls', () => ({
    useAllPollResults: () => state.query,
    useDeletePoll: () => state.deletion,
}));
vi.mock('@/components/charts/lazy', () => ({
    VotesByPollChart: (props: unknown) => {
        chartRender(props);
        return <div>Votes chart</div>;
    },
}));
vi.mock('@/components/StatCard', () => ({default: ({title}: {title: string}) => <div>{title}</div>}));
vi.mock('next/link', () => ({
    default: ({children, href, ...props}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a href={String(href)} {...props}>{children}</a>
    ),
}));

const result: PollResult = {
    id: 1,
    pollId: 'poll-1',
    pollQuestion: 'Which topic?',
    optionText: 'Enumeration',
    voteCount: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
};

afterEach(cleanup);

beforeEach(() => {
    state.query.results = [];
    state.query.isLoading = false;
    state.query.isError = false;
    state.query.error = null;
    state.query.isFetching = false;
    state.query.refetch.mockReset();
    state.deletion.isPending = false;
    state.deletion.variables = undefined;
    state.deletion.mutateAsync.mockReset();
    chartRender.mockReset();
    vi.stubGlobal('confirm', vi.fn(() => true));
});

describe('PollAnalytics', () => {
    it('renders an announced loading skeleton in a busy region', () => {
        state.query.isLoading = true;
        const {container} = render(<PollAnalytics/>);

        expect(screen.getByRole('region', {name: 'Poll analytics'})).toHaveAttribute('aria-busy', 'true');
        expect(screen.getByRole('status')).toHaveTextContent('Loading poll analytics');
        expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
    });

    it('shows load errors as alerts with a touch-safe retry', () => {
        state.query.isError = true;
        state.query.error = new Error('Analytics unavailable');
        render(<PollAnalytics/>);

        expect(screen.getByRole('alert')).toHaveTextContent('Analytics unavailable');
        const retry = screen.getByRole('button', {name: 'Retry loading poll analytics'});
        expect(retry).toHaveClass('min-h-11');
        fireEvent.click(retry);
        expect(state.query.refetch).toHaveBeenCalledOnce();
    });

    it('keeps failed deletion visible and retryable', async () => {
        state.query.results = [result];
        state.deletion.mutateAsync
            .mockRejectedValueOnce(new Error('Delete unavailable'))
            .mockResolvedValueOnce(undefined);
        const user = userEvent.setup();
        render(<PollAnalytics/>);

        const deleteButton = screen.getByRole('button', {name: 'Delete Which topic?'});
        expect(deleteButton).toHaveClass('min-h-11', 'min-w-11');
        await user.click(deleteButton);

        expect(await screen.findByRole('alert')).toHaveTextContent('Delete unavailable');
        await user.click(screen.getByRole('button', {name: 'Retry deleting Which topic?'}));
        expect(state.deletion.mutateAsync).toHaveBeenCalledTimes(2);
    });

    it('announces successful deletion politely', async () => {
        state.query.results = [result];
        state.deletion.mutateAsync.mockResolvedValue(undefined);
        const user = userEvent.setup();
        render(<PollAnalytics/>);

        await user.click(screen.getByRole('button', {name: 'Delete Which topic?'}));

        expect(await screen.findByRole('status')).toHaveTextContent('Which topic? deleted successfully');
        expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    });

    it('uses render containment and responsive header/action groups', () => {
        state.query.results = [result];
        const {container} = render(<PollAnalytics/>);

        expect(container.querySelector('.render-row')).toBeInTheDocument();
        expect(screen.getByTestId('poll-analytics-header')).toHaveClass('flex-col', 'sm:flex-row');
        expect(screen.getByTestId('poll-list-header')).toHaveClass('flex-col', 'sm:flex-row');
    });

    it('provides a touch-safe first-vote action', () => {
        render(<PollAnalytics/>);

        expect(screen.getByRole('link', {name: 'Go cast the first vote'})).toHaveClass('min-h-11');
    });

    it('passes full poll questions separately from abbreviated visual labels', () => {
        const pollQuestion = 'Which Certified Ethical Hacker topic should the study group review next?';
        state.query.results = [{...result, pollQuestion}];

        render(<PollAnalytics/>);

        expect(chartRender).toHaveBeenCalledWith({
            data: [{
                pollId: 'poll-1',
                question: pollQuestion,
                visualLabel: 'Which Certified Ethical H…',
                votes: 2,
            }],
        });
    });
});
