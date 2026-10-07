import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, m } from 'framer-motion';
import { Check, Info, KeyRound, Languages, Loader2, Map as MapIcon, Moon, Palette, Plus, Server, Settings as SettingsIcon, ShieldCheck, Sparkles, Sun, Trash2 } from 'lucide-react';
import { ENV, getMapboxToken, getMapboxTokenSource, hasGeoServer, hasMapboxToken, saveMapboxToken } from '../config/env.js';
import { LANGUAGES } from '../i18n/languages.js';
import { setLanguage, setReduceMotion, setTheme } from '../store/slices/uiSlice.js';
import { addCustomLayer, setBasemap } from '../store/slices/mapSlice.js';
import { checkServices } from '../store/slices/servicesSlice.js';
import { aiService } from '../services/aiService.js';
import { getWmsCapabilities } from '../services/geoServer.js';
import { useI18n } from '../i18n/I18nProvider.jsx';
import { BASEMAPS } from '../components/map/mapConfig.js';
import ExplainButton from '../components/common/ExplainButton.jsx';
import { Badge, Button, PageHeader, Segmented, SectionTitle, StatusDot, Switch } from '../components/ui/primitives.jsx';
import { fadeUp, stagger } from '../components/ui/motion.js';
import { cx } from '../utils/format.js';

const mask = (v) => (v ? `${v.slice(0, 6)}…${v.slice(-4)}` : '—');

