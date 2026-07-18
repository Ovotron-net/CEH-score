import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-[70vh] items-center justify-center p-6">
            <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-lg page-enter">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">404</p>
                <h1 className="mt-3 text-2xl font-bold text-foreground">Page not found</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    The page you&apos;re looking for does not exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="inline-flex min-h-11 items-center gap-2 mt-5 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-lg text-sm font-medium transition-all"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
}
