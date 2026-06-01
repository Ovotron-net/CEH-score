import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Assessment } from '../types';
import { assessmentsApi } from '../api';

const QUERY_KEY = ['assessments'] as const;

export function useAssessments() {
  const qc = useQueryClient();

  const { data: assessments = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: assessmentsApi.getAll,
  });

  const addMutation = useMutation({
    mutationFn: assessmentsApi.create,
    onSuccess: (created) => {
      qc.setQueryData<Assessment[]>(QUERY_KEY, prev => [created, ...(prev ?? [])]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: assessmentsApi.remove,
    onSuccess: (_, id) => {
      qc.setQueryData<Assessment[]>(QUERY_KEY, prev => prev?.filter(a => a.id !== id) ?? []);
    },
  });

  const clearMutation = useMutation({
    mutationFn: assessmentsApi.clearAll,
    onSuccess: () => {
      qc.setQueryData<Assessment[]>(QUERY_KEY, []);
    },
  });

  const addAssessment = useCallback(
    (a: Assessment) => addMutation.mutateAsync(a),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addMutation.mutateAsync],
  );

  const deleteAssessment = useCallback(
    (id: string) => deleteMutation.mutateAsync(id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deleteMutation.mutateAsync],
  );

  const clearAll = useCallback(
    () => clearMutation.mutateAsync(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clearMutation.mutateAsync],
  );

  return { assessments, isLoading, isError, addAssessment, deleteAssessment, clearAll };
}



