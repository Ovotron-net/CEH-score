import {afterEach, describe, expect, it, vi} from 'vitest';
import type {UserSettings} from '../types';
import {reconcileTheme, serializeThemeCookie, update} from './settings';
import {request} from './client';

vi.mock('./client', () => ({request: vi.fn()}));

const settings: UserSettings = {
    name: 'Alex Chen',
    targetScore: 85,
    examDate: '',
    theme: 'light',
};

afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
    document.cookie = 'ceh-theme=; Path=/; Max-Age=0';
});

describe('settings theme cookie', () => {
    it('serializes a one-year, site-wide, same-site cookie', () => {
        expect(serializeThemeCookie('light', false)).toBe(
            'ceh-theme=light; Path=/; SameSite=Lax; Max-Age=31536000',
        );
        expect(serializeThemeCookie('dark', true)).toBe(
            'ceh-theme=dark; Path=/; SameSite=Lax; Max-Age=31536000; Secure',
        );
    });

    it('persists and applies the theme only after a successful update', async () => {
        vi.mocked(request).mockResolvedValue(settings);
        const cookieSetter = vi.spyOn(Document.prototype, 'cookie', 'set');

        await update(settings);

        expect(cookieSetter).toHaveBeenCalledWith(
            'ceh-theme=light; Path=/; SameSite=Lax; Max-Age=31536000',
        );
        expect(document.documentElement).toHaveClass('light');
        expect(document.documentElement.style.colorScheme).toBe('light');
    });

    it('does not persist a theme when the update fails', async () => {
        vi.mocked(request).mockRejectedValue(new Error('offline'));
        const cookieSetter = vi.spyOn(Document.prototype, 'cookie', 'set');

        await expect(update(settings)).rejects.toThrow('offline');

        expect(cookieSetter).not.toHaveBeenCalled();
    });

    it('reconciles stale pre-paint theme state once', () => {
        document.documentElement.classList.add('light');
        document.documentElement.style.colorScheme = 'light';
        document.cookie = 'ceh-theme=light; Path=/';
        const cookieSetter = vi.spyOn(Document.prototype, 'cookie', 'set');

        reconcileTheme('dark');
        reconcileTheme('dark');

        expect(document.documentElement).toHaveClass('dark');
        expect(document.documentElement).not.toHaveClass('light');
        expect(document.documentElement.style.colorScheme).toBe('dark');
        expect(cookieSetter).toHaveBeenCalledOnce();
        expect(cookieSetter).toHaveBeenCalledWith(
            'ceh-theme=dark; Path=/; SameSite=Lax; Max-Age=31536000',
        );
    });
});
