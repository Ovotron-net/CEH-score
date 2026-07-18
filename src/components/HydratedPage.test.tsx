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
            queries: [{queryKey: ['allowed'], queryFn}],
            children: null,
        })).resolves.toBeDefined();

        expect(queryFn).toHaveBeenCalledOnce();
    });

    it('refuses production repository hydration when API_SECRET is set', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('ALLOW_OPEN_API', 'true');
        vi.stubEnv('API_SECRET', 'secret-key');
        const queryFn = vi.fn(async () => 'private data');

        await expect(HydratedPage({
            queries: [{queryKey: ['blocked'], queryFn}],
            children: null,
        })).rejects.toThrow('Repository hydration requires API_SECRET to be unset');

        expect(queryFn).not.toHaveBeenCalled();
    });

    it('refuses production repository hydration without explicit open API mode', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('ALLOW_OPEN_API', '');
        vi.stubEnv('API_SECRET', '');
        const queryFn = vi.fn(async () => 'private data');

        await expect(HydratedPage({
            queries: [{queryKey: ['blocked'], queryFn}],
            children: null,
        })).rejects.toThrow('Repository hydration requires ALLOW_OPEN_API=true');

        expect(queryFn).not.toHaveBeenCalled();
    });

    it('does not let production fixture mode bypass the supported UI deployment mode', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('E2E_FIXTURES', 'true');
        vi.stubEnv('ALLOW_OPEN_API', '');
        vi.stubEnv('API_SECRET', '');
        const queryFn = vi.fn(async () => 'fixture data');

        await expect(HydratedPage({
            queries: [{queryKey: ['fixtures'], queryFn}],
            children: null,
        })).rejects.toThrow('Repository hydration requires ALLOW_OPEN_API=true');

        expect(queryFn).not.toHaveBeenCalled();
    });

    it('allows production fixtures only with the supported UI deployment mode', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('E2E_FIXTURES', 'true');
        vi.stubEnv('ALLOW_OPEN_API', 'true');
        vi.stubEnv('API_SECRET', '');
        const queryFn = vi.fn(async () => 'fixture data');

        await HydratedPage({
            queries: [{queryKey: ['fixtures'], queryFn}],
            children: null,
        });

        expect(queryFn).toHaveBeenCalledOnce();
    });

    it('keeps repository hydration open for local development', async () => {
        vi.stubEnv('NODE_ENV', 'development');
        vi.stubEnv('ALLOW_OPEN_API', '');
        vi.stubEnv('API_SECRET', '');
        const queryFn = vi.fn(async () => 'local data');

        await HydratedPage({
            queries: [{queryKey: ['development'], queryFn}],
            children: null,
        });

        expect(queryFn).toHaveBeenCalledOnce();
    });
});
