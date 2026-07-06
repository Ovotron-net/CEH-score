<<<<<<< Updated upstream
=======
<<<<<<< HEAD
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserSettings } from '../types';
import { settingsApi } from '../api';
=======
>>>>>>> Stashed changes
import {useCallback} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {UserSettings} from '../types';
import {settingsApi} from '../api';
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes

const QUERY_KEY = ['settings'] as const;

export function useSettings() {
<<<<<<< Updated upstream
    const qc = useQueryClient();
=======
<<<<<<< HEAD
  const qc = useQueryClient();
>>>>>>> Stashed changes

    const {data: settings, isLoading, isError} = useQuery({
        queryKey: QUERY_KEY,
        queryFn: settingsApi.get,
    });

    const mutation = useMutation({
        mutationFn: settingsApi.update,
        onSuccess: (updated) => {
            qc.setQueryData<UserSettings>(QUERY_KEY, updated);
        },
    });

    const updateSettings = useCallback(
        (updates: Partial<UserSettings>) => {
            if (!settings) return Promise.reject(new Error('Settings not loaded'));
            return mutation.mutateAsync({...settings, ...updates});
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [settings, mutation.mutateAsync],
    );

<<<<<<< Updated upstream
=======
  return {
    settings: settings ?? {
      name: 'Alex Chen',
      targetScore: 85,
      examDate: '',
      theme: 'dark' as const,
    },
    isLoading,
    isError,
    isSaving: mutation.isPending,
    updateSettings,
  };
=======
    const qc = useQueryClient();

    const {data: settings, isLoading, isError} = useQuery({
        queryKey: QUERY_KEY,
        queryFn: settingsApi.get,
    });

    const mutation = useMutation({
        mutationFn: settingsApi.update,
        onSuccess: (updated) => {
            qc.setQueryData<UserSettings>(QUERY_KEY, updated);
        },
    });

    const updateSettings = useCallback(
        (updates: Partial<UserSettings>) => {
            if (!settings) return Promise.reject(new Error('Settings not loaded'));
            return mutation.mutateAsync({...settings, ...updates});
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [settings, mutation.mutateAsync],
    );

>>>>>>> Stashed changes
    return {
        settings: settings ?? {
            name: 'Alex Chen',
            targetScore: 85,
            examDate: '',
            theme: 'dark' as const,
        },
        isLoading,
        isError,
        isSaving: mutation.isPending,
        updateSettings,
    };
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
}



