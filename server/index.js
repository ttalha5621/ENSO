/**
 * ENSO Command Center — lightweight backend (zero dependencies, Node >= 20.12).
 *
 *  • POST /api/ai              → Google Gemini proxy (key never reaches the browser)
 *  • GET  /api/health          → which backend features are configured
 *  • GET  /api/climate/oni     → NOAA CPC Oceanic Niño Index (cached, parsed)
 *  • GET  /api/climate/dmi     → NOAA PSL Dipole Mode Index / IOD (cached, parsed)
 *  • everything else           → serves the built SPA from /dist (production)
 */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPrompt, AI_TYPES } from './prompts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

try {
  process.loadEnvFile(path.join(ROOT, '.env'));
} catch {
  /* .env is optional — real deployments use the process environment */
}

const PORT = Number(process.env.API_PORT || process.env.PORT || 8787);
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
// Tried in order when the main model is busy or unavailable.
const FALLBACKS = (process.env.GEMINI_FALLBACK_MODELS || 'gemini-flash-latest,gemini-2.5-flash').split(',').map((m) => m.trim()).filter(Boolean);
const MODELS = [...new Set([GEMINI_MODEL, ...FALLBACKS])];
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
const DIST = path.join(ROOT, 'dist');

if (process.env.VITE_GEMINI_API_KEY) {
  console.warn('[security] VITE_GEMINI_API_KEY is set. VITE_* variables can be bundled into the browser — rename it to GEMINI_API_KEY.');
}

/* ───────────────────────── helpers ───────────────────────── */

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
};

function send(res, status, body, headers = {}) {
  const isJson = typeof body !== 'string' && !Buffer.isBuffer(body);
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    'Content-Type': isJson ? 'application/json; charset=utf-8' : headers['Content-Type'] || 'text/plain',
    ...headers,
  });
  res.end(isJson ? JSON.stringify(body) : body);
}

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

async function readJson(req, limit = 32 * 1024) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('Request too large'), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    throw Object.assign(new Error('Invalid JSON'), { status: 400 });
  }
}

/* Simple sliding-window rate limiter: 30 AI calls / minute / IP */
const hits = new Map();
function rateLimited(ip, max = 30, windowMs = 60_000) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}

/* ───────────────────────── AI proxy ───────────────────────── */

async function handleAI(req, res) {
  if (!GEMINI_KEY) {
    return send(res, 503, { error: 'AI_NOT_CONFIGURED', message: 'GEMINI_API_KEY is not set on the server.' });
  }
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  if (rateLimited(ip)) return send(res, 429, { error: 'RATE_LIMITED', message: 'Too many AI requests. Try again in a minute.' });

  const body = await readJson(req);
  if (!AI_TYPES.includes(body.type)) return send(res, 400, { error: 'INVALID_REQUEST', message: 'Unknown AI request type.' });

  const { system, user } = buildPrompt(body);
  const payload = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: [...(body.history || []).slice(-6).map(toGeminiTurn), { role: 'user', parts: [{ text: user }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
  });

  // Busy/overloaded models (429/500/503) are retried briefly, then the next model in
  // GEMINI_FALLBACK_MODELS is tried. A model that doesn't exist (404) is skipped at once.
  let last = { status: 502, code: 'UPSTREAM_ERROR', detail: '' };
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt) await sleep(attempt * 900);
      const result = await callGemini(model, payload);
      if (result.text) return send(res, 200, { text: result.text, model });
      last = result;
      console.warn(`[ai] ${model} attempt ${attempt + 1}: ${result.status} ${result.detail}`);
      if (!RETRYABLE.has(result.status)) break;
    }
    // Only fall back for model-specific problems; a bad key or request fails the same everywhere.
    if (![404, 429, 500, 502, 503, 504].includes(last.status)) break;
  }
  return send(res, last.status === 429 ? 429 : 502, { error: last.code, message: last.detail || 'Google AI is unavailable.' });
}

const RETRYABLE = new Set([429, 500, 502, 503, 504]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callGemini(model, payload) {
  let upstream;
  try {
    upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
      body: payload,
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    const timeout = err?.name === 'TimeoutError';
    return { status: timeout ? 504 : 502, code: timeout ? 'TIMEOUT' : 'NETWORK', detail: 'Could not reach Google AI.' };
  }
  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    const st = upstream.status;
    const code = st === 429 ? 'RATE_LIMITED' : st === 404 ? 'MODEL_NOT_FOUND' : st === 503 || st === 500 ? 'BUSY' : st === 400 || st === 401 || st === 403 ? 'UPSTREAM_REJECTED' : 'UPSTREAM_ERROR';
    return { status: st, code, detail: data?.error?.message || `HTTP ${st}` };
  }
  // Skip "thought" parts from thinking models; keep only the answer text.
  const text = (data.candidates?.[0]?.content?.parts || []).filter((p) => !p.thought).map((p) => p.text || '').join('').trim();
  if (!text) return { status: 502, code: 'EMPTY', detail: `Empty response (${data.candidates?.[0]?.finishReason || 'no candidates'})` };
  return { status: 200, text };
}

