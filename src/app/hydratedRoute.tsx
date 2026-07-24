import type {Metadata} from 'next';
import type {ComponentType, ReactNode} from 'react';
import HydratedPage, {type HydratedQuery} from '@/components/HydratedPage';
import type {ServerQueryDescriptor} from '@/data/serverQueries';

/**
 * Factory for App Router pages that only need metadata + HydratedPage + a view.
 *
 * Callers must still export `export const dynamic = 'force-dynamic'` as a
 * string literal in the page module — Next.js static analysis rejects
 * `export const dynamic = page.dynamic` (MemberExpression).
 */
export function createHydratedPage(options: {
    title: string;
    queries: ServerQueryDescriptor[] | (() => ServerQueryDescriptor[]);
    View: ComponentType;
}): {
    metadata: Metadata;
    default: () => ReactNode;
} {
    const resolveQueries = (): HydratedQuery[] => {
        const list = typeof options.queries === 'function' ? options.queries() : options.queries;
        return list.map(({queryKey, queryFn}) => ({queryKey, queryFn}));
    };

    return {
        metadata: {title: options.title},
        default: function HydratedRoutePage() {
            return (
                <HydratedPage queries={resolveQueries()}>
                    <options.View/>
                </HydratedPage>
            );
        },
    };
}
