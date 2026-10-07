import { createBrowserRouter, Navigate } from 'react-router-dom';
import LegacyRedirect from './LegacyRedirect.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import { Pages } from './lazyPages.js';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Pages.dashboard /> },
      { path: 'map', element: <Pages.map /> },
      { path: 'analytics', element: <Pages.analytics /> },
      { path: 'viewers', element: <Pages.viewers /> },
      { path: 'briefings', element: <Pages.briefings /> },
      { path: 'reports', element: <Pages.reports /> },
      { path: 'alerts', element: <Pages.alerts /> },
      { path: 'settings', element: <Pages.settings /> },
      // Old portal URLs → their new homes (bookmarks keep working)
      { path: 'sst', element: <LegacyRedirect layer="sst" /> },
      { path: 'ssc', element: <LegacyRedirect layer="currents" /> },
      { path: 'ssh', element: <LegacyRedirect layer="ssh" /> },
      { path: 'sss', element: <LegacyRedirect layer="sss" /> },
      { path: 'ssta', element: <LegacyRedirect layer="ssta" /> },
      { path: 'climate', element: <Navigate to="/viewers" replace /> },
      { path: 'energy-budget', element: <Navigate to="/viewers" replace /> },
      { path: 'feed', element: <Navigate to="/viewers" replace /> },
      { path: 'iodim', element: <Navigate to="/analytics" replace /> },
      { path: 'climate-state', element: <Navigate to="/briefings" replace /> },
      { path: 'mjo', element: <Navigate to="/briefings" replace /> },
      { path: 'itcz', element: <Navigate to="/briefings" replace /> },
      { path: 'weather-patterns', element: <Navigate to="/briefings" replace /> },
      { path: 'simex', element: <Navigate to="/briefings" replace /> },
      { path: '*', element: <Pages.notFound /> },
    ],
  },
]);
