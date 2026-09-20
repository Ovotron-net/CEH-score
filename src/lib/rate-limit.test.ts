// @vitest-environment node
import {afterEach, describe, expect, it, vi} from 'vitest';
import {
    enforceRateLimit,
    getClientIp,
    isAllowed,
    normalizeClientIp,
    resetRateLimitStoreForTests,
} from './rate-limit';

describe('normalizeClientIp', () => {
    it('accepts valid IPv4 and IPv6 addresses', () => {
        expect(normalizeClientIp('203.0.113.10')).toBe('203.0.113.10');
        expect(normalizeClientIp('::1')).toBe('::1');
        expect(normalizeClientIp('[2001:db8::1]')).toBe('2001:db8::1');
        expect(normalizeClientIp('203.0.113.10:443')).toBe('203.0.113.10');
    });

    it('rejects empty, spoofed, or malformed values', () => {
        expect(normalizeClientIp(null)).toBeNull();
        expect(normalizeClientIp('')).toBeNull();
        expect(normalizeClientIp('1.2.3.4, 5.6.7.8')).toBeNull();
        expect(normalizeClientIp('not-an-ip')).toBeNull();
        expect(normalizeClientIp('999.999.999.999')).toBeNull();
    });
});

describe('getClientIp', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('prefers a valid x-real-ip over X-Forwarded-For', () => {
        const request = new Request('http://localhost', {
            headers: {
                'x-real-ip': '198.51.100.20',
                'x-forwarded-for': '203.0.113.1, 198.51.100.20',
            },
        });
        expect(getClientIp(request)).toBe('198.51.100.20');
    });

    it('ignores spoofed x-real-ip chains and falls back to XFF', () => {
        const request = new Request('http://localhost', {
            headers: {
                'x-real-ip': '1.2.3.4, 5.6.7.8',
                'x-forwarded-for': '203.0.113.9, 198.51.100.1',
            },
        });
        expect(getClientIp(request)).toBe('198.51.100.1');
    });

    it('uses TRUSTED_PROXY_DEPTH against the XFF chain', () => {
        vi.stubEnv('TRUSTED_PROXY_DEPTH', '2');
        const request = new Request('http://localhost', {
            headers: {
                'x-forwarded-for': '203.0.113.1, 198.51.100.2, 192.0.2.3',
            },
        });
        expect(getClientIp(request)).toBe('198.51.100.2');
    });

    it('returns unknown when XFF is disabled or missing', () => {
        vi.stubEnv('TRUSTED_PROXY_DEPTH', '0');
        expect(getClientIp(new Request('http://localhost'))).toBe('unknown');

        vi.stubEnv('TRUSTED_PROXY_DEPTH', '1');
        expect(getClientIp(new Request('http://localhost'))).toBe('unknown');
    });
});

describe('isAllowed / enforceRateLimit', () => {
    afterEach(() => {
        resetRateLimitStoreForTests();
        vi.unstubAllEnvs();
    });

    it('allows traffic under the limit and blocks once exceeded', () => {
        expect(isAllowed('bucket:1.1.1.1', 2, 60_000)).toBe(true);
        expect(isAllowed('bucket:1.1.1.1', 2, 60_000)).toBe(true);
        expect(isAllowed('bucket:1.1.1.1', 2, 60_000)).toBe(false);
    });

    it('returns 429 from enforceRateLimit after the budget is spent', () => {
        const request = new Request('http://localhost', {
            headers: {'x-real-ip': '203.0.113.50'},
        });
        expect(enforceRateLimit(request, 'writes', 1, 60_000)).toBeNull();
        const denied = enforceRateLimit(request, 'writes', 1, 60_000);
        expect(denied?.status).toBe(429);
    });
});
