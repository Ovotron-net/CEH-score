import {createHydratedPage} from '@/app/hydratedRoute';
import {serverQueries} from '@/data/serverQueries';
import Analytics from '@/views/Analytics';

const page = createHydratedPage({
    title: 'Analytics | CEH Tracker',
    queries: [serverQueries.assessments()],
    View: Analytics,
});

export const dynamic = page.dynamic;
export const metadata = page.metadata;
export default page.default;
