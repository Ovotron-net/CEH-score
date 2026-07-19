import {expect, type Locator, type Page, test} from '@playwright/test';

const pages = [
    {path: '/', heading: 'Dashboard', title: 'Dashboard | CEH Tracker'},
    {path: '/assessments', heading: 'Assessments', title: 'Assessments | CEH Tracker'},
    {path: '/add', heading: 'Add Assessment', title: 'Add Assessment | CEH Tracker'},
    {path: '/analytics', heading: 'Analytics', title: 'Analytics | CEH Tracker'},
    {path: '/leaderboard', heading: 'Leaderboard', title: 'Leaderboard | CEH Tracker'},
    {path: '/polls', heading: 'Community Polls', title: 'Community Polls | CEH Tracker'},
    {path: '/polls/analytics', heading: 'Poll Analytics', title: 'Poll Analytics | CEH Tracker'},
    {path: '/topics', heading: 'CEH Topics', title: 'CEH Topics | CEH Tracker'},
    {path: '/settings', heading: 'Settings', title: 'Settings | CEH Tracker'},
];

const settings = {
    name: 'E2E Learner',
    targetScore: 85,
    examDate: '2026-12-01',
    theme: 'dark',
};

const pollOptions: Record<string, string[]> = {
    'module-selection': [
        'Module 1: Network Security',
        'Module 2: Cryptography',
        'Module 3: Web Security',
    ],
    'difficulty-level': ['Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard'],
    'study-method': ['Video Courses', 'Books', 'Practice Labs', 'Study Groups', 'Combination'],
};

const pollQuestions: Record<string, string> = {
    'module-selection': "What's your favorite CEH module?",
    'difficulty-level': 'How difficult is the CEH exam?',
    'study-method': "What's your preferred study method?",
};

function pollStats(pollId: string) {
    return {
        pollId,
        pollQuestion: pollQuestions[pollId] ?? 'E2E poll',
        totalVotes: 0,
        options: (pollOptions[pollId] ?? []).map((optionText, index) => ({
            id: -(index + 1),
            optionText,
            voteCount: 0,
            percentage: 0,
        })),
        createdAt: '1970-01-01T00:00:00.000Z',
        updatedAt: '1970-01-01T00:00:00.000Z',
    };
}

function collectBrowserErrors(page: Page) {
    const errors: string[] = [];
    page.on('console', message => {
        if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });
    page.on('pageerror', error => errors.push(`page: ${error.message}`));
    return errors;
}

function isWebGlUnavailableError(error: string) {
    return /THREE\.WebGLRenderer: Error creating WebGL context/i.test(error);
}

function unexpectedBrowserErrors(
    errors: string[],
    {allowHeadlessWebGlUnavailable = false}: {allowHeadlessWebGlUnavailable?: boolean} = {},
) {
    // Headless Chromium may expose canvas APIs without a usable WebGL context.
    return errors.filter(error => !allowHeadlessWebGlUnavailable || !isWebGlUnavailableError(error));
}

async function expectReadinessMetrics(page: Page) {
    const readiness = page.getByRole('region', {name: 'Readiness overview'});
    await expect(readiness.getByRole('heading', {name: 'Dashboard', level: 1})).toBeVisible();
    await expect(readiness.getByText('75.2%')).toBeVisible();
    await expect(readiness.getByText('Almost Ready')).toBeVisible();
    await expect(readiness.getByText('1 day')).toBeVisible();
    await expect(readiness.getByText('1 of 20')).toBeVisible();
    await expect(readiness.getByRole('link', {name: 'View analytics'})).toBeVisible();
    return readiness;
}

async function expectReadinessTerminal(readiness: Locator) {
    const boundary = readiness.locator('[data-readiness-status]');
    await expect(boundary).toHaveAttribute('data-readiness-status', /^(ready|unavailable)$/);
    return boundary;
}

