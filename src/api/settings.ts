/**
 * Settings API module.
 *
 * Currently backed by localStorage. To switch to a real backend, replace each
 * function body with a `request()` call from `./client`, e.g.:
 *
 *   export async function get() {
 *     return request<UserSettings>('/api/settings');
 *   }
 */

import type { UserSettings } from '../types';
import { loadSettings, saveSettings } from '../utils/localStorage';

const DEFAULT_SETTINGS: UserSettings = {
  name: 'Alex Chen',
  targetScore: 85,
  examDate: '',
  theme: 'dark',
};

export async function get(): Promise<UserSettings> {
  return loadSettings<UserSettings>(DEFAULT_SETTINGS);
}

export async function update(settings: UserSettings): Promise<UserSettings> {
  saveSettings(settings);
  return settings;
}
