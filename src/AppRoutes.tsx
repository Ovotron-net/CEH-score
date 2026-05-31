import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Assessments = lazy(() => import('./pages/Assessments'));
const AddAssessment = lazy(() => import('./pages/AddAssessment'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Topics = lazy(() => import('./pages/Topics'));
const Settings = lazy(() => import('./pages/Settings'));

const fallback = <div className="flex items-center justify-center min-h-screen">Loading...</div>;

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
            <div className="flex min-h-screen items-center justify-center p-6">
              <div className="max-w-md rounded-xl border border-[#1f2d40] bg-[#111827] p-8 text-center shadow-lg">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#00d4ff]">404</p>
                <h1 className="mt-3 text-2xl font-bold text-white">Page not found</h1>
                <p className="mt-2 text-sm text-[#64748b]">
                  The page you&apos;re looking for does not exist or has been moved.
                </p>
              </div>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
