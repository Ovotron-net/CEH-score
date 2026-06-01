# Poll Form with API Integration

## Updated JavaScript Code

Replace your existing script with this version that calls the poll API:

```html
<form id="pollForm">
  <fieldset>
    <legend>Select a module:</legend>
    <label>
      <input type="radio" name="module" value="Module 1" />
      Module 1
    </label>
    <label>
      <input type="radio" name="module" value="Module 2" />
      Module 2
    </label>
    <label>
      <input type="radio" name="module" value="Module 3" />
      Module 3
    </label>
    <button type="submit">Submit Vote</button>
  </fieldset>
</form>

<div id="result"></div>

<script>
  const form = document.getElementById("pollForm");
  const result = document.getElementById("result");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const selected = form.querySelector('input[name="module"]:checked');

    if (!selected) {
      result.textContent = "Please select an option before submitting.";
      result.style.color = "red";
      return;
    }

    // Show loading state
    result.textContent = "Submitting your vote...";
    result.style.color = "blue";

    try {
      // Call the poll API
      const response = await fetch("/api/polls/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pollId: "module-selection", // Unique poll identifier
          optionText: selected.value,
          // userId: "user-123", // Optional: add user ID if available
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      result.textContent = `Thanks! You selected: ${selected.value}. Total votes for this option: ${data.voteCount}`;
      result.style.color = "green";

      // Optional: Reset form after successful submission
      form.reset();
    } catch (error) {
      result.textContent = `Error submitting vote: ${error.message}`;
      result.style.color = "red";
      console.error("Vote submission failed:", error);
    }
  });
</script>
```

---

## Key Changes

### 1. **Async/Await for API Call**
```javascript
const response = await fetch("/api/polls/vote", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    pollId: "module-selection",
    optionText: selected.value,
  }),
});
```

### 2. **Error Handling**
```javascript
if (!response.ok) {
  throw new Error(`API error: ${response.status}`);
}
```

### 3. **Response Handling**
```javascript
const data = await response.json();
result.textContent = `Thanks! You selected: ${selected.value}. Total votes: ${data.voteCount}`;
```

### 4. **Loading State**
```javascript
result.textContent = "Submitting your vote...";
result.style.color = "blue";
```

---

## Alternative: Using the API Client Module

If this is in a Next.js component, use the TypeScript API client instead:

```typescript
'use client';

import { pollsApi } from '@/api';

export function PollForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const selected = formData.get('module') as string;

    if (!selected) {
      alert('Please select an option');
      return;
    }

    try {
      const result = await pollsApi.vote({
        pollId: 'module-selection',
        optionText: selected,
      });

      alert(`Thanks! You selected: ${selected}. Total votes: ${result.voteCount}`);
      e.currentTarget.reset();
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to submit'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} id="pollForm">
      <fieldset>
        <legend>Select a module:</legend>
        <label>
          <input type="radio" name="module" value="Module 1" />
          Module 1
        </label>
        <label>
          <input type="radio" name="module" value="Module 2" />
          Module 2
        </label>
        <label>
          <input type="radio" name="module" value="Module 3" />
          Module 3
        </label>
        <button type="submit">Submit Vote</button>
      </fieldset>
    </form>
  );
}
```

---

## Configuration

### Change the Poll ID
Replace `"module-selection"` with your desired poll identifier:
```javascript
pollId: "your-poll-name"
```

### Add User Tracking (Optional)
```javascript
body: JSON.stringify({
  pollId: "module-selection",
  optionText: selected.value,
  userId: localStorage.getItem("userId") || "anonymous",
})
```

### Get Current Poll Results
```javascript
// After voting, fetch updated stats
const stats = await fetch("/api/polls/module-selection").then(r => r.json());
console.log(stats); // { pollId, totalVotes, options: [...] }
```

---

## Complete Example with Results Display

```html
<form id="pollForm">
  <fieldset>
    <legend>Select a module:</legend>
    <label>
      <input type="radio" name="module" value="Module 1" />
      Module 1
    </label>
    <label>
      <input type="radio" name="module" value="Module 2" />
      Module 2
    </label>
    <label>
      <input type="radio" name="module" value="Module 3" />
      Module 3
    </label>
    <button type="submit">Submit Vote</button>
  </fieldset>
</form>

<div id="result"></div>
<div id="stats"></div>

<script>
  const form = document.getElementById("pollForm");
  const result = document.getElementById("result");
  const stats = document.getElementById("stats");
  const POLL_ID = "module-selection";

  // Load and display current poll stats
  async function loadStats() {
    try {
      const response = await fetch(`/api/polls/${POLL_ID}`);
      if (!response.ok) return;
      
      const data = await response.json();
      stats.innerHTML = `
        <h3>${data.pollQuestion || 'Poll Results'}</h3>
        <p>Total votes: ${data.totalVotes}</p>
        ${data.options.map(opt => `
          <div>
            <strong>${opt.optionText}</strong>: ${opt.voteCount} votes (${opt.percentage}%)
            <div style="width: 200px; height: 20px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
              <div style="width: ${opt.percentage}%; height: 100%; background: #4caf50;"></div>
            </div>
          </div>
        `).join('')}
      `;
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }

  // Load stats on page load
  loadStats();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const selected = form.querySelector('input[name="module"]:checked');

    if (!selected) {
      result.textContent = "Please select an option before submitting.";
      result.style.color = "red";
      return;
    }

    result.textContent = "Submitting your vote...";
    result.style.color = "blue";

    try {
      const response = await fetch(`/api/polls/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pollId: POLL_ID,
          optionText: selected.value,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      result.textContent = `Thanks! You selected: ${selected.value}`;
      result.style.color = "green";

      // Refresh stats
      await loadStats();
      form.reset();
    } catch (error) {
      result.textContent = `Error: ${error.message}`;
      result.style.color = "red";
    }
  });
</script>
```

This version:
- ✅ Submits votes to the API
- ✅ Shows loading state
- ✅ Displays confirmation message
- ✅ Loads and displays live poll results
- ✅ Updates stats after each vote
- ✅ Handles errors gracefully

