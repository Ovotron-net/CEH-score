import {cleanup, render, screen, within} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import ChartDataTable from './ChartDataTable';

afterEach(cleanup);

describe('ChartDataTable', () => {
    it('provides a visually hidden summary and structured values', () => {
        render(
            <ChartDataTable
                summary="Two domain scores are plotted."
                caption="Domain score data"
                columns={['Domain', 'Score']}
                rows={[
                    ['Enumeration', '80%'],
                    ['System Hacking', '70%'],
                ]}
            />,
        );

        const table = screen.getByRole('table', {name: 'Domain score data'});
        expect(table.parentElement).toHaveClass('sr-only');
        expect(screen.getByText('Two domain scores are plotted.')).toBeInTheDocument();
        expect(within(table).getAllByRole('row')).toHaveLength(3);
        expect(within(table).getByRole('cell', {name: '80%'})).toBeInTheDocument();
    });
});
