export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
}

export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export async function request<T>(
    path: string,
    options: RequestOptions = {},
): Promise<T> {
    const {method = 'GET', body, headers = {}} = options;

    const response = await fetch(path, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const text = await response.text().catch(() => response.statusText);
        throw new ApiError(response.status, text);
    }

    // 204 No Content — nothing to parse
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}



