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
	- Domain performance charts (bar and radar)
- Assessment management:
	- Add a new assessment with validation
	- Delete individual assessments
	- Clear all assessments
- Personal leaderboard (all time, monthly, weekly)
- User settings:
	- Name
	- Target score
	- Exam date
	- Theme field in the API model

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

2. Configure environment variables:

Create a `.env.local` file (or `.env`) in the project root. See `.env.example` for all available options.

**Required:**
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/ceh_score
```

**Optional:**
```bash
API_SECRET=your-secure-random-string-here  # Enable API authentication
```

3. Generate and run DB migrations:

```bash
npm run db:generate
npm run db:migrate
```

4. Start development server:

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

## Environment Variables

The application supports the following environment variables:

### Database Connection

The database connection can be configured in two ways:

**Option 1: Connection String (Recommended)**
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/ceh_score
# or
DATABASE_PUBLIC_URL=postgresql://username:password@localhost:5432/ceh_score
```

**Option 2: Individual Variables**
```bash
PGUSER=username
PGPASSWORD=password
PGHOST=localhost
PGPORT=5432
PGDATABASE=ceh_score
```

Connection resolution order: `DATABASE_PUBLIC_URL` → `DATABASE_URL` → individual `PG*` variables

### Security

**API_SECRET** (optional)
- When set, all API endpoints require authentication via `Authorization: Bearer <API_SECRET>` header
- When not set, API endpoints are open (useful for development)
- Example: `API_SECRET=your-secure-random-string-here`

### Other

**NEXT_PUBLIC_API_BASE_URL** (optional)
- Override the default API base URL for client-side API calls
- Default: same-origin (relative URLs)

## Security Features

### API Authentication

The application supports optional API key authentication:

- **Opt-in**: Authentication is disabled by default for easy development
- **Enable**: Set the `API_SECRET` environment variable to enable authentication
- **Usage**: Include `Authorization: Bearer <your-api-secret>` header in all API requests
- **Scope**: All API endpoints (`/api/*`) require authentication when enabled

### Rate Limiting

The vote endpoint includes built-in rate limiting:

- **Endpoint**: `POST /api/polls/[pollId]/votes`
- **Limit**: 5 requests per IP address per poll per 60 seconds
- **Response**: Returns `429 Too Many Requests` when limit exceeded
- **Implementation**: In-memory sliding window with automatic cleanup

### Input Validation

All API endpoints include comprehensive input validation:

- Maximum string lengths (e.g., pollId limited to 100 characters)
- Zod schema validation for request bodies
- Division-by-zero guards in calculations
- SQL injection prevention via Drizzle ORM parameterized queries

### Database Connection Pooling

The database connection uses a singleton pattern to prevent connection leaks:

- Connection pool persists across hot reloads in development
- Graceful shutdown handlers (SIGTERM, SIGINT) properly close connections
- Prevents connection pool exhaustion in production

## API Endpoints

**Authentication**: All API endpoints support optional authentication. When `API_SECRET` environment variable is set, requests must include `Authorization: Bearer <API_SECRET>` header.

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
- `targetScore`: integer (0–100)
- `examDate`: string
- `theme`: `dark | light`

### Polls

- `GET /api/polls` - List all poll results (optional `?pollId=<id>` query param)
- `POST /api/polls` - Create a poll result
- `GET /api/polls/[pollId]` - Get results for a specific poll
- `DELETE /api/polls/[pollId]` - Delete all results for a specific poll
- `POST /api/polls/[pollId]/votes` - Submit a vote (⚠️ **Rate limited**: 5 requests per IP per poll per 60 seconds)

**Rate Limiting**: The vote endpoint returns `429 Too Many Requests` if the rate limit is exceeded.

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
