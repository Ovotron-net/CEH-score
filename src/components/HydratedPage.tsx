import {dehydrate, HydrationBoundary, type QueryKey} from '@tanstack/react-query';
import {makeQueryClient} from '@/lib/queryClient';
import {assertRepositoryHydrationAllowed} from '@/lib/uiDeployment';

export interface HydratedQuery {
    queryKey: QueryKey;
    queryFn: () => Promise<unknown>;
}

interface HydratedPageProps {
    queries: HydratedQuery[];
    children: React.ReactNode;
}

export default async function HydratedPage({queries, children}: HydratedPageProps) {
    assertRepositoryHydrationAllowed();
    const queryClient = makeQueryClient();

    await Promise.all(queries.map((query) => queryClient.fetchQuery(query)));

    return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
