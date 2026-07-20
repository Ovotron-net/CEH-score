import {createHydratedPage} from '@/app/hydratedRoute';
import {serverQueries} from '@/data/serverQueries';
import Settings from '@/views/Settings';

const page = createHydratedPage({
    title: 'Settings | CEH Tracker',
    queries: [serverQueries.assessments(), serverQueries.settings()],
    View: Settings,
});

export const dynamic = page.dynamic;
export const metadata = page.metadata;
export default page.default;
