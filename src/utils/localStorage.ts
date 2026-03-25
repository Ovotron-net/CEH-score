const ASSESSMENTS_KEY = 'ceh_assessments';
const SETTINGS_KEY = 'ceh_settings';

export function loadAssessments<T>(): T[] {
  try {
    const data = localStorage.getItem(ASSESSMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveAssessments<T>(assessments: T[]): void {
  localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(assessments));
}

export function loadSettings<T>(defaults: T): T {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...defaults, ...JSON.parse(data) } : defaults;
  } catch {
    return defaults;
  }
}

export function saveSettings<T>(settings: T): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
