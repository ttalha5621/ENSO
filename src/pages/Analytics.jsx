import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, m } from 'framer-motion';
import { ChartLine, ExternalLink, Maximize2, RefreshCw, Thermometer, Waves, X } from 'lucide-react';
import { fetchDMI, fetchONI } from '../store/slices/climateSlice.js';
import { useI18n } from '../i18n/I18nProvider.jsx';
import { classifyDMI, classifyONI, dmiPeriod, dmiSeries, fmtSigned, oniPeriod, oniSeries } from '../utils/climate.js';
import AnomalyChart from '../components/common/AnomalyChart.jsx';
import ExplainButton from '../components/common/ExplainButton.jsx';
import { Badge, Button, GlassCard, PageHeader, Segmented, SectionTitle, Skeleton } from '../components/ui/primitives.jsx';
import { fadeUp, stagger } from '../components/ui/motion.js';
import mjoImg from '../assets/mjo.webp';
import plumeImg from '../assets/iod-plume.webp';
import probImg from '../assets/iod-probability.webp';

const RANGES = [5, 10, 30, 0];

function Stat({ label, value, sub, tone }) {
  return (
    <div className="rounded-xl bg-[var(--glass-soft)] p-3 ring-1 ring-[var(--border)]">
      <p className="text-[11px] text-muted">{label}</p>
      <p className={`whitespace-nowrap font-mono text-base font-semibold xl:text-lg ${tone === 'warm' ? 'text-orange-400' : tone === 'cool' ? 'text-sky-400' : 'text-strong'}`}>{value}</p>
      {sub && <p className="truncate text-[10.5px] text-muted">{sub}</p>}
    </div>
  );
}

function IndexPanel({ title, icon, featureId, rows, status, toSeries, classify, period, valueOf, threshold, source, onRetry }) {
  const { t } = useI18n();
  const [years, setYears] = useState(10);
  const series = useMemo(() => {
    const all = toSeries(rows);
    if (!years || !all.length) return all;
    const cutoff = all[all.length - 1].t - years;
    return all.filter((d) => d.t >= cutoff);
  }, [rows, years, toSeries]);

  const latest = rows.at(-1);
  const cls = latest && classify(valueOf(latest));
  const peak = series.reduce((a, b) => (b.v > (a?.v ?? -Infinity) ? b : a), null);
  const low = series.reduce((a, b) => (b.v < (a?.v ?? Infinity) ? b : a), null);

  return (
    <MotionSection>
      <SectionTitle
        icon={icon}
        title={title}
        subtitle={source}
        tone={cls?.tone === 'warm' ? 'warm' : 'sky'}
        action={<ExplainButton subject={{ kind: 'feature', id: featureId, title, breadcrumb: [t('nav.analytics'), title] }} />}
      />
      {status === 'ready' ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            <Stat label={t('analytics.latest')} value={`${fmtSigned(valueOf(latest))} °C`} sub={period(latest)} tone={cls?.tone} />
            <Stat label={featureId === 'oni' ? t('kpi.enso') : t('kpi.iod')} value={<span className="font-sans text-base">{t(`phase.${cls.phase}`)}</span>} sub={cls.strength ? t(`phase.${cls.strength}`) : `±${threshold} °C`} tone={cls.tone} />
            <Stat label={t('analytics.peak')} value={`${fmtSigned(peak?.v)} °C`} sub={peak?.label} tone="warm" />
            <Stat label={t('analytics.low')} value={`${fmtSigned(low?.v)} °C`} sub={low?.label} tone="cool" />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <Segmented size="sm" label={t('analytics.range')} value={years} onChange={setYears} options={RANGES.map((y) => ({ value: y, label: y ? t('analytics.years', { n: y }) : t('analytics.all') }))} />
            <span className="flex items-center gap-3 text-[11px] text-muted">
              <span className="flex items-center gap-1"><span className="h-0.5 w-4 border-t border-dashed border-orange-400" /> +{threshold}</span>
              <span className="flex items-center gap-1"><span className="h-0.5 w-4 border-t border-dashed border-sky-400" /> −{threshold}</span>
            </span>
          </div>
          <div className="mt-3">
            <AnomalyChart key={years} series={series} threshold={threshold} ariaLabel={title} />
          </div>
        </>
      ) : status === 'error' ? (
        <div className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
          <p className="max-w-sm text-sm text-muted">{t('analytics.unavailable')}</p>
          <Button size="sm" icon={RefreshCw} onClick={onRetry}>{t('common.retry')}</Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
          <Skeleton className="h-64" />
        </div>
      )}
    </MotionSection>
  );
}