// Initial data is server-hydrated; these stubs cover browser refreshes and mutations.
test.beforeEach(async ({page}, testInfo) => {
    if (testInfo.project.name === 'production') return;

    await page.route('**/api/**', async route => {
        const request = route.request();
        const url = new URL(request.url());

        if (request.method() === 'DELETE') {
            await route.fulfill({status: 204, body: ''});
            return;
        }

        if (url.pathname === '/api/settings') {
            const body = request.method() === 'PUT' ? request.postDataJSON() : settings;
            await route.fulfill({status: 200, json: body});
            return;
        }

        if (url.pathname === '/api/assessments') {
            const body = request.method() === 'POST' ? request.postDataJSON() : [];
            await route.fulfill({status: 200, json: body});
            return;
        }

        const pollMatch = url.pathname.match(/^\/api\/polls\/([^/]+)$/);
        if (pollMatch) {
            await route.fulfill({status: 200, json: pollStats(decodeURIComponent(pollMatch[1]))});
            return;
        }

        if (url.pathname === '/api/polls') {
            await route.fulfill({status: 200, json: []});
            return;
        }

        if (/^\/api\/polls\/[^/]+\/votes$/.test(url.pathname)) {
            const vote = request.postDataJSON() as {optionText: string; pollQuestion?: string};
            const pollId = decodeURIComponent(url.pathname.split('/')[3]);
            await route.fulfill({status: 200, json: {
                id: 1,
                pollId,
                pollQuestion: vote.pollQuestion ?? pollQuestions[pollId] ?? 'E2E poll',
                optionText: vote.optionText,
                voteCount: 1,
                createdAt: '2026-07-18T12:00:00.000Z',
                updatedAt: '2026-07-18T12:00:00.000Z',
            }});
            return;
        }

        await route.fulfill({status: 404, json: {error: 'Unstubbed E2E API route'}});
    });
});

for (const {path, heading, title} of pages) {
    test(`loads ${path}`, async ({page}) => {
        await page.goto(path);
        await expect(page.getByRole('heading', {name: heading, level: 1})).toBeVisible();
        await expect(page).toHaveTitle(title);
    });
}

test('dashboard uses server-hydrated assessments without an initial browser GET', async ({page}) => {
    const browserErrors = collectBrowserErrors(page);
    let browserAssessmentGets = 0;
    page.on('request', request => {
        if (request.method() === 'GET' && new URL(request.url()).pathname === '/api/assessments') {
            browserAssessmentGets += 1;
        }
    });

    await page.goto('/');
    const readiness = await expectReadinessMetrics(page);
    await expectReadinessTerminal(readiness);
    await expect(readiness.locator('[data-readiness-canvas]:visible, [data-readiness-fallback]:visible')).toHaveCount(1);
    expect(browserAssessmentGets).toBe(0);
    expect(unexpectedBrowserErrors(browserErrors, {allowHeadlessWebGlUnavailable: true})).toEqual([]);
});

test('dashboard remains complete when WebGL is unavailable', async ({page}) => {
    const browserErrors = collectBrowserErrors(page);
    await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type, ...args) {
            if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null;
            return Reflect.apply(original, this, [type, ...args]);
        } as typeof original;
    });

    await page.goto('/');
    const readiness = await expectReadinessMetrics(page);
    const boundary = await expectReadinessTerminal(readiness);
    await expect(boundary).toHaveAttribute('data-readiness-status', 'unavailable');
    await expect.poll(() => browserErrors.some(isWebGlUnavailableError)).toBe(true);
    await expect(readiness.locator('[data-readiness-fallback]')).toBeVisible();
    await expect(page.getByRole('main').getByRole('alert')).toHaveCount(0);
    expect(unexpectedBrowserErrors(browserErrors, {allowHeadlessWebGlUnavailable: true})).toEqual([]);
});

