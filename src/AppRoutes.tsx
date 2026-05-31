import { lazy, Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Assessments = lazy(() => import('./pages/Assessments'));
const AddAssessment = lazy(() => import('./pages/AddAssessment'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Topics = lazy(() => import('./pages/Topics'));
const Settings = lazy(() => import('./pages/Settings'));

function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="spinner" />
        <p className="text-[#64748b] text-sm">Loading…</p>
      </div>
    </div>
  );
}

const fallback = <PageSpinner />;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Suspense fallback={fallback}><Dashboard /></Suspense>} />
        <Route path="assessments" element={<Suspense fallback={fallback}><Assessments /></Suspense>} />
        <Route path="add" element={<Suspense fallback={fallback}><AddAssessment /></Suspense>} />
        <Route path="analytics" element={<Suspense fallback={fallback}><Analytics /></Suspense>} />
        <Route path="leaderboard" element={<Suspense fallback={fallback}><Leaderboard /></Suspense>} />
        <Route path="topics" element={<Suspense fallback={fallback}><Topics /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={fallback}><Settings /></Suspense>} />
        <Route
          path="*"
          element={
            <div className="flex min-h-[70vh] items-center justify-center p-6">
              <div className="max-w-md rounded-xl border border-[#1f2d40] bg-[#111827] p-8 text-center shadow-lg page-enter">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#00d4ff]">404</p>
                <h1 className="mt-3 text-2xl font-bold text-white">Page not found</h1>
                <p className="mt-2 text-sm text-[#64748b]">
                  The page you&apos;re looking for does not exist or has been moved.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 text-[#00ff88] rounded-lg text-sm font-medium transition-all"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
