import {createHydratedPage} from '@/app/hydratedRoute';
import {serverQueries} from '@/data/serverQueries';
import Leaderboard from '@/views/Leaderboard';

const page = createHydratedPage({
    title: 'Leaderboard | CEH Tracker',
    queries: [serverQueries.assessments(), serverQueries.settings()],
    View: Leaderboard,
});

export const dynamic = 'force-dynamic';
export const metadata = page.metadata;
export default page.default;