function toGeminiTurn(turn) {
  return { role: turn.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(turn.text || '').slice(0, 4000) }] };
}

/* ───────────────────────── climate indices ───────────────────────── */

const SIX_HOURS = 6 * 60 * 60 * 1000;
const cache = new Map();

async function cached(key, loader) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < SIX_HOURS) return hit.value;
  try {
    const value = await loader();
    cache.set(key, { at: Date.now(), value });
    return value;
  } catch (err) {
    if (hit) return { ...hit.value, stale: true };
    throw err;
  }
}

async function fetchText(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(20_000), headers: { 'User-Agent': 'ENSO-Command-Center/2.0' } });
  if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`);
  return r.text();
}

const ONI_URL = 'https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt';
const DMI_URL = 'https://psl.noaa.gov/gcos_wgsp/Timeseries/Data/dmi.had.long.data';

export function parseONI(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.trim().match(/^([A-Z]{3})\s+(\d{4})\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)$/);
    if (m) rows.push({ season: m[1], year: +m[2], total: +m[3], anom: +m[4] });
  }
  return rows;
}

export function parseDMI(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/);
    if (parts.length !== 13 || !/^\d{4}$/.test(parts[0])) continue;
    const year = +parts[0];
    parts.slice(1).forEach((v, i) => {
      const value = Number(v);
      if (Number.isFinite(value) && value > -99) rows.push({ year, month: i + 1, value });
    });
  }
  return rows;
}

async function handleClimate(res, which) {
  try {
    const value =
      which === 'oni'
        ? await cached('oni', async () => ({ source: ONI_URL, fetchedAt: new Date().toISOString(), rows: parseONI(await fetchText(ONI_URL)) }))
        : await cached('dmi', async () => ({ source: DMI_URL, fetchedAt: new Date().toISOString(), rows: parseDMI(await fetchText(DMI_URL)) }));
    send(res, 200, value, { 'Cache-Control': 'public, max-age=1800' });
  } catch (err) {
    console.warn(`[climate] ${which}:`, err.message);
    send(res, 502, { error: 'SOURCE_UNAVAILABLE', message: `The ${which.toUpperCase()} source could not be reached.` });
  }
}

/* ───────────────────────── static SPA ───────────────────────── */

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.jpg': 'image/jpeg',
  '.gif': 'image/gif', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.md': 'text/markdown',
};

async function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = path.normalize(path.join(DIST, urlPath));
  if (!file.startsWith(DIST)) return send(res, 403, 'Forbidden');
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
  } catch {
    file = path.join(DIST, 'index.html'); // SPA fallback
  }
  try {
    const buf = await readFile(file);
    const ext = path.extname(file);
    const immutable = file.includes(`${path.sep}assets${path.sep}`);
    send(res, 200, buf, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
  } catch {
    send(res, 404, 'Not found — run "npm run build" first.');
  }
}

/* ───────────────────────── router ───────────────────────── */

const server = http.createServer(async (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') return send(res, 204, '');
  const { pathname } = new URL(req.url, 'http://x');
  try {
    if (pathname === '/api/health') return send(res, 200, { ok: true, ai: Boolean(GEMINI_KEY), model: GEMINI_KEY ? GEMINI_MODEL : null });
    if (pathname === '/api/ai' && req.method === 'POST') return await handleAI(req, res);
    if (pathname === '/api/climate/oni') return await handleClimate(res, 'oni');
    if (pathname === '/api/climate/dmi') return await handleClimate(res, 'dmi');
    if (pathname.startsWith('/api/')) return send(res, 404, { error: 'NOT_FOUND' });
    return await serveStatic(req, res);
  } catch (err) {
    send(res, err.status || 500, { error: 'SERVER_ERROR', message: err.status ? err.message : 'Unexpected server error.' });
  }
});

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  server.listen(PORT, () => {
    console.log(`ENSO API listening on http://localhost:${PORT}  (AI: ${GEMINI_KEY ? MODELS.join(' → ') : 'not configured — offline guide only'})`);
  });
}
