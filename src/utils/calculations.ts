import type {Assessment} from '../types';
import {formatLocalDateInput, parseLocalDate} from './dates';

export function calculatePercentage(score: number, maxScore: number): number {
    if (maxScore === 0) return 0;
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
    let bestScore = Number.NEGATIVE_INFINITY;
    for (const assessment of assessments) {
        bestScore = Math.max(bestScore, assessment.percentage);
    }
    return bestScore;
}

export function getPassRate(assessments: Assessment[]): number {
    if (assessments.length === 0) return 0;
    let passed = 0;
    for (const assessment of assessments) {
        if (assessment.passed) passed += 1;
    }
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
    if (percentage >= 85) return 'hsl(var(--primary))';
    if (percentage >= 70) return 'hsl(var(--accent))';
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
    const totalAssessments = assessments.length;
    let scoreTotal = 0;
    let bestScore = Number.NEGATIVE_INFINITY;
    const studyDays = new Set<string>();

    for (const assessment of assessments) {
        const percentage = assessment.percentage;
        scoreTotal += percentage;
        bestScore = Math.max(bestScore, percentage);
        studyDays.add(assessment.date);
    }

    const uniqueDays = [...studyDays]
        .sort((a, b) => parseLocalDate(b).getTime() - parseLocalDate(a).getTime());
    const averageScore = totalAssessments === 0
        ? 0
        : Math.round((scoreTotal / totalAssessments) * 10) / 10;
    if (totalAssessments === 0) bestScore = 0;

    let studyStreak = 0;
    if (uniqueDays.length > 0) {
        const cursor = parseLocalDate(uniqueDays[0]);
        while (studyDays.has(formatLocalDateInput(cursor))) {
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



