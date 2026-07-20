import type {Metadata} from 'next';
import HydratedPage from '@/components/HydratedPage';
import {pollDefinitions} from '@/data/polls';
import {serverQueries} from '@/data/serverQueries';
import Polls from '@/views/Polls';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
    title: 'Community Polls | CEH Tracker',
    description: 'Vote in CEH community polls and explore the results.',
};

const pollQueries = Object.keys(pollDefinitions).map((pollId) => serverQueries.pollStats(pollId));

export default function PollsPage() {
    return (
        <HydratedPage queries={pollQueries}>
            <Polls/>
        </HydratedPage>
    );
}
