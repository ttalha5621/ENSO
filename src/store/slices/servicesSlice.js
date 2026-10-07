import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getHealth } from '../../services/api.js';
import { probeGeoServer, probeWms } from '../../services/geoServer.js';

export const checkServices = createAsyncThunk('services/check', async () => {
  const [health, gibs, geoserver] = await Promise.all([
    getHealth().catch(() => null),
    probeWms({ service: 'gibs', layer: 'MODIS_Aqua_L2_Sea_Surface_Temp_Day' }),
    probeGeoServer(),
  ]);
  return {
    ai: health ? (health.ai ? 'online' : 'notConfigured') : 'offline',
    model: health?.model || null,
    api: health ? 'online' : 'offline',
    gibs: gibs ? 'online' : 'offline',
    geoserver,
    checkedAt: new Date().toISOString(),
  };
});

const servicesSlice = createSlice({
  name: 'services',
  initialState: { ai: 'checking', api: 'checking', gibs: 'checking', geoserver: 'checking', model: null, checkedAt: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(checkServices.fulfilled, (_, a) => a.payload);
  },
});

export default servicesSlice.reducer;
