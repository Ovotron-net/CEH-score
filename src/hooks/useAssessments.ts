import {
    queryOptions,
    useMutation,
    useQuery,
    useQueryClient,
    type UseQueryOptions,
} from '@tanstack/react-query';
import type {Assessment} from '@/types';
import * as assessmentsApi from '@/api/assessments';
import {assessmentQueryKey} from '@/data/queryKeys';

export function assessmentQueryOptions() {
    return queryOptions({
        queryKey: assessmentQueryKey,
        queryFn: assessmentsApi.getAll,
    });
}

type AssessmentQueryOptions = Pick<
    UseQueryOptions<Assessment[], Error, Assessment[], typeof assessmentQueryKey>,
    'staleTime' | 'refetchOnWindowFocus'
>;

export function useAssessmentQuery(options: AssessmentQueryOptions = {}) {
    return useQuery({...assessmentQueryOptions(), ...options});
}

export function useAddAssessment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: assessmentsApi.create,
        onSuccess: (created) => {
            queryClient.setQueryData<Assessment[]>(assessmentQueryKey, (previous) => [
                created,
                ...(previous ?? []),
            ]);
        },
    });
}

export function useDeleteAssessment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: assessmentsApi.remove,
        onSuccess: (_, id) => {
            queryClient.setQueryData<Assessment[]>(
                assessmentQueryKey,
                (previous) => previous?.filter((assessment) => assessment.id !== id) ?? [],
            );
        },
    });
}

export function useClearAssessments() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: assessmentsApi.clearAll,
        onSuccess: () => {
            queryClient.setQueryData<Assessment[]>(assessmentQueryKey, []);
        },
    });
}
