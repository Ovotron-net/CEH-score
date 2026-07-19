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



