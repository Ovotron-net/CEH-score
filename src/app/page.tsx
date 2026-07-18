import type {Metadata} from 'next';
import HydratedPage from '@/components/HydratedPage';
import {getAssessments} from '@/data/assessmentRepository';
import {assessmentQueryKey} from '@/data/queryKeys';
import Dashboard from '@/views/Dashboard';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
    title: 'Dashboard | CEH Tracker',
};

export default function DashboardPage() {
    return (
        <HydratedPage queries={[{queryKey: assessmentQueryKey, queryFn: getAssessments}]}>
            <Dashboard/>
        </HydratedPage>
    );
}
