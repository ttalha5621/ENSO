import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { Bell, Check, Command, Languages, Menu, Moon, Search, Settings, Sparkles, Sun, UserRound } from 'lucide-react';
import { LANGUAGES } from '../../i18n/languages.js';
import { markAlertsRead, setLanguage, setMobileNav, setSearchOpen, toggleTheme } from '../../store/slices/uiSlice.js';
import { openAssistant } from '../../store/slices/aiSlice.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { alertMessage, selectAlerts, SEVERITY_STYLE } from '../../utils/alerts.js';
import { cx } from '../../utils/format.js';
import { IconButton, Popover } from '../ui/primitives.jsx';
import logo from '../../assets/ndma_logo.webp';

function LanguageMenu() {
  const dispatch = useDispatch();
  const { t, lang } = useI18n();
  return (
    <Popover
      width="w-56"
      trigger={({ open, toggle }) => (
        <IconButton icon={Languages} label={`${t('common.language')} · ${lang.native}`} onClick={toggle} active={open} aria-haspopup="menu" aria-expanded={open} />
      )}
    >
      {({ close }) => (
        <div role="menu" aria-label={t('common.language')}>
          <p className="flex items-center gap-2 px-2.5 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
            <Languages className="h-3.5 w-3.5" /> {t('common.language')}
          </p>
          {LANGUAGES.map((l, i) => {
            const active = l.code === lang.code;
            return (
              <m.button
                key={l.code}
                role="menuitemradio"
                aria-checked={active}
                type="button"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0, transition: { delay: i * 0.03 } }}
                onClick={() => {
                  dispatch(setLanguage(l.code));
                  close();
                }}
                className={cx('flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-start transition', active ? 'bg-sky-500/12 text-strong' : 'hover:bg-[var(--glass-soft)]')}
              >
                <span className="grid w-4 place-items-center">{active && <Check className="h-4 w-4 text-sky-400" />}</span>
                <span className="flex-1 text-sm" dir={l.dir} style={l.family ? { fontFamily: l.family } : undefined}>{l.native}</span>
                <span className="text-[10.5px] uppercase text-muted">{l.code}</span>
              </m.button>
            );
          })}
        </div>
      )}
    </Popover>
  );
}

function Notifications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useI18n();
  const alerts = useSelector(selectAlerts);
  const read = useSelector((s) => s.ui.readAlertIds);
  const unread = alerts.filter((a) => !read.includes(a.id));
  return (
    <Popover
      width="w-80"
      trigger={({ open, toggle }) => <IconButton icon={Bell} label={t('notif.title')} onClick={toggle} active={open} badge={unread.length || null} aria-haspopup="dialog" />}
    >
      {({ close }) => (
        <div>
          <div className="flex items-center justify-between px-2.5 pb-2 pt-1">
            <p className="text-sm font-semibold text-strong">{t('notif.title')}</p>
            {unread.length > 0 && (
              <button type="button" onClick={() => dispatch(markAlertsRead(alerts.map((a) => a.id)))} className="text-[11px] font-medium text-sky-400 hover:underline">
                {t('alerts.markAllRead')}
              </button>
            )}
          </div>
          <ul className="scrollbar-thin max-h-80 space-y-1 overflow-y-auto">
            {alerts.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">{t('notif.empty')}</li>}
            {alerts.slice(0, 6).map((a) => {
              const s = SEVERITY_STYLE[a.severity];
              const isRead = read.includes(a.id);
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(markAlertsRead([a.id]));
                      navigate('/alerts');
                      close();
                    }}
                    className="flex w-full gap-3 rounded-xl px-2.5 py-2 text-start hover:bg-[var(--glass-soft)]"
                  >
                    <span className={cx('mt-1.5 h-2 w-2 shrink-0 rounded-full', s.dot, isRead && 'opacity-30')} />
                    <span className="min-w-0 flex-1">
                      <span className={cx('block text-[10.5px] font-semibold uppercase tracking-wider', s.text)}>{t(`alerts.severity.${a.severity}`)}</span>
                      <span className={cx('block text-[13px]', isRead ? 'text-muted' : 'text-strong')}>
                        {alertMessage(t, a)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Link to="/alerts" onClick={close} className="mt-1 block rounded-xl px-2.5 py-2 text-center text-xs font-medium text-sky-400 hover:bg-[var(--glass-soft)]">
            {t('common.viewAll')}
          </Link>
        </div>
      )}
    </Popover>
  );
}

function UserMenu() {
  const { t } = useI18n();
  return (
    <Popover
      width="w-60"
      trigger={({ toggle, open }) => (
        <button type="button" onClick={toggle} aria-expanded={open} aria-haspopup="menu" className="flex items-center gap-2 rounded-xl py-1 pe-2 ps-1 transition hover:bg-[var(--glass-hover)]">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 text-[11px] font-bold text-white shadow-md shadow-emerald-500/20">G-11</span>
          <span className="hidden text-start xl:block">
            <span className="block text-xs font-semibold text-strong">NDMA Analyst</span>
            <span className="block text-[10.5px] text-muted">Climate Cell</span>
          </span>
        </button>
      )}
    >
      {({ close }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-3 rounded-xl bg-[var(--glass-soft)] p-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--glass-hover)] text-emerald-400"><UserRound className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-semibold text-strong">NDMA Analyst</p>
              <p className="text-[11px] text-muted">G-11 · {t('app.org')}</p>
            </div>
          </div>
          <Link to="/settings" onClick={close} className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm hover:bg-[var(--glass-soft)]">
            <Settings className="h-4 w-4 text-muted" /> {t('nav.settings')}
          </Link>
        </div>
      )}
    </Popover>
  );
}

