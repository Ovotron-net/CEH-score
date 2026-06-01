import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let pool: Pool | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (!_db) {
    if (!pool) {
      pool = new Pool({
        connectionString:
          process.env.DATABASE_PUBLIC_URL ??
          process.env.DATABASE_URL ??
          `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST ?? 'localhost'}:${process.env.PGPORT ?? 5432}/${process.env.PGDATABASE ?? 'ceh_score'}`,
      });
    }
    _db = drizzle(pool, { schema });
  }
  return _db;
}

export const db = {
  select: (...args: any[]) => getDb().select(...args),
  insert: (...args: any[]) => getDb().insert(...args),
  update: (...args: any[]) => getDb().update(...args),
  delete: (...args: any[]) => getDb().delete(...args),
  query: (...args: any[]) => getDb().query(...args),
} as ReturnType<typeof drizzle<typeof schema>>;

