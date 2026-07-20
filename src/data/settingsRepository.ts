import 'server-only';

import {eq} from 'drizzle-orm';
import {db} from '@/db';
import {settings} from '@/db/schema';
import type {UserSettings} from '@/types';
import {e2eSettingsAdapter, selectRepositoryAdapter} from './e2eFixtures';

export const SETTINGS_ID = 1;

interface SettingsRow extends UserSettings {
    id: number;
}

export interface SettingsAdapter {
    insertDefaultOnConflictDoNothing(id: number): Promise<void>;
    selectById(id: number): Promise<SettingsRow | undefined>;
    upsert(id: number, data: UserSettings): Promise<SettingsRow>;
}

const databaseAdapter: SettingsAdapter = {
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
    async upsert(id, data) {
        const [updated] = await db
            .insert(settings)
            .values({id, ...data})
            .onConflictDoUpdate({target: settings.id, set: data})
            .returning({
                id: settings.id,
                name: settings.name,
                targetScore: settings.targetScore,
                examDate: settings.examDate,
                theme: settings.theme,
            });
        return updated;
    },
};

function projectSettings(row: SettingsRow): UserSettings {
    return {
        name: row.name,
        targetScore: row.targetScore,
        examDate: row.examDate,
        theme: row.theme,
    };
}

export function createSettingsRepository(adapter: SettingsAdapter) {
    return {
        async getSettings(): Promise<UserSettings> {
            await adapter.insertDefaultOnConflictDoNothing(SETTINGS_ID);
            const row = await adapter.selectById(SETTINGS_ID);

            if (!row) throw new Error('Settings row was not initialized.');

            return projectSettings(row);
        },

        async updateSettings(data: UserSettings): Promise<UserSettings> {
            const row = await adapter.upsert(SETTINGS_ID, data);
            return projectSettings(row);
        },
    };
}

function repository() {
    return createSettingsRepository(
        selectRepositoryAdapter(databaseAdapter, e2eSettingsAdapter),
    );
}

export const getSettings = () => repository().getSettings();
export const updateSettings = (data: UserSettings) => repository().updateSettings(data);
