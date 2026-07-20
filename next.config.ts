import type {NextConfig} from 'next';

const scriptSrc = [
    '\'self\'',
    '\'unsafe-inline\'',
    ...(process.env.NODE_ENV !== 'production' ? ['\'unsafe-eval\''] : []),
];

const contentSecurityPolicy = [
    'default-src \'self\'',
    'base-uri \'self\'',
    'object-src \'none\'',
    'frame-ancestors \'none\'',
    'img-src \'self\' data:',
    'font-src \'self\'',
    'connect-src \'self\'',
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
