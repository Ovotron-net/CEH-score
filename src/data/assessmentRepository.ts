import 'server-only';

import {desc} from 'drizzle-orm';
import {db} from '@/db';
import {assessments} from '@/db/schema';
import type {Assessment} from '@/types';
import {e2eAssessmentAdapter, selectRepositoryAdapter} from './e2eFixtures';

type AssessmentRow = Omit<Assessment, 'createdAt'> & {createdAt: Date | string};

export interface AssessmentReadAdapter {
    selectAll(): Promise<AssessmentRow[]>;
}

const databaseAdapter: AssessmentReadAdapter = {
    selectAll: () => db.select().from(assessments).orderBy(desc(assessments.createdAt)),
};

export function createAssessmentRepository(adapter: AssessmentReadAdapter) {
    return {
        async getAssessments(): Promise<Assessment[]> {
            const rows = await adapter.selectAll();

            return rows
                .map((row) => ({
                    ...row,
                    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
                }))
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        },
    };
}

export const {getAssessments} = createAssessmentRepository(
    selectRepositoryAdapter(databaseAdapter, e2eAssessmentAdapter),
);
