import { useDispatch, useSelector } from 'react-redux';
import { m } from 'framer-motion';
import { Globe, Layers, ListFilter, Map as MapIcon, Mountain, Orbit, Ruler, Sparkles, SquareDashed, Wrench, Crosshair } from 'lucide-react';
import { setActivePanel, setMeasureMode, setProjection, setSpinning, toggleTerrain } from '../../store/slices/mapSlice.js';
import { explain } from '../../store/slices/aiSlice.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { mapService } from '../../services/mapService.js';
import { IconButton } from '../ui/primitives.jsx';
import { DEFAULT_VIEW } from './mapConfig.js';

/** Floating tool rail. Zoom/compass/locate/fullscreen are Mapbox's native controls (bottom corner). */
export default function MapControls() {
  const dispatch = useDispatch();
  const { t, lang } = useI18n();
  const { activePanel, projection, terrain, spinning, measureMode } = useSelector((s) => s.map);
  const side = lang.dir === 'rtl' ? 'right' : 'left';

  const groups = [
    [
      { icon: Layers, label: t('nav.layers'), active: activePanel === 'layers', onClick: () => dispatch(setActivePanel('layers')) },
      { icon: MapIcon, label: t('nav.basemap'), active: activePanel === 'basemap', onClick: () => dispatch(setActivePanel('basemap')) },
      { icon: ListFilter, label: t('nav.legend'), active: activePanel === 'legend', onClick: () => dispatch(setActivePanel('legend')) },
      { icon: Wrench, label: t('nav.tools'), active: activePanel === 'tools', onClick: () => dispatch(setActivePanel('tools')) },
    ],
    [
      { icon: Globe, label: t('tools.globe'), active: projection === 'globe', onClick: () => dispatch(setProjection(projection === 'globe' ? 'mercator' : 'globe')) },
      { icon: Mountain, label: t('tools.terrain'), active: terrain, onClick: () => dispatch(toggleTerrain()) },
      { icon: Orbit, label: t('tools.rotate'), active: spinning, onClick: () => dispatch(setSpinning(!spinning)) },
      { icon: Ruler, label: t('tools.measureDistance'), active: measureMode === 'distance', onClick: () => dispatch(setMeasureMode(measureMode === 'distance' ? null : 'distance')) },
      { icon: SquareDashed, label: t('tools.measureArea'), active: measureMode === 'area', onClick: () => dispatch(setMeasureMode(measureMode === 'area' ? null : 'area')) },
      { icon: Crosshair, label: t('tools.resetView'), onClick: () => mapService.flyTo({ ...DEFAULT_VIEW, duration: 1600 }) },
    ],
  ];

  return (
    <m.nav
      aria-label={t('nav.tools')}
      initial={{ opacity: 0, x: lang.dir === 'rtl' ? -16 : 16 }}
      animate={{ opacity: 1, x: 0, transition: { delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
      className="pointer-events-auto flex flex-col gap-2"
    >
      {groups.map((items, gi) => (
        <div key={gi} className="glass flex flex-col gap-0.5 rounded-2xl p-1">
          {items.map((it) => (
            <IconButton key={it.label} icon={it.icon} label={it.label} active={it.active} onClick={it.onClick} tooltipSide={side} />
          ))}
        </div>
      ))}
      <div className="glass rounded-2xl p-1">
        <IconButton
          icon={Sparkles}
          tone="ai"
          active
          label={t('tools.explainMap')}
          tooltipSide={side}
          onClick={() => dispatch(explain({ kind: 'map', id: 'map', title: t('tools.explainMap'), breadcrumb: [t('nav.map')] }))}
        />
      </div>
    </m.nav>
  );
}
