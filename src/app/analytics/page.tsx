import type {Metadata} from 'next';
import HydratedPage from '@/components/HydratedPage';
import {getAssessments} from '@/data/assessmentRepository';
import {assessmentQueryKey} from '@/data/queryKeys';
import Analytics from '@/views/Analytics';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
    title: 'Analytics | CEH Tracker',
};

export default function AnalyticsPage() {
    return (
        <HydratedPage queries={[{queryKey: assessmentQueryKey, queryFn: getAssessments}]}>
            <Analytics/>
        </HydratedPage>
    );
}
