import { lazy } from 'react';

/** Every page is its own chunk. Loaders are reused for hover-prefetching in the sidebar. */
export const pageLoaders = {
  dashboard: () => import('../pages/Dashboard.jsx'),
  map: () => import('../pages/MapPage.jsx'),
  analytics: () => import('../pages/Analytics.jsx'),
  viewers: () => import('../pages/Viewers.jsx'),
  briefings: () => import('../pages/Briefings.jsx'),
  reports: () => import('../pages/Reports.jsx'),
  alerts: () => import('../pages/Alerts.jsx'),
  settings: () => import('../pages/Settings.jsx'),
  notFound: () => import('../pages/NotFound.jsx'),
};

export const Pages = Object.fromEntries(Object.entries(pageLoaders).map(([k, loader]) => [k, lazy(loader)]));

const prefetched = new Set();
export function prefetchPage(key) {
  if (!key || prefetched.has(key) || !pageLoaders[key]) return;
  prefetched.add(key);
  pageLoaders[key]().catch(() => prefetched.delete(key));
}
