import type {ReactElement, ReactNode} from 'react';
import {isValidElement} from 'react';
import {describe, expect, it, vi} from 'vitest';
import RootLayout from './layout';

const cookieStore = vi.hoisted(() => ({theme: undefined as string | undefined}));
const speedInsightsMocks = vi.hoisted(() => {
    function SpeedInsights() {
        return null;
    }
    return {SpeedInsights};
});

vi.mock('next/headers', () => ({
    cookies: async () => ({
        get: (name: string) => name === 'ceh-theme' && cookieStore.theme
            ? {value: cookieStore.theme}
            : undefined,
    }),
}));

vi.mock('@vercel/speed-insights/next', () => ({
    SpeedInsights: speedInsightsMocks.SpeedInsights,
}));

vi.mock('@/components/providers', () => ({default: ({children}: {children: React.ReactNode}) => children}));
vi.mock('@/components/ClientShell', () => ({default: ({children}: {children: React.ReactNode}) => children}));
vi.mock('@/components/ErrorBoundary', () => ({default: ({children}: {children: React.ReactNode}) => children}));

type HtmlTree = ReactElement<{
    className?: string;
    style?: {colorScheme?: string};
    children: ReactElement<{
        children: ReactNode;
    }>;
}>;

function bodyChildren(layout: HtmlTree): ReactNode[] {
    const children = layout.props.children.props.children;
    return Array.isArray(children) ? children : [children];
}

describe('RootLayout theme', () => {
    it('renders the saved light theme before hydration', async () => {
        cookieStore.theme = 'light';

        const layout = await RootLayout({children: <main>Content</main>}) as HtmlTree;

        expect(layout.props.className).toBe('light');
        expect(layout.props.style).toEqual({colorScheme: 'light'});
    });

    it.each([undefined, 'system'])('defaults a %s theme cookie to dark', async (savedTheme) => {
        cookieStore.theme = savedTheme;

        const layout = await RootLayout({children: <main>Content</main>}) as HtmlTree;

        expect(layout.props.className).toBe('dark');
        expect(layout.props.style).toEqual({colorScheme: 'dark'});
    });

    it('renders SpeedInsights in the document body', async () => {
        cookieStore.theme = 'dark';
        const layout = await RootLayout({children: <main>Content</main>}) as HtmlTree;
        const body = layout.props.children;

        expect(body.type).toBe('body');
        expect(
            bodyChildren(layout).some(
                (child) => isValidElement(child) && child.type === speedInsightsMocks.SpeedInsights,
            ),
        ).toBe(true);
    });
});
