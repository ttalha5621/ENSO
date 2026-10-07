import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { Crosshair, CornerDownLeft, FileText, Layers, Loader2, MapPin, Search } from 'lucide-react';
import { setSearchOpen } from '../../store/slices/uiSlice.js';
import { openPanel, setLayerVisible } from '../../store/slices/mapSlice.js';
import { geocode, mapService, parseCoordinates } from '../../services/mapService.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useLayerCatalog } from '../../hooks/useLayerCatalog.js';
import { NAV_PAGES } from '../../routes/navigation.js';
import { layerLabel } from '../../utils/layers.js';
import { cx } from '../../utils/format.js';

const NO_PLACES = [];

/** Global search (Ctrl/⌘ K): pages, layers, coordinates and Mapbox places in one list. */
export default function MapSearch() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const open = useSelector((s) => s.ui.searchOpen);
  const catalog = useLayerCatalog();
  const [q, setQ] = useState('');
  const [places, setPlaces] = useState({ query: '', status: 'idle', items: [] });
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const debounced = useDebounce(q, 280);

  const close = () => {
    dispatch(setSearchOpen(false));
    setQ('');
  };

  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !/input|textarea|select/i.test(e.target.tagName))) {
        e.preventDefault();
        dispatch(setSearchOpen(true));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  // Debounced + cancellable geocoding — one request per pause in typing.
  const geoQuery = open && debounced.trim().length >= 2 && !parseCoordinates(debounced) ? debounced.trim() : '';
  useEffect(() => {
    if (!geoQuery) return undefined;
    const ctrl = new AbortController();
    const view = mapService.getViewContext();
    geocode(geoQuery, { language: lang.code, signal: ctrl.signal, proximity: view?.center })
      .then((items) => setPlaces({ query: geoQuery, status: 'done', items }))
      .catch((err) => err?.name !== 'CanceledError' && setPlaces({ query: geoQuery, status: 'error', items: [] }));
    return () => ctrl.abort();
  }, [geoQuery, lang.code]);
  const placeItems = geoQuery && places.query === geoQuery && q.trim() ? places.items : NO_PLACES;
  const placesLoading = Boolean(geoQuery) && places.query !== geoQuery;

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const out = [];
    const coords = parseCoordinates(q);
    if (coords) out.push({ kind: 'coords', id: 'coords', title: `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`, detail: t('search.coords'), coords });
    const pages = NAV_PAGES.filter((p) => !term || t(p.label).toLowerCase().includes(term) || p.path.includes(term)).slice(0, term ? 5 : 6);
    pages.forEach((p) => out.push({ kind: 'page', id: p.path, title: t(p.label), detail: p.path, icon: p.icon }));
    if (term) {
      catalog
        .filter((l) => `${layerLabel(t, l)} ${l.name} ${l.short || ''} ${l.layer || ''}`.toLowerCase().includes(term))
        .slice(0, 5)
        .forEach((l) => out.push({ kind: 'layer', id: l.id, title: layerLabel(t, l), detail: l.source, color: l.color }));
    }
    placeItems.forEach((p) => out.push({ kind: 'place', id: p.id, title: p.name, detail: p.detail, place: p }));
    return out;
  }, [q, catalog, placeItems, t]);

  const choose = (r) => {
    if (!r) return;
    close();
    if (r.kind === 'page') return navigate(r.id);
    navigate('/map');
    if (r.kind === 'layer') {
      dispatch(setLayerVisible({ id: r.id, visible: true }));
      dispatch(openPanel('layers'));
    }
    if (r.kind === 'coords') setTimeout(() => mapService.flyTo({ center: [r.coords.lon, r.coords.lat], zoom: 7 }), 150);
    if (r.kind === 'place') {
      setTimeout(() => (r.place.bbox ? mapService.fitBounds(r.place.bbox, { maxZoom: 11 }) : mapService.flyTo({ center: r.place.center, zoom: 10 })), 150);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') (e.preventDefault(), setCursor((c) => Math.min(results.length - 1, c + 1)));
    if (e.key === 'ArrowUp') (e.preventDefault(), setCursor((c) => Math.max(0, c - 1)));
    if (e.key === 'Enter') (e.preventDefault(), choose(results[cursor]));
    if (e.key === 'Escape') close();
  };

  const sections = [
    ['coords', t('search.coords')],
    ['page', t('search.pages')],
    ['layer', t('search.layers')],
    ['place', t('search.places')],
  ];

  return (
    <AnimatePresence>
      {open && (
        <m.div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[10vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} aria-hidden />
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={t('search.placeholder')}
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong relative w-full max-w-xl overflow-hidden rounded-3xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="h-5 w-5 text-sky-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setCursor(0);
                }}
                onKeyDown={onKeyDown}
                placeholder={t('search.placeholder')}
                aria-label={t('search.placeholder')}
                role="combobox"
                aria-expanded="true"
                aria-controls="search-results"
                aria-activedescendant={results[cursor] ? `sr-${cursor}` : undefined}
                className="h-14 flex-1 bg-transparent text-[15px] text-strong !outline-none placeholder:text-muted"
              />
              {placesLoading && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
              <kbd className="rounded-md bg-[var(--glass-hover)] px-1.5 py-0.5 font-mono text-[10px] text-muted">Esc</kbd>
            </div>
            <ul id="search-results" role="listbox" className="scrollbar-thin max-h-[55vh] overflow-y-auto p-2">
              {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">{q ? t('search.empty') : t('search.hint')}</li>}
              {sections.map(([kind, label]) => {
                const items = results.map((r, i) => [r, i]).filter(([r]) => r.kind === kind);
                if (!items.length) return null;
                return (
                  <li key={kind} role="presentation">
                    <p className="px-3 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
                    <ul role="presentation">
                      {items.map(([r, i]) => {
                        const Icon = r.kind === 'page' ? r.icon || FileText : r.kind === 'layer' ? Layers : r.kind === 'coords' ? Crosshair : MapPin;
                        return (
                          <li key={`${r.kind}-${r.id}`} id={`sr-${i}`} role="option" aria-selected={i === cursor}>
                            <button
                              type="button"
                              onMouseEnter={() => setCursor(i)}
                              onClick={() => choose(r)}
                              className={cx('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition', i === cursor ? 'bg-sky-500/12 ring-1 ring-sky-400/25' : 'hover:bg-[var(--glass-soft)]')}
                            >
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--glass-hover)]" style={r.color ? { color: r.color } : undefined}>
                                <Icon className={cx('h-4 w-4', !r.color && 'text-sky-300')} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium text-strong">{r.title}</span>
                                {r.detail && <span className="block truncate text-[11px] text-muted">{r.detail}</span>}
                              </span>
                              {i === cursor && <CornerDownLeft className="h-3.5 w-3.5 text-muted rtl:-scale-x-100" />}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
