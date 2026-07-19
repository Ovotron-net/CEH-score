/** @type {import('next').NextConfig} */
const nextConfig = {
  // allow importing server-only modules (pg, drizzle) only in server components / route handlers
  outputFileTracingRoot: process.cwd(),
}

export default nextConfig
