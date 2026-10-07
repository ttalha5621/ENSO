import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Activity, ArrowUpRight, Bell, Clock, Database, Eye, EyeOff, Layers, Map as MapIcon, Server, Waves } from 'lucide-react';
import { mapLayers } from '../config/mapLayers.js';
import { setSpinning, toggleLayer } from '../store/slices/mapSlice.js';
import { useI18n } from '../i18n/I18nProvider.jsx';
import { useLayerCatalog } from '../hooks/useLayerCatalog.js';
import { alertMessage, selectAlerts, SEVERITY_STYLE } from '../utils/alerts.js';
import { classifyDMI, classifyONI, dmiPeriod, latestDMI, latestONI, oniPeriod } from '../utils/climate.js';
import { cx, formatDateTime } from '../utils/format.js';
import { layerLabel } from '../utils/layers.js';
import KpiCard from '../components/dashboard/KpiCard.jsx';
import Sparkline from '../components/dashboard/Sparkline.jsx';
import PhaseMeter from '../components/dashboard/PhaseMeter.jsx';
import ExplainButton from '../components/common/ExplainButton.jsx';
import { AnimatedNumber, Badge, Button, Skeleton, StatusDot } from '../components/ui/primitives.jsx';
import { fadeUp, stagger } from '../components/ui/motion.js';

const TONE_BADGE = { warm: 'warm', cool: 'cool', neutral: 'default' };

