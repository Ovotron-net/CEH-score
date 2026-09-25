/**
 * Simple in-memory fixed-window rate limiter.
 * Limits requests per key within a time window that resets after windowMs.
 *
 * Process-local only: under multi-instance / serverless deployments each
 * replica keeps its own counters. Use an external limiter if you need a
 * shared budget across instances.
 */

import {isIP} from 'node:net';
import {NextResponse} from 'next/server';
import {logSecurityEvent} from './security-log';

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/** Soft cap so a flood of distinct keys cannot grow the Map without bound. */
const MAX_STORE_ENTRIES = 10_000;

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

function evictExpiredOrOldest(now: number) {
    for (const [key, entry] of store) {
        if (now > entry.resetAt) {
            store.delete(key);
        }
    }
    while (store.size >= MAX_STORE_ENTRIES) {
        const oldest = store.keys().next().value;
        if (oldest === undefined) break;
        store.delete(oldest);
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
        if (store.size >= MAX_STORE_ENTRIES) {
            evictExpiredOrOldest(now);
        }
        store.set(key, {count: 1, resetAt: now + windowMs});
        return true;
    }

    if (entry.count < maxRequests) {
        entry.count++;
        return true;
    }

    return false;
}

/** Reset in-memory buckets (tests only). */
export function resetRateLimitStoreForTests() {
    store.clear();
    if (cleanupTimer) {
        clearInterval(cleanupTimer);
        cleanupTimer = null;
    }
}

/**
 * Returns a normalized IP string when `value` is a single valid IPv4/IPv6
 * address; otherwise null. Rejects comma-separated spoof chains.
 */
export function normalizeClientIp(value: string | null | undefined): string | null {
    if (!value) return null;
    const candidate = value.trim();
    if (!candidate || candidate.includes(',')) return null;
    // Strip optional IPv6 brackets used by some proxies: "[::1]"
    const unbracketed = candidate.startsWith('[') && candidate.endsWith(']')
        ? candidate.slice(1, -1)
        : candidate;
    // Drop unexpected ports on IPv4 ("1.2.3.4:1234"); keep IPv6 as-is for isIP.
    const withoutV4Port = /^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(unbracketed)
        ? unbracketed.replace(/:\d+$/, '')
        : unbracketed;
    return isIP(withoutV4Port) ? withoutV4Port : null;
}

/**
 * Extract the client IP from a trusted source.
 *
 * Prefers `x-real-ip` when present and syntactically valid. Platforms such as
 * Vercel/Railway (and reverse proxies that overwrite this header) set it to the
 * connecting client; it is only trustworthy when the edge strips or overwrites
 * client-supplied values.
 *
 * Falls back to the X-Forwarded-For chain using a configured proxy depth.
 * `TRUSTED_PROXY_DEPTH` (default: 1) is how many rightmost XFF hops are treated
 * as trusted proxies. The client address is the leftmost entry of that trusted
 * suffix (`ips[length - depth]`). With the default depth of 1, that is the
 * rightmost hop (the immediate client seen by the last trusted proxy).
 * Set `TRUSTED_PROXY_DEPTH=0` to skip XFF entirely.
 */
export function getClientIp(request: Request): string {
    const realIp = normalizeClientIp(request.headers.get('x-real-ip'));
    if (realIp) return realIp;

    const depth = Math.max(0, parseInt(process.env.TRUSTED_PROXY_DEPTH ?? '1', 10) || 0);
    if (depth === 0) return 'unknown';

    const xff = request.headers.get('x-forwarded-for');
    if (!xff) return 'unknown';

    const ips = xff.split(',').map(s => s.trim()).filter(Boolean);
    const picked = ips[Math.max(0, ips.length - depth)] ?? null;
    return normalizeClientIp(picked) ?? 'unknown';
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
