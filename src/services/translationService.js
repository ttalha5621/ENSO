/**
 * Translation service.
 *  • Static UI strings: per-language dictionaries, code-split and loaded on demand.
 *  • Dynamic content (AI answers, layer descriptions): translated through aiService
 *    with caching, so the same text is never sent twice.
 */
import en from '../i18n/locales/en.js';
import { getLanguage } from '../i18n/languages.js';
import { aiService } from './aiService.js';

const loaders = {
  ur: () => import('../i18n/locales/ur.js'),
  ar: () => import('../i18n/locales/ar.js'),
  zh: () => import('../i18n/locales/zh.js'),
  fr: () => import('../i18n/locales/fr.js'),
  es: () => import('../i18n/locales/es.js'),
};
const dictionaries = { en };

export async function loadDictionary(code) {
  if (dictionaries[code]) return dictionaries[code];
  const loader = loaders[code];
  if (!loader) return en;
  const mod = await loader();
  dictionaries[code] = mod.default;
  return mod.default;
}

const lookup = (dict, key) => key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dict);

/** Build a t() bound to a dictionary, falling back to English, then to the key itself. */
export function createTranslator(dict) {
  return function t(key, params) {
    let value = lookup(dict, key);
    if (typeof value !== 'string') value = lookup(en, key);
    if (typeof value !== 'string') return key;
    if (params) value = value.replace(/\{(\w+)\}/g, (_, k) => (params[k] ?? `{${k}}`));
    return value;
  };
}

const fontsLoaded = new Set();
/** Load a script-appropriate web font only when that language is selected. */
export function ensureLanguageFont(code) {
  const lang = getLanguage(code);
  if (!lang.font || fontsLoaded.has(code)) return;
  fontsLoaded.add(code);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${lang.font}&display=swap`;
  document.head.appendChild(link);
}

/** AI translation of dynamic content (cached in aiService). */
export function translateContent(content, languageCode, context, signal) {
  return aiService.request({ type: 'TRANSLATE_CONTENT', content, language: getLanguage(languageCode).english, context, signal });
}
