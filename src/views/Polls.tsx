'use client';

import {BarChart2} from 'lucide-react';
import {Poll, PollAnalyticsLink} from '@/components/Poll';
import {pollDefinitions} from '@/data/polls';

const pollUi = {
    'module-selection': {layout: 'horizontal' as const, refreshInterval: 3000},
    'difficulty-level': {layout: 'vertical' as const, refreshInterval: 5000},
    'study-method': {layout: 'horizontal' as const, refreshInterval: 4000},
} satisfies Record<keyof typeof pollDefinitions, {layout: 'horizontal' | 'vertical'; refreshInterval: number}>;

export default function Polls() {
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
                {(Object.keys(pollDefinitions) as Array<keyof typeof pollDefinitions>).map((pollId) => {
                    const definition = pollDefinitions[pollId];
                    const ui = pollUi[pollId];
                    return (
                        <Poll
                            key={pollId}
                            pollId={pollId}
                            question={definition.question}
                            options={[...definition.options]}
                            layout={ui.layout}
                            refreshInterval={ui.refreshInterval}
                        />
                    );
                })}
            </div>
        </div>
    );
}
