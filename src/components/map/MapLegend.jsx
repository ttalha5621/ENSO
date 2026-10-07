import { AnimatePresence, m } from 'framer-motion';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { useLayerCatalog } from '../../hooks/useLayerCatalog.js';
import { buildLegendUrl } from '../../services/geoServer.js';
import { layerLabel } from '../../utils/layers.js';
import ExplainButton from '../common/ExplainButton.jsx';

/** Colour scales for every visible layer. compact = the floating on-map version. */
export default function MapLegend({ compact = false }) {
  const { t } = useI18n();
  const visible = useLayerCatalog().filter((l) => l.visible);

  if (!visible.length) return compact ? null : <p className="py-6 text-center text-sm text-muted">{t('legend.empty')}</p>;

  return (
    <div className={compact ? 'space-y-2.5' : 'space-y-4'}>
      {!compact && (
        <div className="flex justify-end">
          <ExplainButton variant="how" subject={{ kind: 'feature', id: 'legend', title: t('legend.title'), breadcrumb: [t('nav.map'), t('legend.title')] }} />
        </div>
      )}
      <AnimatePresence initial={false}>
        {visible.map((l) => (
          <m.div key={l.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
              <span className={`truncate font-medium text-strong ${compact ? 'text-[11px]' : 'text-xs'}`}>{layerLabel(t, l)}</span>
            </div>
            {l.legend ? (
              <>
                <div className={`${compact ? 'h-2' : 'h-3'} rounded-full ring-1 ring-black/10`} style={{ background: `linear-gradient(90deg, ${l.legend.stops.join(',')})`, opacity: Math.max(0.5, l.opacity) }} />
                <div className="mt-1 flex justify-between font-mono text-[10px] text-muted"><span>{l.legend.min}</span><span>{l.legend.max}</span></div>
              </>
            ) : l.service === 'geoserver' ? (
              <img src={buildLegendUrl(l)} alt="" loading="lazy" className="max-h-40 rounded-md" />
            ) : (
              <p className="text-[10.5px] text-muted">{l.description}</p>
            )}
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
