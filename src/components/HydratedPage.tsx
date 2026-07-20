import {dehydrate, HydrationBoundary, type QueryKey} from '@tanstack/react-query';
import {makeQueryClient} from '@/lib/queryClient';
import {assertRepositoryHydrationAllowed} from '@/lib/uiDeployment';

export interface HydratedQuery {
    queryKey: QueryKey;
    queryFn: () => Promise<unknown>;
}

export interface HydratedSeed {
    queryKey: QueryKey;
    data: unknown;
}

interface HydratedPageProps {
    queries?: HydratedQuery[];
    seeds?: HydratedSeed[];
    children: React.ReactNode;
}

export default async function HydratedPage({
    queries = [],
    seeds = [],
    children,
}: HydratedPageProps) {
    assertRepositoryHydrationAllowed();
    const queryClient = makeQueryClient();

    for (const seed of seeds) {
        queryClient.setQueryData(seed.queryKey, seed.data);
    }

    await Promise.all(queries.map((query) => queryClient.fetchQuery(query)));

    return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
