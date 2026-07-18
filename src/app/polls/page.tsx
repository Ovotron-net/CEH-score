import type {Metadata} from 'next';
import {BarChart2} from 'lucide-react';
import HydratedPage from '@/components/HydratedPage';
import {Poll, PollAnalyticsLink} from '@/components/Poll';
import {getPollStats} from '@/data/pollRepository';
import {pollDefinitions} from '@/data/polls';
import {pollStatsKey} from '@/data/queryKeys';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
    title: 'Community Polls | CEH Tracker',
    description: 'Vote in CEH community polls and explore the results.',
};

const pollQueries = Object.entries(pollDefinitions).map(([pollId, definition]) => ({
    queryKey: pollStatsKey(pollId),
    queryFn: () => getPollStats(pollId, definition),
}));

export default function PollsPage() {
    return (
        <HydratedPage queries={pollQueries}>
            <PollsContent/>
        </HydratedPage>
    );
}

function PollsContent() {
    return (
        <div className="p-4 sm:p-6 lg:p-8 page-enter">
            <div className="mb-8">
                <div className="mb-2 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-start gap-3 sm:items-center">
                        <div className="shrink-0 rounded-lg border border-info/20 bg-info/10 p-2">
                            <BarChart2 className="h-6 w-6 text-info"/>
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Community Polls</h1>
                            <p className="mt-1 text-muted-foreground">Share your opinion and see what the community thinks</p>
                        </div>
                    </div>
                    <PollAnalyticsLink/>
                </div>
            </div>

            <div className="space-y-8">
                <Poll
                    pollId="module-selection"
                    question={pollDefinitions['module-selection'].question}
                    options={[...pollDefinitions['module-selection'].options]}
                    layout="horizontal"
                    refreshInterval={3000}
                />

                <Poll
                    pollId="difficulty-level"
                    question={pollDefinitions['difficulty-level'].question}
                    options={[...pollDefinitions['difficulty-level'].options]}
                    layout="vertical"
                    refreshInterval={5000}
                />

                <Poll
                    pollId="study-method"
                    question={pollDefinitions['study-method'].question}
                    options={[...pollDefinitions['study-method'].options]}
                    layout="horizontal"
                    refreshInterval={4000}
                />
            </div>
        </div>
    );
}

