import {cleanup, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import ReadinessHero from './ReadinessHero';

const readinessVisual = vi.hoisted(() => vi.fn(() => <div data-readiness-visual-client/>));

vi.mock('./ReadinessVisual', () => ({default: readinessVisual}));

vi.mock('next/link', () => ({
    default: ({children, href, ...props}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {href: string}) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ReadinessHero', () => {
    it('renders real populated metrics as text', () => {
        render(<ReadinessHero
            state="ready"
            averageScore={75.2}
            studyStreak={1}
            coveredDomains={1}
            totalDomains={20}
        />);

        expect(screen.getByRole('heading', {name: 'Dashboard', level: 1})).toBeVisible();
        expect(screen.getByText('Progress shapes your readiness shield.')).toBeVisible();
        expect(screen.getByText('75.2%')).toBeVisible();
        expect(screen.getByText('Almost Ready')).toBeVisible();
        expect(screen.getByText('1 day')).toBeVisible();
        expect(screen.getByText('1 of 20')).toBeVisible();
        expect(screen.getByRole('link', {name: 'View analytics'})).toHaveAttribute('href', '/analytics');
        expect(screen.getByRole('link', {name: 'View analytics'})).toHaveClass('min-h-11');
        expect(screen.getByRole('link', {name: 'View analytics'})).toHaveClass(
            '[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
        );
    });

    it('does not invent values when data is empty', () => {
        render(<ReadinessHero
            state="empty"
            averageScore={0}
            studyStreak={0}
            coveredDomains={0}
            totalDomains={20}
        />);

        expect(screen.queryByText('0%')).not.toBeInTheDocument();
        expect(screen.queryByText('Needs Work')).not.toBeInTheDocument();
        expect(screen.getByRole('link', {name: 'Add assessment'})).toHaveAttribute('href', '/add');
    });

    it('keeps the particle visual decorative', () => {
        const {container} = render(<ReadinessHero
            state="ready"
            averageScore={80}
            studyStreak={2}
            coveredDomains={3}
            totalDomains={20}
        />);

        expect(container.querySelector('[data-readiness-visual]')).toHaveAttribute('aria-hidden', 'true');
        expect(readinessVisual).toHaveBeenCalledWith({
            parameters: {
                cohesion: 0.91,
                orbitRegularity: expect.closeTo(0.35714285714285715),
                sectorCoverage: 0.15,
                dataPresence: 1,
            },
        }, undefined);
    });
});
