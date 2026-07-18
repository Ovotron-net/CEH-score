import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';

const fromRoot = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');
const globals = fromRoot('src/app/globals.css');
const tailwind = fromRoot('tailwind.config.js');

const scopedViews = [
    '../views/Dashboard.tsx',
    '../views/Assessments.tsx',
    '../views/Leaderboard.tsx',
    '../views/Topics.tsx',
    '../views/PollAnalytics.tsx',
].map((path) => fromRoot(`src/app/${path}`));

const charts = [
    '../components/charts/ScoreDistribution.tsx',
    '../components/charts/PassFail.tsx',
    '../components/charts/VotesByPollChart.tsx',
].map((path) => fromRoot(`src/app/${path}`));

type Hsl = [number, number, number];

function themeBlock(selector: ':root' | '.dark' | '.light') {
    const escaped = selector.replace('.', '\\.');
    const match = globals.match(new RegExp(`^\\s*${escaped} \\{([\\s\\S]*?)^\\s*\\}`, 'm'));
    expect(match, `${selector} theme block`).not.toBeNull();
    return match![1];
}

function token(block: string, name: string, seen = new Set<string>()): Hsl {
    expect(seen.has(name), `circular token ${name}`).toBe(false);
    seen.add(name);
    const match = block.match(new RegExp(`--${name}:\\s*([^;]+);`));
    expect(match, `--${name}`).not.toBeNull();
    const value = match![1].trim();
    const alias = value.match(/^var\(--([^)]+)\)$/);
    if (alias) return token(block, alias[1], seen);
    const channels = value.split(/\s+/).map(Number.parseFloat);
    expect(channels).toHaveLength(3);
    return channels as Hsl;
}

function luminance([h, s, l]: Hsl) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const channel = (n: number) => {
        const k = (n + h / 30) % 12;
        const srgb = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(0) + 0.7152 * channel(8) + 0.0722 * channel(4);
}

function contrast(first: Hsl, second: Hsl) {
    const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (lighter + 0.05) / (darker + 0.05);
}

describe('accessibility style contracts', () => {
    it.each([':root', '.dark', '.light'] as const)('%s semantic marks and control borders meet contrast requirements', (selector) => {
        const block = themeBlock(selector);
        const surfaces = [token(block, 'card'), token(block, 'background')];

        for (const semantic of ['success', 'destructive', 'warning', 'info']) {
            for (const surface of surfaces) {
                expect(contrast(token(block, semantic), surface), `${selector} --${semantic}`).toBeGreaterThanOrEqual(3);
            }
        }
        for (const surface of surfaces) {
            expect(contrast(token(block, 'control-border'), surface), `${selector} --control-border`).toBeGreaterThanOrEqual(3);
        }
    });

    it('maps input borders to the control border token', () => {
        for (const selector of [':root', '.dark', '.light'] as const) {
            expect(themeBlock(selector)).toMatch(/--input:\s*var\(--control-border\);/);
        }
        expect(tailwind).toMatch(/input:\s*'hsl\(var\(--input\)\)'/);
    });

    it('globally minimizes motion and leaves the spinner as a static indicator', () => {
        const reducedMotion = globals.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*)$/)?.[1] ?? '';

        expect(reducedMotion).toMatch(/\*[\s\S]*\*::before[\s\S]*\*::after\s*\{/);
        expect(reducedMotion).toMatch(/\*::after\s*\{[\s\S]*animation-name:\s*none !important;/);
        expect(reducedMotion).toMatch(/animation-duration:\s*0\.01ms !important;/);
        expect(reducedMotion).toMatch(/animation-iteration-count:\s*1 !important;/);
        expect(reducedMotion).toMatch(/transition-duration:\s*0\.01ms !important;/);
        expect(reducedMotion).toMatch(/\.spinner\s*\{[\s\S]*animation-name:\s*none !important;/);
    });

    it('uses semantic colors instead of hard-coded blue, purple, or yellow text utilities', () => {
        for (const source of scopedViews) {
            expect(source).not.toMatch(/text-(?:blue|purple|yellow)-/);
        }
    });

    it('uses semantic tokens for chart marks', () => {
        for (const source of charts) {
            expect(source).not.toMatch(/fill=["']#[0-9a-f]+|return ["']#[0-9a-f]+|COLORS = \[[^\]]*#[0-9a-f]+/i);
        }
        expect(charts.join('\n')).toContain('hsl(var(--success))');
        expect(charts.join('\n')).toContain('hsl(var(--destructive))');
        expect(charts.join('\n')).toContain('hsl(var(--warning))');
        expect(charts.join('\n')).toContain('hsl(var(--info))');
    });
});
