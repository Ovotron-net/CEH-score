import {Suspense} from 'react';
import type {Metadata} from 'next';
import HydratedPage from '@/components/HydratedPage';
import ReadinessHero from '@/components/readiness/ReadinessHero';
import ReadinessHeroLoading from '@/components/readiness/ReadinessHeroLoading';
import {getAssessments} from '@/data/assessmentRepository';
import {assessmentQueryKey} from '@/data/queryKeys';
import {assertRepositoryHydrationAllowed} from '@/lib/uiDeployment';
import {calculateStats} from '@/utils/calculations';
import {calculateDomainCoverage} from '@/utils/readinessVisual';
import Dashboard from '@/views/Dashboard';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
    title: 'Dashboard | CEH Tracker',
};

async function DashboardContent() {
    assertRepositoryHydrationAllowed();
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
            <HydratedPage seeds={[{queryKey: assessmentQueryKey, data: assessments}]}>
                <Dashboard/>
            </HydratedPage>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<ReadinessHeroLoading/>}>
            <DashboardContent/>
        </Suspense>
    );
}
