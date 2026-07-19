import {cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, describe, expect, it, vi} from 'vitest';
import ClientShell from './ClientShell';

const navigation = vi.hoisted(() => ({pathname: '/'}));

vi.mock('next/navigation', () => ({
    usePathname: () => navigation.pathname,
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
    document.body.style.overflow = '';
    navigation.pathname = '/';
});

function renderShell() {
    return render(<ClientShell><button>Page action</button></ClientShell>);
}

async function openDrawer() {
    const user = userEvent.setup();
    const menu = screen.getByRole('button', {name: 'Open navigation'});
    menu.focus();
    await user.click(menu);
    return {menu, user};
}

describe('ClientShell navigation accessibility', () => {
    it('focuses the destination heading after a route change without stealing focus on initial load', async () => {
        const {rerender} = render(<ClientShell><h1>Dashboard</h1></ClientShell>);
        const initialHeading = screen.getByRole('heading', {level: 1, name: 'Dashboard'});

        expect(initialHeading).not.toHaveFocus();

        navigation.pathname = '/analytics';
        rerender(<ClientShell><h1>Analytics</h1></ClientShell>);

        const destinationHeading = screen.getByRole('heading', {level: 1, name: 'Analytics'});
        await waitFor(() => expect(destinationHeading).toHaveFocus());
        expect(destinationHeading).toHaveAttribute('tabindex', '-1');
    });

    it('waits for the destination heading when a route loading boundary renders first', async () => {
        const {rerender} = render(<ClientShell><h1>Dashboard</h1></ClientShell>);

        navigation.pathname = '/assessments';
        rerender(
            <ClientShell>
                <div data-route-loading><h1>Dashboard</h1></div>
            </ClientShell>,
        );

        expect(screen.getByRole('heading', {level: 1, name: 'Dashboard'})).not.toHaveFocus();

        rerender(<ClientShell><h1>Assessments</h1></ClientShell>);

        await waitFor(() => expect(
            screen.getByRole('heading', {level: 1, name: 'Assessments'}),
        ).toHaveFocus());
    });

    it('provides a skip link targeting the main content', () => {
        renderShell();

        expect(screen.getByRole('link', {name: 'Skip to main content'})).toHaveAttribute('href', '#main-content');
        expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    });

    it('keeps the desktop navigation accessible while the mobile drawer is closed', () => {
        renderShell();

        expect(screen.getByRole('link', {name: 'Dashboard'})).toBeInTheDocument();
        expect(screen.getAllByRole('navigation', {name: 'Primary navigation'})).toHaveLength(1);
    });

    it('makes the background inert and locks body scrolling while the drawer is open', async () => {
        renderShell();
        const {user} = await openDrawer();

        expect(screen.getByRole('main', {hidden: true})).toHaveAttribute('inert');
        expect(document.body).toHaveStyle({overflow: 'hidden'});

        await user.click(screen.getByRole('button', {name: 'Close navigation'}));
        expect(screen.getByRole('main')).not.toHaveAttribute('inert');
        expect(document.body.style.overflow).toBe('');
    });

    it('restores the previous body overflow value after closing', async () => {
        document.body.style.overflow = 'clip';
        renderShell();
        const {user} = await openDrawer();

        await user.click(screen.getByRole('button', {name: 'Close navigation'}));
        expect(document.body.style.overflow).toBe('clip');
    });

    it('restores menu focus after the close button, backdrop, and Escape', async () => {
        const {container} = renderShell();
        let controls = await openDrawer();

        await controls.user.click(screen.getByRole('button', {name: 'Close navigation'}));
        await waitFor(() => expect(controls.menu).toHaveFocus());

        controls = await openDrawer();
        const backdrop = container.querySelector('.fixed.inset-0');
        expect(backdrop).not.toBeNull();
        fireEvent.click(backdrop!);
        await waitFor(() => expect(controls.menu).toHaveFocus());

        controls = await openDrawer();
        await controls.user.keyboard('{Escape}');
        await waitFor(() => expect(controls.menu).toHaveFocus());
    });

    it('does not restore menu focus when a route link closes the drawer', async () => {
        renderShell();
        const {menu, user} = await openDrawer();
        const mobileNav = screen.getAllByRole('navigation', {name: 'Primary navigation'})[1];

        await user.click(within(mobileNav).getByRole('link', {name: 'Assessments'}));

        expect(menu).not.toHaveFocus();
    });

    it('moves focus from mobile navigation to the new page heading', async () => {
        const {rerender} = render(<ClientShell><h1>Dashboard</h1></ClientShell>);
        const {user} = await openDrawer();
        const mobileNav = screen.getAllByRole('navigation', {name: 'Primary navigation'})[1];

        await user.click(within(mobileNav).getByRole('link', {name: 'Assessments'}));
        navigation.pathname = '/assessments';
        rerender(<ClientShell><h1>Assessments</h1></ClientShell>);

        await waitFor(() => expect(screen.getByRole('heading', {level: 1, name: 'Assessments'})).toHaveFocus());
    });

    it('traps Tab and Shift+Tab within the open mobile drawer', async () => {
        renderShell();
        const {user} = await openDrawer();
        const closeButton = screen.getByRole('button', {name: 'Close navigation'});
        const mobileNav = screen.getAllByRole('navigation', {name: 'Primary navigation'})[1];
        const lastLink = within(mobileNav).getByRole('link', {name: 'Settings'});

        expect(closeButton).toHaveFocus();
        await user.tab({shift: true});
        expect(lastLink).toHaveFocus();
        await user.tab();
        expect(closeButton).toHaveFocus();
    });

    it('provides a menu target at least 44px square', () => {
        renderShell();

        expect(screen.getByRole('button', {name: 'Open navigation'})).toHaveClass('min-h-11', 'min-w-11');
    });
});
