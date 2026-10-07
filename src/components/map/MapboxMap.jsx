import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, m } from 'framer-motion';
import { checkTokenFormat, getMapboxToken } from '../../config/env.js';
import { mapService, verifyMapboxToken } from '../../services/mapService.js';
import MapTokenHelp from './MapTokenHelp.jsx';
import { mapLayers } from '../../config/mapLayers.js';
import { getFeatures } from '../../services/geoServer.js';
import { setLayerError, setMapStatus, setSelectedFeature, setSpinning } from '../../store/slices/mapSlice.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { BASEMAPS, DEFAULT_VIEW, SPIN } from './mapConfig.js';
import { applyAtmosphere, applyTerrain, interactiveLayerIds, PREFIX, sourceId, syncLayers, removeLayer } from './mapUtils.js';

/**
 * THE map. Exactly one Mapbox GL instance exists in the application; it is created
 * once, never re-initialised, and shared with every page through mapService.
 * mapbox-gl (≈1.7 MB) is loaded on demand so the rest of the UI paints first.
 */
function MapboxMap() {
  const dispatch = useDispatch();
  const { t } = useI18n();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [failure, setFailure] = useState(null);

  const { basemap, projection, terrain, spinning, layers, order, customLayers, status, selectedFeature } = useSelector((s) => s.map);
  const theme = useSelector((s) => s.ui.theme);
  const defs = useMemo(() => [...mapLayers, ...customLayers], [customLayers]);

  // Latest values for event handlers bound once at creation.
  const live = useRef({ defs, layers, order, theme, projection, terrain, spinning });
  useLayoutEffect(() => {
    live.current = { defs, layers, order, theme, projection, terrain, spinning };
  });

  const [attempt, setAttempt] = useState(0);

  /* ───────── create once (again only if the user retries after a failure) ───────── */
  useEffect(() => {
    const format = checkTokenFormat();
    if (format !== 'ok') {
      dispatch(setMapStatus('no-token'));
      return undefined;
    }
    let disposed = false;
    let map;
    const cleanup = [];
    const token = getMapboxToken();
    dispatch(setMapStatus('loading'));

    (async () => {
      // Load the engine and check the token with Mapbox at the same time, so a bad token
      // produces a clear message instead of an endless spinner.
      const [{ default: mapboxgl }, , tokenStatus] = await Promise.all([import('mapbox-gl'), import('mapbox-gl/dist/mapbox-gl.css'), verifyMapboxToken(token)]);
      if (disposed) return;
      if (tokenStatus !== 'ok') {
        setFailure(tokenStatus);
        dispatch(setMapStatus('error'));
        return;
      }
      if (mapboxgl.supported && !mapboxgl.supported()) {
        setFailure('webgl');
        dispatch(setMapStatus('error'));
        return;
      }
      mapboxgl.accessToken = token;
      const initial = live.current;
      const initialStyle = (BASEMAPS.find((b) => b.id === basemap) || BASEMAPS[0]).style;
      map = new mapboxgl.Map({
        container: containerRef.current,
        style: initialStyle,
        center: DEFAULT_VIEW.center,
        zoom: DEFAULT_VIEW.zoom,
        projection: initial.projection,
        attributionControl: false,
        cooperativeGestures: false,
        maxPitch: 75,
        fadeDuration: 200,
      });
      map.__currentStyle = initialStyle;
      mapRef.current = map;
      mapService.attach(map, mapboxgl);

      map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
      map.addControl(new mapboxgl.ScaleControl({ maxWidth: 110, unit: 'metric' }), 'bottom-left');
      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'bottom-right');
      map.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: false, showUserHeading: true }), 'bottom-right');
      map.addControl(new mapboxgl.FullscreenControl({ container: document.getElementById('main') || containerRef.current }), 'bottom-right');

      // Re-attach everything after every style change (basemap switch).
      map.on('style.load', () => {
        const s = live.current;
        try {
          map.setProjection(s.projection);
          applyAtmosphere(map, s);
          applyTerrain(map, s.terrain);
        } catch (err) {
          console.warn('[map] style setup', err);
        }
        syncLayers(map, s.defs, s.layers, s.order);
        mapService.emitStyleReady();
      });
      const slow = setTimeout(() => {
        if (!map.loaded()) {
          setFailure('timeout');
          dispatch(setMapStatus('error'));
        }
      }, 30000);
      cleanup.push(() => clearTimeout(slow));
      map.once('load', () => {
        clearTimeout(slow);
        setFailure(null);
        dispatch(setMapStatus('ready'));
      });

      /* Tile failures → flag the layer once it fails repeatedly (single misses are normal). */
      const failures = new Map();
      map.on('error', (e) => {
        const id = e.sourceId || e.source?.id;
        if (!id?.startsWith(PREFIX)) {
          const status = e.error?.status;
          if (status === 401 || /access token/i.test(e.error?.message || '')) setFailure('invalid');
          else if (status === 403) setFailure('restricted');
          if (status === 401 || status === 403) dispatch(setMapStatus('error'));
          else if (e.error) console.warn('[map]', e.error.message || e.error);
          return;
        }
        const n = (failures.get(id) || 0) + 1;
        failures.set(id, n);
        if (n === 8) dispatch(setLayerError(id.slice(PREFIX.length)));
      });

      /* Feature interaction for vector layers */
      let hovered = null;
      const setState = (f, state) => f && map.setFeatureState({ source: f.source, id: f.id }, state);
      map.on('mousemove', (e) => {
        const ids = interactiveLayerIds(live.current.defs).filter((id) => map.getLayer(id));
        const f = ids.length ? map.queryRenderedFeatures(e.point, { layers: ids })[0] : null;
        map.getCanvas().style.cursor = f ? 'pointer' : '';
        if (hovered && (!f || f.id !== hovered.id || f.source !== hovered.source)) setState(hovered, { hover: false });
        if (f && f.id != null) setState(f, { hover: true });
        hovered = f && f.id != null ? f : null;
      });
      let selected = null;
      map.on('click', (e) => {
        if (map.__measuring) return;
        const ids = interactiveLayerIds(live.current.defs).filter((id) => map.getLayer(id));
        const f = ids.length ? map.queryRenderedFeatures(e.point, { layers: ids })[0] : null;
        if (selected) setState(selected, { selected: false });
        selected = f && f.id != null ? f : null;
        if (selected) setState(selected, { selected: true });
        const layerId = f?.layer.id.replace(PREFIX, '').replace(/-(fill|point)$/, '');
        dispatch(setSelectedFeature(f ? { layerId, id: f.id, properties: { ...f.properties }, lngLat: [+e.lngLat.lng.toFixed(4), +e.lngLat.lat.toFixed(4)] } : null));
      });

      /* Auto-rotate (the old portal's spinning globe), paused while the user interacts */
      let interacting = false;
      const spin = () => {
        const s = live.current;
        if (!s.spinning || interacting) return;
        const zoom = map.getZoom();
        if (zoom >= SPIN.maxSpinZoom) return;
        let degPerSec = 360 / SPIN.secondsPerRevolution;
        if (zoom > SPIN.slowSpinZoom) degPerSec *= (SPIN.maxSpinZoom - zoom) / (SPIN.maxSpinZoom - SPIN.slowSpinZoom);
        const c = map.getCenter();
        c.lng -= degPerSec;
        map.easeTo({ center: c, duration: 1000, easing: (n) => n });
      };
      map.__spin = spin;
      const start = () => (interacting = true);
      const stop = () => {
        interacting = false;
        spin();
      };
      map.on('mousedown', start);
      map.on('touchstart', start);
      map.on('mouseup', stop);
      map.on('touchend', stop);
      map.on('dragend', stop);
      map.on('moveend', spin);

      const ro = new ResizeObserver(() => map.resize());
      ro.observe(containerRef.current);
      cleanup.push(() => ro.disconnect());
    })().catch((err) => {
      console.error('[map] failed to start', err);
      setFailure('failed');
      dispatch(setMapStatus('error'));
    });

    return () => {
      disposed = true;
      cleanup.forEach((fn) => fn());
      mapService.detach();
      map?.remove();
      mapRef.current = null;
    };
    // The map is created once; later changes are applied by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  /* ───────── react to state (no re-initialisation) ───────── */
  const ready = status === 'ready';

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const style = (BASEMAPS.find((b) => b.id === basemap) || BASEMAPS[0]).style;
    if (map.__currentStyle === style) return;
    map.__currentStyle = style;
    map.setStyle(style);
  }, [basemap, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (ready && map?.isStyleLoaded()) syncLayers(map, defs, layers, order);
  }, [defs, layers, order, ready]);

  // Remove Mapbox sources for GeoServer layers the user deleted.
  const prevDefs = useRef(defs);
  useEffect(() => {
    const map = mapRef.current;
    if (map?.isStyleLoaded()) prevDefs.current.filter((d) => !defs.includes(d)).forEach((d) => removeLayer(map, d));
    prevDefs.current = defs;
  }, [defs]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map?.isStyleLoaded()) return;
    map.setProjection(projection);
    applyAtmosphere(map, { theme, projection });
  }, [projection, theme, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map?.isStyleLoaded()) return;
    applyTerrain(map, terrain);
    if (terrain && map.getPitch() < 30) map.easeTo({ pitch: 55, duration: 900 });
    if (!terrain && map.getPitch() > 0) map.easeTo({ pitch: 0, duration: 700 });
  }, [terrain, ready]);

  useEffect(() => {
    if (spinning) mapRef.current?.__spin?.();
  }, [spinning]);

  useEffect(() => () => dispatch(setSpinning(false)), [dispatch]);

  // Clear highlight when the inspector is dismissed.
  useEffect(() => {
    const map = mapRef.current;
    if (!selectedFeature && map?.isStyleLoaded()) {
      for (const d of defs) if (d.type !== 'wms' && map.getSource(sourceId(d.id))) map.removeFeatureState({ source: sourceId(d.id) });
    }
  }, [selectedFeature, defs]);

  /* ───────── WFS layers: fetch only the current bbox, debounced and cancellable ───────── */
  useEffect(() => {
    const map = mapRef.current;
    const wfs = defs.filter((d) => d.type === 'wfs' && layers[d.id]?.visible);
    if (!ready || !map || !wfs.length) return undefined;
    let ctrl;
    let timer;
    const load = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        ctrl?.abort();
        ctrl = new AbortController();
        const b = map.getBounds();
        const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map((v) => +v.toFixed(4));
        for (const d of wfs) {
          try {
            const data = await getFeatures({ typeName: d.typeName, bbox, signal: ctrl.signal });
            map.getSource(sourceId(d.id))?.setData(data);
          } catch (err) {
            if (err?.name !== 'CanceledError') dispatch(setLayerError(d.id));
          }
        }
      }, 350);
    };
    load();
    map.on('moveend', load);
    return () => {
      clearTimeout(timer);
      ctrl?.abort();
      map.off('moveend', load);
    };
  }, [defs, layers, ready, dispatch]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--bg)]">
      {/* Mapbox adds .mapboxgl-map {position: relative} to its container, which would override
          "absolute inset-0" and collapse it to 0 px high — so the container fills a positioned wrapper instead. */}
      <div className="absolute inset-0">
        <div ref={containerRef} className="h-full w-full" role="region" aria-label="Interactive map" />
      </div>
      <AnimatePresence>{(status === 'loading' || status === 'idle') && !failure && <MapLoader key="loader" label={t('map.loading')} />}</AnimatePresence>
      {(status === 'no-token' || failure) && (
        <MapTokenHelp
          reason={failure || (checkTokenFormat() !== 'ok' ? checkTokenFormat() : 'missing')}
          onRetry={() => {
            setFailure(null);
            setAttempt((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}

function MapLoader({ label }) {
  return (
    <m.div initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.6 } }} className="ambient absolute inset-0 z-10 grid place-items-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-28 w-28">
          <div className="absolute inset-0 rounded-full border border-sky-400/20" />
          <div className="absolute inset-4 rounded-full border border-sky-400/15" />
          <div className="absolute inset-8 rounded-full border border-sky-400/10" />
          <div className="absolute inset-0 animate-sweep rounded-full" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(56,189,248,0.45) 50deg, transparent 52deg)' }} />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-sky-300/80">{label}</p>
      </div>
    </m.div>
  );
}

export default memo(MapboxMap);
