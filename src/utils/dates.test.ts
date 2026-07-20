import {afterEach, describe, expect, it, vi} from 'vitest';
import {formatLocalDateDisplay, formatLocalDateInput, parseLocalDate} from './dates';

describe('parseLocalDate', () => {
    it('keeps a date-only value on the same local calendar day', () => {
        const date = parseLocalDate('2026-07-18');

        expect(date.getFullYear()).toBe(2026);
        expect(date.getMonth()).toBe(6);
        expect(date.getDate()).toBe(18);
    });
});

describe('formatLocalDateInput', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('formats the current date from local calendar components by default', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 6, 18, 23, 59));

        expect(formatLocalDateInput()).toBe('2026-07-18');
    });

    it('pads local month and day components', () => {
        expect(formatLocalDateInput(new Date(2026, 0, 5))).toBe('2026-01-05');
    });
});

describe('formatLocalDateDisplay', () => {
    it('formats date-only values consistently across server and browser locales', () => {
        expect(formatLocalDateDisplay('2026-07-18')).toBe('Jul 18, 2026');
    });
});
