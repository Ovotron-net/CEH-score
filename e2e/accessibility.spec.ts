import AxeBuilder from '@axe-core/playwright';
import {expect, test} from '@playwright/test';

const routes = [
    {path: '/', heading: 'Dashboard'},
    {path: '/assessments', heading: 'Assessments'},
    {path: '/add', heading: 'Add Assessment'},
    {path: '/analytics', heading: 'Analytics'},
    {path: '/leaderboard', heading: 'Leaderboard'},
    {path: '/polls', heading: 'Community Polls'},
    {path: '/polls/analytics', heading: 'Poll Analytics'},
    {path: '/topics', heading: 'CEH Topics'},
    {path: '/settings', heading: 'Settings'},
];

for (const theme of ['dark', 'light'] as const) {
    for (const {path, heading} of routes) {
        test(`${path} has no serious accessibility violations in ${theme} theme`, async ({context, page}) => {
            await page.emulateMedia({reducedMotion: 'reduce'});
            await context.addCookies([{
                name: 'ceh-theme',
                value: theme,
                domain: '127.0.0.1',
                path: '/',
            }]);
            await page.goto(path);
            await expect(page.getByRole('heading', {name: heading, level: 1})).toBeVisible();
            await expect(page.getByRole('main')).toHaveCount(1);
            if (path === '/') {
                const readiness = page.getByRole('region', {name: 'Readiness overview'});
                await expect(readiness.getByText('75.2%')).toBeVisible();
                await expect(readiness.getByText('Almost Ready')).toBeVisible();
                await expect(readiness.getByText('1 day')).toBeVisible();
                await expect(readiness.getByText('1 of 20')).toBeVisible();
                await page.waitForLoadState('networkidle');

                const canvas = readiness.locator('[data-readiness-canvas]');
                if (await canvas.count() > 0) {
                    await expect(canvas).toHaveAttribute('aria-hidden', 'true');
                } else {
                    await expect(readiness.locator('[data-readiness-fallback]')).toBeVisible();
                }
            }
            await page.evaluate(requestedTheme => {
                document.documentElement.classList.remove('dark', 'light');
                document.documentElement.classList.add(requestedTheme);
                document.documentElement.style.colorScheme = requestedTheme;
            }, theme);

            const results = await new AxeBuilder({page}).analyze();
            const blockingViolations = results.violations.filter(
                violation => violation.impact === 'critical' || violation.impact === 'serious',
            );
            const details = blockingViolations.map(violation => ({
                id: violation.id,
                impact: violation.impact,
                help: violation.help,
                targets: violation.nodes.flatMap(node => node.target),
            }));

            expect(blockingViolations, JSON.stringify(details, null, 2)).toEqual([]);
        });
    }
}
