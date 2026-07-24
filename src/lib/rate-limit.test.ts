// @vitest-environment node
import {afterEach, describe, expect, it, vi} from 'vitest';
import {getClientIp, shouldTrustProxyHeaders} from './rate-limit';

describe('shouldTrustProxyHeaders', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('trusts when TRUST_PROXY_HEADERS=true', () => {
        expect(shouldTrustProxyHeaders({TRUST_PROXY_HEADERS: 'true'})).toBe(true);
    });

    it('never trusts when TRUST_PROXY_HEADERS=false even on Vercel', () => {
        expect(shouldTrustProxyHeaders({
            TRUST_PROXY_HEADERS: 'false',
            VERCEL: '1',
        })).toBe(false);
    });

    it('auto-trusts Vercel and Railway platform environments', () => {
        expect(shouldTrustProxyHeaders({VERCEL: '1'})).toBe(true);
        expect(shouldTrustProxyHeaders({RAILWAY_ENVIRONMENT: 'production'})).toBe(true);
    });

    it('does not trust headers by default without platform markers', () => {
        expect(shouldTrustProxyHeaders({})).toBe(false);
    });
});

describe('getClientIp', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('ignores spoofable headers when proxy trust is disabled', () => {
        vi.stubEnv('TRUST_PROXY_HEADERS', 'false');
        const request = new Request('http://localhost/', {
            headers: {
                'x-real-ip': '9.9.9.9',
                'x-forwarded-for': '1.1.1.1, 2.2.2.2',
            },
        });
        expect(getClientIp(request)).toBe('unknown');
    });

    it('prefers x-real-ip when proxy headers are trusted', () => {
        vi.stubEnv('TRUST_PROXY_HEADERS', 'true');
        const request = new Request('http://localhost/', {
            headers: {
                'x-real-ip': '9.9.9.9',
                'x-forwarded-for': '1.1.1.1, 2.2.2.2',
            },
        });
        expect(getClientIp(request)).toBe('9.9.9.9');
    });

    it('uses the trusted XFF hop when x-real-ip is absent', () => {
        vi.stubEnv('TRUST_PROXY_HEADERS', 'true');
        vi.stubEnv('TRUSTED_PROXY_DEPTH', '1');
        const request = new Request('http://localhost/', {
            headers: {
                'x-forwarded-for': '1.1.1.1, 2.2.2.2',
            },
        });
        expect(getClientIp(request)).toBe('2.2.2.2');
    });
});
