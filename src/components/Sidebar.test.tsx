import {cleanup, fireEvent, render, screen, within} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import Sidebar from './Sidebar';

const navigation = vi.hoisted(() => ({pathname: '/assessments/42'}));
const preload = vi.hoisted(() => ({analytics: vi.fn(), pollAnalytics: vi.fn()}));

vi.mock('next/navigation', () => ({
    usePathname: () => navigation.pathname,
}));

vi.mock('@/components/charts/lazy', () => ({
    preloadAnalyticsCharts: preload.analytics,
    preloadPollAnalyticsChart: preload.pollAnalytics,
}));

vi.mock('next/link', () => ({
    default: ({children, href, onClick, ...props}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a
            href={String(href)}
            onClick={(event) => {
                event.preventDefault();
                onClick?.(event);
            }}
            {...props}
        >
            {children}
        </a>
    ),
}));

afterEach(() => {
    cleanup();
    navigation.pathname = '/assessments/42';
    preload.analytics.mockReset();
    preload.pollAnalytics.mockReset();
});

describe('Sidebar', () => {
    it('labels the navigation and marks only the active route as current', () => {
        render(<Sidebar mode="desktop"/>);

        const nav = screen.getByRole('navigation', {name: 'Primary navigation'});
        expect(within(nav).getByRole('link', {name: 'Assessments'})).toHaveAttribute('aria-current', 'page');
        expect(within(nav).getByRole('link', {name: 'Dashboard'})).not.toHaveAttribute('aria-current');
    });

    it('does not mark a route with only a matching prefix as current', () => {
        navigation.pathname = '/assessments-old';
        const {container} = render(<Sidebar mode="desktop"/>);

        expect(container.querySelector('[aria-current="page"]')).not.toBeInTheDocument();
    });

    it('does not use a page-level heading for the brand', () => {
        render(<Sidebar mode="desktop"/>);

        expect(screen.queryByRole('heading', {level: 1, name: 'CEH Tracker'})).not.toBeInTheDocument();
        expect(screen.getByText('CEH Tracker')).toHaveClass('text-foreground');
    });

    it('keeps a closed mobile drawer inert and hidden from assistive technology', () => {
        const {container} = render(<Sidebar mode="mobile" isOpen={false}/>);
        const sidebar = container.querySelector('aside');

        expect(sidebar).toHaveAttribute('inert');
        expect(sidebar).toHaveAttribute('aria-hidden', 'true');
    });

    it('keeps desktop navigation usable while the mobile drawer is closed', () => {
        const {container} = render(<Sidebar mode="desktop" isOpen={false}/>);
        const sidebar = container.querySelector('aside');

        expect(sidebar).not.toHaveAttribute('inert');
        expect(screen.getByRole('link', {name: 'Dashboard'})).toBeInTheDocument();
    });

    it('provides a close target at least 44px square in the mobile drawer', () => {
        render(<Sidebar mode="mobile" isOpen/>);

        expect(screen.getByRole('button', {name: 'Close navigation'})).toHaveClass('min-h-11', 'min-w-11');
    });

    it('preloads route charts on focus, pointer enter, and touch start', () => {
        render(<Sidebar mode="desktop"/>);
        const analytics = screen.getByRole('link', {name: 'Analytics'});
        const polls = screen.getByRole('link', {name: 'Polls'});

        fireEvent.focus(analytics);
        fireEvent.pointerEnter(analytics);
        fireEvent.touchStart(analytics);
        fireEvent.focus(polls);
        fireEvent.pointerEnter(polls);
        fireEvent.touchStart(polls);

        expect(preload.analytics).toHaveBeenCalledTimes(3);
        expect(preload.pollAnalytics).toHaveBeenCalledTimes(3);
    });
});
