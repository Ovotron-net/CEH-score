import type { Metadata } from 'next';
import HydratedPage from '@/components/HydratedPage';
import { getAssessments } from '@/data/assessmentRepository';
import { assessmentQueryKey } from '@/data/queryKeys';
import Dashboard from '@/views/Dashboard';
import ReadinessHero from '@/components/readiness/ReadinessHero';
import { calculateStats } from '@/utils/calculations';
import { calculateDomainCoverage } from '@/utils/readinessVisual';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
    title: 'Dashboard | CEH Tracker',
};

export default async function DashboardPage() {
    const assessments = await getAssessments();
    const stats = calculateStats(assessments);
    const domainCoverage = calculateDomainCoverage(assessments);

    return (
        <div className="p-4 sm:p-6 lg:p-8 page-enter">
            <ReadinessHero
                state={assessments.length === 0 ? 'empty' : 'ready'}
                averageScore={stats.averageScore}
                studyStreak={stats.studyStreak}
                coveredDomains={domainCoverage.covered}
                totalDomains={domainCoverage.total}
            />
            <HydratedPage queries={[{
                queryKey: assessmentQueryKey,
                queryFn: getAssessments,
                initialData: assessments,
            }]}>
                <Dashboard />
            </HydratedPage>
            <SpeedInsights />
        </div>
    );
}
