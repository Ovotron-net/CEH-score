// @vitest-environment node
import {afterEach, describe, expect, it, vi} from 'vitest';
import {authenticate} from './auth';

describe('authenticate', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('allows requests when API_SECRET is not configured', () => {
        vi.stubEnv('API_SECRET', '');
        const request = new Request('http://localhost/api/assessments');
        expect(authenticate(request)).toBeNull();
    });

    it('rejects missing authorization when API_SECRET is set', async () => {
        vi.stubEnv('API_SECRET', 'secret-key');
        const request = new Request('http://localhost/api/assessments');
        const response = authenticate(request);

        expect(response?.status).toBe(401);
        await expect(response?.json()).resolves.toEqual({error: 'Unauthorized'});
    });

    it('accepts a valid bearer token', () => {
        vi.stubEnv('API_SECRET', 'secret-key');
        const request = new Request('http://localhost/api/assessments', {
            headers: {Authorization: 'Bearer secret-key'},
        });

        expect(authenticate(request)).toBeNull();
    });

    it('denies requests in production when API_SECRET is unset (fail-closed)', () => {
        vi.stubEnv('API_SECRET', '');
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('ALLOW_OPEN_API', '');
        const request = new Request('http://localhost/api/assessments');
        const response = authenticate(request);
        expect(response?.status).toBe(503);
    });

    it('allows open mode in production when ALLOW_OPEN_API=true', () => {
        vi.stubEnv('API_SECRET', '');
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('ALLOW_OPEN_API', 'true');
        const request = new Request('http://localhost/api/assessments');
        expect(authenticate(request)).toBeNull();
    });
});