import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Assessment } from '../types';
import { assessmentsApi } from '../api';

const QUERY_KEY = ['assessments'] as const;

export function useAssessments() {
  const qc = useQueryClient();

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: assessmentsApi.getAll,
  });

  const addAssessment = useMutation({
    mutationFn: assessmentsApi.create,
    onSuccess: (created) => {
      qc.setQueryData<Assessment[]>(QUERY_KEY, prev => [created, ...(prev ?? [])]);
    },
  });

  const deleteAssessment = useMutation({
    mutationFn: assessmentsApi.remove,
    onSuccess: (_, id) => {
      qc.setQueryData<Assessment[]>(QUERY_KEY, prev => prev?.filter(a => a.id !== id) ?? []);
    },
  });

  const clearAll = useMutation({
    mutationFn: assessmentsApi.clearAll,
    onSuccess: () => {
      qc.setQueryData<Assessment[]>(QUERY_KEY, []);
    },
  });

  return {
    assessments,
    isLoading,
    addAssessment: (a: Assessment) => addAssessment.mutateAsync(a),
    deleteAssessment: (id: string) => deleteAssessment.mutateAsync(id),
    clearAll: () => clearAll.mutateAsync(),
  };
}
