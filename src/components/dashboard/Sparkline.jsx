import { useId, useMemo } from 'react';
import { m } from 'framer-motion';

/** Small animated trend line with zero baseline. */
export default function Sparkline({ values, width = 280, height = 56, threshold = 0.5 }) {
  const id = useId().replace(/:/g, '');
  const { d, area, zeroY, last } = useMemo(() => {
    if (values.length < 2) return { d: '', area: '', zeroY: height / 2, last: null };
    const max = Math.max(threshold * 2, ...values.map(Math.abs));
    const x = (i) => (i / (values.length - 1)) * (width - 6) + 3;
    const y = (v) => height / 2 - (v / max) * (height / 2 - 4);
    const pts = values.map((v, i) => [x(i), y(v)]);
    const path = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join('');
    return { d: path, area: `${path}L${pts.at(-1)[0]},${y(0)}L${pts[0][0]},${y(0)}Z`, zeroY: y(0), last: pts.at(-1) };
  }, [values, width, height, threshold]);

  if (!d) return <div style={{ height }} />;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#f97316" stopOpacity="0.02" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <line x1="0" x2={width} y1={zeroY} y2={zeroY} stroke="var(--border-strong)" strokeDasharray="3 3" />
      <m.path d={area} fill={`url(#${id}-g)`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} />
      <m.path d={d} fill="none" stroke={`url(#${id}-s)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} />
      {last && (
        <m.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.3, type: 'spring' }} style={{ originX: `${last[0]}px`, originY: `${last[1]}px` }}>
          <circle cx={last[0]} cy={last[1]} r="7" fill="#f97316" opacity="0.25" className="animate-pulse" />
          <circle cx={last[0]} cy={last[1]} r="3.5" fill="#fff" stroke="#f97316" strokeWidth="2" />
        </m.g>
      )}
    </svg>
  );
}
