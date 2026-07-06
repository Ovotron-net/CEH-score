---
render_with_liquid: false
---

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
<<<<<<< Updated upstream
      // Call the poll API (pollId is the URL path segment)
      const response = await fetch("/api/polls/module-selection/votes", {
=======
<<<<<<< HEAD
      // Call the poll API
      const response = await fetch("/api/polls/vote", {
=======
      // Call the poll API (pollId is the URL path segment)
      const response = await fetch("/api/polls/module-selection/votes", {
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
<<<<<<< Updated upstream
          optionText: selected.value,
          pollQuestion: "Select a module", // Required the first time this pollId is used
=======
<<<<<<< HEAD
          pollId: "module-selection", // Unique poll identifier
          optionText: selected.value,
=======
          optionText: selected.value,
          pollQuestion: "Select a module", // Required the first time this pollId is used
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

=======
<<<<<<< HEAD
>>>>>>> Stashed changes
```javascript
const response = await fetch("/api/polls/module-selection/votes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
<<<<<<< Updated upstream
=======
    pollId: "module-selection",
=======

```javascript
const response = await fetch("/api/polls/module-selection/votes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
    optionText: selected.value,
    pollQuestion: "Select a module", // Required the first time this pollId is used
  }),
});
```

### 2. **Error Handling**
<<<<<<< Updated upstream

=======
<<<<<<< HEAD
=======

>>>>>>> origin/claude/build
>>>>>>> Stashed changes
```javascript
if (!response.ok) {
  throw new Error(`API error: ${response.status}`);
}
```

### 3. **Response Handling**
<<<<<<< Updated upstream

=======
<<<<<<< HEAD
=======

>>>>>>> origin/claude/build
>>>>>>> Stashed changes
```javascript
const data = await response.json();
result.textContent = `Thanks! You selected: ${selected.value}. Total votes: ${data.voteCount}`;
```

### 4. **Loading State**
<<<<<<< Updated upstream

=======
<<<<<<< HEAD
=======

>>>>>>> origin/claude/build
>>>>>>> Stashed changes
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
        pollQuestion: 'Select a module', // Required the first time this pollId is used
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
<<<<<<< Updated upstream

Replace `"module-selection"` in the request URL with your desired poll identifier:

=======
<<<<<<< HEAD
Replace `"module-selection"` with your desired poll identifier:
=======

Replace `"module-selection"` with your desired poll identifier:

>>>>>>> origin/claude/build
>>>>>>> Stashed changes
```javascript
fetch("/api/polls/your-poll-name/votes", { /* ... */ });
```

### Add User Tracking (Optional)
<<<<<<< Updated upstream

=======
<<<<<<< HEAD
=======

>>>>>>> origin/claude/build
>>>>>>> Stashed changes
```javascript
body: JSON.stringify({
  optionText: selected.value,
  userId: localStorage.getItem("userId") || "anonymous",
})
```

### Get Current Poll Results
<<<<<<< Updated upstream

=======
<<<<<<< HEAD
=======

>>>>>>> origin/claude/build
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      const response = await fetch(`/api/polls/${POLL_ID}/votes`, {
=======
<<<<<<< HEAD
      const response = await fetch(`/api/polls/vote`, {
>>>>>>> Stashed changes
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionText: selected.value,
<<<<<<< Updated upstream
          pollQuestion: "Select a module", // Required only when the poll doesn't exist yet
=======
=======
      const response = await fetch(`/api/polls/${POLL_ID}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionText: selected.value,
          pollQuestion: "Select a module", // Required only when the poll doesn't exist yet
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

=======
<<<<<<< HEAD
=======

>>>>>>> origin/claude/build
>>>>>>> Stashed changes
- ✅ Submits votes to the API
- ✅ Shows loading state
- ✅ Displays confirmation message
- ✅ Loads and displays live poll results
- ✅ Updates stats after each vote
<<<<<<< Updated upstream
- ✅ Handles errors gracefully.
=======
<<<<<<< HEAD
- ✅ Handles errors gracefully

=======
- ✅ Handles errors gracefully.
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
