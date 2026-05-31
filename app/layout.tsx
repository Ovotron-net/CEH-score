import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/providers';
import Layout from '@/src/components/Layout';

export const metadata: Metadata = {
  title: 'CEH Tracker',
  description: 'CEH Exam Score Analytics Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
