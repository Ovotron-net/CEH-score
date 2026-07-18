// @vitest-environment node
import {readFile} from 'node:fs/promises';
import {describe, expect, it} from 'vitest';

const routeTitles = {
    'page.tsx': 'Dashboard | CEH Tracker',
    'add/page.tsx': 'Add Assessment | CEH Tracker',
    'analytics/page.tsx': 'Analytics | CEH Tracker',
    'assessments/page.tsx': 'Assessments | CEH Tracker',
    'leaderboard/page.tsx': 'Leaderboard | CEH Tracker',
    'polls/page.tsx': 'Community Polls | CEH Tracker',
    'polls/analytics/page.tsx': 'Poll Analytics | CEH Tracker',
    'settings/page.tsx': 'Settings | CEH Tracker',
    'topics/page.tsx': 'CEH Topics | CEH Tracker',
} as const;

describe('route metadata', () => {
    it('exports a unique CEH Tracker title from every route page', async () => {
        const entries = await Promise.all(
            Object.entries(routeTitles).map(async ([route, title]) => ({
                route,
                title,
                source: await readFile(new URL(route, import.meta.url), 'utf8'),
            })),
        );

        for (const {route, title, source} of entries) {
            expect(source.replaceAll('\r\n', '\n'), route).toContain(
                `export const metadata: Metadata = {\n    title: '${title}',`,
            );
        }

        expect(new Set(Object.values(routeTitles)).size).toBe(Object.keys(routeTitles).length);
    });
});
