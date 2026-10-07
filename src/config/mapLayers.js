/**
 * Deduplicated layer catalogue.
 *
 * The previous portal created a separate Mapbox map per page and loaded Sea Surface
 * Height and Sea Surface Salinity twice (full page + side globe). Each dataset now
 * exists exactly once here and is rendered by the single MapboxMap engine.
 *
 * Every entry carries the metadata the AI layer may quote — nothing outside this
 * object is presented to the AI as fact.
 */

export const GIBS_WMS = 'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi';

export const LAYER_GROUPS = [
  { id: 'ocean', label: 'layers.groups.ocean' },
  { id: 'atmosphere', label: 'layers.groups.atmosphere' },
  { id: 'reference', label: 'layers.groups.reference' },
  { id: 'geoserver', label: 'layers.groups.geoserver' },
];

export const mapLayers = [
  {
    id: 'sst',
    name: 'Sea Surface Temperature',
    short: 'SST',
    group: 'ocean',
    type: 'wms',
    service: 'gibs',
    layer: 'MODIS_Aqua_L2_Sea_Surface_Temp_Day',
    visible: true,
    opacity: 0.85,
    color: '#f97316',
    description: 'Daytime sea surface temperature observed by the MODIS sensor on NASA’s Aqua satellite.',
    source: 'NASA GIBS — MODIS Aqua Level-2 (daytime swaths)',
    legend: { min: '< 0 °C', max: '≥ 32 °C', stops: ['#2f001e', '#72046d', '#3a0855', '#21296d', '#2b5dae', '#3da3ed', '#49c12c', '#fdea3b', '#fa7e22', '#d23211', '#690503'] },
    aiExplanationEnabled: true,
  },
  {
    id: 'ssta',
    name: 'SST Anomaly',
    short: 'SSTA',
    group: 'ocean',
    type: 'wms',
    service: 'gibs',
    layer: 'GHRSST_L4_MUR_Sea_Surface_Temperature_Anomalies',
    visible: false,
    opacity: 0.85,
    color: '#ef4444',
    description: 'Difference between current sea surface temperature and the long-term average — the primary visual signal of El Niño / La Niña.',
    source: 'NASA GIBS — GHRSST Level-4 MUR (JPL)',
    legend: { min: '< −3 °C', max: '≥ 3 °C', stops: ['#6b00d6', '#7818cf', '#2badfb', '#58ffba', '#b6ffa0', '#cacab8', '#fdeb6c', '#fb9f29', '#fa2915', '#da0a7b', '#7d0505'] },
    aiExplanationEnabled: true,
  },
  {
    id: 'currents',
    name: 'Sea Surface Currents (Zonal)',
    short: 'SSC',
    group: 'ocean',
    type: 'wms',
    service: 'gibs',
    layer: 'OSCAR_Sea_Surface_Currents_Zonal',
    visible: false,
    opacity: 0.85,
    color: '#3b82f6',
    description: 'East–west (zonal) component of near-surface ocean currents. Positive = eastward, negative = westward.',
    source: 'NASA GIBS — OSCAR (Ocean Surface Current Analysis Real-time)',
    legend: { min: '< −0.5 m/s', max: '≥ 0.5 m/s', stops: ['#1d30f9', '#3f5cfa', '#6d84fa', '#9dadfc', '#cfd6fd', '#fdfafc', '#fdd6cd', '#fcad9b', '#fb876a', '#fb603d', '#fa3816'] },
    aiExplanationEnabled: true,
  },
  {
    id: 'ssh',
    name: 'Sea Surface Height Anomaly',
    short: 'SSH',
    group: 'ocean',
    type: 'wms',
    service: 'gibs',
    layer: 'JPL_MEaSUREs_L4_Sea_Surface_Height_Anomalies',
    visible: false,
    opacity: 0.8,
    color: '#a855f7',
    description: 'Deviation of sea level from its mean, measured by satellite altimetry. Warm water expands, so positive anomalies often accompany heat build-up.',
    source: 'NASA GIBS — JPL MEaSUREs Level-4 gridded SSH anomalies',
    legend: { min: '< −0.3 m', max: '≥ 0.3 m', stops: ['#9c00aa', '#8e00f7', '#1900f8', '#3087f9', '#61fcd4', '#61f93b', '#80fd3d', '#f7f23d', '#e95719', '#ea5047', '#f8e1df'] },
    aiExplanationEnabled: true,
  },
  {
    id: 'sss',
    name: 'Sea Surface Salinity',
    short: 'SSS',
    group: 'ocean',
    type: 'wms',
    service: 'gibs',
    layer: 'SMAP_L3_Sea_Surface_Salinity_CAP_8Day_RunningMean',
    visible: false,
    opacity: 0.8,
    color: '#14b8a6',
    description: 'Salt concentration of surface sea water (8-day running mean), linked to rainfall, evaporation and river outflow.',
    source: 'NASA GIBS — SMAP Level-3 CAP, 8-day running mean',
    legend: { min: '< 30 PSU', max: '≥ 40 PSU', stops: ['#7900e2', '#0c00a3', '#2d7ba1', '#57e2e4', '#49bf6c', '#4d9f22', '#dfe739', '#d44c15', '#64100a', '#976b6c', '#cac8c9'] },
    aiExplanationEnabled: true,
  },
  {
    id: 'precip',
    name: 'Surface Precipitation Rate',
    short: 'PR',
    group: 'atmosphere',
    type: 'wms',
    service: 'gibs',
    layer: 'AMSRU2_Surface_Precipitation_Day',
    visible: false,
    opacity: 0.8,
    color: '#22c55e',
    description: 'Instantaneous rain rate at the surface from the AMSR2 microwave radiometer (daytime passes).',
    source: 'NASA GIBS — AMSR2 (GCOM-W1) Level-2',
    legend: { min: '0 mm/hr', max: '≥ 25 mm/hr', stops: ['#5f80b7', '#63b5cf', '#5fd6c8', '#58db9d', '#52e06a', '#65e64f', '#9aeb4a', '#dff147', '#efb837', '#f36723', '#f71515'] },
    aiExplanationEnabled: true,
  },
  {
    id: 'monitoring-regions',
    name: 'ENSO & IOD Monitoring Regions',
    short: 'REG',
    group: 'reference',
    type: 'geojson',
    service: 'static',
    data: '/monitoring-regions.geojson',
    visible: true,
    opacity: 0.9,
    color: '#22d3ee',
    description: 'Standard index boxes: Niño 1+2, 3, 3.4 and 4 in the Pacific, and the western and eastern IOD poles in the Indian Ocean. Click a box for its definition.',
    source: 'NOAA CPC (Niño regions) and Saji et al., 1999 (IOD poles)',
    aiExplanationEnabled: true,
  },
];

export const getLayerById = (id) => mapLayers.find((l) => l.id === id);
