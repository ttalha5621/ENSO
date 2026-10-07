/**
 * Single source of truth for runtime configuration.
 * Only PUBLIC values belong here — anything prefixed VITE_ is bundled into the browser.
 * The Google AI key is read by server/index.js (GEMINI_API_KEY) and never reaches this file.
 */
const trim = (v) => (typeof v === 'string' ? v.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '') : '');

export const ENV = Object.freeze({
  MAPBOX_ACCESS_TOKEN: trim(import.meta.env.VITE_MAPBOX_ACCESS_TOKEN),
  GEOSERVER_URL: trim(import.meta.env.VITE_GEOSERVER_URL),
  API_BASE_URL: trim(import.meta.env.VITE_API_BASE_URL),
  IS_DEV: import.meta.env.DEV,
});

/**
 * A Mapbox public token can also be pasted in the app (saved in this browser only).
 * It takes priority over .env so a wrong token can be corrected without a rebuild.
 */
const TOKEN_KEY = 'enso.mapboxToken';

export function getSavedMapboxToken() {
  try {
    return trim(localStorage.getItem(TOKEN_KEY) || '');
  } catch {
    return '';
  }
}
export function saveMapboxToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, trim(token));
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage blocked */
  }
}

export const getMapboxToken = () => getSavedMapboxToken() || ENV.MAPBOX_ACCESS_TOKEN;
export const getMapboxTokenSource = () => (getSavedMapboxToken() ? 'browser' : ENV.MAPBOX_ACCESS_TOKEN ? 'env' : 'none');

/** 'ok' | 'missing' | 'secret' (sk.* tokens must never be used in a browser) | 'malformed' */
export function checkTokenFormat(token = getMapboxToken()) {
  if (!token) return 'missing';
  if (token.startsWith('sk.')) return 'secret';
  if (!/^pk\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) return 'malformed';
  return 'ok';
}

export const hasMapboxToken = () => checkTokenFormat() === 'ok';
export const hasGeoServer = () => Boolean(ENV.GEOSERVER_URL);
