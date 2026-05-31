import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './AppRoutes';

export function render(url: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });

  const html = renderToString(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );

  return { html };
}
