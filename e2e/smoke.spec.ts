import {expect, test} from '@playwright/test';

const pages = [
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

for (const {path, heading} of pages) {
    test(`loads ${path}`, async ({page}) => {
        await page.goto(path);
        await expect(page.getByRole('heading', {name: heading, level: 1})).toBeVisible();
    });
}

test('sidebar navigation reaches assessments', async ({page}) => {
    await page.goto('/');
    await page.getByRole('link', {name: 'Assessments'}).click();
    await expect(page).toHaveURL(/\/assessments$/);
    await expect(page.getByRole('heading', {name: 'Assessments', level: 1})).toBeVisible();
});