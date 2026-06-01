import { Poll } from '@/components/Poll';

export default function PollsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Polls</h1>

        {/* Example 1: Module Selection Poll */}
        <div className="mb-12">
          <Poll
            pollId="module-selection"
            question="What's your favorite CEH module?"
            options={['Module 1: Network Security', 'Module 2: Cryptography', 'Module 3: Web Security']}
            layout="horizontal"
            refreshInterval={3000}
          />
        </div>

        {/* Example 2: Difficulty Level Poll */}
        <div className="mb-12">
          <Poll
            pollId="difficulty-level"
            question="How difficult is the CEH exam?"
            options={['Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard']}
            layout="vertical"
            refreshInterval={5000}
          />
        </div>

        {/* Example 3: Study Method Poll */}
        <div>
          <Poll
            pollId="study-method"
            question="What's your preferred study method?"
            options={['Video Courses', 'Books', 'Practice Labs', 'Study Groups', 'Combination']}
            layout="horizontal"
            refreshInterval={4000}
          />
        </div>
      </div>
    </div>
  );
}

