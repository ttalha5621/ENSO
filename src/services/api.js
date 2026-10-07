import axios from 'axios';
import { ENV } from '../config/env.js';

/** Axios instance for the portal's own backend (AI proxy, climate indices). */
export const api = axios.create({
  baseURL: ENV.API_BASE_URL || '',
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

export const getHealth = (signal) => api.get('/api/health', { signal, timeout: 6000 }).then((r) => r.data);
export const getONI = (signal) => api.get('/api/climate/oni', { signal }).then((r) => r.data);
export const getDMI = (signal) => api.get('/api/climate/dmi', { signal }).then((r) => r.data);
