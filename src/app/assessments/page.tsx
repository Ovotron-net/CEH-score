import {createHydratedPage} from '@/app/hydratedRoute';
import {serverQueries} from '@/data/serverQueries';
import Assessments from '@/views/Assessments';

const page = createHydratedPage({
    title: 'Assessments | CEH Tracker',
    queries: [serverQueries.assessments()],
    View: Assessments,
});

export const dynamic = page.dynamic;
export const metadata = page.metadata;
export default page.default;
