<<<<<<< Updated upstream
import type {Assessment} from '../types';
import {request} from './client';
=======
<<<<<<< HEAD
import type { Assessment } from '../types';
import { request } from './client';
>>>>>>> Stashed changes

export async function getAll(): Promise<Assessment[]> {
    if (typeof window === 'undefined') return [];
    return request<Assessment[]>('/api/assessments');
}

export async function create(assessment: Assessment): Promise<Assessment> {
    return request<Assessment>('/api/assessments', {method: 'POST', body: assessment});
}

export async function remove(id: string): Promise<void> {
    return request<void>(`/api/assessments/${id}`, {method: 'DELETE'});
}

export async function clearAll(): Promise<void> {
<<<<<<< Updated upstream
    return request<void>('/api/assessments', {method: 'DELETE'});
=======
  return request<void>('/api/assessments', { method: 'DELETE' });
=======
import type {Assessment} from '../types';
import {request} from './client';

export async function getAll(): Promise<Assessment[]> {
    if (typeof window === 'undefined') return [];
    return request<Assessment[]>('/api/assessments');
}

export async function create(assessment: Assessment): Promise<Assessment> {
    return request<Assessment>('/api/assessments', {method: 'POST', body: assessment});
}

export async function remove(id: string): Promise<void> {
    return request<void>(`/api/assessments/${id}`, {method: 'DELETE'});
}

export async function clearAll(): Promise<void> {
    return request<void>('/api/assessments', {method: 'DELETE'});
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
}




