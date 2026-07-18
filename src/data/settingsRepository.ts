import 'server-only';

import {eq} from 'drizzle-orm';
import {db} from '@/db';
import {settings} from '@/db/schema';
import type {UserSettings} from '@/types';
import {e2eSettingsAdapter, selectRepositoryAdapter} from './e2eFixtures';

const SETTINGS_ID = 1;

interface SettingsRow extends UserSettings {
    id: number;
}

export interface SettingsReadAdapter {
    insertDefaultOnConflictDoNothing(id: number): Promise<void>;
    selectById(id: number): Promise<SettingsRow | undefined>;
}

const databaseAdapter: SettingsReadAdapter = {
    async insertDefaultOnConflictDoNothing(id) {
        await db.insert(settings).values({id}).onConflictDoNothing();
    },
    async selectById(id) {
        const [row] = await db
            .select({
                id: settings.id,
                name: settings.name,
                targetScore: settings.targetScore,
                examDate: settings.examDate,
                theme: settings.theme,
            })
            .from(settings)
            .where(eq(settings.id, id))
            .limit(1);
        return row;
    },
};

export function createSettingsRepository(adapter: SettingsReadAdapter) {
    return {
        async getSettings(): Promise<UserSettings> {
            await adapter.insertDefaultOnConflictDoNothing(SETTINGS_ID);
            const row = await adapter.selectById(SETTINGS_ID);

            if (!row) throw new Error('Settings row was not initialized.');

            return {
                name: row.name,
                targetScore: row.targetScore,
                examDate: row.examDate,
                theme: row.theme,
            };
        },
    };
}

export const {getSettings} = createSettingsRepository(
    selectRepositoryAdapter(databaseAdapter, e2eSettingsAdapter),
);
