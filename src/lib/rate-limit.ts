/**
 * Simple in-memory fixed-window rate limiter.
 * Limits requests per key within a time window that resets after windowMs.
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
 * Extract the client IP from a trusted source.
 *
 * Prefers `x-real-ip` when present. Platforms such as Vercel/Railway (and
 * reverse proxies that overwrite this header) set it to the connecting client;
 * it is only trustworthy when the edge strips or overwrites client-supplied
 * values.
 *
 * Falls back to the X-Forwarded-For chain using a configured proxy depth.
 * `TRUSTED_PROXY_DEPTH` (default: 1) is how many rightmost XFF hops are treated
 * as trusted proxies. The client address is the leftmost entry of that trusted
 * suffix (`ips[length - depth]`). With the default depth of 1, that is the
 * rightmost hop (the immediate client seen by the last trusted proxy).
 * Set `TRUSTED_PROXY_DEPTH=0` to skip XFF entirely.
 */
export function getClientIp(request: Request): string {
    const realIp = request.headers.get('x-real-ip')?.trim();
    if (realIp) return realIp;

    const depth = Math.max(0, parseInt(process.env.TRUSTED_PROXY_DEPTH ?? '1', 10) || 0);
    if (depth === 0) return 'unknown';

    const xff = request.headers.get('x-forwarded-for');
    if (!xff) return 'unknown';

    const ips = xff.split(',').map(s => s.trim()).filter(Boolean);
    return ips[Math.max(0, ips.length - depth)] ?? 'unknown';
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
