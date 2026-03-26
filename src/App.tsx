
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Assessments from './pages/Assessments';
import AddAssessment from './pages/AddAssessment';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';
import Topics from './pages/Topics';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="add" element={<AddAssessment />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="topics" element={<Topics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <SpeedInsights />
    </BrowserRouter>
  );
}
