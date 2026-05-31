/**
 * Assessments API module.
 *
 * Currently backed by localStorage. To switch to a real backend, replace each
 * function body with a `request()` call from `./client`, e.g.:
 *
 *   export async function getAll() {
 *     return request<Assessment[]>('/api/assessments');
 *   }
 */

import type { Assessment } from '../types';
import { loadAssessments, saveAssessments } from '../utils/localStorage';
import { SAMPLE_ASSESSMENTS } from '../data/sampleData';

const INITIALIZED_KEY = 'ceh_initialized';

export async function getAll(): Promise<Assessment[]> {
  if (typeof window === 'undefined') return [];
  const stored = loadAssessments<Assessment>();
  if (stored.length === 0 && !localStorage.getItem(INITIALIZED_KEY)) {
    localStorage.setItem(INITIALIZED_KEY, 'true');
    saveAssessments(SAMPLE_ASSESSMENTS);
    return SAMPLE_ASSESSMENTS;
  }
  return stored;
}

export async function create(assessment: Assessment): Promise<Assessment> {
  const all = loadAssessments<Assessment>();
  saveAssessments([assessment, ...all]);
  return assessment;
}

export async function remove(id: string): Promise<void> {
  const all = loadAssessments<Assessment>();
  saveAssessments(all.filter(a => a.id !== id));
}

export async function clearAll(): Promise<void> {
  saveAssessments([]);
}
