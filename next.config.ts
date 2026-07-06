import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
    // allow importing server-only modules (pg, drizzle) only in server components / route handlers
    outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
