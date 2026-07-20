import {cleanup, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import NotFound from './not-found';

afterEach(cleanup);

describe('NotFound', () => {
    it('uses the semantic foreground color for its heading', () => {
        render(<NotFound/>);

        expect(screen.getByRole('heading', {name: 'Page not found'})).toHaveClass('text-foreground');
    });

    it('provides a touch-safe dashboard action', () => {
        render(<NotFound/>);

        expect(screen.getByRole('link', {name: 'Go to Dashboard'})).toHaveClass('min-h-11');
    });
});
