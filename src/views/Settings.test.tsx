import {cleanup, render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, describe, expect, it, vi} from 'vitest';
import type {UserSettings} from '../types';
import Settings from './Settings';

const hooks = vi.hoisted(() => ({
    update: vi.fn(),
    clear: vi.fn(),
    settings: {name: 'Alex Chen', targetScore: 85, examDate: '', theme: 'dark'} as UserSettings,
}));

vi.mock('../hooks/useSettings', () => ({
    useSettingsQuery: () => ({
        data: hooks.settings,
        isLoading: false,
        isError: false,
    }),
    useUpdateSettings: () => ({mutateAsync: hooks.update, isPending: false}),
}));

vi.mock('../hooks/useAssessments', () => ({
    useAssessmentQuery: () => ({data: [{id: 'assessment-1'}], isLoading: false, isError: false}),
    useClearAssessments: () => ({mutateAsync: hooks.clear, isPending: false}),
}));

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    hooks.update.mockReset();
    hooks.clear.mockReset();
    hooks.settings = {name: 'Alex Chen', targetScore: 85, examDate: '', theme: 'dark'};
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
    document.cookie = 'ceh-theme=; Path=/; Max-Age=0';
});

describe('Settings', () => {
    it('groups theme controls and exposes their selected state', () => {
        render(<Settings/>);

        const themeGroup = screen.getByRole('group', {name: 'Theme'});
        expect(within(themeGroup).getByRole('button', {name: 'Dark'})).toHaveAttribute('aria-pressed', 'true');
        expect(within(themeGroup).getByRole('button', {name: 'Light'})).toHaveAttribute('aria-pressed', 'false');
    });

    it('reconciles the hydrated database theme with stale pre-paint state once', async () => {
        document.documentElement.classList.add('light');
        document.documentElement.style.colorScheme = 'light';
        document.cookie = 'ceh-theme=light; Path=/';
        const cookieSetter = vi.spyOn(Document.prototype, 'cookie', 'set');
        const {rerender} = render(<Settings/>);

        await waitFor(() => expect(document.documentElement).toHaveClass('dark'));
        expect(document.documentElement.style.colorScheme).toBe('dark');
        expect(document.cookie).toContain('ceh-theme=dark');

        rerender(<Settings/>);

        expect(cookieSetter).toHaveBeenCalledOnce();
        expect(screen.getByRole('button', {name: 'Dark'})).toHaveAttribute('aria-pressed', 'true');
    });

    it('saves the complete edited form and announces success', async () => {
        hooks.update.mockResolvedValue({});
        const user = userEvent.setup();
        render(<Settings/>);

        await user.clear(screen.getByRole('textbox', {name: 'Your Name'}));
        await user.type(screen.getByRole('textbox', {name: 'Your Name'}), 'Jordan');
        await user.click(screen.getByRole('button', {name: 'Light'}));
        await user.click(screen.getByRole('button', {name: 'Save Settings'}));

        expect(hooks.update).toHaveBeenCalledWith({
            name: 'Jordan',
            targetScore: 85,
            examDate: '',
            theme: 'light',
        });
        expect(await screen.findByRole('status')).toHaveTextContent('Settings saved.');
    });

    it('awaits clear-all and disables confirmation actions while pending', async () => {
        let resolveClear!: () => void;
        hooks.clear.mockImplementation(() => new Promise<void>((resolve) => {
            resolveClear = resolve;
        }));
        const user = userEvent.setup();
        render(<Settings/>);

        await user.click(screen.getByRole('button', {name: 'Clear Data'}));
        const confirm = screen.getByRole('button', {name: 'Yes, delete all'});
        await user.click(confirm);

        expect(confirm).toBeDisabled();
        expect(screen.getByRole('button', {name: 'Clear Data'})).toBeDisabled();
        expect(screen.getByRole('button', {name: 'Cancel'})).toBeDisabled();
        expect(screen.getByRole('status')).toHaveTextContent('Clearing assessment data.');

        resolveClear();
        await waitFor(() => expect(screen.queryByText('This cannot be undone.')).not.toBeInTheDocument());
    });

    it('keeps clear confirmation and its error visible after failure', async () => {
        hooks.clear.mockRejectedValue(new Error('offline'));
        const user = userEvent.setup();
        render(<Settings/>);

        await user.click(screen.getByRole('button', {name: 'Clear Data'}));
        await user.click(screen.getByRole('button', {name: 'Yes, delete all'}));

        expect(await screen.findByRole('alert')).toHaveTextContent('Could not clear assessment data. Try again.');
        expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    });

    it('uses responsive action layout, semantic foreground colors, focus styles, and 44px targets', () => {
        render(<Settings/>);

        expect(screen.getByTestId('settings-actions')).toHaveClass('flex-col', 'sm:flex-row');
        expect(screen.getByRole('heading', {name: 'Profile'})).toHaveClass('text-foreground');
        expect(screen.getByRole('textbox', {name: 'Your Name'})).toHaveClass('min-h-11', 'text-foreground', 'focus-visible:ring-2');
        expect(screen.getByRole('button', {name: 'Save Settings'})).toHaveClass('min-h-11', 'focus-visible:ring-2');
        expect(screen.getByRole('button', {name: 'Clear Data'})).toHaveClass('min-h-11', 'focus-visible:ring-2');
    });
});
