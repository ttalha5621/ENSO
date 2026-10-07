/** Static configuration for the single Mapbox engine. */

export const BASEMAPS = [
  { id: 'dark', label: 'basemap.dark', style: 'mapbox://styles/mapbox/dark-v11', swatch: 'linear-gradient(135deg,#0f172a,#334155)' },
  { id: 'satellite-streets', label: 'basemap.satelliteStreets', style: 'mapbox://styles/mapbox/satellite-streets-v12', swatch: 'linear-gradient(135deg,#14532d,#1e3a8a 60%,#f59e0b)' },
  { id: 'satellite', label: 'basemap.satellite', style: 'mapbox://styles/mapbox/satellite-v9', swatch: 'linear-gradient(135deg,#064e3b,#1e3a8a)' },
  { id: 'streets', label: 'basemap.streets', style: 'mapbox://styles/mapbox/streets-v12', swatch: 'linear-gradient(135deg,#e2e8f0,#fde68a 55%,#93c5fd)' },
  { id: 'light', label: 'basemap.light', style: 'mapbox://styles/mapbox/light-v11', swatch: 'linear-gradient(135deg,#f8fafc,#cbd5e1)' },
  { id: 'outdoors', label: 'basemap.outdoors', style: 'mapbox://styles/mapbox/outdoors-v12', swatch: 'linear-gradient(135deg,#d9f99d,#86efac 50%,#7dd3fc)' },
];

export const DEFAULT_VIEW = Object.freeze({
  center: [69.3451, 20.5], // Pakistan / northern Indian Ocean
  zoom: 2.4,
  pitch: 0,
  bearing: 0,
});

export const BOOKMARKS = [
  { id: 'pakistan', label: 'bookmarks.pakistan', center: [69.35, 30.37], zoom: 4.6 },
  { id: 'arabian-sea', label: 'bookmarks.arabianSea', center: [64, 16], zoom: 3.8 },
  { id: 'indian-ocean', label: 'bookmarks.indianOcean', center: [80, -5], zoom: 2.6 },
  { id: 'nino34', label: 'bookmarks.nino34', center: [-145, 0], zoom: 2.8 },
  { id: 'world', label: 'bookmarks.world', center: [40, 10], zoom: 1.2 },
];

export const SPIN = Object.freeze({ secondsPerRevolution: 140, maxSpinZoom: 5, slowSpinZoom: 3 });
