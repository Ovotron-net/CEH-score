import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    testMatch: 'smoke.spec.ts',
    grep: /@production/,
    fullyParallel: false,
    forbidOnly: true,
    retries: 0,
    workers: 1,
    reporter: process.env.CI ? 'github' : 'line',
    use: {
        baseURL: 'http://127.0.0.1:3100',
        trace: 'retain-on-failure',
    },
    projects: [
        {name: 'production', use: {...devices['Desktop Chrome']}},
    ],
    webServer: {
        command: 'cross-env E2E_FIXTURES=true ALLOW_OPEN_API=true API_SECRET= npm run build && cross-env E2E_FIXTURES=true ALLOW_OPEN_API=true API_SECRET= npm run start -- -p 3100',
        url: 'http://127.0.0.1:3100/api/health',
        reuseExistingServer: false,
        timeout: 240_000,
    },
});
