---
render_with_liquid: false
---

<<<<<<< Updated upstream
{% raw %}

=======
<<<<<<< HEAD
=======
{% raw %}

>>>>>>> origin/claude/build
>>>>>>> Stashed changes
# Poll API Usage Guide

## Basic Usage

### 1. Record a Vote (Most Common)

```typescript
<<<<<<< Updated upstream
import {pollsApi} from '@/api';

// In a component or event handler
async function handleVote(pollId: string, optionText: string, userId?: string) {
=======
<<<<<<< HEAD
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
=======
import {pollsApi} from '@/api';

// In a component or event handler
async function handleVote(pollId: string, optionText: string, userId?: string) {
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
}
```

### 2. Get Poll Statistics

```typescript
<<<<<<< Updated upstream
import {pollsApi} from '@/api';

async function loadPollStats(pollId: string) {
=======
<<<<<<< HEAD
import { pollsApi } from '@/api';

async function loadPollStats(pollId: string) {
  try {
    const stats = await pollsApi.getPollStats(pollId);
    console.log('Poll stats:', stats);
    // stats.options contains vote counts and percentages
  } catch (error) {
    console.error('Failed to load poll:', error);
  }
=======
import {pollsApi} from '@/api';

async function loadPollStats(pollId: string) {
>>>>>>> Stashed changes
    try {
        const stats = await pollsApi.getPollStats(pollId);
        console.log('Poll stats:', stats);
        // stats.options contains vote counts and percentages
    } catch (error) {
        console.error('Failed to load poll:', error);
    }
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
}
```

### 3. Create a New Poll with Initial Option

```typescript
<<<<<<< Updated upstream
import {pollsApi} from '@/api';
=======
<<<<<<< HEAD
import { pollsApi } from '@/api';
>>>>>>> Stashed changes

async function createNewPoll(
    pollId: string,
    question: string,
    firstOption: string,
    userId?: string
) {
<<<<<<< Updated upstream
=======
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
=======
import {pollsApi} from '@/api';

async function createNewPoll(
    pollId: string,
    question: string,
    firstOption: string,
    userId?: string
) {
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
}
```

---

## React Component Examples

### Example 1: Simple Vote Button

```typescript
'use client';

<<<<<<< Updated upstream
import {useState} from 'react';
import {pollsApi} from '@/api';
=======
<<<<<<< HEAD
import { useState } from 'react';
import { pollsApi } from '@/api';
>>>>>>> Stashed changes

export function VoteButton({pollId, option}: { pollId: string; option: string }) {
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
            <button onClick = {handleVote}
    disabled = {loading} >
        {loading ? 'Voting...' : `Vote for ${option}`}
<<<<<<< Updated upstream
=======
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
=======
import {useState} from 'react';
import {pollsApi} from '@/api';

export function VoteButton({pollId, option}: { pollId: string; option: string }) {
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
            <button onClick = {handleVote}
    disabled = {loading} >
        {loading ? 'Voting...' : `Vote for ${option}`}
>>>>>>> Stashed changes
        < /button>
    {
        error && <p style = {
        {
            color: 'red'
        }
    }>
        {
            error
        }
        </p>}
        < /div>
    )
        ;
    }
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
```

### Example 2: Poll Display with Live Results

