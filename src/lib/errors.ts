/**
 * Domain errors thrown by repositories and mapped to HTTP by route handlers.
 */

export class ConflictError extends Error {
    readonly status = 409 as const;

    constructor(message: string) {
        super(message);
        this.name = 'ConflictError';
    }
}

export class ValidationError extends Error {
    readonly status = 400 as const;

    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export function isPgUniqueViolation(err: unknown): boolean {
    return typeof err === 'object'
        && err !== null
        && 'code' in err
        && (err as {code: string}).code === '23505';
}

export function toErrorResponse(err: unknown, fallbackMessage: string): {status: number; body: {error: string}} {
    if (err instanceof ConflictError || err instanceof ValidationError) {
        return {status: err.status, body: {error: err.message}};
    }
    return {status: 500, body: {error: fallbackMessage}};
}