function IndexCard({ title, featureId, value, period, phaseText, tone, spark, loading, error, source, t }) {
  return (
    <m.section variants={fadeUp} className="glass relative shrink-0 overflow-hidden rounded-2xl p-4">
      <div className={cx('pointer-events-none absolute -end-10 -top-12 h-36 w-36 rounded-full blur-3xl', tone === 'warm' ? 'bg-orange-500/25' : tone === 'cool' ? 'bg-sky-500/25' : 'bg-slate-400/15')} />
      <div className="relative flex items-center justify-between gap-2">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">{title}</h3>
        <ExplainButton subject={{ kind: 'feature', id: featureId, title, breadcrumb: [t('nav.dashboard'), title] }} />
      </div>
      {loading ? (
        <div className="mt-3 space-y-3"><Skeleton className="h-9 w-32" /><Skeleton className="h-3 w-full" /><Skeleton className="h-12 w-full" /></div>
      ) : error ? (
        <p className="relative mt-3 text-xs text-muted">{t('analytics.unavailable')}</p>
      ) : (
        <>
          <div className="relative mt-2 flex items-end gap-3">
            <span className="font-display text-[34px] font-semibold leading-none text-strong">
              <AnimatedNumber value={value} decimals={2} signed />
              <span className="ms-1 text-base font-medium text-muted">°C</span>
            </span>
            <Badge tone={TONE_BADGE[tone]} className="mb-1">{phaseText}</Badge>
          </div>
          <p className="relative mt-1 text-[11px] text-muted">{t('analytics.period')}: {period} · {source}</p>
          <div className="relative mt-3"><PhaseMeter value={value} labels={featureId === 'oni' ? [t('phase.lanina'), t('phase.neutral'), t('phase.elnino')] : [t('phase.negIOD'), t('phase.neutral'), t('phase.posIOD')]} threshold={featureId === 'oni' ? 0.5 : 0.4} /></div>
          {spark?.length > 1 && <div className="relative mt-3"><Sparkline values={spark} threshold={featureId === 'oni' ? 0.5 : 0.4} /></div>}
        </>
      )}
    </m.section>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { t, lang } = useI18n();
  const catalog = useLayerCatalog();
  const { oni, dmi } = useSelector((s) => s.climate);
  const services = useSelector((s) => s.services);
  const mapStatus = useSelector((s) => s.map.status);
  const reduceMotion = useSelector((s) => s.ui.reduceMotion);
  const alerts = useSelector(selectAlerts);

  // The command-center globe slowly rotates behind the dashboard.
  useEffect(() => {
    if (!reduceMotion && mapStatus === 'ready' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) dispatch(setSpinning(true));
  }, [dispatch, mapStatus, reduceMotion]);

  const o = latestONI(oni.rows);
  const d = latestDMI(dmi.rows);
  const oc = o && classifyONI(o.anom);
  const dc = d && classifyDMI(d.value);
  const active = catalog.filter((l) => l.visible);
  const activeAlerts = alerts.filter((a) => a.severity !== 'info');

  const sources = useMemo(
    () => [
      { name: 'NASA GIBS', state: services.gibs },
      { name: 'NOAA CPC', state: oni.status === 'ready' ? 'online' : oni.status === 'error' ? 'offline' : 'checking' },
      { name: 'NOAA PSL', state: dmi.status === 'ready' ? 'online' : dmi.status === 'error' ? 'offline' : 'checking' },
      { name: 'Mapbox', state: mapStatus === 'ready' ? 'online' : mapStatus === 'no-token' || mapStatus === 'error' ? 'offline' : 'checking' },
      { name: 'GeoServer', state: services.geoserver },
    ],
    [services, oni.status, dmi.status, mapStatus],
  );
  const onlineSources = sources.filter((s) => s.state === 'online').length;
  const fetchedAt = [oni.fetchedAt, dmi.fetchedAt].filter(Boolean).sort().at(-1);
  const stateLabel = (s) => t({ online: 'state.online', offline: 'state.offline', notConfigured: 'state.notConfigured', ready: 'state.ready', loading: 'state.loading', idle: 'state.loading', error: 'state.error', 'no-token': 'state.notConfigured' }[s] || 'state.checking');

  const ensoPhase = oc ? `${oc.strength ? `${t(`phase.${oc.strength}`)} ` : ''}${t(`phase.${oc.phase}`)}` : '';

  return (
    <div className="pointer-events-auto h-full overflow-y-auto scrollbar-thin lg:pointer-events-none lg:overflow-hidden">
      <m.div variants={stagger(0.06)} initial="hidden" animate="show" className="flex min-h-full flex-col gap-3 p-3 md:p-4 lg:h-full">
        {/* Header + KPIs */}
        <div className="pointer-events-auto">
          <m.div variants={fadeUp} className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-xl font-semibold text-strong drop-shadow md:text-2xl">{t('dash.title')}</h1>
              <p className="max-w-xl text-xs text-[var(--text)] drop-shadow md:text-sm">{t('dash.subtitle')}</p>
            </div>
            <div className="flex items-center gap-2">
              <ExplainButton variant="pill" subject={{ kind: 'feature', id: 'dashboard', title: t('nav.dashboard'), breadcrumb: [t('nav.dashboard')] }} />
              <Link to="/map"><Button variant="primary" icon={MapIcon}>{t('dash.openMap')}</Button></Link>
            </div>
          </m.div>

          <m.div variants={stagger(0.05)} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            <KpiCard icon={Layers} tone="blue" label={t('kpi.totalLayers')} value={<AnimatedNumber value={catalog.length} />} sub={`${mapLayers.filter((l) => l.service === 'gibs').length} NASA GIBS · ${catalog.filter((l) => l.service === 'geoserver').length} GeoServer`} explainData={{ [t('kpi.totalLayers')]: catalog.length }} />
            <KpiCard icon={Eye} tone="cyan" label={t('kpi.activeLayers')} value={<AnimatedNumber value={active.length} />} sub={active.map((l) => l.short).join(' · ') || '—'} explainData={{ [t('kpi.activeLayers')]: active.map((l) => l.name).join(', ') || 'none' }} />
            <KpiCard icon={Server} tone={services.geoserver === 'online' ? 'green' : services.geoserver === 'offline' ? 'red' : 'slate'} label={t('kpi.geoserver')} value={<span className="flex items-center gap-2 text-base"><StatusDot state={services.geoserver} />{stateLabel(services.geoserver)}</span>} sub="WMS · WFS · WMTS" explainData={{ GeoServer: services.geoserver }} />
            <KpiCard icon={MapIcon} tone={mapStatus === 'ready' ? 'green' : mapStatus === 'loading' ? 'amber' : 'red'} label={t('kpi.mapStatus')} value={<span className="flex items-center gap-2 text-base"><StatusDot state={mapStatus} />{stateLabel(mapStatus)}</span>} sub="Mapbox GL JS v3" explainData={{ Map: mapStatus }} />
            <KpiCard icon={Bell} tone={activeAlerts.some((a) => a.severity === 'critical') ? 'red' : activeAlerts.length ? 'orange' : 'green'} label={t('kpi.alerts')} value={<AnimatedNumber value={activeAlerts.length} />} sub={activeAlerts[0] ? t(`alerts.severity.${activeAlerts[0].severity}`) : t('dash.noAlerts')} explainData={{ [t('kpi.alerts')]: activeAlerts.length }} />
            <KpiCard icon={Database} tone="purple" label={t('kpi.sources')} value={<span><AnimatedNumber value={onlineSources} /><span className="text-base text-muted"> / {sources.length}</span></span>} sub={<span className="flex gap-1.5">{sources.map((s) => <span key={s.name} title={`${s.name}: ${stateLabel(s.state)}`}><StatusDot state={s.state} pulse={false} /></span>)}</span>} explainData={Object.fromEntries(sources.map((s) => [s.name, s.state]))} />
            <KpiCard icon={Clock} tone="amber" label={t('kpi.updated')} value={<span className="text-lg">{fetchedAt ? new Date(fetchedAt).toLocaleTimeString(lang.code, { hour: '2-digit', minute: '2-digit' }) : '—'}</span>} sub={fetchedAt ? formatDateTime(fetchedAt, lang.code) : t('common.notAvailable')} explainData={{ [t('kpi.updated')]: fetchedAt || 'n/a', ONI: oniPeriod(o) || 'n/a', DMI: dmiPeriod(d) || 'n/a' }} />
          </m.div>
        </div>

        {/* Body: side columns, globe visible in the middle on large screens */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:justify-between">
          <m.div variants={stagger(0.08, 0.2)} className="pointer-events-auto flex w-full flex-col gap-3 lg:w-[300px] lg:overflow-y-auto lg:scrollbar-thin">
            <m.section variants={fadeUp} className="glass shrink-0 rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">{t('dash.quickLayers')}</h3>
                <Link to="/map" className="text-[11px] font-medium text-sky-400 hover:underline">{t('nav.layers')} →</Link>
              </div>
              <ul className="space-y-1">
                {catalog.slice(0, 7).map((l) => (
                  <li key={l.id}>
                    <button type="button" onClick={() => dispatch(toggleLayer(l.id))} aria-pressed={l.visible} className="flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-start transition hover:bg-[var(--glass-soft)]">
                      <span className="h-2.5 w-2.5 rounded-full transition-all" style={{ background: l.visible ? l.color : 'transparent', boxShadow: `inset 0 0 0 1.5px ${l.color}` }} />
                      <span className={cx('flex-1 truncate text-[13px]', l.visible ? 'text-strong' : 'text-muted')}>{layerLabel(t, l)}</span>
                      {l.visible ? <Eye className="h-3.5 w-3.5 text-sky-400" /> : <EyeOff className="h-3.5 w-3.5 text-muted" />}
                    </button>
                  </li>
                ))}
              </ul>
            </m.section>
            <m.section variants={fadeUp} className="glass shrink-0 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted"><Waves className="h-4 w-4 text-cyan-400" /> Niño 3.4 · IOD</div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--text)]">{mapLayers.find((l) => l.id === 'monitoring-regions').description}</p>
            </m.section>
          </m.div>

          <m.div variants={stagger(0.08, 0.25)} className="pointer-events-auto flex w-full flex-col gap-3 lg:w-[360px] lg:overflow-y-auto lg:scrollbar-thin">
            <IndexCard t={t} title={t('kpi.enso')} featureId="oni" value={o?.anom} period={oniPeriod(o)} phaseText={ensoPhase} tone={oc?.tone} spark={oni.rows.slice(-24).map((r) => r.anom)} loading={oni.status === 'loading' || oni.status === 'idle'} error={oni.status === 'error'} source="NOAA CPC" />
            <IndexCard t={t} title={t('kpi.iod')} featureId="dmi" value={d?.value} period={dmiPeriod(d)} phaseText={dc ? t(`phase.${dc.phase}`) : ''} tone={dc?.tone} spark={dmi.rows.slice(-24).map((r) => r.value)} loading={dmi.status === 'loading' || dmi.status === 'idle'} error={dmi.status === 'error'} source="NOAA PSL" />
            <m.section variants={fadeUp} className="glass shrink-0 rounded-2xl p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">{t('dash.latestAlerts')}</h3>
                <Link to="/alerts" className="inline-flex items-center gap-0.5 text-[11px] font-medium text-sky-400 hover:underline">{t('common.viewAll')} <ArrowUpRight className="h-3 w-3" /></Link>
              </div>
              {alerts.length === 0 ? (
                <p className="py-3 text-xs text-muted">{t('dash.noAlerts')}</p>
              ) : (
                <ul className="space-y-2">
                  {alerts.slice(0, 3).map((a) => (
                    <li key={a.id} className={cx('rounded-xl p-2.5 ring-1', SEVERITY_STYLE[a.severity].bg, SEVERITY_STYLE[a.severity].ring)}>
                      <p className={cx('text-[10.5px] font-semibold uppercase tracking-wider', SEVERITY_STYLE[a.severity].text)}>{t(`alerts.severity.${a.severity}`)}</p>
                      <p className="text-[12.5px] text-strong">{alertMessage(t, a)}</p>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 flex items-center gap-1.5 text-[10.5px] text-muted"><Activity className="h-3 w-3" /> {t('dash.dataNote')}</p>
            </m.section>
          </m.div>
        </div>
      </m.div>
    </div>
  );
}
