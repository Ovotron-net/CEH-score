import {afterEach, describe, expect, it, vi} from 'vitest';

const {useQuery} = vi.hoisted(() => ({useQuery: vi.fn()}));

vi.mock('@tanstack/react-query', async importOriginal => ({
    ...await importOriginal<typeof import('@tanstack/react-query')>(),
    useQuery,
}));

import {useAssessmentQuery} from './useAssessments';

afterEach(() => vi.clearAllMocks());

describe('useAssessmentQuery', () => {
    it('passes snapshot lifetime options to TanStack Query', () => {
        useAssessmentQuery({staleTime: Infinity, refetchOnWindowFocus: false});

        expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
            staleTime: Infinity,
            refetchOnWindowFocus: false,
        }));
    });

    it('retains the default query contract when called without options', () => {
        useAssessmentQuery();

        expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
            queryKey: ['assessments'],
            queryFn: expect.any(Function),
        }));
    });
});
