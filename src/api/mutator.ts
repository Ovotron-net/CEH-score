/**
 * Orval custom fetch — thin wrapper over the canonical `request` helper.
 * Prefer hand-written `src/api/*` modules at runtime; regenerate only when
 * actively adopting OpenAPI clients.
 */

import {request, type HttpMethod} from './client';

export const customFetch = async <T>(
    url: string,
    options: RequestInit = {},
): Promise<T> => {
    let body: unknown;
    if (typeof options.body === 'string' && options.body.length > 0) {
        try {
            body = JSON.parse(options.body);
        } catch {
            body = options.body;
        }
    }

    const headers: Record<string, string> = {};
    if (options.headers) {
        const raw = new Headers(options.headers);
        raw.forEach((value, key) => {
            headers[key] = value;
        });
    }

    return request<T>(url, {
        method: (options.method as HttpMethod | undefined) ?? 'GET',
        body,
        headers,
    });
};
