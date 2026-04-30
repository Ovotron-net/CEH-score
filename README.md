# CEH Score Tracker Pro

A professional, full-featured **Certified Ethical Hacker (CEH)** exam score tracking application with a dark cybersecurity aesthetic. Track your practice scores, monitor progress across all 20 CEH domains, and analyze trends to maximize your exam performance.

## Features

- **Dashboard** — Readiness gauge, score trend chart, domain radar, and recent assessments at a glance
- **Assessments** — Log practice tests, mock exams, and official results with full details
- **Analytics** — 6 chart types: score trend, pass/fail ratio, distribution histogram, domain performance, improvement trends, and domain radar
- **Leaderboard** — Ranked comparison with mock community data and your own best scores
- **CEH Topics** — Browse all 20 CEH v13 domains with full topic lists and searchable content
- **Settings** — Customize name, target score, exam date, and manage local data
- **Persistent Storage** — All data saved to localStorage with pre-seeded sample progress data
- **Cybersecurity Theme** — Dark theme with cyber-green accents, glassmorphism cards, custom scrollbars

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

| Category   | Technology            |
|------------|-----------------------|
| Frontend   | React 18 + TypeScript |
| Build Tool | Vite                  |
| Styling    | Tailwind CSS          |
| Charts     | Recharts              |
| Routing    | React Router v6       |
| Icons      | Lucide React          |
| Date Utils | date-fns              |
| Storage    | Browser localStorage  |

## Project Structure

```
src/
├── components/
│   ├── charts/          # Recharts chart components
│   ├── AssessmentCard   # Assessment list item
│   ├── DomainCard       # CEH domain card
│   ├── Layout           # App shell with sidebar
│   ├── Sidebar          # Navigation sidebar
│   └── StatCard         # Statistics display card
├── data/
│   ├── cehDomains       # All 20 CEH v13 domains + topics
│   ├── mockLeaderboard  # Sample leaderboard data
│   └── sampleData       # Pre-seeded assessment data
├── hooks/
│   ├── useAssessments   # CRUD operations for assessments
│   └── useSettings      # User settings management
├── pages/
│   ├── Dashboard        # Main dashboard
│   ├── Assessments      # Assessments list + search/filter
│   ├── AddAssessment    # Add/log new assessment
│   ├── Analytics        # Charts and analytics
│   ├── Leaderboard      # Community rankings
│   ├── Topics           # CEH domain browser
│   └── Settings         # App settings
├── types/               # TypeScript type definitions
│── utils/               # Calculations and localStorage helpers
```

## CEH Exam Info

The app is calibrated for the **CEH v13** exam:
- **125 questions**, 4-hour time limit
- **Pass threshold**: 70% (88/125 correct)
- **20 domains** covering all ethical hacking knowledge areas
- Scored via EC-Council's adaptive scoring system

## Design

Built with a professional cybersecurity aesthetic:
- Background: `#0a0e1a` (deep navy)
- Card surface: `#111827`
- Primary accent: `#00ff88` (cyber green)
- Secondary accent: `#00d4ff` (cyber blue)
- Text: `#e2e8f0` / `#64748b`

## Deployment

This application is deployed to GitHub Pages automatically when changes are pushed to the `main` branch.

### Manual Deployment

To deploy manually:

1. Enable GitHub Pages in your repository settings:
   - Go to Settings → Pages
   - Set Source to "GitHub Actions"

2. Push to the `main` branch, and the GitHub Actions workflow will automatically build and deploy the app.

### Local Preview of Production Build

```bash
npm run build
npm run preview
```
