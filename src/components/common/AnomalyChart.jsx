import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { m } from 'framer-motion';
import { fmtSigned } from '../../utils/climate.js';

const WARM = '#f97316';
const HOT = '#ef4444';
const COOL = '#38bdf8';
const COLD = '#3b82f6';
const NEUTRAL = 'rgba(148,163,184,0.55)';

function colorFor(v, th) {
  if (v >= th * 3) return HOT;
  if (v >= th) return WARM;
  if (v <= -th * 3) return COLD;
  if (v <= -th) return COOL;
  return NEUTRAL;
}

function useWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/**
 * Diverging anomaly chart (bars for short ranges, filled line for long ones).
 * Hand-built SVG — no charting library shipped to the browser.
 */
export default function AnomalyChart({ series, threshold = 0.5, height = 260, unit = '°C', ariaLabel }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const clipId = useId().replace(/:/g, '');
  const pad = { t: 14, r: 12, b: 26, l: 40 };
  const iw = width - pad.l - pad.r;
  const ih = height - pad.t - pad.b;

  const { xs, y, ticks, years, max } = useMemo(() => {
    if (!series.length) return { xs: () => 0, y: () => 0, ticks: [], years: [], max: 1 };
    const t0 = series[0].t;
    const t1 = series[series.length - 1].t || t0 + 1;
    const mx = Math.max(threshold * 2, ...series.map((d) => Math.abs(d.v))) * 1.1;
    const xs = (t) => ((t - t0) / Math.max(1e-6, t1 - t0)) * iw;
    const yy = (v) => ih / 2 - (v / mx) * (ih / 2);
    const step = mx > 2 ? 1 : 0.5;
    const tk = [];
    for (let v = -Math.floor(mx / step) * step; v <= mx; v += step) tk.push(+v.toFixed(2));
    const span = t1 - t0;
    const yStep = span > 60 ? 20 : span > 30 ? 10 : span > 12 ? 4 : span > 5 ? 2 : 1;
    const yrs = [];
    for (let yr = Math.ceil(t0 / yStep) * yStep; yr <= t1; yr += yStep) yrs.push(yr);
    return { xs, y: yy, ticks: tk, years: yrs, max: mx };
  }, [series, iw, ih, threshold]);

  const bars = series.length <= 260;
  const bw = Math.max(1, iw / Math.max(1, series.length) - (series.length > 120 ? 0.5 : 1.5));

  const linePath = useMemo(() => (bars ? '' : series.map((d, i) => `${i ? 'L' : 'M'}${xs(d.t).toFixed(1)},${y(d.v).toFixed(1)}`).join('')), [series, xs, y, bars]);

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left - pad.l;
    if (!series.length) return;
    let lo = 0;
    let hi = series.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (xs(series[mid].t) < px) lo = mid;
      else hi = mid;
    }
    const i = Math.abs(xs(series[lo].t) - px) < Math.abs(xs(series[hi].t) - px) ? lo : hi;
    setHover(i);
  };

  const h = hover != null ? series[hover] : null;

  return (
    <div ref={ref} className="relative w-full select-none" dir="ltr">
      <svg width={width} height={height} role="img" aria-label={ariaLabel} onMouseMove={onMove} onMouseLeave={() => setHover(null)} className="block touch-none" onTouchMove={(e) => onMove(e.touches[0] ? { ...e, clientX: e.touches[0].clientX, currentTarget: e.currentTarget } : e)}>
        <defs>
          <clipPath id={clipId}>
            <m.rect x={0} y={-10} height={ih + 20} initial={{ width: 0 }} animate={{ width: iw + 2 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
          </clipPath>
          <linearGradient id={`${clipId}-warm`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={HOT} stopOpacity="0.7" />
            <stop offset="50%" stopColor={WARM} stopOpacity="0.1" />
            <stop offset="50%" stopColor={COOL} stopOpacity="0.1" />
            <stop offset="100%" stopColor={COLD} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <g transform={`translate(${pad.l},${pad.t})`}>
          {ticks.map((v) => (
            <g key={v}>
              <line x1={0} x2={iw} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeWidth={v === 0 ? 1.2 : 1} />
              <text x={-8} y={y(v)} dy="0.32em" textAnchor="end" className="fill-[var(--text-muted)] font-mono text-[10px]">{v > 0 ? `+${v}` : v}</text>
            </g>
          ))}
          {[threshold, -threshold].map((v) => (
            <line key={v} x1={0} x2={iw} y1={y(v)} y2={y(v)} stroke={v > 0 ? WARM : COOL} strokeOpacity={0.55} strokeDasharray="4 4" />
          ))}
          {years.map((yr) => (
            <text key={yr} x={xs(yr)} y={ih + 18} textAnchor="middle" className="fill-[var(--text-muted)] font-mono text-[10px]">{yr}</text>
          ))}

          <g clipPath={`url(#${clipId})`}>
            {bars ? (
              series.map((d, i) => (
                <rect
                  key={i}
                  x={xs(d.t) - bw / 2}
                  y={Math.min(y(0), y(d.v))}
                  width={bw}
                  height={Math.max(0.5, Math.abs(y(d.v) - y(0)))}
                  rx={Math.min(2, bw / 2)}
                  fill={colorFor(d.v, threshold)}
                  opacity={hover == null || hover === i ? 1 : 0.55}
                />
              ))
            ) : (
              <>
                <path d={`${linePath}L${xs(series[series.length - 1].t)},${y(0)}L${xs(series[0].t)},${y(0)}Z`} fill={`url(#${clipId}-warm)`} />
                <path d={linePath} fill="none" stroke="var(--text)" strokeOpacity={0.75} strokeWidth={1} />
              </>
            )}
          </g>

          {h && (
            <g pointerEvents="none">
              <line x1={xs(h.t)} x2={xs(h.t)} y1={0} y2={ih} stroke="var(--text-strong)" strokeOpacity={0.35} />
              <circle cx={xs(h.t)} cy={y(h.v)} r={4.5} fill={colorFor(h.v, threshold)} stroke="var(--bg)" strokeWidth={2} />
            </g>
          )}
        </g>
      </svg>
      {h && (
        <div
          className="glass-strong pointer-events-none absolute top-1 z-10 rounded-xl px-3 py-2 text-xs"
          style={{ left: Math.min(width - 140, Math.max(0, pad.l + xs(h.t) - 60)) }}
        >
          <p className="font-medium text-strong">{h.label}</p>
          <p className="font-mono" style={{ color: colorFor(h.v, threshold) === NEUTRAL ? 'var(--text)' : colorFor(h.v, threshold) }}>
            {fmtSigned(h.v)} {unit}
          </p>
        </div>
      )}
      <span className="sr-only">Max absolute anomaly {max.toFixed(2)}</span>
    </div>
  );
}
