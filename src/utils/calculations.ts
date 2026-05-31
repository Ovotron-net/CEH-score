import type { Assessment } from '../types';

export function calculatePercentage(score: number, maxScore: number): number {
  return Math.round((score / maxScore) * 100);
}

export function isPassed(percentage: number): boolean {
  return percentage >= 70;
}

export function getAverageScore(assessments: Assessment[]): number {
  if (assessments.length === 0) return 0;
  const sum = assessments.reduce((acc, a) => acc + a.percentage, 0);
  return Math.round((sum / assessments.length) * 10) / 10;
}

export function getBestScore(assessments: Assessment[]): number {
  if (assessments.length === 0) return 0;
  return Math.max(...assessments.map(a => a.percentage));
}

export function getPassRate(assessments: Assessment[]): number {
  if (assessments.length === 0) return 0;
  const passed = assessments.filter(a => a.passed).length;
  return Math.round((passed / assessments.length) * 100);
}

export function getDaysToExam(examDate: string): number {
  if (!examDate) return 0;
  const today = new Date();
  const exam = new Date(examDate);
  const diff = exam.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getScoreColor(percentage: number): string {
  if (percentage >= 85) return '#00ff88';
  if (percentage >= 70) return '#00d4ff';
  if (percentage >= 60) return '#ffd700';
  return '#ff4444';
}

export function getReadinessLevel(avgScore: number): string {
  if (avgScore >= 85) return 'Exam Ready';
  if (avgScore >= 75) return 'Almost Ready';
  if (avgScore >= 65) return 'Good Progress';
  if (avgScore >= 55) return 'Developing';
  return 'Needs Work';
}

export function formatScore(score: number): string {
  return Number.isInteger(score) ? score.toString() : score.toFixed(1);
}

export function calculateStats(assessments: Assessment[]) {
  const averageScore = getAverageScore(assessments);
  const bestScore = getBestScore(assessments);
  const totalAssessments = assessments.length;

  const uniqueDays = [...new Set(assessments.map((assessment) => assessment.date))]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let studyStreak = 0;
  if (uniqueDays.length > 0) {
    const cursor = new Date(uniqueDays[0]);
    while (uniqueDays.includes(cursor.toISOString().slice(0, 10))) {
      studyStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  return {
    averageScore,
    bestScore,
    totalAssessments,
    studyStreak,
  };
}