function Row({ label, hint, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3.5 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-strong">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function GeoServerDiscovery() {
  const dispatch = useDispatch();
  const { t } = useI18n();
  const added = useSelector((s) => s.map.customLayers.map((l) => l.id));
  const [state, setState] = useState({ status: 'idle', layers: [] });

  const discover = async () => {
    setState({ status: 'loading', layers: [] });
    try {
      const caps = await getWmsCapabilities();
      setState({ status: 'done', layers: caps.layers });
    } catch {
      setState({ status: 'error', layers: [] });
    }
  };

  const add = (l, asWfs) =>
    dispatch(
      addCustomLayer({
        id: `gs-${asWfs ? 'wfs' : 'wms'}-${l.name}`,
        name: l.title,
        short: l.name.split(':').pop().slice(0, 6).toUpperCase(),
        group: 'geoserver',
        type: asWfs ? 'wfs' : 'wms',
        service: 'geoserver',
        layer: l.name,
        typeName: l.name,
        description: l.abstract || undefined,
        abstract: l.abstract || undefined,
        keywords: l.keywords,
        bounds: l.bounds,
        source: `GeoServer — ${l.name}`,
        color: asWfs ? '#f472b6' : '#a3e635',
        aiExplanationEnabled: true,
      }),
    );

  if (!hasGeoServer()) return <p className="rounded-xl bg-[var(--glass-soft)] p-3 text-xs text-muted ring-1 ring-[var(--border)]">{t('settings.geoserverHint')}</p>;

  return (
    <div className="space-y-3">
      <Button size="sm" icon={state.status === 'loading' ? Loader2 : Server} onClick={discover} disabled={state.status === 'loading'} className={state.status === 'loading' ? '[&_svg]:animate-spin' : ''}>
        {t('settings.discover')}
      </Button>
      {state.status === 'error' && <p className="text-xs text-amber-300">{t('settings.corsError')}</p>}
      {state.status === 'done' && state.layers.length === 0 && <p className="text-xs text-muted">{t('settings.noLayers')}</p>}
      <ul className="scrollbar-thin max-h-80 space-y-1.5 overflow-y-auto">
        {state.layers.map((l) => (
          <li key={l.name} className="flex items-center gap-3 rounded-xl bg-[var(--glass-soft)] p-2.5 ring-1 ring-[var(--border)]">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-strong">{l.title}</p>
              <p className="truncate font-mono text-[10.5px] text-muted">{l.name}</p>
            </div>
            {['wms', 'wfs'].map((kind) => {
              const isAdded = added.includes(`gs-${kind}-${l.name}`);
              return (
                <Button key={kind} size="sm" variant={isAdded ? 'ghost' : 'glass'} icon={isAdded ? Check : Plus} disabled={isAdded} onClick={() => add(l, kind === 'wfs')}>
                  {kind.toUpperCase()}
                </Button>
              );
            })}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Settings() {
  const dispatch = useDispatch();
  const { t, lang } = useI18n();
  const { theme, reduceMotion } = useSelector((s) => s.ui);
  const basemap = useSelector((s) => s.map.basemap);
  const services = useSelector((s) => s.services);
  const [cleared, setCleared] = useState(false);

  return (
    <m.div variants={stagger(0.07)} initial="hidden" animate="show" className="mx-auto max-w-4xl space-y-5 p-4 md:p-8">
      <PageHeader icon={SettingsIcon} title={t('settings.title')} actions={<ExplainButton variant="pill" subject={{ kind: 'feature', id: 'settings', title: t('settings.title'), breadcrumb: [t('nav.settings')] }} />} />

      <m.section variants={fadeUp} className="glass rounded-3xl p-5">
        <SectionTitle icon={Palette} title={t('settings.appearance')} />
        <div className="mt-2">
          <Row label={t('settings.theme')}>
            <Segmented
              size="sm"
              label={t('settings.theme')}
              value={theme}
              onChange={(v) => dispatch(setTheme(v))}
              options={[
                { value: 'dark', label: <span className="inline-flex items-center gap-1.5"><Moon className="h-3.5 w-3.5" />{t('settings.dark')}</span> },
                { value: 'light', label: <span className="inline-flex items-center gap-1.5"><Sun className="h-3.5 w-3.5" />{t('settings.light')}</span> },
              ]}
            />
          </Row>
          <Row label={t('settings.motion')} hint={t('settings.motionHint')}>
            <Switch checked={reduceMotion} onChange={(v) => dispatch(setReduceMotion(v))} label={t('settings.motion')} />
          </Row>
          <Row label={t('settings.defaultBasemap')}>
            <MapIcon className="h-4 w-4 text-muted" />
            <select value={basemap} onChange={(e) => dispatch(setBasemap(e.target.value))} aria-label={t('settings.defaultBasemap')} className="h-9 rounded-xl bg-[var(--glass-soft)] px-3 text-sm text-strong ring-1 ring-[var(--border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
              {BASEMAPS.map((b) => <option key={b.id} value={b.id} className="bg-slate-900 text-white">{t(b.label)}</option>)}
            </select>
          </Row>
        </div>
      </m.section>

      <m.section variants={fadeUp} className="glass rounded-3xl p-5">
        <SectionTitle icon={Languages} title={t('settings.language')} />
        <div role="radiogroup" aria-label={t('settings.language')} className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LANGUAGES.map((l) => {
            const active = l.code === lang.code;
            return (
              <button key={l.code} type="button" role="radio" aria-checked={active} onClick={() => dispatch(setLanguage(l.code))} className={cx('relative flex items-center gap-3 rounded-2xl p-3 text-start ring-1 transition', active ? 'bg-sky-500/12 ring-sky-400/40' : 'bg-[var(--glass-soft)] ring-[var(--border)] hover:ring-[var(--border-strong)]')}>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--glass-hover)] font-mono text-xs uppercase text-sky-300">{l.code}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-strong" dir={l.dir} style={l.family ? { fontFamily: l.family } : undefined}>{l.native}</span>
                  <span className="block truncate text-[11px] text-muted">{l.english}</span>
                </span>
                <AnimatePresence>{active && <m.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute end-3 top-3"><Check className="h-4 w-4 text-sky-400" /></m.span>}</AnimatePresence>
              </button>
            );
          })}
        </div>
      </m.section>

      <m.section variants={fadeUp} className="glass rounded-3xl p-5">
        <SectionTitle icon={ShieldCheck} title={t('settings.services')} action={<ExplainButton variant="how" subject={{ kind: 'feature', id: 'geoserver', title: t('settings.services'), breadcrumb: [t('nav.settings'), t('settings.services')] }} />} />
        <div className="mt-2">
          <Row label={t('settings.mapbox')} hint={getMapboxTokenSource() === 'browser' ? t('map.savedInBrowser') : 'VITE_MAPBOX_ACCESS_TOKEN (.env)'}>
            <KeyRound className="h-4 w-4 text-muted" />
            <span className="font-mono text-xs text-[var(--text)]">{mask(getMapboxToken())}</span>
            <Badge tone={hasMapboxToken() ? 'green' : 'red'}>{hasMapboxToken() ? t('settings.configured') : t('state.notConfigured')}</Badge>
            {getMapboxTokenSource() === 'browser' && (
              <Button size="sm" variant="ghost" onClick={() => (saveMapboxToken(''), window.location.reload())}>{t('map.clearToken')}</Button>
            )}
          </Row>
          <Row label={t('settings.geoserver')} hint="VITE_GEOSERVER_URL">
            <span className="max-w-[220px] truncate font-mono text-xs text-[var(--text)]">{ENV.GEOSERVER_URL || '—'}</span>
            <StatusDot state={services.geoserver} />
          </Row>
          <Row label="NASA GIBS" hint="gibs.earthdata.nasa.gov · WMS EPSG:3857">
            <StatusDot state={services.gibs} />
          </Row>
          <Row label={t('settings.ai')} hint={t('settings.securityNote')}>
            {services.model && <Badge tone="ai"><Sparkles className="h-3 w-3" />{services.model}</Badge>}
            <StatusDot state={services.ai} />
            <Button size="sm" variant="ghost" onClick={() => dispatch(checkServices())}>{t('common.retry')}</Button>
          </Row>
          <Row label={t('settings.clearCache')}>
            <Button size="sm" icon={cleared ? Check : Trash2} onClick={() => (aiService.clearCache(), setCleared(true))}>{cleared ? t('settings.cacheCleared') : t('settings.clearCache')}</Button>
          </Row>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-strong">{t('settings.capabilities')}</p>
          <GeoServerDiscovery />
        </div>
      </m.section>

      <m.section variants={fadeUp} className="glass rounded-3xl p-5">
        <SectionTitle icon={Info} title={t('settings.about')} />
        <p className="mt-3 text-sm leading-relaxed text-[var(--text)]">{t('settings.aboutBody')}</p>
      </m.section>
    </m.div>
  );
}
