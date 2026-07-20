// @vitest-environment node
import {HydrationBoundary} from '@tanstack/react-query';
import {afterEach, describe, expect, it, vi} from 'vitest';
import HydratedPage from './HydratedPage';

describe('HydratedPage', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('starts every query before waiting and dehydrates their results', async () => {
        const started: string[] = [];
        let resolveFirst!: (value: string) => void;
        let resolveSecond!: (value: string) => void;
        const firstResult = new Promise<string>((resolve) => {
            resolveFirst = resolve;
        });
        const secondResult = new Promise<string>((resolve) => {
            resolveSecond = resolve;
        });
        const child = <div>content</div>;

        const rendered = HydratedPage({
            queries: [
                {
                    queryKey: ['first'],
                    queryFn: () => {
                        started.push('first');
                        return firstResult;
                    },
                },
                {
                    queryKey: ['second'],
                    queryFn: () => {
                        started.push('second');
                        return secondResult;
                    },
                },
            ],
            children: child,
        });

        await vi.waitFor(() => expect(started).toEqual(['first', 'second']));
        resolveFirst('one');
        resolveSecond('two');

        const boundary = await rendered;
        expect(boundary.type).toBe(HydrationBoundary);
        expect(boundary.props.children).toBe(child);
        expect(boundary.props.state.queries).toEqual(expect.arrayContaining([
            expect.objectContaining({queryKey: ['first'], state: expect.objectContaining({data: 'one'})}),
            expect.objectContaining({queryKey: ['second'], state: expect.objectContaining({data: 'two'})}),
        ]));
    });

    it('dehydrates supplied seeds without fetching', async () => {
        const initialData = [{id: 'assessment-1'}];

        const boundary = await HydratedPage({
            seeds: [{queryKey: ['assessments'], data: initialData}],
            children: null,
        });

        expect(boundary.props.state.queries).toEqual([
            expect.objectContaining({
                queryKey: ['assessments'],
                state: expect.objectContaining({data: initialData}),
            }),
        ]);
    });

    it('propagates query failures to the route error boundary', async () => {
        const error = new Error('database unavailable');

        await expect(HydratedPage({
            queries: [{queryKey: ['broken'], queryFn: () => Promise.reject(error)}],
            children: null,
        })).rejects.toBe(error);
    });

    it('hydrates repositories in the supported production UI deployment mode', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('ALLOW_OPEN_API', 'true');
        vi.stubEnv('API_SECRET', '');
        const queryFn = vi.fn(async () => 'data');

        await expect(HydratedPage({
            queries: [{queryKey: ['ok'], queryFn}],
            children: null,
        })).resolves.toBeTruthy();
        expect(queryFn).toHaveBeenCalledOnce();
    });

    it('blocks repository hydration when production API is secret-gated', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('API_SECRET', 'secret');
        vi.stubEnv('ALLOW_OPEN_API', '');

        await expect(HydratedPage({
            queries: [{queryKey: ['blocked'], queryFn: async () => 'nope'}],
            children: null,
        })).rejects.toThrow();
    });
});
