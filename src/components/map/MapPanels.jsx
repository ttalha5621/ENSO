import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, m } from 'framer-motion';
import { Globe, Layers, ListFilter, Map as MapIcon, Mountain, Orbit, Ruler, Sparkles, SquareDashed, Wrench, X } from 'lucide-react';
import { openPanel, setMeasureMode, setProjection, setSpinning, toggleTerrain } from '../../store/slices/mapSlice.js';
import { explain } from '../../store/slices/aiSlice.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import ExplainButton from '../common/ExplainButton.jsx';
import { IconButton, Switch } from '../ui/primitives.jsx';
import LayerControl from './LayerControl.jsx';
import MapLegend from './MapLegend.jsx';
import BasemapPicker from './BasemapPicker.jsx';

const META = {
  layers: { icon: Layers, key: 'nav.layers' },
  basemap: { icon: MapIcon, key: 'nav.basemap' },
  legend: { icon: ListFilter, key: 'nav.legend' },
  tools: { icon: Wrench, key: 'nav.tools' },
};

function ToolsPanel() {
  const dispatch = useDispatch();
  const { t } = useI18n();
  const { projection, terrain, spinning, measureMode } = useSelector((s) => s.map);
  const toggles = [
    { icon: Globe, label: t('tools.globe'), value: projection === 'globe', on: (v) => dispatch(setProjection(v ? 'globe' : 'mercator')) },
    { icon: Mountain, label: t('tools.terrain'), value: terrain, on: () => dispatch(toggleTerrain()) },
    { icon: Orbit, label: t('tools.rotate'), value: spinning, on: (v) => dispatch(setSpinning(v)) },
  ];
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ExplainButton variant="how" subject={{ kind: 'feature', id: 'map-tools', title: t('nav.tools'), breadcrumb: [t('nav.map'), t('nav.tools')] }} />
      </div>
      <div className="space-y-1">
        {toggles.map((tg) => (
          <label key={tg.label} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 hover:bg-[var(--glass-soft)]">
            <tg.icon className="h-4 w-4 text-cyan-400" />
            <span className="flex-1 text-sm text-strong">{tg.label}</span>
            <Switch checked={tg.value} onChange={tg.on} label={tg.label} />
          </label>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { mode: 'distance', icon: Ruler, label: t('tools.measureDistance') },
          { mode: 'area', icon: SquareDashed, label: t('tools.measureArea') },
        ].map((b) => (
          <button
            key={b.mode}
            type="button"
            aria-pressed={measureMode === b.mode}
            onClick={() => dispatch(setMeasureMode(measureMode === b.mode ? null : b.mode))}
            className={`flex flex-col items-start gap-2 rounded-xl p-3 text-start text-xs ring-1 transition ${measureMode === b.mode ? 'bg-amber-400/12 text-amber-200 ring-amber-400/40' : 'bg-[var(--glass-soft)] text-[var(--text)] ring-[var(--border)] hover:ring-[var(--border-strong)]'}`}
          >
            <b.icon className="h-4 w-4" /> {b.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => dispatch(explain({ kind: 'map', id: 'map', title: t('tools.explainMap'), breadcrumb: [t('nav.map')] }))}
        className="flex w-full items-center gap-3 rounded-xl bg-violet-500/10 p-3 text-start text-sm text-violet-200 ring-1 ring-violet-400/25 transition hover:bg-violet-500/18"
      >
        <Sparkles className="h-4 w-4" /> {t('tools.explainMap')}
      </button>
    </div>
  );
}

/** Floating panel host for layers / basemap / legend / tools. */
export default function MapPanels() {
  const dispatch = useDispatch();
  const { t, lang } = useI18n();
  const panel = useSelector((s) => s.map.activePanel);
  const meta = META[panel];
  const dx = lang.dir === 'rtl' ? 20 : -20;

  return (
    <AnimatePresence mode="wait">
      {meta && (
        <m.section
          key={panel}
          aria-label={t(meta.key)}
          initial={{ opacity: 0, x: dx, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: dx, scale: 0.98, transition: { duration: 0.15 } }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="glass-strong pointer-events-auto flex max-h-full w-full flex-col overflow-hidden rounded-3xl md:w-[340px]"
        >
          <header className="flex items-center gap-3 border-b border-line px-4 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-sky-500/25 to-cyan-500/10 text-sky-300">
              <meta.icon className="h-4 w-4" />
            </span>
            <h2 className="flex-1 font-display text-[15px] font-semibold text-strong">{t(meta.key)}</h2>
            <IconButton size="sm" icon={X} label={t('common.close')} onClick={() => dispatch(openPanel(null))} />
          </header>
          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-3">
            {panel === 'layers' && <LayerControl />}
            {panel === 'basemap' && <BasemapPicker />}
            {panel === 'legend' && <MapLegend />}
            {panel === 'tools' && <ToolsPanel />}
          </div>
        </m.section>
      )}
    </AnimatePresence>
  );
}
