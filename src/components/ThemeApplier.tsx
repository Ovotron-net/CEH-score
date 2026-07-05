'use client';

import {useEffect} from 'react';
import {useSettings} from '@/hooks/useSettings';

/**
 * Applies the persisted `theme` setting to the document root.
 * Toggles the `dark`/`light` class (which drive the CSS variables in
 * globals.css) and the matching `color-scheme` on <html>.
 */
export default function ThemeApplier() {
    const {settings} = useSettings();
    const theme = settings.theme;

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark', 'light');
        root.classList.add(theme);
        root.style.colorScheme = theme;
    }, [theme]);

    return null;
}