const MotionSection = ({ children }) => (
  <m.section variants={fadeUp} className="glass rounded-3xl p-4 md:p-5">
    {children}
  </m.section>
);

export default function Analytics() {
  const dispatch = useDispatch();
  const { t } = useI18n();
  const { oni, dmi } = useSelector((s) => s.climate);
  const [lightbox, setLightbox] = useState(null);

  const products = [
    { id: 'plume', src: plumeImg, title: t('analytics.iodPlume') },
    { id: 'prob', src: probImg, title: t('analytics.iodProb') },
    { id: 'mjo', src: mjoImg, title: t('analytics.mjo') },
  ];

  return (
    <m.div variants={stagger(0.08)} initial="hidden" animate="show" className="mx-auto max-w-7xl space-y-5 p-4 md:p-8">
      <PageHeader icon={ChartLine} title={t('analytics.title')} subtitle={t('analytics.subtitle')} actions={<ExplainButton variant="pill" subject={{ kind: 'feature', id: 'analytics', title: t('analytics.title'), breadcrumb: [t('nav.analytics')] }} />} />

      <div className="grid gap-5 xl:grid-cols-2">
        <IndexPanel title={t('analytics.oniTitle')} icon={Thermometer} featureId="oni" rows={oni.rows} status={oni.status} toSeries={oniSeries} classify={classifyONI} period={oniPeriod} valueOf={(r) => r.anom} threshold={0.5} source="NOAA CPC · Niño 3.4 · ERSSTv5" onRetry={() => dispatch(fetchONI())} />
        <IndexPanel title={t('analytics.dmiTitle')} icon={Waves} featureId="dmi" rows={dmi.rows} status={dmi.status} toSeries={dmiSeries} classify={classifyDMI} period={dmiPeriod} valueOf={(r) => r.value} threshold={0.4} source="NOAA PSL · HadISST" onRetry={() => dispatch(fetchDMI())} />
      </div>

      <m.section variants={fadeUp}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-strong">{t('analytics.forecasts')}</h2>
          <Badge tone="sky">NDMA</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {products.map((p) => (
            <GlassCard key={p.id} as={m.button} type="button" whileHover={{ y: -4 }} onClick={() => setLightbox(p)} className="group overflow-hidden text-start">
              <div className="relative aspect-video overflow-hidden bg-white">
                <img src={p.src} alt={p.title} loading="lazy" decoding="async" className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]" />
                <span className="absolute end-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-black/50 text-white opacity-0 transition group-hover:opacity-100"><Maximize2 className="h-4 w-4" /></span>
              </div>
              <p className="px-4 py-3 text-sm font-medium text-strong">{p.title}</p>
            </GlassCard>
          ))}
        </div>
      </m.section>

      <AnimatePresence>
        {lightbox && (
          <m.div className="fixed inset-0 z-[90] grid place-items-center bg-black/75 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label={lightbox.title}>
            <m.figure initial={{ scale: 0.92, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} className="glass-strong relative max-h-full max-w-5xl overflow-hidden rounded-3xl" onClick={(e) => e.stopPropagation()}>
              <img src={lightbox.src} alt={lightbox.title} className="max-h-[80vh] w-full bg-white object-contain" />
              <figcaption className="flex items-center justify-between gap-3 px-5 py-3">
                <span className="font-medium text-strong">{lightbox.title}</span>
                <span className="flex gap-1">
                  <a href={lightbox.src} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[var(--glass-hover)]" aria-label={t('viewers.openNew')}><ExternalLink className="h-4 w-4" /></a>
                  <button type="button" autoFocus onClick={() => setLightbox(null)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[var(--glass-hover)]" aria-label={t('common.close')}><X className="h-4 w-4" /></button>
                </span>
              </figcaption>
            </m.figure>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
}
