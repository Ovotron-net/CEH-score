import type { Metadata } from 'next';
import Providers from '@/components/providers';
import ClientShell from '@/components/ClientShell';
import ErrorBoundary from '@/components/ErrorBoundary';
import ThemeApplier from '@/components/ThemeApplier';

export const metadata: Metadata = {
    title: 'CEH Tracker',
    description: 'CEH Exam Score Analytics Dashboard',
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
        <body>
        <Providers>
            <ThemeApplier/>
            <ErrorBoundary>
                <ClientShell>{children}</ClientShell>
            </ErrorBoundary>
        </Providers>
        </body>
        </html>
    );
}