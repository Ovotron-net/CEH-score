<<<<<<< Updated upstream
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
    // allow importing server-only modules (pg, drizzle) only in server components / route handlers
    outputFileTracingRoot: process.cwd(),
=======
<<<<<<< HEAD
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // allow importing server-only modules (pg, drizzle) only in server components / route handlers
  outputFileTracingRoot: process.cwd(),
=======
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
    // allow importing server-only modules (pg, drizzle) only in server components / route handlers
    outputFileTracingRoot: process.cwd(),
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
};

export default nextConfig;
