/** Pure helpers for the single Mapbox engine — no React, no Redux. */
import { buildWmsTileUrl, buildWmtsTileUrl } from '../../services/geoServer.js';

export const PREFIX = 'enso-';
export const TOOL_PREFIX = 'tool-';
export const sourceId = (id) => `${PREFIX}${id}`;

/** Mapbox layer ids that make up one catalogue layer. */
export function styleLayerIds(def) {
  if (def.type === 'geojson' || def.type === 'wfs') return [`${PREFIX}${def.id}-fill`, `${PREFIX}${def.id}-line`, `${PREFIX}${def.id}-point`, `${PREFIX}${def.id}-label`];
  return [`${PREFIX}${def.id}`];
}
export const interactiveLayerIds = (defs) => defs.filter((d) => d.type === 'geojson' || d.type === 'wfs').flatMap((d) => [`${PREFIX}${d.id}-fill`, `${PREFIX}${d.id}-point`]);

/** First symbol (label) layer of the basemap — data is drawn beneath it so place names stay readable. */
export function firstSymbolId(map) {
  return map.getStyle()?.layers?.find((l) => l.type === 'symbol' && !l.id.startsWith(PREFIX) && !l.id.startsWith(TOOL_PREFIX))?.id;
}

function addSourceAndLayers(map, def, state) {
  const src = sourceId(def.id);
  const vis = state.visible ? 'visible' : 'none';
  const before = firstSymbolId(map);

  if (def.type === 'wms' || def.type === 'wmts') {
    if (!map.getSource(src)) {
      const tiles = [def.type === 'wmts' ? buildWmtsTileUrl(def) : buildWmsTileUrl(def)];
      map.addSource(src, { type: 'raster', tiles, tileSize: 256, attribution: def.service === 'gibs' ? 'NASA GIBS' : def.source || '' });
    }
    if (!map.getLayer(src)) {
      map.addLayer({ id: src, type: 'raster', source: src, layout: { visibility: vis }, paint: { 'raster-opacity': state.opacity, 'raster-fade-duration': 250, 'raster-resampling': 'linear' } }, before);
    }
    return;
  }

  // Vector (static GeoJSON or WFS → GeoJSON)
  if (!map.getSource(src)) {
    map.addSource(src, { type: 'geojson', data: def.type === 'geojson' ? def.data : { type: 'FeatureCollection', features: [] }, generateId: def.type === 'wfs' });
  }
  const color = ['coalesce', ['get', 'color'], def.color || '#22d3ee'];
  const sel = ['boolean', ['feature-state', 'selected'], false];
  const hov = ['boolean', ['feature-state', 'hover'], false];
  const [fill, line, point, label] = styleLayerIds(def);
  if (!map.getLayer(fill)) {
    map.addLayer({
      id: fill, type: 'fill', source: src, filter: ['==', ['geometry-type'], 'Polygon'], layout: { visibility: vis },
      paint: { 'fill-color': color, 'fill-opacity': ['*', state.opacity, ['case', sel, 0.38, hov, 0.26, 0.14]] },
    }, before);
  }
  if (!map.getLayer(line)) {
    map.addLayer({
      id: line, type: 'line', source: src, filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'LineString']]], layout: { visibility: vis, 'line-join': 'round' },
      paint: { 'line-color': color, 'line-width': ['case', sel, 3, hov, 2.2, 1.4], 'line-opacity': state.opacity },
    }, before);
  }
  if (!map.getLayer(point)) {
    map.addLayer({
      id: point, type: 'circle', source: src, filter: ['==', ['geometry-type'], 'Point'], layout: { visibility: vis },
      paint: { 'circle-color': color, 'circle-radius': ['case', sel, 8, 5], 'circle-stroke-color': '#fff', 'circle-stroke-width': 1.5, 'circle-opacity': state.opacity },
    }, before);
  }
  if (!map.getLayer(label) && map.getStyle()?.glyphs) {
    map.addLayer({
      id: label, type: 'symbol', source: src, filter: ['==', ['geometry-type'], 'Polygon'],
      layout: { visibility: vis, 'text-field': ['get', 'name'], 'text-size': 11, 'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'], 'text-allow-overlap': false },
      paint: { 'text-color': color, 'text-halo-color': 'rgba(5,10,20,0.85)', 'text-halo-width': 1.4, 'text-opacity': state.opacity },
    });
  }
}

