import type {Assessment, UserSettings} from '@/types';

type AssessmentFixtureRow = Omit<Assessment, 'createdAt'> & {createdAt: string};

interface SettingsFixtureRow extends UserSettings {
    id: number;
}

interface PollFixtureRow {
    id: number;
    pollId: string;
    pollQuestion: string;
    optionText: string;
    voteCount: number;
    createdAt: string;
    updatedAt: string;
}

const assessmentRows: readonly AssessmentFixtureRow[] = [
    {
        id: 'e2e-assessment-3',
        date: '2026-07-18',
        type: 'mock',
        score: 108,
        maxScore: 125,
        percentage: 86.4,
        timeTaken: 210,
        domain: 'Network Security',
        notes: 'Deterministic E2E fixture',
        passed: true,
        createdAt: '2026-07-18T12:00:00.000Z',
    },
    {
        id: 'e2e-assessment-2',
        date: '2026-07-11',
        type: 'practice',
        score: 96,
        maxScore: 125,
        percentage: 76.8,
        timeTaken: 225,
        domain: 'Web Application Security',
        notes: 'Deterministic E2E fixture',
        passed: true,
        createdAt: '2026-07-11T12:00:00.000Z',
    },
    {
        id: 'e2e-assessment-1',
        date: '2026-07-04',
        type: 'practice',
        score: 78,
        maxScore: 125,
        percentage: 62.4,
        timeTaken: 240,
        domain: 'Cryptography',
        notes: 'Deterministic E2E fixture',
        passed: false,
        createdAt: '2026-07-04T12:00:00.000Z',
    },
];

const settingsRow: SettingsFixtureRow = {
    id: 1,
    name: 'E2E Learner',
    targetScore: 85,
    examDate: '2026-12-01',
    theme: 'dark',
};

const createdAt = '2026-07-01T12:00:00.000Z';
const updatedAt = '2026-07-18T12:00:00.000Z';
const pollRows: readonly PollFixtureRow[] = [
    ['module-selection', "What's your favorite CEH module?", 'Module 1: Network Security', 7],
    ['module-selection', "What's your favorite CEH module?", 'Module 2: Cryptography', 5],
    ['module-selection', "What's your favorite CEH module?", 'Module 3: Web Security', 3],
    ['difficulty-level', 'How difficult is the CEH exam?', 'Very Easy', 1],
    ['difficulty-level', 'How difficult is the CEH exam?', 'Easy', 2],
    ['difficulty-level', 'How difficult is the CEH exam?', 'Moderate', 8],
    ['difficulty-level', 'How difficult is the CEH exam?', 'Hard', 6],
    ['difficulty-level', 'How difficult is the CEH exam?', 'Very Hard', 3],
    ['study-method', "What's your preferred study method?", 'Video Courses', 4],
    ['study-method', "What's your preferred study method?", 'Books', 2],
    ['study-method', "What's your preferred study method?", 'Practice Labs', 9],
    ['study-method', "What's your preferred study method?", 'Study Groups', 3],
    ['study-method', "What's your preferred study method?", 'Combination', 7],
].map(([pollId, pollQuestion, optionText, voteCount], index) => ({
    id: index + 1,
    pollId: String(pollId),
    pollQuestion: String(pollQuestion),
    optionText: String(optionText),
    voteCount: Number(voteCount),
    createdAt,
    updatedAt,
}));

export const e2eAssessmentAdapter = {
    async selectAll() {
        if (process.env.E2E_FIXTURES === 'true') {
            const {headers} = await import('next/headers');
            const requestedDelay = Number((await headers()).get('x-e2e-rsc-delay'));
            const delayMs = Number.isFinite(requestedDelay)
                ? Math.min(Math.max(requestedDelay, 0), 5_000)
                : 0;
            if (delayMs > 0) await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        return assessmentRows.map((row) => ({...row}));
    },
};

export const e2eSettingsAdapter = {
    async insertDefaultOnConflictDoNothing(id: number) {
        void id;
    },
    async selectById(id: number) {
        return id === settingsRow.id ? {...settingsRow} : undefined;
    },
};

export const e2ePollAdapter = {
    async selectResults(pollId?: string) {
        return pollRows
            .filter((row) => pollId === undefined || row.pollId === pollId)
            .map((row) => ({...row}));
    },
};

export function selectRepositoryAdapter<T>(
    databaseAdapter: T,
    fixtureAdapter: T,
    fixtureMode = process.env.E2E_FIXTURES,
): T {
    return fixtureMode === 'true' ? fixtureAdapter : databaseAdapter;
}
