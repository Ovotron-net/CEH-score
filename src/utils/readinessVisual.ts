import {DOMAIN_NAMES} from '../data/cehDomains';
import type {Assessment} from '../types';

const KNOWN_DOMAINS = new Set(DOMAIN_NAMES);

export interface DomainCoverage {
    covered: number;
    total: number;
    ratio: number;
}

export interface ReadinessMetrics {
    averageScore: number;
    studyStreak: number;
    coveredDomains: number;
    totalDomains: number;
    hasAssessments: boolean;
}

export interface ReadinessVisualParameters {
    cohesion: number;
    orbitRegularity: number;
    sectorCoverage: number;
    dataPresence: 0 | 1;
}

function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(maximum, Math.max(minimum, value));
}

export function calculateDomainCoverage(assessments: Assessment[]): DomainCoverage {
    const coveredDomains = new Set<string>();

    for (const assessment of assessments) {
        if (KNOWN_DOMAINS.has(assessment.domain)) coveredDomains.add(assessment.domain);
    }

    const total = DOMAIN_NAMES.length;
    const covered = coveredDomains.size;
    return {covered, total, ratio: total === 0 ? 0 : covered / total};
}

export function mapReadinessVisualParameters(metrics: ReadinessMetrics): ReadinessVisualParameters {
    if (!metrics.hasAssessments) {
        return {
            cohesion: 0.42,
            orbitRegularity: 0.2,
            sectorCoverage: 0.25,
            dataPresence: 0,
        };
    }

    const normalizedAverage = clamp(metrics.averageScore, 0, 100) / 100;
    const normalizedStreak = clamp(metrics.studyStreak, 0, 14) / 14;
    const normalizedCoverage = metrics.totalDomains <= 0
        ? 0
        : clamp(metrics.coveredDomains / metrics.totalDomains, 0, 1);

    return {
        cohesion: (55 + normalizedAverage * 45) / 100,
        orbitRegularity: 0.25 + normalizedStreak * 0.75,
        sectorCoverage: normalizedCoverage,
        dataPresence: 1,
    };
}
