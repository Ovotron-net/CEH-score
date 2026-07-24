// @vitest-environment node
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import nextConfig from '../../next.config';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Next.js loads the first match among next.config.js → .mjs → .ts.
 * A competing .js/.mjs file shadows next.config.ts and drops security headers.
 */
const shadowingConfigFiles = [
    'next.config.js',
    'next.config.cjs',
    'next.config.mjs',
] as const;

const requiredHeaderKeys = [
    'Strict-Transport-Security',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Referrer-Policy',
    'Permissions-Policy',
    'Content-Security-Policy',
] as const;

describe('next.config security headers', () => {
    it('does not ship a competing next.config that would shadow next.config.ts', () => {
        for (const file of shadowingConfigFiles) {
            expect(
                existsSync(path.join(repoRoot, file)),
                `${file} must not exist; Next prefers it over next.config.ts and would drop security headers`,
            ).toBe(false);
        }
        expect(existsSync(path.join(repoRoot, 'next.config.ts'))).toBe(true);
    });

    it('defines HSTS, CSP, and related security response headers', async () => {
        expect(nextConfig.headers).toBeTypeOf('function');
        const rules = await nextConfig.headers!();
        expect(rules).toHaveLength(1);

        const globalRule = rules[0];
        expect(globalRule.source).toBe('/(.*)');

        const headersByKey = Object.fromEntries(
            globalRule.headers.map(({key, value}) => [key, value]),
        );

        for (const key of requiredHeaderKeys) {
            expect(headersByKey[key], `missing security header: ${key}`).toBeTruthy();
        }

        expect(headersByKey['Strict-Transport-Security']).toContain('max-age=63072000');
        expect(headersByKey['Strict-Transport-Security']).toContain('includeSubDomains');
        expect(headersByKey['X-Content-Type-Options']).toBe('nosniff');
        expect(headersByKey['X-Frame-Options']).toBe('DENY');
        expect(headersByKey['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
        expect(headersByKey['Permissions-Policy']).toContain('camera=()');
        expect(headersByKey['Content-Security-Policy']).toContain("default-src 'self'");
        expect(headersByKey['Content-Security-Policy']).toContain("frame-ancestors 'none'");
        expect(headersByKey['Content-Security-Policy']).toContain("object-src 'none'");
    });

    it('allows only the intentional Vercel Speed Insights CSP hosts', async () => {
        const rules = await nextConfig.headers!();
        const csp = rules[0].headers.find(({key}) => key === 'Content-Security-Policy')?.value;
        expect(csp).toBeTruthy();

        // On Vercel production the package uses same-origin `/_vercel/speed-insights/*`
        // (`'self'`). Debug scripts and DSN / off-Vercel modes need the public hosts below.
        const scriptSrc = csp!.split('; ').find((d) => d.startsWith('script-src '));
        const connectSrc = csp!.split('; ').find((d) => d.startsWith('connect-src '));

        expect(scriptSrc).toContain("'self'");
        expect(scriptSrc).toContain('https://va.vercel-scripts.com');
        expect(connectSrc).toBe(
            "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
        );

        // Guard against accidental broad opens (e.g. https: or *).
        expect(connectSrc).not.toMatch(/\s\*\s|\shttps:\s|\shttps:$/);
        expect(scriptSrc).not.toMatch(/\s\*\s|\shttps:\s|\shttps:$/);
    });

    it('keeps outputFileTracingRoot so server-only packages resolve without a second config file', () => {
        expect(nextConfig.outputFileTracingRoot).toBe(process.cwd());
    });
});
