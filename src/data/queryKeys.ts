export const assessmentQueryKey = ['assessments'] as const;
export const settingsQueryKey = ['settings'] as const;
export const pollStatsKey = (pollId: string) => ['poll-stats', pollId] as const;
export const allPollResultsKey = ['poll-results'] as const;
