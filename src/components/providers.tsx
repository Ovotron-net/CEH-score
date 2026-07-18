'use client';

import {QueryClientProvider} from '@tanstack/react-query';
import {useState} from 'react';
import {makeBrowserQueryClient} from '@/lib/queryClient';

export default function Providers({children}: { children: React.ReactNode }) {
    const [queryClient] = useState(makeBrowserQueryClient);
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
