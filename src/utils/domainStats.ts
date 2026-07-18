import type {Assessment} from '../types';

export interface DomainStats {
    count: number;
    average: number;
}

export function buildDomainStats(assessments: Assessment[]): Map<string, DomainStats> {
    const totals = new Map<string, {count: number; total: number}>();

    for (const assessment of assessments) {
        const current = totals.get(assessment.domain);
        if (current) {
            current.count += 1;
            current.total += assessment.percentage;
        } else {
            totals.set(assessment.domain, {count: 1, total: assessment.percentage});
        }
    }

    const stats = new Map<string, DomainStats>();
    for (const [domain, {count, total}] of totals) {
        stats.set(domain, {count, average: total / count});
    }
    return stats;
}
