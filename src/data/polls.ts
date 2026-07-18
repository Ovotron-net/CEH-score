export interface PollDefinition {
    question: string;
    options: readonly string[];
}

export const pollDefinitions = {
    'module-selection': {
        question: "What's your favorite CEH module?",
        options: [
            'Module 1: Network Security',
            'Module 2: Cryptography',
            'Module 3: Web Security',
        ],
    },
    'difficulty-level': {
        question: 'How difficult is the CEH exam?',
        options: ['Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard'],
    },
    'study-method': {
        question: "What's your preferred study method?",
        options: ['Video Courses', 'Books', 'Practice Labs', 'Study Groups', 'Combination'],
    },
} as const satisfies Record<string, PollDefinition>;

export function getPollDefinition(pollId: string): PollDefinition | undefined {
    return pollDefinitions[pollId as keyof typeof pollDefinitions];
}
