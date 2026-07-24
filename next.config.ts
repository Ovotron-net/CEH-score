import type {NextConfig} from 'next';

// Vercel Speed Insights: on Vercel the script/vitals are same-origin
// (`/_vercel/speed-insights/*`). Off-Vercel debug and DSN modes load/send via
// va.vercel-scripts.com and vitals.vercel-insights.com — allow those hosts only.
const vercelSpeedInsightsScript = 'https://va.vercel-scripts.com';
const vercelSpeedInsightsConnect = [
    'https://va.vercel-scripts.com',
    'https://vitals.vercel-insights.com',
].join(' ');

const scriptSrc = [
    '\'self\'',
    '\'unsafe-inline\'',
    vercelSpeedInsightsScript,
    ...(process.env.NODE_ENV !== 'production' ? ['\'unsafe-eval\''] : []),
];

const contentSecurityPolicy = [
    'default-src \'self\'',
    'base-uri \'self\'',
    'object-src \'none\'',
    'frame-ancestors \'none\'',
    'img-src \'self\' data:',
    'font-src \'self\'',
    `connect-src 'self' ${vercelSpeedInsightsConnect}`,
    'style-src \'self\' \'unsafe-inline\'',
    `script-src ${scriptSrc.join(' ')}`,
].join('; ');

const nextConfig: NextConfig = {
    // allow importing server-only modules (pg, drizzle) only in server components / route handlers
    outputFileTracingRoot: process.cwd(),
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: contentSecurityPolicy,
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
