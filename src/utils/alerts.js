import { createSelector } from '@reduxjs/toolkit';
import { mapLayers } from '../config/mapLayers.js';
import { classifyDMI, classifyONI, dmiPeriod, fmtSigned, latestDMI, latestONI, oniPeriod } from './climate.js';

export const SEVERITY_ORDER = { critical: 0, warning: 1, watch: 2, info: 3 };

/** Alerts are derived from data on every change — never stored or invented. */
export const selectAlerts = createSelector(
  [(s) => s.climate, (s) => s.services, (s) => s.map.layerErrors, (s) => s.map.customLayers],
  (climate, services, layerErrors, customLayers) => {
    const out = [];

    const oni = latestONI(climate.oni.rows);
    if (oni) {
      const c = classifyONI(oni.anom);
      const a = Math.abs(oni.anom);
      const severity = a >= 1.5 ? 'critical' : a >= 1 ? 'warning' : a >= 0.5 ? 'watch' : 'info';
      out.push({
        id: `enso-${oni.season}-${oni.year}`, kind: 'enso', severity, period: oniPeriod(oni), source: 'NOAA CPC — ONI',
        msgKey: c.phase === 'neutral' ? 'alerts.msg.ensoNeutral' : 'alerts.msg.enso',
        params: { value: fmtSigned(oni.anom, 2), period: oniPeriod(oni) }, phaseKey: `phase.${c.phase}`, strengthKey: c.strength && `phase.${c.strength}`,
      });
    }

    const dmi = latestDMI(climate.dmi.rows);
    if (dmi) {
      const c = classifyDMI(dmi.value);
      const a = Math.abs(dmi.value);
      const severity = a >= 0.8 ? 'warning' : a >= 0.4 ? 'watch' : 'info';
      out.push({
        id: `iod-${dmi.year}-${dmi.month}`, kind: 'iod', severity, period: dmiPeriod(dmi), source: 'NOAA PSL — DMI (HadISST)',
        msgKey: c.phase === 'neutral' ? 'alerts.msg.iodNeutral' : 'alerts.msg.iod',
        params: { value: fmtSigned(dmi.value, 2), period: dmiPeriod(dmi) }, phaseKey: `phase.${c.phase}`,
      });
    }

    if (climate.oni.status === 'error' && climate.dmi.status === 'error') {
      out.push({ id: 'feed-down', kind: 'service', severity: 'warning', msgKey: 'alerts.msg.dataUnavailable', params: {}, source: 'API' });
    }

    for (const [key, label] of [['gibs', 'NASA GIBS'], ['geoserver', 'GeoServer']]) {
      if (services[key] === 'offline') {
        out.push({ id: `svc-${key}-${services.checkedAt}`, kind: 'service', severity: 'warning', msgKey: 'alerts.msg.serviceDown', params: { service: label }, source: label, at: services.checkedAt });
      }
    }

    const allLayers = [...mapLayers, ...customLayers];
    for (const id of Object.keys(layerErrors)) {
      const layer = allLayers.find((l) => l.id === id);
      if (layer) out.push({ id: `tiles-${id}`, kind: 'layer', severity: 'info', msgKey: 'alerts.msg.layerError', params: { layer: layer.name }, layerId: id, source: layer.source || 'WMS' });
    }

    return out.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  },
);

export const SEVERITY_STYLE = {
  critical: { dot: 'bg-red-500', text: 'text-red-400', ring: 'ring-red-500/40', bg: 'bg-red-500/12' },
  warning: { dot: 'bg-orange-500', text: 'text-orange-400', ring: 'ring-orange-500/40', bg: 'bg-orange-500/12' },
  watch: { dot: 'bg-amber-400', text: 'text-amber-400', ring: 'ring-amber-400/40', bg: 'bg-amber-400/12' },
  info: { dot: 'bg-sky-400', text: 'text-sky-400', ring: 'ring-sky-400/40', bg: 'bg-sky-400/12' },
};

/** Localised alert sentence. */
export const alertMessage = (t, a) =>
  t(a.msgKey, { ...a.params, phase: a.phaseKey ? `${a.strengthKey ? `${t(a.strengthKey)} ` : ''}${t(a.phaseKey)}` : '' });
