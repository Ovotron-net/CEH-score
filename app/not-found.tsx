import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="max-w-md rounded-xl border border-[#1f2d40] bg-[#111827] p-8 text-center shadow-lg page-enter">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#00d4ff]">404</p>
        <h1 className="mt-3 text-2xl font-bold text-white">Page not found</h1>
        <p className="mt-2 text-sm text-[#64748b]">
          The page you&apos;re looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 text-[#00ff88] rounded-lg text-sm font-medium transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
