import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { m } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider.jsx';
import { useLayerCatalog } from '../hooks/useLayerCatalog.js';
import { mapService } from '../services/mapService.js';
import { alertMessage, selectAlerts } from '../utils/alerts.js';
import { classifyDMI, classifyONI, dmiPeriod, fmtSigned, latestDMI, latestONI, oniPeriod } from '../utils/climate.js';
import { downloadFile, formatDateTime } from '../utils/format.js';
import { layerLabel } from '../utils/layers.js';
import { Markdown } from '../utils/markdown.jsx';
import ExplainButton from '../components/common/ExplainButton.jsx';
import { Button, PageHeader, Switch } from '../components/ui/primitives.jsx';
import { fadeUp, stagger } from '../components/ui/motion.js';

export default function Reports() {
  const { t, lang } = useI18n();
  const { oni, dmi } = useSelector((s) => s.climate);
  const basemap = useSelector((s) => s.map.basemap);
  const alerts = useSelector(selectAlerts);
  const active = useLayerCatalog().filter((l) => l.visible);
  const [opts, setOpts] = useState({ indices: true, layers: true, alerts: true, view: true });
  const [generatedAt] = useState(() => new Date().toISOString());

  const markdown = useMemo(() => {
    const o = latestONI(oni.rows);
    const d = latestDMI(dmi.rows);
    const lines = [`# ${t('app.name')} — ${t('reports.title')}`, '', `**${t('reports.generated')}:** ${formatDateTime(generatedAt, lang.code)}  `, `**${t('reports.preparedBy')}:** NDMA · G-11`, ''];
    if (opts.indices) {
      lines.push(`## ${t('reports.sections.indices')}`);
      if (o) {
        const c = classifyONI(o.anom);
        lines.push(`- **ONI** (${oniPeriod(o)}): ${fmtSigned(o.anom)} °C — ${c.strength ? `${t(`phase.${c.strength}`)} ` : ''}${t(`phase.${c.phase}`)} · NOAA CPC`);
      } else lines.push(`- **ONI**: ${t('common.notAvailable')}`);
      if (d) lines.push(`- **DMI** (${dmiPeriod(d)}): ${fmtSigned(d.value)} °C — ${t(`phase.${classifyDMI(d.value).phase}`)} · NOAA PSL`);
      else lines.push(`- **DMI**: ${t('common.notAvailable')}`);
      const last4 = oni.rows.slice(-4).map((r) => `${oniPeriod(r)} ${fmtSigned(r.anom)}`).join(' → ');
      if (last4) lines.push(`- ONI trend: ${last4}`);
      lines.push('');
    }
    if (opts.layers) {
      lines.push(`## ${t('reports.sections.layers')}`);
      if (active.length) active.forEach((l) => lines.push(`- **${layerLabel(t, l)}** — ${l.source || l.service} (${t('layers.opacity')} ${Math.round(l.opacity * 100)}%)`));
      else lines.push(`- ${t('legend.empty')}`);
      lines.push('');
    }
    if (opts.alerts) {
      lines.push(`## ${t('reports.sections.alerts')}`);
      if (alerts.length) alerts.forEach((a) => lines.push(`- **${t(`alerts.severity.${a.severity}`)}** — ${alertMessage(t, a)}`));
      else lines.push(`- ${t('dash.noAlerts')}`);
      lines.push('');
    }
    if (opts.view) {
      const v = mapService.getViewContext();
      lines.push(`## ${t('reports.sections.view')}`);
      lines.push(`- ${t('basemap.title')}: ${t(`basemap.${basemap === 'satellite-streets' ? 'satelliteStreets' : basemap}`)}`);
      if (v) lines.push(`- Center: ${v.center[1]}°, ${v.center[0]}° · ${t('status.zoom')} ${v.zoom}`);
      lines.push('');
    }
    lines.push('---', 'Data: NOAA CPC (ONI), NOAA PSL (DMI/HadISST), NASA GIBS (map layers). Basemap © Mapbox © OpenStreetMap.');
    return lines.join('\n');
  }, [oni.rows, dmi.rows, active, alerts, opts, basemap, t, lang.code, generatedAt]);

  const exportCsv = () => {
    const rows = ['index,period,year,value_c'];
    oni.rows.forEach((r) => rows.push(`ONI,${r.season},${r.year},${r.anom}`));
    dmi.rows.forEach((r) => rows.push(`DMI,${String(r.month).padStart(2, '0')},${r.year},${r.value}`));
    downloadFile(`enso-indices-${generatedAt.slice(0, 10)}.csv`, rows.join('\n'), 'text/csv');
  };

  return (
    <m.div variants={stagger(0.07)} initial="hidden" animate="show" className="mx-auto max-w-7xl space-y-5 p-4 md:p-8">
      <PageHeader
        icon={FileText}
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        actions={<ExplainButton variant="pill" subject={{ kind: 'feature', id: 'reports', title: t('reports.title'), breadcrumb: [t('nav.reports')] }} />}
      />
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <m.aside variants={fadeUp} className="glass h-fit space-y-5 rounded-3xl p-5">
          <div>
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{t('reports.options')}</h2>
            <ul className="space-y-1">
              {Object.keys(opts).map((k) => (
                <li key={k}>
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-2 hover:bg-[var(--glass-soft)]">
                    <span className="text-sm text-strong">{t(`reports.sections.${k}`)}</span>
                    <Switch checked={opts[k]} onChange={(v) => setOpts((o) => ({ ...o, [k]: v }))} label={t(`reports.sections.${k}`)} />
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-2">
            <Button variant="primary" icon={Download} onClick={() => downloadFile(`enso-situation-report-${generatedAt.slice(0, 10)}.md`, markdown, 'text/markdown')}>{t('reports.exportMd')}</Button>
            <Button icon={FileSpreadsheet} onClick={exportCsv} disabled={!oni.rows.length && !dmi.rows.length}>{t('reports.exportCsv')}</Button>
            <Button icon={Printer} onClick={() => window.print()}>{t('reports.print')}</Button>
          </div>
        </m.aside>

        <m.article variants={fadeUp} className="glass rounded-3xl p-2">
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{t('reports.preview')}</span>
            <span className="font-mono text-[11px] text-muted">.md</span>
          </div>
          <div id="print-report" className="rounded-2xl bg-[var(--glass-soft)] p-6 text-sm ring-1 ring-[var(--border)] md:p-8 [&_h1]:font-display [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-strong [&_h4]:mt-4 [&_h4]:font-display [&_h4]:text-base">
            <Markdown text={markdown} />
          </div>
        </m.article>
      </div>
    </m.div>
  );
}
