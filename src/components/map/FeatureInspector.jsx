import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, m } from 'framer-motion';
import { MapPin, X } from 'lucide-react';
import { setSelectedFeature } from '../../store/slices/mapSlice.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import ExplainButton from '../common/ExplainButton.jsx';
import { IconButton } from '../ui/primitives.jsx';
import { formatCoord } from '../../utils/format.js';

const HIDDEN = new Set(['color']);

export default function FeatureInspector() {
  const dispatch = useDispatch();
  const { t } = useI18n();
  const f = useSelector((s) => s.map.selectedFeature);
  const title = f?.properties?.name || f?.properties?.title || f?.properties?.NAME || `${t('feature.selected')} #${f?.id ?? ''}`;

  return (
    <AnimatePresence>
      {f && (
        <m.div
          key={`${f.layerId}-${f.id}`}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="glass-strong pointer-events-auto w-[min(92vw,320px)] rounded-2xl p-4"
          role="dialog"
          aria-label={t('feature.selected')}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: `${f.properties.color || '#22d3ee'}22`, color: f.properties.color || '#22d3ee' }}>
              <MapPin className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] uppercase tracking-wider text-muted">{t('feature.selected')}</p>
              <h3 className="truncate font-display text-[15px] font-semibold text-strong">{title}</h3>
            </div>
            <IconButton size="sm" icon={X} label={t('common.close')} onClick={() => dispatch(setSelectedFeature(null))} />
          </div>
          <dl className="mt-3 space-y-1.5 text-xs">
            {Object.entries(f.properties)
              .filter(([k]) => !HIDDEN.has(k) && k !== 'name')
              .slice(0, 8)
              .map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <dt className="w-16 shrink-0 capitalize text-muted">{k}</dt>
                  <dd className="min-w-0 flex-1 text-[var(--text)]">{String(v)}</dd>
                </div>
              ))}
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-muted">Click</dt>
              <dd className="font-mono text-[11px] text-[var(--text)]">{formatCoord(f.lngLat[1], 'N', 'S')}, {formatCoord(f.lngLat[0], 'E', 'W')}</dd>
            </div>
          </dl>
          <div className="mt-3">
            <ExplainButton
              variant="pill"
              label={t('feature.explain')}
              subject={{ kind: 'selection', id: `${f.layerId}:${f.id}`, title, properties: f.properties, breadcrumb: [t('nav.map'), t('feature.selected'), title] }}
            />
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
