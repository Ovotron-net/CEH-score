'use client';

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
}

/**
 * Complete poll component with form and live results
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
 */
export function Poll({
  pollId,
  question,
  options,
  userId,
  layout = 'vertical',
  refreshInterval = 5000,
}: PollProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleVoteSuccess = () => {
    // Trigger results refresh
    setRefreshKey((prev) => prev + 1);
  };

  const containerClass =
    layout === 'horizontal'
      ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
      : 'space-y-6';

  return (
    <div className={`p-6 bg-white rounded-lg shadow-md ${containerClass}`}>
      <div>
        <h2 className="text-xl font-bold mb-4">Vote</h2>
        <PollForm
          pollId={pollId}
          question={question}
          options={options}
          userId={userId}
        />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Live Results</h2>
        <PollResults key={refreshKey} pollId={pollId} refreshInterval={refreshInterval} />
      </div>
    </div>
  );
}

