import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, m } from 'framer-motion';
import { Bell, CheckCheck, CircleCheck, Layers, Server, Thermometer, Waves } from 'lucide-react';
import { markAlertsRead } from '../store/slices/uiSlice.js';
import { useI18n } from '../i18n/I18nProvider.jsx';
import { getFeature } from '../config/aiFeatures.js';
import { alertMessage, selectAlerts, SEVERITY_STYLE } from '../utils/alerts.js';
import { cx, formatDateTime } from '../utils/format.js';
import ExplainButton from '../components/common/ExplainButton.jsx';
import { Button, PageHeader, Segmented } from '../components/ui/primitives.jsx';
import { fadeUp, stagger } from '../components/ui/motion.js';

const KIND_ICON = { enso: Thermometer, iod: Waves, service: Server, layer: Layers };
const SEVERITIES = ['critical', 'warning', 'watch', 'info'];

export default function Alerts() {
  const dispatch = useDispatch();
  const { t, lang } = useI18n();
  const alerts = useSelector(selectAlerts);
  const read = useSelector((s) => s.ui.readAlertIds);
  const [filter, setFilter] = useState('all');
  const list = useMemo(() => (filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter)), [alerts, filter]);
  const counts = useMemo(() => alerts.reduce((acc, a) => ({ ...acc, [a.severity]: (acc[a.severity] || 0) + 1 }), {}), [alerts]);

  return (
    <m.div variants={stagger(0.06)} initial="hidden" animate="show" className="mx-auto max-w-5xl space-y-5 p-4 md:p-8">
      <PageHeader
        icon={Bell}
        title={t('alerts.title')}
        subtitle={t('alerts.subtitle')}
        actions={
          <>
            <ExplainButton variant="pill" subject={{ kind: 'feature', id: 'alerts', title: t('alerts.title'), breadcrumb: [t('nav.alerts')] }} />
            <Button size="sm" icon={CheckCheck} onClick={() => dispatch(markAlertsRead(alerts.map((a) => a.id)))}>{t('alerts.markAllRead')}</Button>
          </>
        }
      />

      <m.div variants={fadeUp} className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {SEVERITIES.map((sev) => (
          <button key={sev} type="button" onClick={() => setFilter(filter === sev ? 'all' : sev)} aria-pressed={filter === sev} className={cx('glass rounded-2xl p-4 text-start transition hover:-translate-y-0.5', filter === sev && `ring-2 ${SEVERITY_STYLE[sev].ring}`)}>
            <span className="flex items-center gap-2">
              <span className={cx('h-2.5 w-2.5 rounded-full', SEVERITY_STYLE[sev].dot)} />
              <span className={cx('text-xs font-semibold uppercase tracking-wider', SEVERITY_STYLE[sev].text)}>{t(`alerts.severity.${sev}`)}</span>
            </span>
            <span className="mt-2 block font-display text-3xl font-semibold text-strong">{counts[sev] || 0}</span>
          </button>
        ))}
      </m.div>

      <m.div variants={fadeUp} className="flex justify-end">
        <Segmented size="sm" label={t('alerts.title')} value={filter} onChange={setFilter} options={[{ value: 'all', label: t('common.all') }, ...SEVERITIES.map((s) => ({ value: s, label: t(`alerts.severity.${s}`) }))]} />
      </m.div>

      <m.ul variants={fadeUp} className="space-y-3">
        <AnimatePresence mode="popLayout">
          {list.length === 0 && (
            <m.li key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass flex flex-col items-center gap-2 rounded-3xl py-14 text-center">
              <CircleCheck className="h-10 w-10 text-emerald-400" />
              <p className="text-sm text-muted">{t('alerts.none')}</p>
            </m.li>
          )}
          {list.map((a) => {
            const s = SEVERITY_STYLE[a.severity];
            const Icon = KIND_ICON[a.kind] || Bell;
            const unread = !read.includes(a.id);
            return (
              <m.li
                key={a.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className={cx('glass relative overflow-hidden rounded-2xl p-4 ring-1', s.ring)}
                onMouseEnter={() => unread && dispatch(markAlertsRead([a.id]))}
              >
                <span className={cx('absolute inset-y-0 start-0 w-1', s.dot)} />
                <div className="flex items-start gap-4 ps-2">
                  <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl', s.bg, s.text)}><Icon className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cx('text-[11px] font-semibold uppercase tracking-wider', s.text)}>{t(`alerts.severity.${a.severity}`)}</span>
                      {unread && <span className="rounded-full bg-sky-500/15 px-1.5 text-[10px] font-semibold text-sky-300">{t('common.new')}</span>}
                    </div>
                    <p className="mt-1 text-[14px] text-strong">{alertMessage(t, a)}</p>
                    <p className="mt-1.5 text-[11px] text-muted">
                      {a.period && <>{t('alerts.dataPeriod')}: <span className="font-mono">{a.period}</span> · </>}
                      {a.at && <>{formatDateTime(a.at, lang.code)} · </>}
                      {t('common.source')}: {a.source}
                    </p>
                  </div>
                  <ExplainButton
                    subject={{
                      kind: 'kpi', id: a.id, featureId: 'alerts', title: `${t(`alerts.severity.${a.severity}`)} — ${a.period || a.source}`,
                      data: { alert: alertMessage(t, a), severity: a.severity, source: a.source },
                      breadcrumb: [t('nav.alerts'), t(`alerts.severity.${a.severity}`)],
                    }}
                  />
                </div>
              </m.li>
            );
          })}
        </AnimatePresence>
      </m.ul>

      <m.section variants={fadeUp} className="glass rounded-3xl p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{t('alerts.rules')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text)]">{getFeature('alerts').howItWorks}</p>
      </m.section>
    </m.div>
  );
}
