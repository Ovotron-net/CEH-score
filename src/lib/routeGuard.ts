import type {NextResponse} from 'next/server';
import {authenticate} from './auth';
import {enforceRateLimit} from './rate-limit';

/**
 * Shared write-route gate: authenticate first, then IP rate-limit.
 * Returns a response to short-circuit, or null when the request may proceed.
 */
export function guardWrite(
    request: Request,
    bucket: string,
    maxRequests: number,
    windowMs: number,
): NextResponse | null {
    const authError = authenticate(request);
    if (authError) return authError;
    return enforceRateLimit(request, bucket, maxRequests, windowMs);
}

/**
 * Auth-only gate for read routes (no rate limit by default).
 */
export function guardRead(request: Request): NextResponse | null {
    return authenticate(request);
}
