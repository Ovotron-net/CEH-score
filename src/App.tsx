
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Assessments = lazy(() => import('./pages/Assessments'));
const AddAssessment = lazy(() => import('./pages/AddAssessment'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Topics = lazy(() => import('./pages/Topics'));
const Settings = lazy(() => import('./pages/Settings'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><Dashboard /></Suspense>} />
          <Route path="assessments" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><Assessments /></Suspense>} />
          <Route path="add" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><AddAssessment /></Suspense>} />
          <Route path="analytics" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><Analytics /></Suspense>} />
          <Route path="leaderboard" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><Leaderboard /></Suspense>} />
          <Route path="topics" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><Topics /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><Settings /></Suspense>} />
        </Route>
      </Routes>
      <SpeedInsights />
      <VercelAnalytics />
    </BrowserRouter>
  );
}