```typescript
'use client';

<<<<<<< Updated upstream
import {useEffect, useState} from 'react';
import {pollsApi} from '@/api';
import type {PollStats} from '@/api/polls';
=======
<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { pollsApi } from '@/api';
import type { PollStats } from '@/api/polls';
>>>>>>> Stashed changes

export function PollDisplay({pollId}: { pollId: string }) {
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

    if (loading) return <div>Loading
    poll
...
    </div>;
    if (error) return <div style = {
    {
        color: 'red'
    }
}>
    Error: {
        error
    }
    </div>;
    if (!poll) return <div>Poll
    not
    found < /div>;

    return (
        <div style = {
    {
        border: '1px solid #ccc', padding
    :
        '1rem', borderRadius
    :
        '8px'
    }
}>
    <h3>{poll.pollQuestion} < /h3>
    < p > Total
    votes: {
        poll.totalVotes
    }
    </p>

    < div >
    {
        poll.options.map((option) => (
            <div key = {option.id} style = {
    {
        marginBottom: '1rem'
    }
}>
    <button onClick = {()
=>
    handleVote(option.optionText)
}>
    {
        option.optionText
    }
    </button>
    < div
    style = {
    {
        marginTop: '0.5rem'
    }
}>
    <div
        style = {
    {
        width: '100%',
            height
    :
        '20px',
            backgroundColor
    :
        '#e0e0e0',
            borderRadius
    :
        '4px',
            overflow
    :
        'hidden',
    }
}
>
    <div
        style = {
    {
        width: `${option.percentage}%`,
            height
    :
        '100%',
            backgroundColor
    :
        '#4caf50',
            transition
    :
        'width 0.3s ease',
    }
}
    />
    < /div>
    < p
    style = {
    {
        margin: '0.25rem 0'
    }
}>
    {
        option.voteCount
    }
    votes({option.percentage} %)
    < /p>
    < /div>
    < /div>
))
}
    </div>
<<<<<<< Updated upstream
    < /div>
)
    ;
=======
  );
=======
import {useEffect, useState} from 'react';
import {pollsApi} from '@/api';
import type {PollStats} from '@/api/polls';

export function PollDisplay({pollId}: { pollId: string }) {
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

    if (loading) return <div>Loading
    poll
...
    </div>;
    if (error) return <div style = {
    {
        color: 'red'
    }
}>
    Error: {
        error
    }
    </div>;
    if (!poll) return <div>Poll
    not
    found < /div>;

    return (
        <div style = {
    {
        border: '1px solid #ccc', padding
    :
        '1rem', borderRadius
    :
        '8px'
    }
}>
    <h3>{poll.pollQuestion} < /h3>
    < p > Total
    votes: {
        poll.totalVotes
    }
    </p>

    < div >
    {
        poll.options.map((option) => (
            <div key = {option.id} style = {
    {
        marginBottom: '1rem'
    }
}>
    <button onClick = {()
=>
    handleVote(option.optionText)
}>
    {
        option.optionText
    }
    </button>
    < div
    style = {
    {
        marginTop: '0.5rem'
    }
}>
    <div
        style = {
    {
        width: '100%',
            height
    :
        '20px',
            backgroundColor
    :
        '#e0e0e0',
            borderRadius
    :
        '4px',
            overflow
    :
        'hidden',
    }
}
>
    <div
        style = {
    {
        width: `${option.percentage}%`,
            height
    :
        '100%',
            backgroundColor
    :
        '#4caf50',
            transition
    :
        'width 0.3s ease',
    }
}
    />
    < /div>
    < p
    style = {
    {
        margin: '0.25rem 0'
    }
}>
    {
        option.voteCount
    }
    votes({option.percentage} %)
    < /p>
    < /div>
    < /div>
))
}
    </div>
    < /div>
)
    ;
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
}
```

### Example 3: Create Poll Form

