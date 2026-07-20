import {cleanup, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, describe, expect, it} from 'vitest';
import type {CEHDomain} from '../types';
import DomainCard from './DomainCard';

const domain: CEHDomain = {
    id: 'domain-1',
    name: 'Introduction to Ethical Hacking',
    weight: 6,
    description: 'Ethical hacking fundamentals.',
    topics: ['Information Security Overview', 'Hacking Concepts'],
};

afterEach(cleanup);

describe('DomainCard', () => {
    it('uses a native disclosure button and only mounts topics while expanded', async () => {
        const user = userEvent.setup();
        render(<DomainCard domain={domain}/>);

        const button = screen.getByRole('button', {name: /Introduction to Ethical Hacking/i});
        const controlledId = button.getAttribute('aria-controls');

        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(controlledId).toBeTruthy();
        expect(screen.queryByText('Hacking Concepts')).not.toBeInTheDocument();

        await user.click(button);

        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(document.getElementById(controlledId!)).toBeInTheDocument();
        expect(screen.getByText('Hacking Concepts')).toBeInTheDocument();

        await user.click(button);

        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByText('Hacking Concepts')).not.toBeInTheDocument();
    });

    it('uses theme foreground and semantic status classes', () => {
        const {container} = render(<DomainCard domain={domain} assessmentCount={3} avgScore={62}/>);

        expect(screen.getByRole('heading', {level: 2, name: domain.name})).toHaveClass('text-foreground');
        expect(screen.getByText('3 assessments')).toHaveClass('text-accent');
        expect(screen.getByText('Avg: 62%')).toHaveClass('text-destructive');
        expect(container.innerHTML).not.toMatch(/text-(?:white|red-400|purple-400)/);
    });
});
