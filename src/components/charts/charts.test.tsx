import {cleanup, render, screen, within} from '@testing-library/react';
import {afterAll, afterEach, beforeAll, describe, expect, it} from 'vitest';
import type {Assessment} from '@/types';
import DomainRadar from './DomainRadar';
import ScoreTrend from './ScoreTrend';
import PassFail from './PassFail';
import ScoreDistribution from './ScoreDistribution';
import DomainBarChart from './DomainBarChart';
import VotesByPollChart from './VotesByPollChart';

afterEach(cleanup);

function assessment(overrides: Partial<Assessment> = {}): Assessment {
    return {
        id: 'assessment-1',
        date: '2026-01-01',
        type: 'practice',
        score: 80,
        maxScore: 100,
        percentage: 80,
        timeTaken: 60,
        domain: 'Enumeration',
        notes: '',
        passed: true,
        createdAt: '2026-01-01T12:00:00.000Z',
        ...overrides,
    };
}

function expectHiddenVisual(container: HTMLElement) {
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
}

function tableNamed(name: string) {
    const table = screen.getByRole('table', {name});
    expect(table.parentElement).toHaveClass('sr-only');
    return table;
}

describe('DomainRadar', () => {
    it('plots only measured domain averages and ignores Full Exam scores', () => {
        const {container} = render(
            <DomainRadar assessments={[
                assessment({id: '1', domain: 'Full Exam', percentage: 99}),
                assessment({id: '2', domain: 'Enumeration', percentage: 60, passed: false}),
                assessment({id: '3', domain: 'Enumeration', percentage: 80}),
                assessment({id: '4', domain: 'System Hacking', percentage: 90}),
            ]}/>,
        );

        expect(screen.getByText('Scores are available for 2 measured domains.')).toBeInTheDocument();
        const table = tableNamed('Domain radar data');
        expect(within(table).getAllByRole('row')).toHaveLength(3);
        expect(within(table).getByRole('rowheader', {name: 'Enumeration'})).toBeInTheDocument();
        expect(within(table).getByRole('cell', {name: '70%'})).toBeInTheDocument();
        expect(within(table).getByRole('rowheader', {name: 'System Hacking'})).toBeInTheDocument();
        expect(within(table).queryByText('99%')).not.toBeInTheDocument();
        expectHiddenVisual(container);
    });

    it('shows a useful message when no domain assessments are measured', () => {
        render(<DomainRadar assessments={[assessment({domain: 'Full Exam'})]}/>);

        expect(screen.getByText('No domain assessment data yet.')).toBeVisible();
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
});

describe('ScoreTrend', () => {
    const originalTimezone = process.env.TZ;

    beforeAll(() => {
        process.env.TZ = 'America/Los_Angeles';
    });

    afterAll(() => {
        process.env.TZ = originalTimezone;
    });

    it('uses local calendar dates and exposes every plotted score', () => {
        const {container} = render(<ScoreTrend assessments={[
            assessment({id: '1', date: '2026-01-01', percentage: 65, passed: false}),
            assessment({id: '2', date: '2026-01-02', percentage: 80}),
        ]}/>);

        expect(screen.getByText('2 assessment scores from 65% to 80%.')).toBeInTheDocument();
        const table = tableNamed('Score trend data');
        expect(within(table).getByRole('rowheader', {name: 'Jan 1'})).toBeInTheDocument();
        expect(within(table).getByRole('rowheader', {name: 'Jan 2'})).toBeInTheDocument();
        expect(within(table).getByRole('cell', {name: '65%'})).toBeInTheDocument();
        expectHiddenVisual(container);
    });

    it('shows a useful message without scores', () => {
        render(<ScoreTrend assessments={[]}/>);
        expect(screen.getByText('No score trend data yet.')).toBeVisible();
    });
});

describe('PassFail', () => {
    it('summarizes and lists both plotted totals', () => {
        const {container} = render(<PassFail assessments={[
            assessment(),
            assessment({id: '2', passed: false}),
            assessment({id: '3'}),
        ]}/>);

        expect(screen.getByText('3 assessments: 2 passed and 1 failed.')).toBeInTheDocument();
        const table = tableNamed('Pass and fail data');
        expect(within(table).getByRole('rowheader', {name: 'Passed'})).toBeInTheDocument();
        expect(within(table).getByRole('cell', {name: '2'})).toBeInTheDocument();
        expect(within(table).getByRole('rowheader', {name: 'Failed'})).toBeInTheDocument();
        expectHiddenVisual(container);
    });

    it('shows a useful message without assessments', () => {
        render(<PassFail assessments={[]}/>);
        expect(screen.getByText('No pass or fail data yet.')).toBeVisible();
    });
});

describe('ScoreDistribution', () => {
    it('lists every plotted score range including empty ranges', () => {
        const {container} = render(<ScoreDistribution assessments={[
            assessment({percentage: 49}),
            assessment({id: '2', percentage: 75}),
        ]}/>);

        expect(screen.getByText('2 assessments across 6 score ranges.')).toBeInTheDocument();
        const table = tableNamed('Score distribution data');
        expect(within(table).getAllByRole('row')).toHaveLength(7);
        expect(within(table).getByRole('rowheader', {name: '0-50%'})).toBeInTheDocument();
        expect(within(table).getByRole('rowheader', {name: '50-60%'}).nextElementSibling).toHaveTextContent('0');
        expectHiddenVisual(container);
    });

    it('shows a useful message without assessments', () => {
        render(<ScoreDistribution assessments={[]}/>);
        expect(screen.getByText('No score distribution data yet.')).toBeVisible();
    });
});

describe('DomainBarChart', () => {
    it('summarizes and lists every plotted domain score', () => {
        const {container} = render(<DomainBarChart data={[
            {name: 'Enumeration', score: 72},
            {name: 'Sniffing', score: 88},
        ]}/>);

        expect(screen.getByText('Scores are plotted for 2 domains.')).toBeInTheDocument();
        const table = tableNamed('Domain performance data');
        expect(within(table).getAllByRole('row')).toHaveLength(3);
        expect(within(table).getByRole('cell', {name: '88%'})).toBeInTheDocument();
        expectHiddenVisual(container);
    });

    it('shows a useful message without domains', () => {
        render(<DomainBarChart data={[]}/>);
        expect(screen.getByText('No domain performance data yet.')).toBeVisible();
    });
});

describe('VotesByPollChart', () => {
    it('uses short visual labels while exposing full poll questions in the data table', () => {
        const {container} = render(<VotesByPollChart data={[
            {pollId: '1', question: 'When should the exam date be scheduled?', visualLabel: 'Exam date', votes: 4},
            {pollId: '2', question: 'Which study topic should we cover next?', visualLabel: 'Study topic', votes: 7},
        ]}/>);

        expect(screen.getByText('11 votes across 2 polls.')).toBeInTheDocument();
        const table = tableNamed('Votes by poll data');
        expect(within(table).getAllByRole('row')).toHaveLength(3);
        expect(within(table).getByRole('rowheader', {name: 'Which study topic should we cover next?'})).toBeInTheDocument();
        expect(within(table).queryByRole('rowheader', {name: 'Study topic'})).not.toBeInTheDocument();
        expect(within(table).getByRole('cell', {name: '7'})).toBeInTheDocument();
        expectHiddenVisual(container);
    });

    it('shows a useful message without polls', () => {
        render(<VotesByPollChart data={[]}/>);
        expect(screen.getByText('No poll vote data yet.')).toBeVisible();
    });
});
