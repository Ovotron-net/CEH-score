'use client';

import Link from 'next/link';
import {PieChart} from 'lucide-react';
import {PollForm} from './PollForm';
import {PollResults} from './PollResults';
import {preloadPollAnalyticsChart} from './charts/lazy';

interface PollProps {
    pollId: string;
    question: string;
    options: string[];
    userId?: string;
    layout?: 'vertical' | 'horizontal';
    refreshInterval?: number;
}

/**
 * Complete poll component with form and live results
 */
export function Poll({
    pollId,
    question,
    options,
    userId,
    layout = 'vertical',
    refreshInterval = 5000,
}: PollProps) {
    const containerClass =
        layout === 'horizontal'
            ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
            : 'space-y-6';

    return (
        <div className={`bg-card border border-border rounded-xl p-4 sm:p-6 ${containerClass}`}>
            <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Vote</h2>
                <PollForm
                    pollId={pollId}
                    question={question}
                    options={options}
                    userId={userId}
                />
            </div>

            <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Live Results</h2>
                <PollResults pollId={pollId} refreshInterval={refreshInterval}/>
            </div>
        </div>
    );
}

export function PollAnalyticsLink() {
    return (
        <Link
            href="/polls/analytics"
            onFocus={() => void preloadPollAnalyticsChart()}
            onPointerEnter={() => void preloadPollAnalyticsChart()}
            onTouchStart={() => void preloadPollAnalyticsChart()}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-info/20 bg-info/10 px-4 py-2 text-sm font-medium text-info transition-colors hover:border-info/30 hover:bg-info/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:ml-auto sm:w-auto"
        >
            <PieChart className="w-4 h-4"/>
            Poll Analytics
        </Link>
    );
}