function applyState(map, def, state) {
  const vis = state.visible ? 'visible' : 'none';
  for (const id of styleLayerIds(def)) {
    const layer = map.getLayer(id);
    if (!layer) continue;
    if (map.getLayoutProperty(id, 'visibility') !== vis) map.setLayoutProperty(id, 'visibility', vis);
    if (layer.type === 'raster') map.setPaintProperty(id, 'raster-opacity', state.opacity);
    if (layer.type === 'line') map.setPaintProperty(id, 'line-opacity', state.opacity);
    if (layer.type === 'circle') map.setPaintProperty(id, 'circle-opacity', state.opacity);
    if (layer.type === 'symbol') map.setPaintProperty(id, 'text-opacity', state.opacity);
    if (layer.type === 'fill') {
      map.setPaintProperty(id, 'fill-opacity', ['*', state.opacity, ['case', ['boolean', ['feature-state', 'selected'], false], 0.38, ['boolean', ['feature-state', 'hover'], false], 0.26, 0.14]]);
    }
  }
}

/**
 * Reconcile Mapbox with the catalogue state. Sources are created lazily — a layer
 * that has never been switched on never downloads a single tile.
 */
export function syncLayers(map, defs, layerState, order) {
  if (!map?.isStyleLoaded()) return;
  for (const def of defs) {
    const state = layerState[def.id];
    if (!state) continue;
    const exists = map.getSource(sourceId(def.id));
    if (!exists && !state.visible) continue;
    try {
      if (!exists) addSourceAndLayers(map, def, state);
      applyState(map, def, state);
    } catch (err) {
      console.warn(`[map] could not sync layer ${def.id}`, err);
    }
  }
  syncOrder(map, defs, order);
}

/** order[0] is the top-most data layer. Tool overlays always stay above data. */
export function syncOrder(map, defs, order) {
  const before = firstSymbolId(map);
  const byId = new Map(defs.map((d) => [d.id, d]));
  for (const id of [...order].reverse()) {
    const def = byId.get(id);
    if (!def) continue;
    for (const lid of styleLayerIds(def)) {
      if (map.getLayer(lid) && !lid.endsWith('-label')) map.moveLayer(lid, before);
    }
  }
  for (const l of map.getStyle()?.layers || []) {
    if (l.id.startsWith(TOOL_PREFIX) || (l.id.startsWith(PREFIX) && l.id.endsWith('-label'))) map.moveLayer(l.id);
  }
}

export function removeLayer(map, def) {
  for (const id of styleLayerIds(def)) if (map.getLayer(id)) map.removeLayer(id);
  if (map.getSource(sourceId(def.id))) map.removeSource(sourceId(def.id));
}

export function applyAtmosphere(map, { theme, projection }) {
  if (projection !== 'globe') {
    map.setFog(null);
    return;
  }
  map.setFog(
    theme === 'light'
      ? { color: 'rgb(220, 232, 248)', 'high-color': 'rgb(150, 190, 240)', 'horizon-blend': 0.05, 'space-color': 'rgb(196, 214, 240)', 'star-intensity': 0 }
      : { color: 'rgb(12, 24, 48)', 'high-color': 'rgb(36, 92, 178)', 'horizon-blend': 0.06, 'space-color': 'rgb(4, 8, 18)', 'star-intensity': 0.55 },
  );
}

export function applyTerrain(map, enabled) {
  if (enabled) {
    if (!map.getSource('mapbox-dem')) map.addSource('mapbox-dem', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 });
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.4 });
  } else {
    map.setTerrain(null);
  }
}

/* ───────── Geodesy (used by the measure tool) ───────── */
const R = 6371.0088; // mean Earth radius, km
const rad = (d) => (d * Math.PI) / 180;

export function haversineKm([lon1, lat1], [lon2, lat2]) {
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

export const pathLengthKm = (pts) => pts.slice(1).reduce((sum, p, i) => sum + haversineKm(pts[i], p), 0);

/** Spherical polygon area (km²) — same approach as turf/area. */
export function polygonAreaKm2(pts) {
  if (pts.length < 3) return 0;
  const ring = [...pts, pts[0]];
  let total = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [lon1, lat1] = ring[i];
    const [lon2, lat2] = ring[i + 1];
    total += rad(lon2 - lon1) * (2 + Math.sin(rad(lat1)) + Math.sin(rad(lat2)));
  }
  return Math.abs((total * R * R) / 2);
}
