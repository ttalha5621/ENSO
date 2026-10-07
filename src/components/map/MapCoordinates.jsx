import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { mapService } from '../../services/mapService.js';
import { formatCoord } from '../../utils/format.js';

/** Live cursor coordinates + zoom, updated at most once per animation frame (never via Redux). */
export default function MapCoordinates({ zoomLabel }) {
  const ready = useSelector((s) => s.map.status === 'ready');
  const [pos, setPos] = useState(null);
  const [zoom, setZoom] = useState(null);
  const frame = useRef(0);

  useEffect(() => {
    const map = mapService.map;
    if (!ready || !map) return undefined;
    const onMove = (e) => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => setPos([e.lngLat.lng, e.lngLat.lat]));
    };
    const onZoom = () => setZoom(map.getZoom());
    onZoom();
    map.on('mousemove', onMove);
    map.on('zoomend', onZoom);
    return () => {
      cancelAnimationFrame(frame.current);
      map.off('mousemove', onMove);
      map.off('zoomend', onZoom);
    };
  }, [ready]);

  return (
    <span className="flex items-center gap-3 font-mono text-[11px] tabular-nums" dir="ltr">
      <span>{pos ? `${formatCoord(pos[1], 'N', 'S')}  ${formatCoord(((pos[0] + 540) % 360) - 180, 'E', 'W')}` : '—'}</span>
      <span className="text-muted">{zoomLabel} {zoom != null ? zoom.toFixed(1) : '—'}</span>
    </span>
  );
}
