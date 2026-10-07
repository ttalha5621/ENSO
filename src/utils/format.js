export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(2)} km`;
  return `${Math.round(km).toLocaleString()} km`;
}
export function formatArea(km2) {
  if (km2 < 1) return `${Math.round(km2 * 1e6).toLocaleString()} m²`;
  return `${km2 < 100 ? km2.toFixed(2) : Math.round(km2).toLocaleString()} km²`;
}
export function formatCoord(value, pos, neg) {
  const hemi = value >= 0 ? pos : neg;
  return `${Math.abs(value).toFixed(3)}° ${hemi}`;
}
export function formatDateTime(iso, locale) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}
export function downloadFile(name, content, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const cx = (...c) => c.filter(Boolean).join(' ');