```typescript
'use client';

<<<<<<< Updated upstream
import {useState} from 'react';
import {pollsApi} from '@/api';
=======
<<<<<<< HEAD
import { useState } from 'react';
import { pollsApi } from '@/api';
>>>>>>> Stashed changes

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
            setFormData({pollId: '', question: '', option: ''});
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create poll');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit = {handleSubmit}
    style = {
    {
        maxWidth: '400px'
    }
}>
    <div style = {
    {
        marginBottom: '1rem'
    }
}>
    <label>
        Poll
    ID:
        <input
            type = "text"
    value = {formData.pollId}
    onChange = {(e)
=>
    setFormData({...formData, pollId: e.target.value})
}
<<<<<<< Updated upstream
=======
=======
import {useState} from 'react';
import {pollsApi} from '@/api';

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
            setFormData({pollId: '', question: '', option: ''});
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create poll');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit = {handleSubmit}
    style = {
    {
        maxWidth: '400px'
    }
}>
    <div style = {
    {
        marginBottom: '1rem'
    }
}>
    <label>
        Poll
    ID:
        <input
            type = "text"
    value = {formData.pollId}
    onChange = {(e)
=>
    setFormData({...formData, pollId: e.target.value})
}
>>>>>>> Stashed changes
    required
    / >
    </label>
    < /div>

    < div
    style = {
    {
        marginBottom: '1rem'
    }
}>
    <label>
        Question
:
    <input
        type = "text"
    value = {formData.question}
    onChange = {(e)
=>
    setFormData({...formData, question: e.target.value})
}
    required
    / >
    </label>
    < /div>

    < div
    style = {
    {
        marginBottom: '1rem'
    }
}>
    <label>
        First
    Option:
        <input
            type = "text"
    value = {formData.option}
    onChange = {(e)
=>
    setFormData({...formData, option: e.target.value})
}
    required
    / >
    </label>
    < /div>

    < button
    type = "submit"
    disabled = {loading} >
        {loading ? 'Creating...' : 'Create Poll'}
        < /button>

    {
        error && <p style = {
        {
            color: 'red'
        }
    }>
        {
            error
        }
        </p>}
        {
            success && <p style = {
            {
                color: 'green'
            }
        }>
            Poll
            created
            successfully! < /p>}
            < /form>
        )
            ;
        }
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
```

---

## API Functions Reference

### `vote(data)`
<<<<<<< Updated upstream

Record a vote for a poll option. Creates the option if it doesn't exist. When the poll has no options
yet (a brand-new `pollId`), also pass `pollQuestion` so the poll can be created.

```typescript
await pollsApi.vote({
<<<<<<< Updated upstream
    pollId: 'poll-123',
    optionText: 'Option A',
    pollQuestion: 'Which option do you prefer?', // required when the poll has no options yet
    userId: 'user-456', // optional
=======
<<<<<<< HEAD
  pollId: 'poll-123',
  optionText: 'Option A',
  userId: 'user-456', // optional
=======
    pollId: 'poll-123',
    optionText: 'Option A',
    userId: 'user-456', // optional
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
});
```

### `getPollStats(pollId)`
<<<<<<< Updated upstream

=======
<<<<<<< HEAD
=======

>>>>>>> origin/claude/build
>>>>>>> Stashed changes
Get detailed poll statistics including vote counts and percentages.

```typescript
const stats = await pollsApi.getPollStats('poll-123');
// stats.options[0] = { id, optionText, voteCount, percentage }
```

### `createPollResult(data)`
<<<<<<< Updated upstream

=======
<<<<<<< HEAD
=======

>>>>>>> origin/claude/build
>>>>>>> Stashed changes
Create a new poll with an initial option.

```typescript
await pollsApi.createPollResult({
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
  pollId: 'poll-123',
  pollQuestion: 'What is your favorite color?',
  optionText: 'Blue',
  userId: 'user-456', // optional
=======
>>>>>>> Stashed changes
    pollId: 'poll-123',
    pollQuestion: 'What is your favorite color?',
    optionText: 'Blue',
    userId: 'user-456', // optional
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
});
```

### `getAllResults(pollId?)`
<<<<<<< Updated upstream

=======
<<<<<<< HEAD
=======

>>>>>>> origin/claude/build
>>>>>>> Stashed changes
Get all poll results, optionally filtered by poll ID.

```typescript
const allResults = await pollsApi.getAllResults();
const pollResults = await pollsApi.getAllResults('poll-123');
```

### `deletePoll(pollId)`
<<<<<<< Updated upstream

=======
<<<<<<< HEAD
=======

>>>>>>> origin/claude/build
>>>>>>> Stashed changes
Delete all results for a poll.

```typescript
await pollsApi.deletePoll('poll-123');
```

<<<<<<< Updated upstream
{% endraw %}
=======
<<<<<<< HEAD
=======
{% endraw %}
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
