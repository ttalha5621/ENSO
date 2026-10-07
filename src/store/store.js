import { configureStore } from '@reduxjs/toolkit';
import ui, { initialUiState } from './slices/uiSlice.js';
import map, { initialMapState } from './slices/mapSlice.js';
import ai from './slices/aiSlice.js';
import climate from './slices/climateSlice.js';
import services from './slices/servicesSlice.js';
import { mapLayers } from '../config/mapLayers.js';

const PREFS_KEY = 'enso.prefs.v2';

function loadPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null');
    if (!saved) return undefined;
    const known = new Set([...mapLayers.map((l) => l.id), ...(saved.map?.customLayers || []).map((l) => l.id)]);
    const savedOrder = (saved.map?.order || []).filter((id) => known.has(id));
    const order = [...savedOrder, ...initialMapState.order.filter((id) => !savedOrder.includes(id))];
    return {
      ui: { ...initialUiState, ...saved.ui, mobileNavOpen: false, searchOpen: false },
      map: {
        ...initialMapState,
        ...saved.map,
        layers: { ...initialMapState.layers, ...Object.fromEntries(Object.entries(saved.map?.layers || {}).filter(([id]) => known.has(id))) },
        order,
        status: 'idle', layerErrors: {}, activePanel: null, measureMode: null, selectedFeature: null, spinning: false,
      },
    };
  } catch {
    return undefined;
  }
}

export const store = configureStore({
  reducer: { ui, map, ai, climate, services },
  preloadedState: loadPrefs(),
});

let timer;
store.subscribe(() => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const { ui: u, map: m } = store.getState();
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({
          ui: { theme: u.theme, language: u.language, sidebarCollapsed: u.sidebarCollapsed, reduceMotion: u.reduceMotion, readAlertIds: u.readAlertIds },
          map: { basemap: m.basemap, projection: m.projection, terrain: m.terrain, layers: m.layers, order: m.order, customLayers: m.customLayers },
        }),
      );
    } catch {
      /* private mode — preferences simply won't persist */
    }
  }, 400);
});