test('dashboard readiness visual respects reduced motion', async ({page}) => {
    const browserErrors = collectBrowserErrors(page);
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.goto('/');

    const readiness = await expectReadinessMetrics(page);
    await expectReadinessTerminal(readiness);
    await expect(readiness.locator('[data-readiness-canvas]:visible, [data-readiness-fallback]:visible')).toHaveCount(1);
    expect(unexpectedBrowserErrors(browserErrors, {allowHeadlessWebGlUnavailable: true})).toEqual([]);
});

test('sidebar navigation reaches assessments', async ({page}) => {
    await page.goto('/');
    await page.getByRole('link', {name: 'Assessments'}).click();
    await expect(page).toHaveURL(/\/assessments$/);
    await expect(page.getByRole('heading', {name: 'Assessments', level: 1})).toBeVisible();
});

test('client navigation moves focus to the destination heading', async ({page}) => {
    await page.goto('/');
    await page.getByRole('link', {name: 'Assessments'}).click();

    const heading = page.getByRole('heading', {name: 'Assessments', level: 1});
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();
});

test('delayed non-dashboard RSC navigation never mounts the dashboard fallback', async ({page}) => {
    let delayedRscRequest = false;
    let navigationStarted = false;

    await page.route('**/assessments**', async route => {
        const request = route.request();
        if (request.headers().rsc !== '1') {
            await route.continue();
            return;
        }
        if (!navigationStarted) {
            await route.abort();
            return;
        }

        delayedRscRequest = true;
        await route.continue({
            headers: {...request.headers(), 'x-e2e-rsc-delay': '2000'},
        });
    });
    await page.goto('/');
    await page.evaluate(() => {
        document.documentElement.dataset.routeLoadingObserved = 'false';
        new MutationObserver(() => {
            if (document.querySelector('[data-route-loading]')) {
                document.documentElement.dataset.routeLoadingObserved = 'true';
            }
        }).observe(document.body, {childList: true, subtree: true});
    });

    navigationStarted = true;
    const navigation = page.getByRole('link', {name: 'Assessments'}).first().click();
    await expect.poll(() => delayedRscRequest).toBe(true);
    await page.waitForTimeout(1000);
    await expect(page.getByRole('heading', {name: 'Assessments', level: 1})).toHaveCount(0);
    await expect(page.locator('[data-route-loading]')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-route-loading-observed', 'false');
    await navigation;

    const heading = page.getByRole('heading', {name: 'Assessments', level: 1});
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();
    await expect(page.locator('html')).toHaveAttribute('data-route-loading-observed', 'false');
});

test('reduced motion removes active animations and makes transitions effectively instant', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.setViewportSize({width: 375, height: 812});
    await page.goto('/topics');

    const motion = await page.evaluate(() => {
        const maximumDurationMs = (value: string) => Math.max(...value.split(',').map(duration => {
            const parsed = Number.parseFloat(duration);
            return duration.trim().endsWith('ms') ? parsed : parsed * 1000;
        }));
        const pageStyles = getComputedStyle(document.querySelector('.page-enter')!);
        const transitionStyles = getComputedStyle(document.querySelector('#mobile-navigation')!);

        const activeAnimationDurationsMs = document.getAnimations().map(animation => {
            const duration = animation.effect?.getComputedTiming().duration;
            return typeof duration === 'number' ? duration : Number.POSITIVE_INFINITY;
        });

        return {
            maximumActiveAnimationDurationMs: Math.max(0, ...activeAnimationDurationsMs),
            animationDurationMs: pageStyles.animationName === 'none'
                ? 0
                : maximumDurationMs(pageStyles.animationDuration),
            transitionDurationMs: maximumDurationMs(transitionStyles.transitionDuration),
        };
    });

    expect(motion.maximumActiveAnimationDurationMs).toBeLessThanOrEqual(0.1);
    expect(motion.animationDurationMs).toBeLessThanOrEqual(0.1);
    expect(motion.transitionDurationMs).toBeLessThanOrEqual(0.1);
});

