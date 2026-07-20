export interface Assessment {
    id: string;
    date: string;
    type: 'practice' | 'official' | 'mock';
    score: number;
    maxScore: number;
    percentage: number;
    timeTaken: number;
    domain: string;
    notes: string;
    passed: boolean;
    createdAt: string;
}

/**
 * Payload accepted by the create-assessment API. Server-derived fields
 * (`percentage`, `passed`, `createdAt`) are computed by the route handler.
 */
export type AssessmentInput = Omit<Assessment, 'percentage' | 'passed' | 'createdAt'>;

export interface CEHDomain {
    id: string;
    name: string;
    weight: number;
    description: string;
    topics: string[];
}

export interface UserSettings {
    name: string;
    targetScore: number;
    examDate: string;
    theme: 'dark' | 'light';
}

export interface PollResult {
    id: number;
    pollId: string;
    pollQuestion: string;
    optionText: string;
    voteCount: number;
    userId?: string | null;
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
 * Payload for creating an assessment before server-derived fields are applied.
 */
export type AssessmentCreateInput = Omit<Assessment, 'percentage' | 'passed' | 'createdAt'> & {
    createdAt?: string;
};

export type PollCreateInput = {
    pollId: string;
    pollQuestion: string;
    optionText: string;
    userId?: string | null;
};

export type PollVoteInput = {
    pollId: string;
    optionText: string;
    pollQuestion?: string;
    userId?: string | null;
};

