import { Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, MotionConfig, m } from 'framer-motion';
import { checkServices } from '../../store/slices/servicesSlice.js';
import { fetchDMI, fetchONI } from '../../store/slices/climateSlice.js';
import { setSpinning } from '../../store/slices/mapSlice.js';
import { prefetchPage } from '../../routes/lazyPages.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import MapboxMap from '../map/MapboxMap.jsx';
import MapSearch from '../map/MapSearch.jsx';
import AIDrawer from '../ai/AIDrawer.jsx';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import StatusBar from './StatusBar.jsx';
import PageLoader from '../common/PageLoader.jsx';
import ErrorBoundary from '../common/ErrorBoundary.jsx';
import { pageVariants } from '../ui/motion.js';

/** Pages that sit ON the map (transparent) vs. pages that cover it. */
const MAP_PAGES = new Set(['/', '/map']);

export default function AppShell() {
  const dispatch = useDispatch();
  const location = useLocation();
  const outlet = useOutlet();
  const { t } = useI18n();
  const { theme, reduceMotion } = useSelector((s) => s.ui);
  const onMap = MAP_PAGES.has(location.pathname);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#050a14' : '#eef3fa');
  }, [theme, reduceMotion]);

  // Load once: service health + climate indices. Then idle-prefetch the most used pages.
  useEffect(() => {
    document.getElementById('boot')?.classList.add('hide');
    dispatch(checkServices());
    dispatch(fetchONI());
    dispatch(fetchDMI());
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));
    idle(() => ['map', 'analytics', 'alerts'].forEach(prefetchPage));
    const timer = setInterval(() => dispatch(checkServices()), 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [dispatch]);

  // Stop the globe spinning whenever the map is hidden behind a page.
  useEffect(() => {
    if (!onMap) dispatch(setSpinning(false));
  }, [onMap, dispatch]);

  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-sky-500 focus:px-3 focus:py-2 focus:text-white">
        {t('app.skip')}
      </a>
      <div className="flex h-dvh flex-col">
        <Navbar />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main id="main" className="relative min-w-0 flex-1 overflow-hidden">
            <MapboxMap />
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
                className={onMap ? 'pointer-events-none absolute inset-0 z-10' : 'ambient absolute inset-0 z-10 overflow-y-auto scrollbar-thin'}
              >
                <ErrorBoundary key={location.pathname}>
                  <Suspense fallback={<PageLoader overlay={onMap} />}>{outlet}</Suspense>
                </ErrorBoundary>
              </m.div>
            </AnimatePresence>
          </main>
        </div>
        <StatusBar />
      </div>
      <ErrorBoundary fallback={null}>
        <AIDrawer />
        <MapSearch />
      </ErrorBoundary>
    </MotionConfig>
  );
}
