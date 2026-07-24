import type {Metadata} from 'next';
import {cookies} from 'next/headers';
import {SpeedInsights} from '@vercel/speed-insights/next';
import Providers from '@/components/providers';
import ClientShell from '@/components/ClientShell';
import ErrorBoundary from '@/components/ErrorBoundary';
import './globals.css';

export const metadata: Metadata = {
    title: 'CEH Tracker',
    description: 'CEH Exam Score Analytics Dashboard',
};

export default async function RootLayout({children}: { children: React.ReactNode }) {
    const savedTheme = (await cookies()).get('ceh-theme')?.value;
    const theme = savedTheme === 'light' ? 'light' : 'dark';

    return (
        <html lang="en" className={theme} style={{colorScheme: theme}}>
        <body>
        <Providers>
            <ErrorBoundary>
                <ClientShell>{children}</ClientShell>
            </ErrorBoundary>
        </Providers>
        <SpeedInsights/>
        </body>
        </html>
    );
}
