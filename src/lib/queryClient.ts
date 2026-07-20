import {QueryClient} from '@tanstack/react-query';

const staleTime = 30_000;

export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {staleTime, retry: false},
        },
    });
}

export function makeBrowserQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {staleTime, retry: 1},
        },
    });
}
