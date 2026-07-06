<<<<<<< Updated upstream
import type {UserSettings} from '../types';
import {request} from './client';
=======
<<<<<<< HEAD
import type { UserSettings } from '../types';
import { request } from './client';
>>>>>>> Stashed changes

export async function get(): Promise<UserSettings> {
    if (typeof window === 'undefined') {
        return {name: 'Author', targetScore: 85, examDate: '', theme: 'dark'};
    }
    return request<UserSettings>('/api/settings');
}

export async function update(settings: UserSettings): Promise<UserSettings> {
<<<<<<< Updated upstream
    return request<UserSettings>('/api/settings', {method: 'PUT', body: settings});
=======
  return request<UserSettings>('/api/settings', { method: 'PUT', body: settings });
=======
import type {UserSettings} from '../types';
import {request} from './client';

export async function get(): Promise<UserSettings> {
    if (typeof window === 'undefined') {
        return {name: 'Author', targetScore: 85, examDate: '', theme: 'dark'};
    }
    return request<UserSettings>('/api/settings');
}

export async function update(settings: UserSettings): Promise<UserSettings> {
    return request<UserSettings>('/api/settings', {method: 'PUT', body: settings});
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
}




