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
        <h3 className="text-base font-semibold text-foreground mb-4">{question}</h3>

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
                className="w-4 h-4 mr-3 accent-primary"
              />
              <span className="text-sm text-foreground">{option}</span>
            </label>
          ))}
        </fieldset>
      </div>

      <button
        type="submit"
        disabled={loading || !selected}
        className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Submitting...' : 'Submit Vote'}
      </button>

      {error && <p className="text-destructive text-sm">{error}</p>}
      {success && <p className="text-primary text-sm">✓ Vote submitted successfully!</p>}
    </form>
  );
}

