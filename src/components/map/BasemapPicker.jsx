import { useDispatch, useSelector } from 'react-redux';
import { m } from 'framer-motion';
import { Check } from 'lucide-react';
import { setBasemap } from '../../store/slices/mapSlice.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { BASEMAPS, BOOKMARKS } from './mapConfig.js';
import { mapService } from '../../services/mapService.js';
import ExplainButton from '../common/ExplainButton.jsx';

export default function BasemapPicker() {
  const dispatch = useDispatch();
  const { t } = useI18n();
  const current = useSelector((s) => s.map.basemap);

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="px-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">{t('basemap.title')}</h4>
          <ExplainButton variant="how" subject={{ kind: 'feature', id: 'basemap', title: t('basemap.title'), breadcrumb: [t('nav.map'), t('basemap.title')] }} />
        </div>
        <div role="radiogroup" aria-label={t('basemap.title')} className="grid grid-cols-3 gap-2">
          {BASEMAPS.map((b) => {
            const active = b.id === current;
            return (
              <button key={b.id} type="button" role="radio" aria-checked={active} onClick={() => dispatch(setBasemap(b.id))} className="group text-start">
                <span className={`relative block aspect-[4/3] overflow-hidden rounded-xl ring-2 transition-all ${active ? 'ring-sky-400 shadow-lg shadow-sky-500/20' : 'ring-transparent group-hover:ring-[var(--border-strong)]'}`} style={{ background: b.swatch }}>
                  <span className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent_0_10px,rgba(255,255,255,0.06)_10px_11px)]" />
                  {active && (
                    <m.span layoutId="basemap-check" className="absolute end-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-sky-400 text-slate-950">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </m.span>
                  )}
                </span>
                <span className={`mt-1.5 block truncate text-[11px] ${active ? 'font-medium text-strong' : 'text-muted'}`}>{t(b.label)}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <h4 className="mb-2 px-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">{t('bookmarks.title')}</h4>
        <div className="flex flex-wrap gap-1.5">
          {BOOKMARKS.map((b) => (
            <button key={b.id} type="button" onClick={() => mapService.flyTo({ center: b.center, zoom: b.zoom })} className="rounded-full bg-[var(--glass-soft)] px-3 py-1.5 text-xs text-[var(--text)] ring-1 ring-[var(--border)] transition hover:bg-sky-500/12 hover:text-sky-300 hover:ring-sky-400/30">
              {t(b.label)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
