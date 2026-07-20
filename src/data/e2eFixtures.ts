import type {Assessment, UserSettings} from '@/types';
import {ConflictError} from '@/lib/errors';
import {pollDefinitions} from './polls';

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

/** Fixed vote counts for deterministic smoke data (keyed by pollId + option). */
const fixtureVoteCounts: Record<string, number> = {
    'module-selection|Module 1: Network Security': 7,
    'module-selection|Module 2: Cryptography': 5,
    'module-selection|Module 3: Web Security': 3,
    'difficulty-level|Very Easy': 1,
    'difficulty-level|Easy': 2,
    'difficulty-level|Moderate': 8,
    'difficulty-level|Hard': 6,
    'difficulty-level|Very Hard': 3,
    'study-method|Video Courses': 4,
    'study-method|Books': 2,
    'study-method|Practice Labs': 9,
    'study-method|Study Groups': 3,
    'study-method|Combination': 7,
};

function buildPollRowsFromDefinitions(): PollFixtureRow[] {
    let id = 1;
    const rows: PollFixtureRow[] = [];
    for (const [pollId, definition] of Object.entries(pollDefinitions)) {
        for (const optionText of definition.options) {
            rows.push({
                id: id++,
                pollId,
                pollQuestion: definition.question,
                optionText,
                voteCount: fixtureVoteCounts[`${pollId}|${optionText}`] ?? 0,
                createdAt,
                updatedAt,
            });
        }
    }
    return rows;
}

const pollRows: PollFixtureRow[] = buildPollRowsFromDefinitions();

export const e2eAssessmentAdapter = {
    async selectAll() {
        return assessmentRows.map((row) => ({...row}));
    },
    async insert(row: Assessment) {
        if (assessmentRows.some((existing) => existing.id === row.id)) {
            throw new ConflictError('An assessment with this ID already exists.');
        }
        // Non-persisting create for hermetic E2E (matches prior route short-circuit).
        return {
            ...row,
            createdAt: '2026-07-18T12:00:00.000Z',
        };
    },
    async deleteById(_id: string) {
        void _id;
    },
    async deleteAll() {
        // no-op
    },
};

export const e2eSettingsAdapter = {
    async insertDefaultOnConflictDoNothing(id: number) {
        void id;
    },
    async selectById(id: number) {
        return id === settingsRow.id ? {...settingsRow} : undefined;
    },
    async upsert(id: number, data: UserSettings) {
        return {id, ...data};
    },
};

export const e2ePollAdapter = {
    async selectResults(pollId?: string) {
        return pollRows
            .filter((row) => pollId === undefined || row.pollId === pollId)
            .map((row) => ({...row}));
    },
    async insert(row: {
        pollId: string;
        pollQuestion: string;
        optionText: string;
        userId: string | null;
        voteCount: number;
    }) {
        if (pollRows.some((r) => r.pollId === row.pollId && r.optionText === row.optionText)) {
            throw new ConflictError(
                'A poll option with this text already exists for this poll.',
            );
        }
        return {
            id: 9000 + pollRows.length,
            pollId: row.pollId,
            pollQuestion: row.pollQuestion,
            optionText: row.optionText,
            voteCount: row.voteCount,
            userId: row.userId,
            createdAt,
            updatedAt,
        };
    },
    async voteUpsert(input: {
        pollId: string;
        pollQuestion: string;
        optionText: string;
        userId: string | null;
    }) {
        const existing = pollRows.find(
            (r) => r.pollId === input.pollId && r.optionText === input.optionText,
        );
        if (existing) {
            return {
                ...existing,
                voteCount: existing.voteCount + 1,
                updatedAt: new Date().toISOString(),
            };
        }
        return {
            id: 9000 + pollRows.length,
            pollId: input.pollId,
            pollQuestion: input.pollQuestion,
            optionText: input.optionText,
            voteCount: 1,
            userId: input.userId,
            createdAt,
            updatedAt: new Date().toISOString(),
        };
    },
    async deleteByPollId(_pollId: string) {
        void _pollId;
    },
};

export function selectRepositoryAdapter<T>(
    databaseAdapter: T,
    fixtureAdapter: T,
    fixtureMode = process.env.E2E_FIXTURES,
): T {
    return fixtureMode === 'true' ? fixtureAdapter : databaseAdapter;
}
