import {NextResponse} from 'next/server';
import {timingSafeEqual} from 'node:crypto';
import {logSecurityEvent} from './security-log';

/**
 * Validates the API key from the Authorization header.
 *
 * Auth modes:
 * - When API_SECRET is set, requests must include "Authorization: Bearer <API_SECRET>".
 * - When API_SECRET is unset in development/test, requests are allowed (open mode).
 * - When API_SECRET is unset in production, requests are denied (fail-closed) unless
 *   ALLOW_OPEN_API=true is explicitly set, to avoid accidentally shipping an open API.
 */
export function authenticate(request: Request): NextResponse | null {
    const apiSecret = process.env.API_SECRET;

    if (!apiSecret) {
        const isProduction = process.env.NODE_ENV === 'production';
        const allowOpen = process.env.ALLOW_OPEN_API === 'true';
        if (isProduction && !allowOpen) {
            logSecurityEvent('auth_misconfigured', requestMeta(request));
            return NextResponse.json({error: 'API is not configured.'}, {status: 503});
        }
        // Open mode (development/test, or explicit opt-in).
        return null;
    }

    const authHeader = request.headers.get('authorization');
    const expected = 'Bearer ' + apiSecret;

    const provided = Buffer.from(authHeader ?? '');
    const expectedBuf = Buffer.from(expected);
    const matches =
        provided.length === expectedBuf.length && timingSafeEqual(provided, expectedBuf);

    if (!matches) {
        logSecurityEvent('auth_failure', {
            ...requestMeta(request),
            reason: authHeader ? 'invalid_token' : 'missing_token',
        });
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    return null;
}

function requestMeta(request: Request): {method: string; path: string} {
    let path = '';
    try {
        path = new URL(request.url).pathname;
    } catch {
        path = '';
    }
    return {method: request.method, path};
}
