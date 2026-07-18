import type {Metadata} from 'next';
import HydratedPage from '@/components/HydratedPage';
import {getPollResults} from '@/data/pollRepository';
import {allPollResultsKey} from '@/data/queryKeys';
import PollAnalytics from '@/views/PollAnalytics';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
    title: 'Poll Analytics | CEH Tracker',
};

export default function PollAnalyticsPage() {
    return (
        <HydratedPage queries={[{queryKey: allPollResultsKey, queryFn: getPollResults}]}>
            <PollAnalytics/>
        </HydratedPage>
    );
}
