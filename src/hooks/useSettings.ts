import {queryOptions, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {UserSettings} from '@/types';
import * as settingsApi from '@/api/settings';
import {settingsQueryKey} from '@/data/queryKeys';

export function settingsQueryOptions() {
    return queryOptions({
        queryKey: settingsQueryKey,
        queryFn: settingsApi.get,
    });
}

export function useSettingsQuery() {
    return useQuery(settingsQueryOptions());
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: settingsApi.update,
        onSuccess: (updated) => {
            queryClient.setQueryData<UserSettings>(settingsQueryKey, updated);
        },
    });
}
