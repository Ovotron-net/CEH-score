import type {Metadata} from 'next';
import HydratedPage from '@/components/HydratedPage';
import {getAssessments} from '@/data/assessmentRepository';
import {assessmentQueryKey} from '@/data/queryKeys';
import Assessments from '@/views/Assessments';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
    title: 'Assessments | CEH Tracker',
};

export default function AssessmentsPage() {
    return (
        <HydratedPage queries={[{queryKey: assessmentQueryKey, queryFn: getAssessments}]}>
            <Assessments/>
        </HydratedPage>
    );
}
