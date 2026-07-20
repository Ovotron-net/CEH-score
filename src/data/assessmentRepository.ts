import 'server-only';

import {desc, eq} from 'drizzle-orm';
import {db} from '@/db';
import {assessments} from '@/db/schema';
import {ConflictError, isPgUniqueViolation} from '@/lib/errors';
import type {Assessment, AssessmentCreateInput} from '@/types';
import {calculatePercentage, isPassed} from '@/utils/calculations';
import {e2eAssessmentAdapter, selectRepositoryAdapter} from './e2eFixtures';

type AssessmentRow = Omit<Assessment, 'createdAt'> & {createdAt: Date | string};

export interface AssessmentAdapter {
    selectAll(): Promise<AssessmentRow[]>;
    insert(row: Assessment): Promise<AssessmentRow>;
    deleteById(id: string): Promise<void>;
    deleteAll(): Promise<void>;
}

const databaseAdapter: AssessmentAdapter = {
    selectAll: () => db.select().from(assessments).orderBy(desc(assessments.createdAt)),
    async insert(row) {
        const [created] = await db.insert(assessments).values(row).returning();
        return created;
    },
    async deleteById(id) {
        await db.delete(assessments).where(eq(assessments.id, id));
    },
    async deleteAll() {
        await db.delete(assessments);
    },
};

function projectAssessment(row: AssessmentRow): Assessment {
    return {
        ...row,
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    };
}

export function deriveAssessmentFields(input: AssessmentCreateInput): Assessment {
    const percentage = calculatePercentage(input.score, input.maxScore);
    return {
        id: input.id,
        date: input.date,
        type: input.type,
        score: input.score,
        maxScore: input.maxScore,
        timeTaken: input.timeTaken,
        domain: input.domain,
        notes: input.notes,
        percentage,
        passed: isPassed(percentage),
        createdAt: input.createdAt ?? new Date().toISOString(),
    };
}

export function createAssessmentRepository(adapter: AssessmentAdapter) {
    return {
        async getAssessments(): Promise<Assessment[]> {
            const rows = await adapter.selectAll();
            return rows
                .map(projectAssessment)
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        },

        async createAssessment(input: AssessmentCreateInput): Promise<Assessment> {
            const row = deriveAssessmentFields({
                ...input,
                createdAt: new Date().toISOString(),
            });
            try {
                return projectAssessment(await adapter.insert(row));
            } catch (err) {
                if (isPgUniqueViolation(err) || err instanceof ConflictError) {
                    throw new ConflictError('An assessment with this ID already exists.');
                }
                throw err;
            }
        },

        async deleteAssessment(id: string): Promise<void> {
            await adapter.deleteById(id);
        },

        async clearAssessments(): Promise<void> {
            await adapter.deleteAll();
        },
    };
}

function repository() {
    return createAssessmentRepository(
        selectRepositoryAdapter(databaseAdapter, e2eAssessmentAdapter),
    );
}

export const getAssessments = () => repository().getAssessments();
export const createAssessment = (input: AssessmentCreateInput) => repository().createAssessment(input);
export const deleteAssessment = (id: string) => repository().deleteAssessment(id);
export const clearAssessments = () => repository().clearAssessments();
