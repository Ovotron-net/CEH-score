import type {Metadata} from 'next';
import type {ComponentType, ReactNode} from 'react';
import HydratedPage, {type HydratedQuery} from '@/components/HydratedPage';
import type {ServerQueryDescriptor} from '@/data/serverQueries';

/**
 * Factory for App Router pages that only need metadata + HydratedPage + a view.
 */
export function createHydratedPage(options: {
    title: string;
    queries: ServerQueryDescriptor[] | (() => ServerQueryDescriptor[]);
    View: ComponentType;
}): {
    dynamic: 'force-dynamic';
    metadata: Metadata;
    default: () => ReactNode;
} {
    const resolveQueries = (): HydratedQuery[] => {
        const list = typeof options.queries === 'function' ? options.queries() : options.queries;
        return list.map(({queryKey, queryFn}) => ({queryKey, queryFn}));
    };

    return {
        dynamic: 'force-dynamic',
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
