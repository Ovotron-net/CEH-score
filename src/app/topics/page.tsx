import {createHydratedPage} from '@/app/hydratedRoute';
import {serverQueries} from '@/data/serverQueries';
import Topics from '@/views/Topics';

const page = createHydratedPage({
    title: 'CEH Topics | CEH Tracker',
    queries: [serverQueries.assessments()],
    View: Topics,
});

export const dynamic = 'force-dynamic';
export const metadata = page.metadata;
export default page.default;
