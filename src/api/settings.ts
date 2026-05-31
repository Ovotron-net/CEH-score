import type { UserSettings } from '../types';
import { request } from './client';

export async function get(): Promise<UserSettings> {
  if (typeof window === 'undefined') {
    return { name: 'Alex Chen', targetScore: 85, examDate: '', theme: 'dark' };
  }
  return request<UserSettings>('/api/settings');
}

export async function update(settings: UserSettings): Promise<UserSettings> {
  return request<UserSettings>('/api/settings', { method: 'PUT', body: settings });
}

