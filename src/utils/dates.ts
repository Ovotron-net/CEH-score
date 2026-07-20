export function parseLocalDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

export function formatLocalDateInput(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function formatLocalDateDisplay(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(parseLocalDate(value));
}

export function formatLocalDateShort(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
    }).format(parseLocalDate(value));
}
