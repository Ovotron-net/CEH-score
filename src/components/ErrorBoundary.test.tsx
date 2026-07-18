import {cleanup, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import ErrorBoundary from './ErrorBoundary';

function BrokenView(): never {
    throw new Error('View failed');
}

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('ErrorBoundary', () => {
    it('announces the fallback as main content and focuses its heading', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        render(
            <ErrorBoundary>
                <BrokenView/>
            </ErrorBoundary>,
        );

        const main = screen.getByRole('main');
        const alert = screen.getByRole('alert');
        const heading = screen.getByRole('heading', {level: 1, name: 'Something went wrong'});
        expect(main).toContainElement(alert);
        expect(alert).toContainElement(heading);
        await waitFor(() => expect(heading).toHaveFocus());
        expect(heading).toHaveAttribute('tabindex', '-1');
    });
});
