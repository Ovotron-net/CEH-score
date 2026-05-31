import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST ?? 'localhost'}:${process.env.PGPORT ?? 5432}/${process.env.PGDATABASE ?? 'ceh_score'}`,
  },
});
