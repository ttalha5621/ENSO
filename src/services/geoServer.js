/**
 * OGC service helpers (WMS / WMTS / WFS / GetCapabilities).
 * Used for both NASA GIBS and the optional GeoServer — no map code lives here.
 */
import axios from 'axios';
import { ENV } from '../config/env.js';
import { GIBS_WMS } from '../config/mapLayers.js';

export const geoServerBase = () => ENV.GEOSERVER_URL;

/** Mapbox raster tile template for a WMS GetMap request in EPSG:3857. */
export function buildWmsTileUrl({ service, layer, url, workspace, style = '', format = 'image/png', time }) {
  const base = service === 'gibs' ? GIBS_WMS : url || `${geoServerBase()}/${workspace ? `${workspace}/` : ''}wms`;
  const params = new URLSearchParams({
    SERVICE: 'WMS', REQUEST: 'GetMap', VERSION: '1.3.0', LAYERS: workspace && service !== 'gibs' && !layer.includes(':') ? `${workspace}:${layer}` : layer,
    STYLES: style, FORMAT: format, TRANSPARENT: 'true', WIDTH: '256', HEIGHT: '256', CRS: 'EPSG:3857',
  });
  if (time) params.set('TIME', time);
  return `${base}?${params.toString()}&BBOX={bbox-epsg-3857}`;
}

/** Mapbox raster template for GeoServer's GeoWebCache WMTS (REST style), when available. */
export function buildWmtsTileUrl({ layer, workspace, gridset = 'EPSG:900913', format = 'image/png' }) {
  const name = workspace && !layer.includes(':') ? `${workspace}:${layer}` : layer;
  return `${geoServerBase()}/gwc/service/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${encodeURIComponent(name)}&STYLE=&TILEMATRIXSET=${gridset}&TILEMATRIX=${gridset}:{z}&TILEROW={y}&TILECOL={x}&FORMAT=${encodeURIComponent(format)}`;
}

/** WMS GetLegendGraphic URL for GeoServer layers. */
export function buildLegendUrl({ layer, workspace }) {
  const name = workspace && !layer.includes(':') ? `${workspace}:${layer}` : layer;
  return `${geoServerBase()}/wms?SERVICE=WMS&REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&LAYER=${encodeURIComponent(name)}&LEGEND_OPTIONS=fontColor:0xFFFFFF;fontAntiAliasing:true;bgColor:0x0B1220`;
}

/** WFS GetFeature as GeoJSON, filtered server-side by bbox and capped by count. */
export async function getFeatures({ typeName, bbox, maxFeatures = 2000, signal }) {
  const params = new URLSearchParams({
    service: 'WFS', version: '2.0.0', request: 'GetFeature', typeNames: typeName, outputFormat: 'application/json',
    srsName: 'EPSG:4326', count: String(maxFeatures),
  });
  if (bbox) params.set('bbox', `${bbox.join(',')},EPSG:4326`);
  const { data } = await axios.get(`${geoServerBase()}/wfs?${params}`, { signal, timeout: 20000 });
  return data;
}

const capsCache = new Map();
/** Parse WMS GetCapabilities into plain metadata objects (cached per URL). */
export async function getWmsCapabilities({ url = `${geoServerBase()}/wms`, signal } = {}) {
  if (capsCache.has(url)) return capsCache.get(url);
  const { data } = await axios.get(url, {
    params: { service: 'WMS', request: 'GetCapabilities', version: '1.3.0' }, signal, timeout: 20000, responseType: 'text',
  });
  const xml = new DOMParser().parseFromString(data, 'text/xml');
  if (xml.querySelector('parsererror')) throw new Error('Invalid capabilities document');
  const text = (el, tag) => el.querySelector(`:scope > ${tag}`)?.textContent?.trim() || '';
  const layers = [...xml.querySelectorAll('Layer > Layer')]
    .filter((el) => text(el, 'Name'))
    .map((el) => {
      const bbox = el.querySelector(':scope > EX_GeographicBoundingBox');
      return {
        name: text(el, 'Name'),
        title: text(el, 'Title') || text(el, 'Name'),
        abstract: text(el, 'Abstract'),
        keywords: [...el.querySelectorAll(':scope > KeywordList > Keyword')].map((k) => k.textContent),
        crs: [...el.querySelectorAll(':scope > CRS')].slice(0, 4).map((c) => c.textContent),
        bounds: bbox
          ? ['westBoundLongitude', 'southBoundLatitude', 'eastBoundLongitude', 'northBoundLatitude'].map((t) => Number(text(bbox, t)))
          : null,
        queryable: el.getAttribute('queryable') === '1',
      };
    });
  const result = { service: text(xml.documentElement.querySelector('Service') || xml.documentElement, 'Title'), layers };
  capsCache.set(url, result);
  return result;
}

/** Cheap reachability probe that works without CORS: load one tiny GetMap image. */
export function probeWms({ service, layer, url, workspace }) {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => resolve(false), 10000);
    img.onload = () => (clearTimeout(timer), resolve(true));
    img.onerror = () => (clearTimeout(timer), resolve(false));
    img.src = buildWmsTileUrl({ service, layer, url, workspace }).replace('{bbox-epsg-3857}', '0,0,1000000,1000000');
  });
}

/** Reachability for GeoServer without requiring CORS (opaque response = reachable). */
export async function probeGeoServer() {
  if (!geoServerBase()) return 'notConfigured';
  try {
    await fetch(`${geoServerBase()}/wms?service=WMS&request=GetCapabilities`, { mode: 'no-cors', signal: AbortSignal.timeout(8000) });
    return 'online';
  } catch {
    return 'offline';
  }
}
