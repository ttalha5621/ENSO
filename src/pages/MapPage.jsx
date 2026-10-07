import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, m } from 'framer-motion';
import { openPanel } from '../store/slices/mapSlice.js';
import { useI18n } from '../i18n/I18nProvider.jsx';
import MapControls from '../components/map/MapControls.jsx';
import MapPanels from '../components/map/MapPanels.jsx';
import MapLegend from '../components/map/MapLegend.jsx';
import MeasureTool from '../components/map/MeasureTool.jsx';
import FeatureInspector from '../components/map/FeatureInspector.jsx';

/** The map page is only an overlay — the map itself is the shared MapboxMap behind it. */
export default function MapPage() {
  const dispatch = useDispatch();
  const { t } = useI18n();
  const panel = useSelector((s) => s.map.activePanel);
  const hasVisible = useSelector((s) => Object.values(s.map.layers).some((l) => l.visible));

  useEffect(() => {
    if (!panel && window.matchMedia('(min-width: 1024px)').matches) dispatch(openPanel('layers'));
    // Run once on entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Panels: left column on desktop, bottom sheet on mobile */}
      <div className="absolute inset-x-3 bottom-12 top-auto flex max-h-[55%] items-end md:inset-x-auto md:bottom-12 md:start-3 md:top-3 md:max-h-none md:items-start">
        <MapPanels />
      </div>

      <div className="absolute end-3 top-3">
        <MapControls />
      </div>

      <div className="absolute end-16 top-3 md:end-[68px]">
        <FeatureInspector />
      </div>

      <AnimatePresence>
        {!panel && hasVisible && (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass pointer-events-auto absolute bottom-12 start-3 hidden w-60 rounded-2xl p-3 md:block"
            aria-label={t('legend.title')}
          >
            <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">{t('legend.title')}</p>
            <MapLegend compact />
          </m.div>
        )}
      </AnimatePresence>

      <MeasureTool />
    </div>
  );
}
