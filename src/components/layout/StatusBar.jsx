import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { StatusDot } from '../ui/primitives.jsx';
import MapCoordinates from '../map/MapCoordinates.jsx';

const LABEL = { online: 'state.online', offline: 'state.offline', notConfigured: 'state.notConfigured', checking: 'state.checking', ready: 'state.ready', loading: 'state.loading', idle: 'state.loading', error: 'state.error', 'no-token': 'state.notConfigured' };

export default function StatusBar() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const mapStatus = useSelector((s) => s.map.status);
  const activeCount = useSelector((s) => Object.values(s.map.layers).filter((l) => l.visible).length);
  const services = useSelector((s) => s.services);
  const mapVisible = pathname === '/' || pathname.startsWith('/map');

  const items = [
    ['status.mapbox', mapStatus],
    ['status.gibs', services.gibs],
    ['status.geoserver', services.geoserver],
    ['status.ai', services.ai],
  ];

  return (
    <footer className="glass relative z-30 flex h-8 shrink-0 items-center gap-4 overflow-hidden rounded-none border-x-0 border-b-0 px-4 text-[11px] text-muted" aria-label="System status">
      <ul className="flex items-center gap-4">
        {items.map(([key, state], i) => (
          <li key={key} className={`flex items-center gap-1.5 ${i > 1 ? 'hidden sm:flex' : 'flex'}`} title={t(LABEL[state] || 'state.checking')}>
            <StatusDot state={state === 'ready' ? 'online' : state} />
            <span className="text-[var(--text)]">{t(key)}</span>
            <span className="hidden md:inline">{t(LABEL[state] || 'state.checking')}</span>
          </li>
        ))}
      </ul>
      <span className="hidden items-center gap-1.5 md:flex">
        <Layers className="h-3.5 w-3.5 text-cyan-400" /> {activeCount} {t('status.layers')}
      </span>
      <span className="ms-auto">{mapVisible && mapStatus === 'ready' ? <MapCoordinates zoomLabel={t('status.zoom')} /> : <span className="hidden sm:inline">© NASA GIBS · NOAA · Mapbox</span>}</span>
    </footer>
  );
}
