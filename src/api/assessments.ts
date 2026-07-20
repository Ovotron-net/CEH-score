import type {Assessment, AssessmentInput} from '../types';
import {request} from './client';

export async function getAll(): Promise<Assessment[]> {
    if (typeof window === 'undefined') {
        throw new Error('assessments.getAll is browser-only; use the assessment repository on the server.');
    }
    return request<Assessment[]>('/api/assessments');
}

export async function create(assessment: AssessmentInput): Promise<Assessment> {
    return request<Assessment>('/api/assessments', {method: 'POST', body: assessment});
}

export async function remove(id: string): Promise<void> {
    return request<void>(`/api/assessments/${id}`, {method: 'DELETE'});
}

export async function clearAll(): Promise<void> {
    return request<void>('/api/assessments', {method: 'DELETE'});
}




