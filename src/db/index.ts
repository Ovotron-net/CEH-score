import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';
import * as schema from './schema';

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

/* Use globalThis to persist the pool across hot reloads in development */
const globalForDb = globalThis as unknown as {
    _pool: Pool | undefined;
    _db: DrizzleDb | undefined;
};

function getDb() {
    if (!globalForDb._db) {
        if (!globalForDb._pool) {
            globalForDb._pool = new Pool({
                connectionString:
                    process.env.DATABASE_PUBLIC_URL ??
                    process.env.DATABASE_URL ??
                    `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST ?? 'localhost'}:${process.env.PGPORT ?? 5432}/${process.env.PGDATABASE ?? 'ceh_score'}`,
            });
        }
        globalForDb._db = drizzle(globalForDb._pool, {schema});
    }
    return globalForDb._db;
}

export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
    get(_target, prop) {
        return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
    },
});

/* Graceful shutdown: release the connection pool */
function shutdown() {
    if (globalForDb._pool) {
        globalForDb._pool.end().catch(() => {
        });
        globalForDb._pool = undefined;
        globalForDb._db = undefined;
    }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

