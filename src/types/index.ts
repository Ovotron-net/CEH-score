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

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  percentage: number;
  date: string;
  badge: string;
}
