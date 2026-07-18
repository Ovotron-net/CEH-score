export function assertRepositoryHydrationAllowed() {
    if (process.env.NODE_ENV !== 'production') return;

    if (process.env.API_SECRET) {
        throw new Error(
            'Repository hydration requires API_SECRET to be unset in production UI deployments.',
        );
    }

    if (process.env.ALLOW_OPEN_API !== 'true') {
        throw new Error(
            'Repository hydration requires ALLOW_OPEN_API=true in production UI deployments.',
        );
    }
}
