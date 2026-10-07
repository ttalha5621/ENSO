import { m } from 'framer-motion';

/** Horizontal diverging meter, e.g. −2.5 … +2.5 °C, with an animated marker. */
export default function PhaseMeter({ value, min = -2.5, max = 2.5, threshold = 0.5, labels }) {
  const clamp = Math.max(min, Math.min(max, value ?? 0));
  const pct = ((clamp - min) / (max - min)) * 100;
  const th = (v) => ((v - min) / (max - min)) * 100;
  return (
    <div dir="ltr">
      <div className="relative h-2.5 rounded-full" style={{ background: 'linear-gradient(90deg,#1d4ed8,#38bdf8 35%,#64748b 50%,#f97316 65%,#dc2626)' }}>
        {[threshold, -threshold].map((v) => (
          <span key={v} className="absolute top-1/2 h-4 w-px -translate-y-1/2 bg-white/60" style={{ left: `${th(v)}%` }} />
        ))}
        {value != null && (
          <m.span
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[var(--bg)] shadow-lg"
            initial={{ left: '50%' }}
            animate={{ left: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.3 }}
          />
        )}
      </div>
      {labels && (
        <div className="mt-1.5 flex justify-between text-[10px] text-muted">
          {labels.map((l) => <span key={l}>{l}</span>)}
        </div>
      )}
    </div>
  );
}
