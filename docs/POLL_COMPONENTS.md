# Poll Components

Complete React components for creating interactive polls with live results.

## Components

### 1. `Poll` (Main Component)

Complete poll with form and live results.

```tsx
import { Poll } from '@/components/Poll';

export default function Page() {
  return (
    <Poll
      pollId="module-selection"
      question="What's your favorite module?"
      options={["Module 1", "Module 2", "Module 3"]}
      layout="horizontal"
      refreshInterval={5000}
    />
  );
}
```

**Props:**

- `pollId` (string, required) — Unique poll identifier
- `question` (string, required) — Poll question text
- `options` (string[], required) — Array of poll options
- `userId` (string, optional) — User identifier for tracking
- `layout` ('vertical' | 'horizontal', default: 'vertical') — Layout style
- `refreshInterval` (number, default: 5000) — Auto-refresh interval in ms

---

### 2. `PollForm`

Standalone form component for voting.

```tsx
import { PollForm } from '@/components/PollForm';

export default function Page() {
  return (
    <PollForm
      pollId="poll-123"
      question="Select an option:"
      options={["Option A", "Option B", "Option C"]}
      userId="user-456"
    />
  );
}
```

**Props:**

- `pollId` (string, required) — Poll identifier
- `question` (string, required) — Poll question
- `options` (string[], required) — Poll options
- `userId` (string, optional) — User identifier

**Features:**

- Radio button selection
- Form validation
- Loading state
- Error handling
- Success feedback

---

### 3. `PollResults`

Standalone results display component with auto-refresh.

```tsx
import { PollResults } from '@/components/PollResults';

export default function Page() {
  return (
    <PollResults
      pollId="poll-123"
      refreshInterval={3000}
    />
  );
}
```

**Props:**

- `pollId` (string, required) — Poll identifier
- `refreshInterval` (number, default: 5000) — Auto-refresh interval in ms

**Features:**

- Live vote counts
- Percentage calculations
- Animated progress bars
- Manual refresh button
- Auto-refresh on interval
- Error handling

---

## Usage Examples

### Basic Poll

```tsx
<Poll
  pollId="favorite-language"
  question="What's your favorite programming language?"
  options={["TypeScript", "Python", "Go", "Rust"]}
/>
```

### Horizontal Layout (Side-by-side)

```tsx
<Poll
  pollId="exam-difficulty"
  question="How difficult is the exam?"
  options={["Very Easy", "Easy", "Moderate", "Hard", "Very Hard"]}
  layout="horizontal"
/>
```

### With User Tracking

```tsx
<Poll
  pollId="study-method"
  question="What's your preferred study method?"
  options={["Videos", "Books", "Labs", "Groups"]}
  userId={currentUser.id}
/>
```

### Custom Refresh Rate

```tsx
<Poll
  pollId="quick-poll"
  question="Quick question?"
  options={["Yes", "No", "Maybe"]}
  refreshInterval={2000} // Refresh every 2 seconds
/>
```

### Form Only (No Results)

```tsx
<PollForm
  pollId="feedback"
  question="Rate your experience:"
  options={["Poor", "Fair", "Good", "Excellent"]}
/>
```

### Results Only (No Form)

```tsx
<PollResults
  pollId="feedback"
  refreshInterval={3000}
/>
```

---

## Styling

Components use Tailwind CSS classes. Customize by modifying the className attributes:

### Change Colors

```tsx
// In PollResults.tsx, modify the progress bar color:
className="h-full bg-gradient-to-r from-green-500 to-green-600"
```

### Change Button Style

```tsx
// In PollForm.tsx, modify the submit button:
className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
```

### Add Custom Container Styling

```tsx
<div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
  <Poll
    pollId="custom-poll"
    question="Your question?"
    options={["Option 1", "Option 2"]}
  />
</div>
```

---

## API Integration

Components automatically use the polls API:

- **POST /api/polls/vote** — Record votes
- **GET /api/polls/[pollId]** — Fetch poll stats

No additional configuration needed. The API client is imported from `@/api/polls`.

---

## Live Example

Visit `/polls` page to see all components in action:

```bash
npm run dev
# Navigate to http://localhost:3000/polls
```

---

## Features

✅ Real-time vote counting  
✅ Auto-refresh results  
✅ Responsive design  
✅ Error handling  
✅ Loading states  
✅ Success feedback  
✅ User tracking (optional)  
✅ Customizable layout  
✅ Animated progress bars  
✅ TypeScript support

---

## Accessibility

- Semantic HTML (fieldset, legend, label)
- Proper form labels
- Disabled state handling
- Error messages
- Loading indicators

---

## Performance

- Efficient re-renders with React hooks
- Configurable refresh intervals
- Cleanup on unmount
- Minimal API calls

---

## Troubleshooting

### Results not updating?

- Check `refreshInterval` prop (default: 5000ms)
- Click "Refresh" button manually
- Check browser console for errors

### Votes not saving?

- Verify API endpoint is running
- Check network tab in DevTools
- Ensure `pollId` is unique

### Styling issues?

- Ensure Tailwind CSS is configured
- Check for CSS conflicts
- Verify className attributes

---

## File Locations

- `src/components/Poll.tsx` — Main component
- `src/components/PollForm.tsx` — Form component
- `src/components/PollResults.tsx` — Results component
- `src/app/polls/page.tsx` — Example page
- `src/api/polls.ts` — API client

