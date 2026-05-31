import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserSettings } from '../types';
import { settingsApi } from '../api';

const QUERY_KEY = ['settings'] as const;

export function useSettings() {
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: settingsApi.get,
  });

  const mutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: (updated) => {
      qc.setQueryData<UserSettings>(QUERY_KEY, updated);
    },
  });

  const updateSettings = (updates: Partial<UserSettings>) => {
    if (!settings) return;
    mutation.mutate({ ...settings, ...updates });
  };

  return {
    settings: settings ?? {
      name: 'Alex Chen',
      targetScore: 85,
      examDate: '',
      theme: 'dark' as const,
    },
    isLoading,
    updateSettings,
  };
}
