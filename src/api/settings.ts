import type {UserSettings} from '../types';
import {request} from './client';

export function serializeThemeCookie(theme: UserSettings['theme'], secure: boolean): string {
    return `ceh-theme=${theme}; Path=/; SameSite=Lax; Max-Age=31536000${secure ? '; Secure' : ''}`;
}

function applyTheme(theme: UserSettings['theme']) {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    root.style.colorScheme = theme;
}

export function reconcileTheme(theme: UserSettings['theme']) {
    const root = document.documentElement;
    const savedTheme = document.cookie
        .split('; ')
        .find(cookie => cookie.startsWith('ceh-theme='))
        ?.slice('ceh-theme='.length);
    const rootMatches = root.classList.contains(theme)
        && !root.classList.contains(theme === 'dark' ? 'light' : 'dark')
        && root.style.colorScheme === theme;

    if (rootMatches && savedTheme === theme) return;

    applyTheme(theme);
    document.cookie = serializeThemeCookie(theme, process.env.NODE_ENV === 'production');
}

export async function get(): Promise<UserSettings> {
    if (typeof window === 'undefined') {
        return {name: 'Author', targetScore: 85, examDate: '', theme: 'dark'};
    }
    return request<UserSettings>('/api/settings');
}

export async function update(settings: UserSettings): Promise<UserSettings> {
    const updated = await request<UserSettings>('/api/settings', {method: 'PUT', body: settings});

    if (typeof document !== 'undefined') {
        reconcileTheme(updated.theme);
    }

    return updated;
}
