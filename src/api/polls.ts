import { request } from './client';

export interface PollResult {
  id: number;
  pollId: string;
  pollQuestion: string;
  optionText: string;
  voteCount: number;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
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
  userId?: string | null;
}): Promise<PollResult> {
  return request<PollResult>('/api/polls/vote', {
    method: 'POST',
    body: data,
  });
}

/**
 * Get all poll results, optionally filtered by pollId
 */
export async function getAllResults(pollId?: string): Promise<PollResult[]> {
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