test.describe('mobile layout', () => {
    test.use({viewport: {width: 375, height: 812}});

    for (const {path} of pages) {
        test(`${path} has no document horizontal overflow`, async ({page}) => {
            await page.goto(path);
            await expect.poll(() => page.evaluate(() => ({
                clientWidth: document.documentElement.clientWidth,
                scrollWidth: document.documentElement.scrollWidth,
            }))).toEqual({clientWidth: 375, scrollWidth: 375});
        });
    }

    test('mobile drawer manages focus and closes with Escape and its close button', async ({page}) => {
        await page.goto('/');
        const openButton = page.getByRole('button', {name: 'Open navigation'});

        await openButton.click();
        await expect(page.getByRole('button', {name: 'Close navigation'})).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(openButton).toBeFocused();
        await expect(openButton).toHaveAttribute('aria-expanded', 'false');

        await openButton.click();
        await page.getByRole('button', {name: 'Close navigation'}).click();
        await expect(openButton).toBeFocused();
        await expect(openButton).toHaveAttribute('aria-expanded', 'false');
    });
});

test.describe('mobile readiness hero', () => {
    test.use({viewport: {width: 375, height: 812}});

    test('collapses without horizontal overflow', async ({page}) => {
        await page.goto('/');
        await expect(page.getByRole('region', {name: 'Readiness overview'})).toBeVisible();
        await expect.poll(() => page.evaluate(() => ({
            clientWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
        }))).toEqual({clientWidth: 375, scrollWidth: 375});
    });
});

test('assessment and settings fields have accessible labels', async ({page}) => {
    await page.goto('/add');
    for (const label of ['Date', 'Type', 'Score', 'Max Score', 'Domain', 'Time Taken (minutes)', 'Notes (optional)']) {
        await expect(page.getByLabel(label, {exact: true})).toBeVisible();
    }

    await page.goto('/settings');
    await expect(page.getByLabel('Your Name')).toBeVisible();
    await expect(page.getByLabel(/Target Score/)).toBeVisible();
    await expect(page.getByLabel('Exam Date')).toBeVisible();
});

test('light theme cookie is applied to the root element during server rendering', async ({context, page}) => {
    await context.addCookies([{
        name: 'ceh-theme',
        value: 'light',
        domain: '127.0.0.1',
        path: '/',
    }]);

    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/\blight\b/);
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
});

test('@production built app hydrates fixture data and performs a real assessment POST', async ({page}) => {
    let browserAssessmentGets = 0;
    page.on('request', request => {
        if (request.method() === 'GET' && new URL(request.url()).pathname === '/api/assessments') {
            browserAssessmentGets += 1;
        }
    });

    await page.goto('/');
    await expectReadinessMetrics(page);
    await expect(page.getByText('Current Average', {exact: true}).locator('..').getByText('75.2', {exact: true}))
        .toBeVisible();
    await expect(page.getByText('Total Assessments', {exact: true}).locator('..').getByText('3', {exact: true}))
        .toBeVisible();
    expect(browserAssessmentGets).toBe(0);

    await page.getByRole('link', {name: 'Add Assessment'}).first().click();
    await page.getByLabel('Score', {exact: true}).fill('100');
    await page.getByLabel('Time Taken (minutes)', {exact: true}).fill('120');
    await page.getByLabel('Notes (optional)', {exact: true}).fill('Production smoke browser mutation');

    const mutationResponse = page.waitForResponse(response =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname === '/api/assessments',
    );
    await page.getByRole('button', {name: 'Save Assessment'}).click();

    const response = await mutationResponse;
    expect(response.status()).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
        score: 100,
        percentage: 80,
        passed: true,
        notes: 'Production smoke browser mutation',
    });
    await expect(page).toHaveURL(/\/assessments$/);
    await expect(page.getByRole('heading', {name: 'Assessments', level: 1})).toBeVisible();
});
