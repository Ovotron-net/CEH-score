<<<<<<< Updated upstream
import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';
=======
<<<<<<< HEAD
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
=======
import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
import * as schema from './schema';

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

<<<<<<< Updated upstream
/* Use globalThis to persist the pool across hot reloads in development */
const globalForDb = globalThis as unknown as {
    _pool: Pool | undefined;
    _db: DrizzleDb | undefined;
    _shutdownHooked: boolean | undefined;
};
=======
<<<<<<< HEAD
let pool: Pool | null = null;
let _db: DrizzleDb | null = null;
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
=======
=======
/* Use globalThis to persist the pool across hot reloads in development */
const globalForDb = globalThis as unknown as {
    _pool: Pool | undefined;
    _db: DrizzleDb | undefined;
    _shutdownHooked: boolean | undefined;
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

>>>>>>> Stashed changes
/* Graceful shutdown: release the connection pool.
   Registered once per process (guarded via globalThis) so hot-reload in dev
   doesn't accumulate duplicate SIGTERM/SIGINT listeners. */
function shutdown() {
    if (globalForDb._pool) {
        globalForDb._pool.end().catch(() => {
        });
        globalForDb._pool = undefined;
        globalForDb._db = undefined;
    }
}

if (!globalForDb._shutdownHooked) {
    globalForDb._shutdownHooked = true;
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}

<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
