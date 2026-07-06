'use client';

<<<<<<< Updated upstream
import {PollForm} from './PollForm';
import {PollResults} from './PollResults';

interface PollProps {
=======
<<<<<<< HEAD
import { useState } from 'react';
import { PollForm } from './PollForm';
import { PollResults } from './PollResults';

interface PollProps {
  pollId: string;
  question: string;
  options: string[];
  userId?: string;
  layout?: 'vertical' | 'horizontal';
  refreshInterval?: number;
=======
import {PollForm} from './PollForm';
import {PollResults} from './PollResults';

interface PollProps {
>>>>>>> Stashed changes
    pollId: string;
    question: string;
    options: string[];
    userId?: string;
    layout?: 'vertical' | 'horizontal';
    refreshInterval?: number;
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
}

/**
 * Complete poll component with form and live results
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
 *
 * @example
 * ```tsx
 * <Poll
 *   pollId="module-selection"
 *   question="What's your favorite module?"
 *   options={["Module 1", "Module 2", "Module 3"]}
 *   layout="horizontal"
 * />
 * ```
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
=======
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

>>>>>>> Stashed changes
            <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Live Results</h2>
                <PollResults pollId={pollId} refreshInterval={refreshInterval}/>
            </div>
        </div>
    );
<<<<<<< Updated upstream
}
=======
}
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
