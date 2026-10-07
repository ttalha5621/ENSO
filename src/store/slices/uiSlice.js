import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_LANGUAGE, LANGUAGES } from '../../i18n/languages.js';

const systemTheme = () => (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
const browserLanguage = () => {
  const code = (typeof navigator !== 'undefined' && navigator.language?.slice(0, 2)) || DEFAULT_LANGUAGE;
  return LANGUAGES.some((l) => l.code === code) ? code : DEFAULT_LANGUAGE;
};

export const initialUiState = {
  theme: systemTheme(),
  language: browserLanguage(),
  sidebarCollapsed: false,
  mobileNavOpen: false,
  reduceMotion: false,
  searchOpen: false,
  readAlertIds: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: initialUiState,
  reducers: {
    setTheme: (s, a) => void (s.theme = a.payload),
    toggleTheme: (s) => void (s.theme = s.theme === 'dark' ? 'light' : 'dark'),
    setLanguage: (s, a) => void (s.language = a.payload),
    toggleSidebar: (s) => void (s.sidebarCollapsed = !s.sidebarCollapsed),
    setMobileNav: (s, a) => void (s.mobileNavOpen = a.payload),
    setReduceMotion: (s, a) => void (s.reduceMotion = a.payload),
    setSearchOpen: (s, a) => void (s.searchOpen = a.payload),
    markAlertsRead: (s, a) => {
      s.readAlertIds = [...new Set([...s.readAlertIds, ...a.payload])].slice(-200);
    },
  },
});

export const { setTheme, toggleTheme, setLanguage, toggleSidebar, setMobileNav, setReduceMotion, setSearchOpen, markAlertsRead } = uiSlice.actions;
export default uiSlice.reducer;
