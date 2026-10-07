/** Add a language: create src/i18n/locales/<code>.js and add an entry here. */
export const LANGUAGES = [
  { code: 'en', native: 'English', english: 'English', dir: 'ltr' },
  { code: 'ur', native: 'اردو', english: 'Urdu', dir: 'rtl', font: 'Noto+Nastaliq+Urdu:wght@400;600', family: '"Noto Nastaliq Urdu"' },
  { code: 'ar', native: 'العربية', english: 'Arabic', dir: 'rtl', font: 'Noto+Sans+Arabic:wght@400;500;600', family: '"Noto Sans Arabic"' },
  { code: 'zh', native: '中文', english: 'Chinese (Simplified)', dir: 'ltr', font: 'Noto+Sans+SC:wght@400;500;600', family: '"Noto Sans SC"' },
  { code: 'fr', native: 'Français', english: 'French', dir: 'ltr' },
  { code: 'es', native: 'Español', english: 'Spanish', dir: 'ltr' },
];

export const DEFAULT_LANGUAGE = 'en';
export const getLanguage = (code) => LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
