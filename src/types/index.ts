export interface Assessment {
<<<<<<< Updated upstream
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
=======
<<<<<<< HEAD
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
>>>>>>> Stashed changes
}

export interface CEHDomain {
    id: string;
    name: string;
    weight: number;
    description: string;
    topics: string[];
}

export interface UserSettings {
<<<<<<< Updated upstream
=======
  name: string;
  targetScore: number;
  examDate: string;
  theme: 'dark' | 'light';
=======
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
>>>>>>> Stashed changes
    name: string;
    targetScore: number;
    examDate: string;
    theme: 'dark' | 'light';
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
}



