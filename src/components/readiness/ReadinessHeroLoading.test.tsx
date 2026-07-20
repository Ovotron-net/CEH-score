import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import ReadinessHeroLoading from './ReadinessHeroLoading';

describe('ReadinessHeroLoading', () => {
    it('reserves the hero geometry without presenting invented readiness data', () => {
        const {container} = render(<ReadinessHeroLoading/>);

        expect(screen.getAllByRole('heading', {name: 'Dashboard', level: 1})).toHaveLength(1);
        expect(screen.getByRole('status', {name: 'Loading dashboard'})).toBeVisible();
        expect(screen.queryByText(/%/)).not.toBeInTheDocument();
        expect(screen.queryByText('Current average')).not.toBeInTheDocument();
        expect(screen.queryByText('Readiness')).not.toBeInTheDocument();
        expect(container.querySelector('[data-readiness-fallback]')).toBeInTheDocument();
        expect(container.querySelector('[data-readiness-visual]')).toHaveClass(
            'min-h-56',
            'sm:min-h-64',
            'md:min-h-80',
        );
        expect(container.firstElementChild).toHaveAttribute('data-route-loading');
    });
});
