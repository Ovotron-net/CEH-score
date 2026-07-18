import {cleanup, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, describe, expect, it, vi} from 'vitest';
import RouteError from './error';

afterEach(cleanup);

describe('RouteError', () => {
    it('offers a retry action for failed server reads', async () => {
        const reset = vi.fn();
        render(<RouteError error={new Error('database unavailable')} reset={reset}/>);

        expect(screen.getByRole('heading', {name: 'Unable to load this page'})).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', {name: 'Try again'}));
        expect(reset).toHaveBeenCalledOnce();
    });

    it('uses semantic foreground colors', () => {
        render(<RouteError error={new Error('database unavailable')} reset={vi.fn()}/>);

        expect(screen.getByRole('heading', {name: 'Unable to load this page'})).toHaveClass('text-foreground');
        expect(screen.getByRole('button', {name: 'Try again'})).toHaveClass('text-primary-foreground');
    });
});
