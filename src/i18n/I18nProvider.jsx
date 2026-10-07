import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import en from './locales/en.js';
import { getLanguage } from './languages.js';
import { createTranslator, ensureLanguageFont, loadDictionary } from '../services/translationService.js';

const I18nContext = createContext({ t: createTranslator(en), lang: getLanguage('en'), ready: true });

export function I18nProvider({ children }) {
  const code = useSelector((s) => s.ui.language);
  const [dict, setDict] = useState({ code: 'en', data: en });

  useEffect(() => {
    let alive = true;
    ensureLanguageFont(code);
    loadDictionary(code).then((data) => alive && setDict({ code, data }));
    return () => {
      alive = false;
    };
  }, [code]);

  const lang = getLanguage(dict.code);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang.code;
    html.dir = lang.dir;
    html.style.setProperty('--font-script', lang.family || 'var(--font-sans)');
  }, [lang]);

  const value = useMemo(() => ({ t: createTranslator(dict.data), lang, ready: dict.code === code }), [dict, lang, code]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useI18n = () => useContext(I18nContext);
