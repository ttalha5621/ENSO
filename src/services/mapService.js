/**
 * Bridge between React and the single Mapbox instance.
 * The map object is not serialisable, so it lives here (never in Redux).
 * Components use these helpers instead of creating their own maps.
 */
import axios from 'axios';
import { getMapboxToken } from '../config/env.js';

let mapInstance = null;
let mapboxLib = null;
const listeners = new Set();

export const mapService = {
  attach(map, lib) {
    mapInstance = map;
    mapboxLib = lib;
  },
  detach() {
    mapInstance = null;
  },
  get map() {
    return mapInstance;
  },
  get lib() {
    return mapboxLib;
  },
  /** Run callback now if the style is ready, and again after every basemap change. */
  onStyleReady(cb) {
    listeners.add(cb);
    if (mapInstance?.isStyleLoaded?.()) cb(mapInstance);
    return () => listeners.delete(cb);
  },
  emitStyleReady() {
    listeners.forEach((cb) => {
      try {
        cb(mapInstance);
      } catch (err) {
        console.warn('[map] style listener failed', err);
      }
    });
  },
  flyTo({ center, zoom = 5, ...rest }) {
    mapInstance?.flyTo({ center, zoom, speed: 1.4, curve: 1.4, essential: true, ...rest });
  },
  fitBounds(bounds, opts) {
    mapInstance?.fitBounds(bounds, { padding: 60, duration: 1400, ...opts });
  },
  getViewContext() {
    if (!mapInstance) return null;
    const c = mapInstance.getCenter();
    return { center: [+c.lng.toFixed(3), +c.lat.toFixed(3)], zoom: +mapInstance.getZoom().toFixed(2), bearing: Math.round(mapInstance.getBearing()), pitch: Math.round(mapInstance.getPitch()) };
  },
};

/** Mapbox Search (geocoding v6) — debounced/cancelled by the caller. */
export async function geocode(query, { language = 'en', signal, proximity } = {}) {
  const token = getMapboxToken();
  if (!token || query.trim().length < 2) return [];
  const params = { q: query, access_token: token, limit: 6, language, autocomplete: true };
  if (proximity) params.proximity = proximity.join(',');
  const { data } = await axios.get('https://api.mapbox.com/search/geocode/v6/forward', { params, signal, timeout: 8000 });
  return (data.features || []).map((f) => ({
    id: f.id,
    name: f.properties.name,
    detail: f.properties.place_formatted || f.properties.full_address || '',
    type: f.properties.feature_type,
    center: f.geometry.coordinates,
    bbox: f.properties.bbox,
  }));
}

/** Parse "lat, lon" / "lat lon" input (decimal degrees, optional N/S/E/W). */
export function parseCoordinates(input) {
  const m = input.trim().match(/^(-?\d+(?:\.\d+)?)\s*°?\s*([NS])?\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*°?\s*([EW])?$/i);
  if (!m) return null;
  let lat = parseFloat(m[1]);
  let lon = parseFloat(m[3]);
  if (m[2]?.toUpperCase() === 'S') lat = -Math.abs(lat);
  if (m[4]?.toUpperCase() === 'W') lon = -Math.abs(lon);
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat, lon };
}

/**
 * Ask Mapbox whether a token works before starting the map.
 * 'ok' | 'invalid' (401: wrong/revoked token) | 'restricted' (403: URL restriction or missing
 * scope) | 'network' (Mapbox unreachable — firewall, proxy or offline)
 */
export async function verifyMapboxToken(token) {
  try {
    const r = await fetch(`https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=${encodeURIComponent(token)}`, { signal: AbortSignal.timeout(15000) });
    if (r.ok) return 'ok';
    if (r.status === 401) return 'invalid';
    if (r.status === 403) return 'restricted';
    return 'network';
  } catch {
    return 'network';
  }
}
