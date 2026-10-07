import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, m } from 'framer-motion';
import { Check, Ruler, SquareDashed, Trash2, X } from 'lucide-react';
import { mapService } from '../../services/mapService.js';
import { setMeasureMode } from '../../store/slices/mapSlice.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { formatArea, formatDistance } from '../../utils/format.js';
import { IconButton } from '../ui/primitives.jsx';
import { pathLengthKm, polygonAreaKm2, TOOL_PREFIX } from './mapUtils.js';

const SRC = `${TOOL_PREFIX}measure`;
const COLOR = '#facc15';

function ensureLayers(map) {
  if (!map.getSource(SRC)) map.addSource(SRC, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  if (!map.getLayer(`${SRC}-fill`)) map.addLayer({ id: `${SRC}-fill`, type: 'fill', source: SRC, filter: ['==', ['geometry-type'], 'Polygon'], paint: { 'fill-color': COLOR, 'fill-opacity': 0.15 } });
  if (!map.getLayer(`${SRC}-line`)) map.addLayer({ id: `${SRC}-line`, type: 'line', source: SRC, filter: ['!=', ['geometry-type'], 'Point'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': COLOR, 'line-width': 2.5, 'line-dasharray': [2, 1.2] } });
  if (!map.getLayer(`${SRC}-pts`)) map.addLayer({ id: `${SRC}-pts`, type: 'circle', source: SRC, filter: ['==', ['geometry-type'], 'Point'], paint: { 'circle-radius': 5, 'circle-color': '#0b1220', 'circle-stroke-color': COLOR, 'circle-stroke-width': 2.5 } });
}

function render(map, pts, mode, cursor) {
  const src = map?.getSource(SRC);
  if (!src) return;
  const line = cursor ? [...pts, cursor] : pts;
  const features = pts.map((p) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: p }, properties: {} }));
  if (mode === 'area' && line.length >= 3) features.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [[...line, line[0]]] }, properties: {} });
  else if (line.length >= 2) features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: line }, properties: {} });
  src.setData({ type: 'FeatureCollection', features });
}

/** Geodesic distance / area measurement on the shared map. Re-mounted (keyed) per mode. */
function Measurement({ mode }) {
  const dispatch = useDispatch();
  const { t } = useI18n();
  const ready = useSelector((s) => s.map.status === 'ready');
  const [pts, setPts] = useState([]);
  const [done, setDone] = useState(false);
  const live = useRef({ pts, done });
  useLayoutEffect(() => {
    live.current = { pts, done };
  });

  useEffect(() => {
    const map = mapService.map;
    if (!ready || !map) return undefined;
    map.__measuring = true;
    map.doubleClickZoom.disable();
    map.getCanvas().style.cursor = 'crosshair';
    const off = mapService.onStyleReady((mp) => {
      ensureLayers(mp);
      render(mp, live.current.pts, mode);
    });

    const onClick = (e) => {
      if (e.originalEvent?.detail > 1) return; // 2nd click of a double-click
      const p = [e.lngLat.lng, e.lngLat.lat];
      if (live.current.done) {
        setDone(false);
        setPts([p]);
      } else setPts((prev) => [...prev, p]);
    };
    const onMove = (e) => !live.current.done && live.current.pts.length && render(map, live.current.pts, mode, [e.lngLat.lng, e.lngLat.lat]);
    const finish = () => {
      setDone(true);
      render(map, live.current.pts, mode);
    };
    const onKey = (e) => {
      if (e.key === 'Enter') finish();
      if (e.key === 'Escape') dispatch(setMeasureMode(null));
    };
    map.on('click', onClick);
    map.on('mousemove', onMove);
    map.on('dblclick', finish);
    window.addEventListener('keydown', onKey);

    return () => {
      off();
      map.off('click', onClick);
      map.off('mousemove', onMove);
      map.off('dblclick', finish);
      window.removeEventListener('keydown', onKey);
      map.__measuring = false;
      map.doubleClickZoom.enable();
      map.getCanvas().style.cursor = '';
      for (const id of [`${SRC}-fill`, `${SRC}-line`, `${SRC}-pts`]) if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(SRC)) map.removeSource(SRC);
    };
  }, [mode, ready, dispatch]);

  useEffect(() => {
    render(mapService.map, pts, mode);
  }, [pts, mode]);

  const value = mode === 'area' ? (pts.length >= 3 ? formatArea(polygonAreaKm2(pts)) : '—') : pts.length >= 2 ? formatDistance(pathLengthKm(pts)) : '—';
  const canFinish = !done && pts.length >= (mode === 'area' ? 3 : 2);

  return (
    <m.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      className="glass-strong pointer-events-auto absolute bottom-16 left-1/2 z-20 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl p-3"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/15 text-amber-300">{mode === 'area' ? <SquareDashed className="h-5 w-5" /> : <Ruler className="h-5 w-5" />}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wider text-muted">{mode === 'area' ? t('tools.area') : t('tools.distance')}</p>
          <p className="font-mono text-lg font-semibold text-strong">{value}</p>
        </div>
        {canFinish && <IconButton icon={Check} label="Enter" onClick={() => setDone(true)} size="sm" />}
        <IconButton icon={Trash2} label={t('tools.clear')} onClick={() => (setPts([]), setDone(false))} size="sm" />
        <IconButton icon={X} label={t('common.close')} onClick={() => dispatch(setMeasureMode(null))} size="sm" />
      </div>
      <p className="mt-2 text-[11px] text-muted">{t('tools.finishHint')}</p>
    </m.div>
  );
}

export default function MeasureTool() {
  const mode = useSelector((s) => s.map.measureMode);
  return <AnimatePresence>{mode && <Measurement key={mode} mode={mode} />}</AnimatePresence>;
}
