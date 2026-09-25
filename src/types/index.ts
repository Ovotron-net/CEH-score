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
 * Browser create payload. Server assigns `id` and derives `percentage`,
 * `passed`, and `createdAt`.
 */
export type AssessmentInput = Omit<Assessment, 'id' | 'percentage' | 'passed' | 'createdAt'>;

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
 * `id` is optional; the repository generates a UUID when omitted.
 */
export type AssessmentCreateInput = Omit<Assessment, 'id' | 'percentage' | 'passed' | 'createdAt'> & {
    id?: string;
    createdAt?: string;
};

export type PollCreateInput = {
    pollId: string;
    pollQuestion: string;
    optionText: string;
};

export type PollVoteInput = {
    pollId: string;
    optionText: string;
    pollQuestion?: string;
};
