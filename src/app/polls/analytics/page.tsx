import {createHydratedPage} from '@/app/hydratedRoute';
import {serverQueries} from '@/data/serverQueries';
import PollAnalytics from '@/views/PollAnalytics';

const page = createHydratedPage({
    title: 'Poll Analytics | CEH Tracker',
    queries: [serverQueries.pollResults()],
    View: PollAnalytics,
});

export const dynamic = 'force-dynamic';
export const metadata = page.metadata;
export default page.default;
