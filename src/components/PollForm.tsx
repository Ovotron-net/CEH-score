'use client';

import { useState } from 'react';
import { pollsApi } from '@/api';

interface PollFormProps {
  pollId: string;
  question: string;
  options: string[];
  userId?: string;
  onSuccess?: () => void;
}

export function PollForm({ pollId, question, options, userId, onSuccess }: PollFormProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selected) {
      setError('Please select an option before submitting.');
      return;
    }

    setLoading(true);

    try {
      await pollsApi.vote({
        pollId,
        optionText: selected,
        userId,
      });

      setSuccess(true);
      setSelected(null);
      onSuccess?.();
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">{question}</h3>

        <fieldset className="space-y-3">
          {options.map((option) => (
            <label key={option} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="poll-option"
                value={option}
                checked={selected === option}
                onChange={(e) => setSelected(e.target.value)}
                disabled={loading}
                className="w-4 h-4 mr-3"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </fieldset>
      </div>

      <button
        type="submit"
        disabled={loading || !selected}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Submitting...' : 'Submit Vote'}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">✓ Vote submitted successfully!</p>}
    </form>
  );
}

