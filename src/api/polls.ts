import {request} from './client';

export interface PollResult {
    id: number;
    pollId: string;
    pollQuestion: string;
    optionText: string;
    voteCount: number;
    userId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PollStats {
    pollId: string;
    pollQuestion: string;
    totalVotes: number;
    options: Array<{
        id: number;
        optionText: string;
        voteCount: number;
        percentage: number;
    }>;
    createdAt: string;
    updatedAt: string;
}

/**
 * Create a new poll result
 */
export async function createPollResult(data: {
    pollId: string;
    pollQuestion: string;
    optionText: string;
    userId?: string | null;
}): Promise<PollResult> {
    return request<PollResult>('/api/polls', {
        method: 'POST',
        body: data,
    });
}

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
    if (typeof window === 'undefined') return [];
    const query = pollId ? `?pollId=${encodeURIComponent(pollId)}` : '';
    return request<PollResult[]>(`/api/polls${query}`, {
        method: 'GET',
    });
}

/**
 * Get poll statistics and results for a specific poll
 */
export async function getPollStats(pollId: string): Promise<PollStats> {
    if (typeof window === 'undefined') {
        return {pollId, pollQuestion: '', totalVotes: 0, options: [], createdAt: '', updatedAt: ''};
    }
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

