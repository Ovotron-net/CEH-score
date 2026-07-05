import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Target} from 'lucide-react';
import StatCard from './StatCard';

describe('StatCard', () => {
    it('renders title, value, and subtitle', () => {
        render(
            <StatCard
                title="Current Average"
                value="78%"
                subtitle="Last 10 tests"
                icon={Target}
                color="green"
            />,
        );

        expect(screen.getByText('Current Average')).toBeInTheDocument();
        expect(screen.getByText('78%')).toBeInTheDocument();
        expect(screen.getByText('Last 10 tests')).toBeInTheDocument();
    });
});