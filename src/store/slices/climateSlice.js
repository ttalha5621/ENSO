import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getDMI, getONI } from '../../services/api.js';

/** Index series are small (≈900 + 1900 rows of numbers) — fine to keep in the store. */
export const fetchONI = createAsyncThunk('climate/oni', (_, { signal }) => getONI(signal), {
  condition: (_, { getState }) => !['loading', 'ready'].includes(getState().climate.oni.status),
});
export const fetchDMI = createAsyncThunk('climate/dmi', (_, { signal }) => getDMI(signal), {
  condition: (_, { getState }) => !['loading', 'ready'].includes(getState().climate.dmi.status),
});

const empty = { status: 'idle', rows: [], fetchedAt: null, source: null };

const climateSlice = createSlice({
  name: 'climate',
  initialState: { oni: empty, dmi: empty },
  reducers: {},
  extraReducers: (b) => {
    for (const [thunk, key] of [[fetchONI, 'oni'], [fetchDMI, 'dmi']]) {
      b.addCase(thunk.pending, (s) => void (s[key].status = 'loading'));
      b.addCase(thunk.fulfilled, (s, a) => {
        s[key] = { status: 'ready', rows: a.payload.rows || [], fetchedAt: a.payload.fetchedAt, source: a.payload.source, stale: !!a.payload.stale };
      });
      b.addCase(thunk.rejected, (s) => void (s[key].status = 'error'));
    }
  },
});

export default climateSlice.reducer;
