'use client';

import {PollForm} from './PollForm';
import {PollResults} from './PollResults';

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
        <div className={`bg-card border border-border rounded-xl p-6 ${containerClass}`}>
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