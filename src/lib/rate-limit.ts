/**
 * Simple in-memory sliding-window rate limiter.
 * Limits requests per key within a time window.
 */

import {NextResponse} from 'next/server';
import {logSecurityEvent} from './security-log';

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodically clean up expired entries to prevent memory leak
const CLEANUP_INTERVAL = 60_000; // 1 minute
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
    if (cleanupTimer) return;
    cleanupTimer = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store) {
            if (now > entry.resetAt) {
                store.delete(key);
            }
        }
        if (store.size === 0 && cleanupTimer) {
            clearInterval(cleanupTimer);
            cleanupTimer = null;
        }
    }, CLEANUP_INTERVAL);
    // Don't prevent process exit
    if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
        cleanupTimer.unref();
    }
}

/**
 * Check if a request is rate-limited.
 * @param key - Unique key for the rate limit bucket (e.g., IP + pollId)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if the request is allowed, false if rate-limited
 */
export function isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    ensureCleanup();

    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
        store.set(key, {count: 1, resetAt: now + windowMs});
        return true;
    }

    if (entry.count < maxRequests) {
        entry.count++;
        return true;
    }

    return false;
}

/**
 * Extract the client IP from the X-Forwarded-For header (first hop), falling
 * back to 'unknown' when unavailable.
 */
export function getClientIp(request: Request): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

/**
 * Enforce an IP-scoped rate limit for a request. Returns a 429 response (and
 * logs the event) when the limit is exceeded, or null when the request is allowed.
 */
export function enforceRateLimit(
    request: Request,
    bucket: string,
    maxRequests: number,
    windowMs: number,
): NextResponse | null {
    const ip = getClientIp(request);
    if (!isAllowed(`${bucket}:${ip}`, maxRequests, windowMs)) {
        logSecurityEvent('rate_limit_exceeded', {ip, bucket});
        return NextResponse.json(
            {error: 'Too many requests. Please try again later.'},
            {status: 429},
        );
    }
    return null;
}