export default function Navbar() {
  const dispatch = useDispatch();
  const { t } = useI18n();
  const theme = useSelector((s) => s.ui.theme);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="glass relative z-40 flex h-16 shrink-0 items-center gap-2 rounded-none border-x-0 border-t-0 px-3 md:gap-3 md:px-4">
      <IconButton icon={Menu} label={t('nav.menu')} onClick={() => dispatch(setMobileNav(true))} className="lg:hidden" />
      <Link to="/" className="flex min-w-0 items-center gap-3" aria-label={t('app.name')}>
        <span className="relative grid h-10 w-10 shrink-0 place-items-center">
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400/40 to-emerald-400/30 blur-md" />
          <img src={logo} alt="" width="40" height="40" className="relative h-10 w-10 rounded-full bg-white object-contain p-0.5 ring-1 ring-white/20" />
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate font-display text-[15px] font-semibold leading-tight text-strong">{t('app.name')}</span>
          <span className="block truncate text-[11px] leading-tight text-muted">{t('app.subtitle')}</span>
        </span>
      </Link>

      <div className="flex flex-1 justify-center px-1 md:px-6">
        <button
          type="button"
          onClick={() => dispatch(setSearchOpen(true))}
          className="group flex h-10 w-full max-w-md items-center gap-3 rounded-xl bg-[var(--glass-soft)] px-3 text-start text-sm text-muted ring-1 ring-[var(--border)] transition hover:bg-[var(--glass-hover)] hover:ring-[var(--border-strong)]"
          aria-label={t('search.placeholder')}
        >
          <Search className="h-4 w-4 shrink-0 text-sky-400 transition-transform group-hover:scale-110" />
          <span className="hidden flex-1 truncate md:block">{t('search.placeholder')}</span>
          <kbd className="ms-auto hidden items-center gap-0.5 rounded-md bg-[var(--glass-hover)] px-1.5 py-0.5 font-mono text-[10px] md:flex">
            {isMac ? <Command className="h-3 w-3" /> : 'Ctrl'} K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-1 md:gap-1.5">
        <button
          type="button"
          onClick={() => dispatch(openAssistant())}
          className="group relative hidden h-9 items-center gap-2 overflow-hidden rounded-xl px-3.5 text-sm font-medium text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/50 sm:flex"
        >
          <span className="absolute inset-0 ai-gradient" />
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <Sparkles className="relative h-4 w-4" />
          <span className="relative hidden md:inline">{t('ai.title')}</span>
        </button>
        <IconButton icon={Sparkles} label={t('ai.title')} onClick={() => dispatch(openAssistant())} className="text-violet-300 sm:hidden" />
        <LanguageMenu />
        <Notifications />
        <IconButton icon={theme === 'dark' ? Sun : Moon} label={t('settings.theme')} onClick={() => dispatch(toggleTheme())} className="hidden sm:inline-flex" />
        <UserMenu />
      </div>
    </header>
  );
}
