'use client';

interface RouteErrorProps {
    error: Error & {digest?: string};
    reset: () => void;
}

export default function RouteError({reset}: RouteErrorProps) {
    return (
        <div className="flex min-h-[50vh] items-center justify-center p-6">
            <div className="glass-card max-w-md rounded-xl p-8 text-center">
                <h1 className="text-2xl font-semibold text-foreground">Unable to load this page</h1>
                <p className="mt-3 text-muted-foreground">A required data request failed.</p>
                <button
                    type="button"
                    onClick={reset}
                    className="mt-6 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
