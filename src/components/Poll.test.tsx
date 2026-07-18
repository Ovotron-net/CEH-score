import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Poll, PollAnalyticsLink} from './Poll';

const hooks = vi.hoisted(() => ({
    usePollStats: vi.fn(),
    useVotePoll: vi.fn(() => ({isPending: false, mutateAsync: vi.fn()})),
}));
const preload = vi.hoisted(() => ({poll: vi.fn()}));

vi.mock('@/hooks/usePolls', () => hooks);
vi.mock('@/components/charts/lazy', () => ({preloadPollAnalyticsChart: preload.poll}));
vi.mock('next/link', () => ({
    default: ({children, href, ...props}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a href={String(href)} {...props}>{children}</a>
    ),
}));

afterEach(cleanup);

beforeEach(() => {
    hooks.usePollStats.mockReset();
    hooks.usePollStats.mockReturnValue({
        poll: {pollQuestion: 'Question', totalVotes: 0, options: []},
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isFetching: false,
    });
    preload.poll.mockReset();
});

describe('Poll', () => {
    it('keeps one polling hook owner per poll', () => {
        render(<Poll pollId="poll-1" question="Question" options={['One']} refreshInterval={3000}/>);

        expect(hooks.usePollStats).toHaveBeenCalledOnce();
        expect(hooks.usePollStats).toHaveBeenCalledWith('poll-1', 3000);
    });

    it('preloads Poll Analytics charts from the analytics link interactions', () => {
        render(<PollAnalyticsLink/>);
        const link = screen.getByRole('link', {name: 'Poll Analytics'});

        fireEvent.focus(link);
        fireEvent.pointerEnter(link);
        fireEvent.touchStart(link);

        expect(preload.poll).toHaveBeenCalledTimes(3);
    });
});
