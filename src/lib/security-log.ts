/**
 * Minimal, dependency-free structured security logging.
 *
 * Emits single-line JSON via console.warn so platform log drains can pick it up.
 * Intentionally PII-light: never log secrets, tokens, or request bodies.
 */

type SecurityEvent = 'auth_failure' | 'auth_misconfigured' | 'rate_limit_exceeded';

export function logSecurityEvent(
    event: SecurityEvent,
    details: Record<string, string | number | undefined> = {},
): void {
    const entry = {
        level: 'warn',
        kind: 'security',
        event,
        time: new Date().toISOString(),
        ...details,
    };
    console.warn(JSON.stringify(entry));
}
