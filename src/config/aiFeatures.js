/**
 * Structured descriptions of every major feature. The AI receives these objects
 * (never scraped UI text). They are also the offline guide shown when AI is
 * unavailable, so they must be accurate on their own.
 */
export const aiFeatures = {
  dashboard: {
    id: 'dashboard', title: 'Command Center Dashboard', category: 'Overview',
    description: 'Summarises the portal state: how many map layers exist and are active, whether NASA GIBS and the optional GeoServer respond, the latest ENSO (ONI) and IOD (DMI) index values fetched from NOAA, and active alerts.',
    howItWorks: 'KPI cards read live application state. Index values come from the backend, which downloads and caches NOAA text files every 6 hours. Nothing on the dashboard is estimated — a card shows "—" when data is unavailable.',
    userActions: ['Open the map from the hero card', 'Click a KPI’s ✨ to have it explained', 'Jump to Analytics for the full index history'],
    aiEnabled: true,
  },
  'layer-management': {
    id: 'layer-management', title: 'Layer Management', category: 'GIS',
    description: 'Turn ocean, atmosphere and reference layers on or off, change their opacity, and reorder them. All layers draw on one shared Mapbox map.',
    howItWorks: 'Raster layers are requested from NASA GIBS (or your GeoServer) as WMS GetMap tiles in EPSG:3857. Toggling visibility hides the layer without re-downloading tiles; reordering moves it in the Mapbox layer stack.',
    userActions: ['Toggle the eye icon', 'Drag the opacity slider', 'Use ↑ ↓ to change draw order', 'Click ✨ on a layer for an explanation'],
    considerations: 'Several overlapping semi-transparent rasters can be hard to read; keep one or two active.',
    aiEnabled: true,
  },
  basemap: {
    id: 'basemap', title: 'Basemap Switcher', category: 'Map',
    description: 'Changes the background cartography (dark, satellite, streets, light, outdoors) under the data layers.',
    howItWorks: 'The map swaps its Mapbox style and then re-attaches every data layer with its current visibility, opacity and order.',
    aiEnabled: true,
  },
  legend: {
    id: 'legend', title: 'Map Legend', category: 'Map',
    description: 'Shows the colour scale and units for each visible layer so colours can be read as values.',
    aiEnabled: true,
  },
  'map-tools': {
    id: 'map-tools', title: 'Map Tools', category: 'Map',
    description: 'Zoom, compass/reset north, fullscreen, locate me, globe/flat projection, 3D terrain, auto-rotate, distance & area measurement, and live cursor coordinates.',
    howItWorks: 'Measurement uses great-circle (haversine) distances and spherical polygon area, so results are valid on the globe.',
    aiEnabled: true,
  },
  measure: {
    id: 'measure', title: 'Measure Tool', category: 'Map',
    description: 'Click points on the map to measure a path length; switch to Area to measure an enclosed polygon. Double-click or press Enter to finish, Esc to cancel.',
    aiEnabled: true,
  },
  wms: {
    id: 'wms', title: 'WMS (Web Map Service)', category: 'GeoServer',
    description: 'An OGC standard for requesting rendered map images for a bounding box. This portal requests 256×256 PNG tiles in EPSG:3857 from NASA GIBS and optionally your GeoServer.',
    aiEnabled: true,
  },
  wfs: {
    id: 'wfs', title: 'WFS (Web Feature Service)', category: 'GeoServer',
    description: 'An OGC standard that returns vector features (here as GeoJSON) instead of images, so features can be clicked and inspected.',
    aiEnabled: true,
  },
  geoserver: {
    id: 'geoserver', title: 'GeoServer Connection', category: 'GeoServer',
    description: 'Connects to the GeoServer configured in VITE_GEOSERVER_URL, reads its WMS GetCapabilities document and lets you add published layers to the map.',
    aiEnabled: true,
  },
  analytics: {
    id: 'analytics', title: 'Climate Analytics', category: 'Analytics',
    description: 'Charts the Oceanic Niño Index (ONI, NOAA CPC) and the Dipole Mode Index (DMI, NOAA PSL), classifies the current phase and shows the forecast products already used by NDMA (IOD plume, IOD probability, MJO phase diagram).',
    howItWorks: 'ONI ≥ +0.5 °C indicates El Niño conditions and ≤ −0.5 °C La Niña (NOAA thresholds). DMI above +0.4 °C is commonly treated as a positive IOD and below −0.4 °C as negative.',
    aiEnabled: true,
  },
  oni: {
    id: 'oni', title: 'Oceanic Niño Index (ONI)', category: 'Analytics',
    description: 'Three-month running mean of SST anomalies in the Niño 3.4 region, published by NOAA CPC. NOAA’s primary ENSO indicator.',
    aiEnabled: true,
  },
  dmi: {
    id: 'dmi', title: 'Dipole Mode Index (DMI)', category: 'Analytics',
    description: 'Monthly SST-anomaly difference between the western (50–70°E, 10°S–10°N) and south-eastern (90–110°E, 10°S–0°) tropical Indian Ocean, from NOAA PSL (HadISST).',
    aiEnabled: true,
  },
  viewers: {
    id: 'viewers', title: 'Live Earth Viewers', category: 'Visualisation',
    description: 'Embeds external global visualisations (Fluid Earth, earth.nullschool.net, NASA Eyes on the Earth). They are loaded only when opened, to keep the portal fast.',
    aiEnabled: true,
  },
  briefings: {
    id: 'briefings', title: 'Climate Briefings', category: 'Media',
    description: 'Animations and videos prepared for briefings (ENSO/IOD/MJO state, ITCZ, weather patterns, SIMEX scenario). Media is loaded lazily when scrolled into view.',
    aiEnabled: true,
  },
  reports: {
    id: 'reports', title: 'Situation Reports', category: 'Reports',
    description: 'Builds a concise situation report from the current index values, active layers and alerts, which can be exported as Markdown, CSV (index data) or printed to PDF.',
    aiEnabled: true,
  },
  alerts: {
    id: 'alerts', title: 'Alerts', category: 'Alerts',
    description: 'Rules evaluated against the latest data: ENSO phase from ONI, IOD phase from DMI, data freshness and service availability. Severity: info, watch, warning, critical.',
    howItWorks: 'Critical ≥ |1.5| °C ONI (strong event), Warning ≥ |1.0|, Watch ≥ |0.5|. IOD Watch beyond ±0.4 °C, Warning beyond ±0.8 °C. Timestamps show the data period, not the time the alert was viewed.',
    aiEnabled: true,
  },
  settings: {
    id: 'settings', title: 'Settings', category: 'Settings',
    description: 'Theme (dark/light), language, motion, default basemap and the status of Mapbox, GeoServer and the AI backend.',
    aiEnabled: true,
  },
  assistant: {
    id: 'assistant', title: 'GIS AI Assistant', category: 'AI',
    description: 'Answers questions about the map, layers and climate indices using the current application state as context. It is told not to invent data.',
    aiEnabled: true,
  },
};

export const getFeature = (id) => aiFeatures[id];
