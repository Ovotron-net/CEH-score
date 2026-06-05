import { BarChart2 } from 'lucide-react';
import { Poll } from '@/components/Poll';

export default function PollsPage() {
  return (
    <div className="p-6 lg:p-8 page-enter">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-cyber-blue/10 border border-cyber-blue/20">
            <BarChart2 className="w-6 h-6 text-cyber-blue" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Community Polls</h1>
            <p className="text-cyber-muted mt-1">Share your opinion and see what the community thinks</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <Poll
          pollId="module-selection"
          question="What's your favorite CEH module?"
          options={['Module 1: Network Security', 'Module 2: Cryptography', 'Module 3: Web Security']}
          layout="horizontal"
          refreshInterval={3000}
        />

        <Poll
          pollId="difficulty-level"
          question="How difficult is the CEH exam?"
          options={['Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard']}
          layout="vertical"
          refreshInterval={5000}
        />

        <Poll
          pollId="study-method"
          question="What's your preferred study method?"
          options={['Video Courses', 'Books', 'Practice Labs', 'Study Groups', 'Combination']}
          layout="horizontal"
          refreshInterval={4000}
        />
      </div>
    </div>
  );
}

