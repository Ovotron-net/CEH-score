import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let pool: Pool | null = null;
let _db: DrizzleDb | null = null;

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

export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

