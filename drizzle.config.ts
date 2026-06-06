import { defineConfig } from 'drizzle-kit';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// drizzle-kit doesn't auto-load .env.local — load it manually
const envLocalPath = resolve(process.cwd(), '.env.local');
if (existsSync(envLocalPath)) {
  for (const line of readFileSync(envLocalPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const raw = trimmed.slice(eqIdx + 1).trim();
    const value = /^(["']).*\1$/.test(raw) ? raw.slice(1, -1) : raw;
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_PUBLIC_URL ??
      process.env.DATABASE_URL ??
      `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST ?? 'localhost'}:${process.env.PGPORT ?? 5432}/${process.env.PGDATABASE ?? 'ceh_score'}`,
  },
});
