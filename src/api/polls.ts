import type {PollResult, PollStats} from '@/types';
import {request} from './client';

export type {PollResult, PollStats};

/**
 * Record a vote for a poll option
 */
export async function vote(data: {
    pollId: string;
    optionText: string;
    pollQuestion?: string;
    userId?: string | null;
}): Promise<PollResult> {
    return request<PollResult>(`/api/polls/${encodeURIComponent(data.pollId)}/votes`, {
        method: 'POST',
        body: {
            optionText: data.optionText,
            pollQuestion: data.pollQuestion,
            userId: data.userId,
        },
    });
}

/**
 * Get all poll results, optionally filtered by pollId
 */
export async function getAllResults(pollId?: string): Promise<PollResult[]> {
    if (typeof window === 'undefined') {
        throw new Error('polls.getAllResults is browser-only; use the poll repository on the server.');
    }
    const query = pollId ? `?pollId=${encodeURIComponent(pollId)}` : '';
    return request<PollResult[]>(`/api/polls${query}`, {
        method: 'GET',
    });
}

/**
 * Get poll statistics and results for a specific poll
 */
export async function getPollStats(pollId: string): Promise<PollStats> {
    return request<PollStats>(`/api/polls/${encodeURIComponent(pollId)}`, {
        method: 'GET',
    });
}

/**
 * Delete all results for a poll
 */
export async function deletePoll(pollId: string): Promise<void> {
    return request<void>(`/api/polls/${encodeURIComponent(pollId)}`, {
        method: 'DELETE',
    });
}
