---
render_with_liquid: false
---

# Poll API Usage Guide

## Basic Usage

### 1. Record a Vote (Most Common)

```typescript
import { pollsApi } from '@/api';

// In a component or event handler
async function handleVote(pollId: string, optionText: string, userId?: string) {
  try {
    const result = await pollsApi.vote({
      pollId,
      optionText,
      userId, // optional
    });
    console.log('Vote recorded:', result);
  } catch (error) {
    console.error('Failed to vote:', error);
  }
}
```

### 2. Get Poll Statistics

```typescript
import { pollsApi } from '@/api';

async function loadPollStats(pollId: string) {
  try {
    const stats = await pollsApi.getPollStats(pollId);
    console.log('Poll stats:', stats);
    // stats.options contains vote counts and percentages
  } catch (error) {
    console.error('Failed to load poll:', error);
  }
}
```

### 3. Create a New Poll with Initial Option

```typescript
import { pollsApi } from '@/api';

async function createNewPoll(
  pollId: string,
  question: string,
  firstOption: string,
  userId?: string
) {
  try {
    const result = await pollsApi.createPollResult({
      pollId,
      pollQuestion: question,
      optionText: firstOption,
      userId,
    });
    console.log('Poll created:', result);
  } catch (error) {
    console.error('Failed to create poll:', error);
  }
}
```

---

## React Component Examples

### Example 1: Simple Vote Button

```typescript
'use client';

import { useState } from 'react';
import { pollsApi } from '@/api';

export function VoteButton({ pollId, option }: { pollId: string; option: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async () => {
    setLoading(true);
    setError(null);
    try {
      await pollsApi.vote({
        pollId,
        optionText: option,
      });
      // Optionally refresh poll stats here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleVote} disabled={loading}>
        {loading ? 'Voting...' : `Vote for ${option}`}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

### Example 2: Poll Display with Live Results

```typescript
'use client';

import { useEffect, useState } from 'react';
import { pollsApi } from '@/api';
import type { PollStats } from '@/api/polls';

export function PollDisplay({ pollId }: { pollId: string }) {
  const [poll, setPoll] = useState<PollStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPoll();
  }, [pollId]);

  const loadPoll = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await pollsApi.getPollStats(pollId);
      setPoll(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (option: string) => {
    try {
      await pollsApi.vote({
        pollId,
        optionText: option,
      });
      // Refresh poll stats
      await loadPoll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote');
    }
  };

  if (loading) return <div>Loading poll...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!poll) return <div>Poll not found</div>;

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
      <h3>{poll.pollQuestion}</h3>
      <p>Total votes: {poll.totalVotes}</p>

      <div>
        {poll.options.map((option) => (
          <div key={option.id} style={{ marginBottom: '1rem' }}>
            <button onClick={() => handleVote(option.optionText)}>
              {option.optionText}
            </button>
            <div style={{ marginTop: '0.5rem' }}>
              <div
                style={{
                  width: '100%',
                  height: '20px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${option.percentage}%`,
                    height: '100%',
                    backgroundColor: '#4caf50',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <p style={{ margin: '0.25rem 0' }}>
                {option.voteCount} votes ({option.percentage}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Example 3: Create Poll Form

```typescript
'use client';

import { useState } from 'react';
import { pollsApi } from '@/api';

export function CreatePollForm() {
  const [formData, setFormData] = useState({
    pollId: '',
    question: '',
    option: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await pollsApi.createPollResult({
        pollId: formData.pollId,
        pollQuestion: formData.question,
        optionText: formData.option,
      });
      setSuccess(true);
      setFormData({ pollId: '', question: '', option: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Poll ID:
          <input
            type="text"
            value={formData.pollId}
            onChange={(e) => setFormData({ ...formData, pollId: e.target.value })}
            required
          />
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Question:
          <input
            type="text"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            required
          />
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          First Option:
          <input
            type="text"
            value={formData.option}
            onChange={(e) => setFormData({ ...formData, option: e.target.value })}
            required
          />
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Poll'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Poll created successfully!</p>}
    </form>
  );
}
```

---

## API Functions Reference

### `vote(data)`
Record a vote for a poll option. Creates the option if it doesn't exist.

```typescript
await pollsApi.vote({
  pollId: 'poll-123',
  optionText: 'Option A',
  userId: 'user-456', // optional
});
```

### `getPollStats(pollId)`
Get detailed poll statistics including vote counts and percentages.

```typescript
const stats = await pollsApi.getPollStats('poll-123');
// stats.options[0] = { id, optionText, voteCount, percentage }
```

### `createPollResult(data)`
Create a new poll with an initial option.

```typescript
await pollsApi.createPollResult({
  pollId: 'poll-123',
  pollQuestion: 'What is your favorite color?',
  optionText: 'Blue',
  userId: 'user-456', // optional
});
```

### `getAllResults(pollId?)`
Get all poll results, optionally filtered by poll ID.

```typescript
const allResults = await pollsApi.getAllResults();
const pollResults = await pollsApi.getAllResults('poll-123');
```

### `deletePoll(pollId)`
Delete all results for a poll.

```typescript
await pollsApi.deletePoll('poll-123');
```

