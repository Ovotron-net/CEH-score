<<<<<<< Updated upstream
import {request} from './client';
=======
<<<<<<< HEAD
import { request } from './client';
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
=======
  pollId: string;
  pollQuestion: string;
  totalVotes: number;
  options: Array<{
    id: number;
    optionText: string;
    voteCount: number;
    percentage: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
=======
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
}

/**
 * Create a new poll result
 */
export async function createPollResult(data: {
<<<<<<< Updated upstream
    pollId: string;
    pollQuestion: string;
    optionText: string;
    userId?: string | null;
}): Promise<PollResult> {
=======
<<<<<<< HEAD
  pollId: string;
  pollQuestion: string;
  optionText: string;
  userId?: string | null;
}): Promise<PollResult> {
  return request<PollResult>('/api/polls', {
    method: 'POST',
    body: data,
  });
=======
    pollId: string;
    pollQuestion: string;
    optionText: string;
    userId?: string | null;
}): Promise<PollResult> {
>>>>>>> Stashed changes
    return request<PollResult>('/api/polls', {
        method: 'POST',
        body: data,
    });
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
}

/**
 * Record a vote for a poll option
 */
export async function vote(data: {
<<<<<<< Updated upstream
    pollId: string;
    optionText: string;
    pollQuestion?: string;
    userId?: string | null;
}): Promise<PollResult> {
=======
<<<<<<< HEAD
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
=======
    pollId: string;
    optionText: string;
    pollQuestion?: string;
    userId?: string | null;
}): Promise<PollResult> {
>>>>>>> Stashed changes
    return request<PollResult>(`/api/polls/${encodeURIComponent(data.pollId)}/votes`, {
        method: 'POST',
        body: {
            optionText: data.optionText,
            pollQuestion: data.pollQuestion,
            userId: data.userId,
        },
    });
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
}

/**
 * Get all poll results, optionally filtered by pollId
 */
export async function getAllResults(pollId?: string): Promise<PollResult[]> {
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
  if (typeof window === 'undefined') return [];
  const query = pollId ? `?pollId=${encodeURIComponent(pollId)}` : '';
  return request<PollResult[]>(`/api/polls${query}`, {
    method: 'GET',
  });
=======
>>>>>>> Stashed changes
    if (typeof window === 'undefined') return [];
    const query = pollId ? `?pollId=${encodeURIComponent(pollId)}` : '';
    return request<PollResult[]>(`/api/polls${query}`, {
        method: 'GET',
    });
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
}

/**
 * Get poll statistics and results for a specific poll
 */
export async function getPollStats(pollId: string): Promise<PollStats> {
<<<<<<< Updated upstream
    return request<PollStats>(`/api/polls/${encodeURIComponent(pollId)}`, {
        method: 'GET',
    });
=======
<<<<<<< HEAD
  return request<PollStats>(`/api/polls/${encodeURIComponent(pollId)}`, {
    method: 'GET',
  });
=======
    if (typeof window === 'undefined') {
        return {pollId, pollQuestion: '', totalVotes: 0, options: [], createdAt: '', updatedAt: ''};
    }
    return request<PollStats>(`/api/polls/${encodeURIComponent(pollId)}`, {
        method: 'GET',
    });
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
}

/**
 * Delete all results for a poll
 */
export async function deletePoll(pollId: string): Promise<void> {
<<<<<<< Updated upstream
    return request<void>(`/api/polls/${encodeURIComponent(pollId)}`, {
        method: 'DELETE',
    });
=======
<<<<<<< HEAD
  return request<void>(`/api/polls/${encodeURIComponent(pollId)}`, {
    method: 'DELETE',
  });
=======
    return request<void>(`/api/polls/${encodeURIComponent(pollId)}`, {
        method: 'DELETE',
    });
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
}

