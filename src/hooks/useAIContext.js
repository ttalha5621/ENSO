import { useCallback } from 'react';
import { useStore } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getFeature } from '../config/aiFeatures.js';
import { mapLayers } from '../config/mapLayers.js';
import { mapService } from '../services/mapService.js';
import { classifyDMI, classifyONI, dmiPeriod, latestDMI, latestONI, oniPeriod } from '../utils/climate.js';

const describeLayer = (l, state) => ({
  name: l.name,
  type: l.type?.toUpperCase(),
  service: l.service === 'gibs' ? 'NASA GIBS WMS' : l.service === 'geoserver' ? 'GeoServer' : 'Static GeoJSON',
  serviceLayer: l.layer || l.typeName || undefined,
  description: l.description || l.abstract || undefined,
  source: l.source || undefined,
  legend: l.legend ? `${l.legend.min} → ${l.legend.max}` : undefined,
  opacity: state?.opacity,
  visible: state?.visible,
});

/**
 * Builds the structured context the AI receives. Reads the store lazily
 * (no subscription) so it never causes re-renders and never fires requests by itself.
 */
export function useAIContext() {
  const store = useStore();
  const { pathname } = useLocation();

  return useCallback(
    (subject) => {
      const s = store.getState();
      const all = [...mapLayers, ...s.map.customLayers];
      const active = s.map.order
        .map((id) => all.find((l) => l.id === id))
        .filter((l) => l && s.map.layers[l.id]?.visible)
        .map((l) => describeLayer(l, s.map.layers[l.id]));

      const oni = latestONI(s.climate.oni.rows);
      const dmi = latestDMI(s.climate.dmi.rows);

      const ctx = {
        application: 'NDMA ENSO Command Center',
        page: pathname,
        breadcrumb: subject?.breadcrumb,
        map: {
          basemap: s.map.basemap,
          projection: s.map.projection,
          terrain3D: s.map.terrain,
          view: mapService.getViewContext(),
          activeLayers: active,
          availableControls: ['zoom', 'compass', 'fullscreen', 'locate', 'globe/flat projection', '3D terrain', 'auto-rotate', 'measure distance/area', 'cursor coordinates', 'place search', 'quick views'],
        },
        climateIndices: {
          ONI: oni ? { period: oniPeriod(oni), anomalyC: oni.anom, phase: classifyONI(oni.anom)?.phase, source: 'NOAA CPC' } : 'not available',
          DMI: dmi ? { period: dmiPeriod(dmi), valueC: dmi.value, phase: classifyDMI(dmi.value)?.phase, source: 'NOAA PSL (HadISST)' } : 'not available',
        },
        services: { nasaGibs: s.services.gibs, geoServer: s.services.geoserver },
      };

      if (subject?.kind === 'feature') ctx.feature = getFeature(subject.id) || { title: subject.title };
      if (subject?.kind === 'layer') {
        const l = all.find((x) => x.id === subject.id);
        if (l) ctx.layer = describeLayer(l, s.map.layers[l.id]);
      }
      if (subject?.kind === 'selection') ctx.selectedFeature = subject.properties;
      if (subject?.kind === 'kpi') ctx.kpi = subject.data;
      return ctx;
    },
    [store, pathname],
  );
}
