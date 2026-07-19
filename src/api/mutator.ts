/**
 * Custom fetch mutator for Orval-generated clients.
 *
 * Bridges Orval's expected interface to the base fetch logic so all generated
 * hooks use the same same-origin requests and ApiError handling as hand-written
 * API modules.
 */

import {ApiError} from './client';

export const customFetch = async <T>(
    url: string,
    options: RequestInit = {},
): Promise<T> => {
    const response = await fetch(url, options);

    if (!response.ok) {
        const text = await response.text().catch(() => response.statusText);
        throw new ApiError(response.status, text);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
};



