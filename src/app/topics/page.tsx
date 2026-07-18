import type {Metadata} from 'next';
import HydratedPage from '@/components/HydratedPage';
import {getAssessments} from '@/data/assessmentRepository';
import {assessmentQueryKey} from '@/data/queryKeys';
import Topics from '@/views/Topics';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
    title: 'CEH Topics | CEH Tracker',
};

export default function TopicsPage() {
    return (
        <HydratedPage queries={[{queryKey: assessmentQueryKey, queryFn: getAssessments}]}>
            <Topics/>
        </HydratedPage>
    );
}
