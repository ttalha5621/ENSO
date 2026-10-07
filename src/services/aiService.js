/**
 * One reusable AI service for every Explain / Simplify / Translate / Ask action.
 *  • Talks only to our backend (/api/ai) — the Google key stays server-side.
 *  • Caches by type + language + subject + content so repeats are free.
 *  • De-duplicates concurrent identical requests and supports cancellation.
 *  • Never throws into the UI unexpectedly: errors carry a stable `code`.
 */
import { api } from './api.js';

export const AI_REQUEST = Object.freeze({
  EXPLAIN_FEATURE: 'EXPLAIN_FEATURE',
  EXPLAIN_LAYER: 'EXPLAIN_LAYER',
  EXPLAIN_MAP: 'EXPLAIN_MAP',
  SIMPLIFY_CONTENT: 'SIMPLIFY_CONTENT',
  TRANSLATE_CONTENT: 'TRANSLATE_CONTENT',
  EXPLAIN_SELECTED_FEATURE: 'EXPLAIN_SELECTED_FEATURE',
  ANSWER_GIS_QUESTION: 'ANSWER_GIS_QUESTION',
});

const STORAGE_KEY = 'enso.aiCache.v1';
const MAX_ENTRIES = 80;
const cache = new Map(readStore());
const inflight = new Map();

function readStore() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}
function writeStore() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...cache].slice(-MAX_ENTRIES)));
  } catch {
    /* storage full or blocked — in-memory cache still works */
  }
}

function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export class AIError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
  }
}

function toAIError(err) {
  if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return new AIError('CANCELED');
  if (err?.code === 'ECONNABORTED') return new AIError('TIMEOUT');
  const data = err?.response?.data;
  if (data?.error) return new AIError(data.error, data.message);
  if (err?.response?.status === 404) return new AIError('AI_NOT_CONFIGURED'); // no backend running
  if (!err?.response) return new AIError('NETWORK');
  return new AIError('UPSTREAM_ERROR');
}

export const aiService = {
  /**
   * @param {{type:string, language?:string, context?:object, content?:string, question?:string,
   *          history?:Array, subjectKey?:string, signal?:AbortSignal, force?:boolean}} req
   */
  async request({ type, language = 'English', context, content, question, history, subjectKey, signal, force = false }) {
    const cacheable = type !== AI_REQUEST.ANSWER_GIS_QUESTION;
    const key = `${type}|${language}|${subjectKey || ''}|${hash(JSON.stringify([context, content, question]))}`;

    if (cacheable && !force && cache.has(key)) return { text: cache.get(key), cached: true };
    if (inflight.has(key)) return inflight.get(key);

    const promise = api
      .post('/api/ai', { type, language, context, content, question, history }, { signal, timeout: 35000 })
      .then(({ data }) => {
        if (cacheable) {
          cache.delete(key);
          cache.set(key, data.text);
          if (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value);
          writeStore();
        }
        return { text: data.text, model: data.model, cached: false };
      })
      .catch((err) => {
        throw toAIError(err);
      })
      .finally(() => inflight.delete(key));

    inflight.set(key, promise);
    return promise;
  },

  clearCache() {
    cache.clear();
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  },
};
