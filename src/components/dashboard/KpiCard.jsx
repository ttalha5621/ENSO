import { m } from 'framer-motion';
import ExplainButton from '../common/ExplainButton.jsx';
import { fadeUp } from '../ui/motion.js';
import { cx } from '../../utils/format.js';

const TONES = {
  blue: 'from-blue-500/30 to-sky-500/5 text-sky-300',
  cyan: 'from-cyan-400/30 to-teal-500/5 text-cyan-300',
  green: 'from-emerald-400/30 to-green-600/5 text-emerald-300',
  amber: 'from-amber-400/30 to-orange-500/5 text-amber-300',
  orange: 'from-orange-500/30 to-red-500/5 text-orange-300',
  red: 'from-red-500/35 to-rose-600/5 text-red-300',
  purple: 'from-violet-500/30 to-fuchsia-500/5 text-violet-300',
  slate: 'from-slate-400/25 to-slate-600/5 text-slate-300',
};

export default function KpiCard({ icon: Icon, label, value, sub, tone = 'blue', explainData, children }) {
  return (
    <m.div variants={fadeUp} whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} className="glass group relative overflow-hidden rounded-2xl p-4">
      <div className={cx('pointer-events-none absolute -end-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br opacity-50 blur-2xl transition-opacity group-hover:opacity-90', TONES[tone])} />
      <div className="relative flex items-start justify-between gap-2">
        <span className={cx('grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ring-1 ring-[var(--border)]', TONES[tone])}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </span>
        {explainData && <ExplainButton subject={{ kind: 'kpi', id: `kpi-${label}`, featureId: 'dashboard', title: label, data: explainData, breadcrumb: ['Dashboard', label] }} className="-me-1 -mt-1 opacity-60 group-hover:opacity-100" />}
      </div>
      <p className="relative mt-3 truncate text-[11.5px] font-medium text-muted">{label}</p>
      <div className="relative mt-0.5 truncate font-display text-[22px] font-semibold leading-tight text-strong">{value}</div>
      {sub && <div className="relative mt-1 truncate text-[11px] text-muted">{sub}</div>}
      {children}
    </m.div>
  );
}
