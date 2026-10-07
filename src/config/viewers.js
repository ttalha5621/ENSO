/** External global viewers from the previous portal (dates removed so they open on the latest data). */
const EYES = 'https://eyes.nasa.gov/apps/earth/#/vital-signs';

export const VIEWERS = [
  { id: 'fe-sst', group: 'fluid', color: '#f97316', src: 'https://fluid-earth.byrd.osu.edu/#gdata=sea+surface+temperature&pdata=none&proj=equirectangular&lat=33.49&lon=60.96&zoom=1.95&smode=false&kmode=false&pins=%5B%5D' },
  { id: 'fe-t2m', group: 'fluid', color: '#ef4444', src: 'https://fluid-earth.byrd.osu.edu/#gdata=average+temperature+at+2+m+above+ground&pdata=none&proj=equirectangular&lat=33.49&lon=60.96&zoom=1.95&smode=false&kmode=false&pins=%5B%5D' },
  { id: 'nullschool', group: 'nullschool', color: '#22d3ee', src: 'https://earth.nullschool.net/#current/ocean/surface/level/overlay=sea_surface_temp/patterson=137.56,4.44,413/loc=73.084,33.680' },
  { id: 'eyes-visible', group: 'eyes', color: '#38bdf8', src: `${EYES}/visible-earth/viirs-infrared-daily` },
  { id: 'eyes-air', group: 'eyes', color: '#fb923c', src: `${EYES}/air-temperature/airs-infrared-surface-3day` },
  { id: 'eyes-vapor', group: 'eyes', color: '#60a5fa', src: `${EYES}/water-vapor/airs-atmospheric-precipitable-total-3day` },
  { id: 'eyes-co2', group: 'eyes', color: '#a3a3a3', src: `${EYES}/carbon-dioxide/oco-2-carbon-observatory-16day` },
  { id: 'eyes-co', group: 'eyes', color: '#facc15', src: `${EYES}/carbon-monoxide/airs-infrared-18000ft-3day` },
  { id: 'eyes-precip', group: 'eyes', color: '#4ade80', src: `${EYES}/precipitation/imerg-multi-satellite-retrievals-daily` },
  { id: 'eyes-soil', group: 'eyes', color: '#a16207', src: `${EYES}/soil-moisture/smap-saturation-8day` },
  { id: 'eyes-chl', group: 'eyes', color: '#22c55e', src: `${EYES}/chlorophyll/chlorophyll-today` },
  { id: 'eyes-ozone', group: 'eyes', color: '#818cf8', src: `${EYES}/ozone/omps-atmosphere-daily` },
  { id: 'eyes-sea', group: 'eyes', color: '#0ea5e9', src: `${EYES}/sea-level/ocean-climate-measurements-monthly` },
  { id: 'eyes-water', group: 'eyes', color: '#06b6d4', src: `${EYES}/gravity-field-map/water-storage-monthly` },
  { id: 'eyes-n2o', group: 'eyes', color: '#e879f9', src: `${EYES}/nitrous-oxide/mls-stratosphere-n2o-7day` },
];

/** Briefing media (files live in public/media — see the README there). */
export const BRIEFINGS = [
  { id: 'enso-state', group: 'state', file: 'enso1.gif', kind: 'image' },
  { id: 'iod-state', group: 'state', file: 'iod1.gif', kind: 'image' },
  { id: 'mjo-state', group: 'state', file: 'MJO1.gif', kind: 'image' },
  { id: 'enso-prob', group: 'forecast', file: 'ENSOProb.mp4', kind: 'video' },
  { id: 'iod-forecast', group: 'forecast', file: 'IOD2video.mp4', kind: 'video' },
  { id: 'iod-monsoon-1', group: 'process', file: '15.mp4', kind: 'video' },
  { id: 'iod-monsoon-2', group: 'process', file: '18.mp4', kind: 'video' },
  { id: 'mjo-evolution', group: 'process', file: '12.mp4', kind: 'video' },
  { id: 'itcz', group: 'process', file: '19.mp4', kind: 'video' },
  { id: 'weather-patterns', group: 'process', file: 'WeatherPatterns.mp4', kind: 'video' },
  { id: 'simex', group: 'exercise', file: 'scenario.mp4', kind: 'video' },
];
