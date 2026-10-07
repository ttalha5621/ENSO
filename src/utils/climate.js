/** Classification thresholds follow NOAA CPC (ONI) and common IOD practice (DMI ±0.4 °C). */
export function classifyONI(anom) {
  if (anom == null || Number.isNaN(anom)) return null;
  const a = Math.abs(anom);
  const phase = anom >= 0.5 ? 'elnino' : anom <= -0.5 ? 'lanina' : 'neutral';
  const strength = a >= 2 ? 'veryStrong' : a >= 1.5 ? 'strong' : a >= 1 ? 'moderate' : a >= 0.5 ? 'weak' : null;
  const tone = phase === 'elnino' ? 'warm' : phase === 'lanina' ? 'cool' : 'neutral';
  return { phase, strength, tone };
}

export function classifyDMI(value) {
  if (value == null || Number.isNaN(value)) return null;
  const phase = value >= 0.4 ? 'posIOD' : value <= -0.4 ? 'negIOD' : 'neutral';
  return { phase, tone: phase === 'posIOD' ? 'warm' : phase === 'negIOD' ? 'cool' : 'neutral' };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const monthLabel = (m) => MONTHS[m - 1];

export const latestONI = (rows) => (rows?.length ? rows[rows.length - 1] : null);
export const latestDMI = (rows) => (rows?.length ? rows[rows.length - 1] : null);
export const oniPeriod = (r) => (r ? `${r.season} ${r.year}` : '');
export const dmiPeriod = (r) => (r ? `${monthLabel(r.month)} ${r.year}` : '');

export const fmtSigned = (v, digits = 2) => (v == null ? '—' : `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(digits)}`);

/** Convert ONI rows to {t (decimal year), v, label} for charts. */
const SEASON_CENTER = { DJF: 1, JFM: 2, FMA: 3, MAM: 4, AMJ: 5, MJJ: 6, JJA: 7, JAS: 8, ASO: 9, SON: 10, OND: 11, NDJ: 12 };
export const oniSeries = (rows) => rows.map((r) => ({ t: r.year + (SEASON_CENTER[r.season] - 1) / 12, v: r.anom, label: oniPeriod(r) }));
export const dmiSeries = (rows) => rows.map((r) => ({ t: r.year + (r.month - 1) / 12, v: r.value, label: dmiPeriod(r) }));
