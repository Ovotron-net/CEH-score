'use client';

<<<<<<< Updated upstream
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useState} from 'react';

=======
<<<<<<< HEAD
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      }),
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
=======
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useState} from 'react';

>>>>>>> Stashed changes
export default function Providers({children}: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {staleTime: 30_000, retry: 1},
                },
            }),
    );
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
}



