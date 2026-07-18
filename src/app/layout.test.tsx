import {describe, expect, it, vi} from 'vitest';
import RootLayout from './layout';

const cookieStore = vi.hoisted(() => ({theme: undefined as string | undefined}));

vi.mock('next/headers', () => ({
    cookies: async () => ({
        get: (name: string) => name === 'ceh-theme' && cookieStore.theme
            ? {value: cookieStore.theme}
            : undefined,
    }),
}));

vi.mock('@/components/providers', () => ({default: ({children}: {children: React.ReactNode}) => children}));
vi.mock('@/components/ClientShell', () => ({default: ({children}: {children: React.ReactNode}) => children}));
vi.mock('@/components/ErrorBoundary', () => ({default: ({children}: {children: React.ReactNode}) => children}));

describe('RootLayout theme', () => {
    it('renders the saved light theme before hydration', async () => {
        cookieStore.theme = 'light';

        const layout = await RootLayout({children: <main>Content</main>});

        expect(layout.props.className).toBe('light');
        expect(layout.props.style).toEqual({colorScheme: 'light'});
    });

    it.each([undefined, 'system'])('defaults a %s theme cookie to dark', async (savedTheme) => {
        cookieStore.theme = savedTheme;

        const layout = await RootLayout({children: <main>Content</main>});

        expect(layout.props.className).toBe('dark');
        expect(layout.props.style).toEqual({colorScheme: 'dark'});
    });
});
