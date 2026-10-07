import { createSlice } from '@reduxjs/toolkit';
import { mapLayers } from '../../config/mapLayers.js';

/** Only small, serialisable view state lives here — never GIS data or the map object. */
export const initialMapState = {
  basemap: 'dark',
  projection: 'globe',
  terrain: false,
  spinning: false,
  status: 'idle', // idle | loading | ready | error | no-token
  layers: Object.fromEntries(mapLayers.map((l) => [l.id, { visible: l.visible, opacity: l.opacity }])),
  order: mapLayers.map((l) => l.id), // index 0 = drawn on top
  customLayers: [], // GeoServer layers added at runtime (metadata only)
  layerErrors: {},
  activePanel: null, // layers | basemap | legend | tools
  measureMode: null, // distance | area
  selectedFeature: null,
};

const mapSlice = createSlice({
  name: 'map',
  initialState: initialMapState,
  reducers: {
    setBasemap: (s, a) => void (s.basemap = a.payload),
    setProjection: (s, a) => void (s.projection = a.payload),
    toggleTerrain: (s) => void (s.terrain = !s.terrain),
    setSpinning: (s, a) => void (s.spinning = a.payload),
    setMapStatus: (s, a) => void (s.status = a.payload),
    toggleLayer: (s, a) => {
      const l = s.layers[a.payload];
      if (l) {
        l.visible = !l.visible;
        if (l.visible) delete s.layerErrors[a.payload];
      }
    },
    setLayerVisible: (s, a) => {
      const l = s.layers[a.payload.id];
      if (l) l.visible = a.payload.visible;
    },
    setLayerOpacity: (s, a) => {
      const l = s.layers[a.payload.id];
      if (l) l.opacity = a.payload.opacity;
    },
    moveLayer: (s, a) => {
      const { id, direction } = a.payload;
      const i = s.order.indexOf(id);
      const j = direction === 'up' ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= s.order.length) return;
      [s.order[i], s.order[j]] = [s.order[j], s.order[i]];
    },
    addCustomLayer: (s, a) => {
      const layer = a.payload;
      if (s.customLayers.some((l) => l.id === layer.id)) return;
      s.customLayers.push(layer);
      s.layers[layer.id] = { visible: true, opacity: 0.85 };
      s.order.unshift(layer.id);
    },
    removeCustomLayer: (s, a) => {
      s.customLayers = s.customLayers.filter((l) => l.id !== a.payload);
      delete s.layers[a.payload];
      s.order = s.order.filter((id) => id !== a.payload);
    },
    setLayerError: (s, a) => void (s.layerErrors[a.payload] = true),
    setActivePanel: (s, a) => void (s.activePanel = s.activePanel === a.payload ? null : a.payload),
    openPanel: (s, a) => void (s.activePanel = a.payload),
    setMeasureMode: (s, a) => void (s.measureMode = a.payload),
    setSelectedFeature: (s, a) => void (s.selectedFeature = a.payload),
  },
});

export const {
  setBasemap, setProjection, toggleTerrain, setSpinning, setMapStatus, toggleLayer, setLayerVisible, setLayerOpacity, moveLayer,
  addCustomLayer, removeCustomLayer, setLayerError, setActivePanel, openPanel, setMeasureMode, setSelectedFeature,
} = mapSlice.actions;
export default mapSlice.reducer;
