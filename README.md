# CEH Score Tracker

A modern dashboard to track and analyze CEH exam preparation performance.

This project helps you:
- Record practice, mock, and official assessment results
- Track pass/fail progress over time
- Analyze trends by CEH domain
- Manage personal exam goals (target score and exam date)

Built with Next.js App Router, React Query, Drizzle ORM, and PostgreSQL.

## Tech Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS + Radix UI
- TanStack Query
- Recharts
- Drizzle ORM + drizzle-kit
- PostgreSQL
- OpenAPI + Orval (typed client generation)

## Features

- Dashboard with key stats:
	- Current average
	- Best score
	- Total assessments
	- Study streak
- Analytics view:
	- Score trend chart
	- Pass/fail ratio
	- Score distribution
	- Domain performance charts (bar + radar)
- Assessment management:
	- Add new assessment with validation
	- Delete individual assessments
	- Clear all assessments
- Personal leaderboard (all time, monthly, weekly)
- User settings:
	- Name
	- Target score
	- Exam date
	- Theme field in API model

## Project Structure

```text
src/
	app/                 # Next.js routes and API route handlers
	components/          # UI and chart components
	hooks/               # React Query data hooks
	api/                 # API layer + generated API client
	views/               # Page-level view components
	db/                  # Drizzle schema and DB client
	data/                # CEH domain metadata
	utils/               # Calculation and utility helpers
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Generate and run DB migrations:

```bash
npm run db:generate
npm run db:migrate
```

3. Start development server:

```bash
npm run dev
```

5. Open:

```text
http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build production app
- `npm run start` - Start production server
- `npm run lint` - Run lint checks
- `npm run generate` - Regenerate Orval API client from OpenAPI spec
- `npm run db:generate` - Generate Drizzle migration files
- `npm run db:migrate` - Run pending migrations
- `npm run db:studio` - Open Drizzle Studio

## API Endpoints

### Assessments

- `GET /api/assessments` - List all assessments
- `POST /api/assessments` - Create an assessment
- `DELETE /api/assessments` - Delete all assessments
- `DELETE /api/assessments/{id}` - Delete assessment by ID

Create request body (important fields):
- `id`, `date`, `type`, `score`, `maxScore`, `timeTaken`, `domain`, `createdAt`
- `notes` is optional in UI and defaults to empty string

Server-calculated fields:
- `percentage` is calculated as `Math.round((score / maxScore) * 100)`
- `passed` is `true` when percentage is 70 or above

### Settings

- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

Settings model:
- `name`: string
- `targetScore`: integer (0-100)
- `examDate`: string
- `theme`: `dark | light`

## OpenAPI and Client Generation

- API contract is defined in `openapi.yaml`
- Generated client/types are under `src/api/generated`
- Regenerate client after spec changes:

```bash
npm run generate
```

## Database Notes

- Drizzle config: `drizzle.config.ts`
- Schema tables:
	- `assessments`
	- `settings`
- Migrations are stored in `drizzle/`

## Build for Production

```bash
npm run build
npm run start
```

## Troubleshooting

- If you get database connection errors, verify `DATABASE_URL` (or PG* vars) and ensure PostgreSQL is running.
- If the app starts but data does not load, check API route responses at `/api/assessments` and `/api/settings`.
- If typed API client changes are missing, run `npm run generate`.

## License

No license file is currently included in this repository.
