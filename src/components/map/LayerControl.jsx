import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AnimatePresence, m } from 'framer-motion';
import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, Trash2, TriangleAlert } from 'lucide-react';
import { LAYER_GROUPS } from '../../config/mapLayers.js';
import { moveLayer, removeCustomLayer, setLayerOpacity, toggleLayer } from '../../store/slices/mapSlice.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { useLayerCatalog } from '../../hooks/useLayerCatalog.js';
import ExplainButton from '../common/ExplainButton.jsx';
import { Badge, IconButton, Slider } from '../ui/primitives.jsx';
import { cx } from '../../utils/format.js';
import { layerLabel } from '../../utils/layers.js';


function LayerRow({ layer, index, total }) {
  const dispatch = useDispatch();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const name = layerLabel(t, layer);
  const gradient = layer.legend ? `linear-gradient(90deg, ${layer.legend.stops.join(',')})` : null;

  return (
    <m.li layout="position" transition={{ type: 'spring', stiffness: 500, damping: 40 }} className={cx('rounded-xl ring-1 transition-colors', layer.visible ? 'bg-[var(--glass-soft)] ring-[var(--border-strong)]' : 'ring-transparent hover:bg-[var(--glass-soft)]')}>
      <div className="flex items-center gap-2 p-2">
        <button
          type="button"
          onClick={() => dispatch(toggleLayer(layer.id))}
          aria-pressed={layer.visible}
          aria-label={`${layer.visible ? t('layers.hide') : t('layers.show')}: ${name}`}
          className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-all active:scale-90', layer.visible ? 'text-white shadow-md' : 'bg-[var(--glass-hover)] text-muted')}
          style={layer.visible ? { background: layer.color, boxShadow: `0 4px 14px -4px ${layer.color}` } : undefined}
        >
          {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="min-w-0 flex-1 text-start">
          <span className={cx('block truncate text-[13px] font-medium', layer.visible ? 'text-strong' : 'text-[var(--text)]')}>{name}</span>
          <span className="flex items-center gap-1.5 text-[10.5px] text-muted">
            <span className="font-mono">{layer.type.toUpperCase()}</span>·<span className="truncate">{layer.service === 'gibs' ? 'NASA GIBS' : layer.service === 'geoserver' ? 'GeoServer' : 'GeoJSON'}</span>
            {layer.error && <TriangleAlert className="h-3 w-3 text-amber-400" aria-label={t('layers.error')} />}
          </span>
        </button>
        {layer.aiExplanationEnabled !== false && (
          <ExplainButton subject={{ kind: 'layer', id: layer.id, title: name, breadcrumb: [t('nav.map'), t('nav.layers'), name] }} />
        )}
        <button type="button" onClick={() => setOpen((v) => !v)} aria-label={name} className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-[var(--glass-hover)]">
          <ChevronDown className={cx('h-4 w-4 transition-transform duration-300', open && 'rotate-180')} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div className="space-y-3 px-3 pb-3 pt-1">
              {layer.description && <p className="text-xs leading-relaxed text-muted">{layer.description}</p>}
              {gradient && (
                <div>
                  <div className="h-2 rounded-full ring-1 ring-black/10" style={{ background: gradient }} />
                  <div className="mt-1 flex justify-between font-mono text-[10px] text-muted"><span>{layer.legend.min}</span><span>{layer.legend.max}</span></div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-[11px] text-muted">{t('layers.opacity')}</span>
                <Slider value={layer.opacity} label={`${t('layers.opacity')} ${name}`} color={layer.color} onChange={(v) => dispatch(setLayerOpacity({ id: layer.id, opacity: v }))} />
                <span className="w-9 text-end font-mono text-[11px] text-[var(--text)]">{Math.round(layer.opacity * 100)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="truncate text-[10.5px] text-muted">{layer.source}</span>
                <div className="flex gap-1">
                  {layer.service === 'geoserver' && <IconButton size="sm" icon={Trash2} label={t('layers.remove')} onClick={() => dispatch(removeCustomLayer(layer.id))} />}
                  <IconButton size="sm" icon={ArrowUp} label={t('layers.moveUp')} disabled={index === 0} onClick={() => dispatch(moveLayer({ id: layer.id, direction: 'up' }))} />
                  <IconButton size="sm" icon={ArrowDown} label={t('layers.moveDown')} disabled={index === total - 1} onClick={() => dispatch(moveLayer({ id: layer.id, direction: 'down' }))} />
                </div>
              </div>
              {layer.error && <p className="rounded-lg bg-amber-400/10 px-2.5 py-2 text-[11px] text-amber-300">{t('layers.error')}</p>}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.li>
  );
}

export default function LayerControl() {
  const { t } = useI18n();
  const catalog = useLayerCatalog();
  const active = catalog.filter((l) => l.visible).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge tone="sky">{t('layers.active', { n: active })}</Badge>
        <ExplainButton variant="how" subject={{ kind: 'feature', id: 'layer-management', title: t('nav.layers'), breadcrumb: [t('nav.map'), t('nav.layers')] }} />
      </div>
      {LAYER_GROUPS.map((g) => {
        const items = catalog.filter((l) => l.group === g.id);
        if (!items.length) return null;
        return (
          <section key={g.id}>
            <h4 className="mb-2 px-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">{t(g.label)}</h4>
            <ul className="space-y-1.5">
              {items.map((l) => (
                <LayerRow key={l.id} layer={l} index={catalog.indexOf(l)} total={catalog.length} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
