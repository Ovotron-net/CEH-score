import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {UserSettings} from '@/types';
import * as settingsApi from '@/api/settings';
import {settingsQueryOptions} from '@/data/queryContracts';
import {settingsQueryKey} from '@/data/queryKeys';

export {settingsQueryOptions};

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
