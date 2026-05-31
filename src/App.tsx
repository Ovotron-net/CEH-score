import { BrowserRouter } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import AppRoutes from './AppRoutes';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppRoutes />
      <SpeedInsights />
      <VercelAnalytics />
    </BrowserRouter>
  );
}
