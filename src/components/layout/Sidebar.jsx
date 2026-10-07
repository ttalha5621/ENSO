import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { ChevronDown, PanelLeftClose, PanelLeftOpen, Sparkles, X } from 'lucide-react';
import { NAV_SECTIONS } from '../../routes/navigation.js';
import { prefetchPage } from '../../routes/lazyPages.js';
import { setMobileNav, toggleSidebar } from '../../store/slices/uiSlice.js';
import { openPanel } from '../../store/slices/mapSlice.js';
import { explain, openAssistant } from '../../store/slices/aiSlice.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { selectAlerts } from '../../utils/alerts.js';
import { cx } from '../../utils/format.js';
import { Tooltip } from '../ui/primitives.jsx';
import logo from '../../assets/ndma_logo.webp';

function NavItem({ item, collapsed, onNavigate, unread }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t, lang } = useI18n();
  const activePanel = useSelector((s) => s.map.activePanel);
  const isActive = item.path ? (item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)) : false;
  const [expanded, setExpanded] = useState(isActive);
  const showChildren = item.children && !collapsed && (expanded || isActive);
  const Icon = item.icon;

  const inner = (
    <>
      {isActive && <m.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-transparent ring-1 ring-sky-400/25 rtl:bg-gradient-to-l" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
      {isActive && <m.span layoutId="nav-bar" className="absolute inset-y-2 start-0 w-[3px] rounded-full bg-gradient-to-b from-sky-300 to-cyan-500 shadow-[0_0_10px_#38bdf8]" />}
      <span className={cx('relative grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors', item.ai ? 'ai-gradient text-white shadow-md shadow-violet-500/30' : isActive ? 'text-sky-300' : 'text-muted group-hover:text-strong')}>
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        {unread > 0 && collapsed && <span className="absolute -end-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[var(--bg)]" />}
      </span>
      {!collapsed && <span className={cx('relative flex-1 truncate text-[13.5px]', isActive ? 'font-semibold text-strong' : 'text-[var(--text)] group-hover:text-strong')}>{t(item.label)}</span>}
      {!collapsed && unread > 0 && <span className="relative rounded-full bg-red-500/90 px-1.5 text-[10px] font-semibold text-white">{unread}</span>}
    </>
  );

  const base = cx('group relative flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-[var(--glass-soft)]', collapsed && 'justify-center');

  const node = item.action ? (
    <button type="button" className={cx(base, 'w-full text-start')} onClick={() => (dispatch(openAssistant()), onNavigate?.())}>{inner}</button>
  ) : (
    <NavLink to={item.path} end={item.path === '/'} className={base} onMouseEnter={() => prefetchPage(item.key)} onFocus={() => prefetchPage(item.key)} onClick={() => onNavigate?.()}>
      {inner}
    </NavLink>
  );

  return (
    <li>
      <div className="relative flex items-center">
        <div className="min-w-0 flex-1">{collapsed ? <Tooltip label={t(item.label)} side={lang.dir === 'rtl' ? 'left' : 'right'} className="w-full">{node}</Tooltip> : node}</div>
        {!collapsed && item.children && (
          <button type="button" aria-label={t(item.label)} aria-expanded={showChildren} onClick={() => setExpanded((v) => !v)} className="absolute end-1 grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-[var(--glass-hover)]">
            <ChevronDown className={cx('h-4 w-4 transition-transform', showChildren && 'rotate-180')} />
          </button>
        )}
        {!collapsed && !item.children && item.feature && (
          <button
            type="button"
            aria-label={`${t('common.explain')}: ${t(item.label)}`}
            onClick={() => dispatch(explain({ kind: 'feature', id: item.feature, title: t(item.label), breadcrumb: [t(item.label)] }))}
            className="absolute end-1 grid h-7 w-7 place-items-center rounded-lg text-violet-300 opacity-0 transition hover:bg-violet-500/15 focus:opacity-100 group-hover:opacity-100 [li:hover_&]:opacity-100"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {showChildren && (
          <m.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="ms-6 overflow-hidden border-s border-line ps-2">
            {item.children.map((c) => {
              const active = pathname === '/map' && activePanel === c.panel;
              return (
                <li key={c.panel}>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/map');
                      dispatch(openPanel(c.panel));
                      onNavigate?.();
                    }}
                    className={cx('flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] transition', active ? 'bg-sky-500/10 text-sky-300' : 'text-muted hover:bg-[var(--glass-soft)] hover:text-strong')}
                  >
                    <c.icon className="h-3.5 w-3.5" /> {t(c.label)}
                  </button>
                </li>
              );
            })}
          </m.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

function SidebarBody({ collapsed, onNavigate, mobile }) {
  const dispatch = useDispatch();
  const { t } = useI18n();
  const alerts = useSelector(selectAlerts);
  const read = useSelector((s) => s.ui.readAlertIds);
  const unread = alerts.filter((a) => a.severity !== 'info' && !read.includes(a.id)).length;

  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Primary" className="scrollbar-thin flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3">
        {NAV_SECTIONS.map((section, si) => (
          <div key={section.id} className={si ? 'mt-5' : ''}>
            {collapsed ? <div className="mx-3 mb-2 h-px bg-[var(--border)]" /> : <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{t(section.label)}</p>}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem key={item.key} item={item} collapsed={collapsed} onNavigate={onNavigate} unread={item.badge === 'alerts' ? unread : 0} />
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-line p-2.5">
        <div className={cx('flex items-center gap-2.5 rounded-xl p-2', collapsed && 'justify-center')}>
          <img src={logo} alt="NDMA" width="32" height="32" className="h-8 w-8 rounded-full bg-white/90 object-contain p-0.5" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-strong">NDMA Pakistan</p>
              <p className="truncate text-[10.5px] text-muted">G-11 · Climate Cell</p>
            </div>
          )}
          {!mobile && !collapsed && (
            <button type="button" onClick={() => dispatch(toggleSidebar())} aria-label={t('nav.collapse')} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-[var(--glass-hover)] hover:text-strong">
              <PanelLeftClose className="h-4 w-4 rtl:-scale-x-100" />
            </button>
          )}
        </div>
        {!mobile && collapsed && (
          <button type="button" onClick={() => dispatch(toggleSidebar())} aria-label={t('nav.expand')} className="mx-auto mt-1 grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-[var(--glass-hover)] hover:text-strong">
            <PanelLeftOpen className="h-4 w-4 rtl:-scale-x-100" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const dispatch = useDispatch();
  const { t, lang } = useI18n();
  const { sidebarCollapsed, mobileNavOpen } = useSelector((s) => s.ui);
  const off = lang.dir === 'rtl' ? '100%' : '-100%';

  return (
    <>
      <m.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 76 : 252 }}
        transition={{ type: 'spring', stiffness: 380, damping: 40 }}
        className="glass relative z-30 hidden shrink-0 rounded-none border-y-0 border-s-0 lg:block"
        aria-label="Sidebar"
      >
        <SidebarBody collapsed={sidebarCollapsed} />
      </m.aside>

      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <m.div key="scrim" className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => dispatch(setMobileNav(false))} />
            <m.aside
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label={t('nav.menu')}
              initial={{ x: off }}
              animate={{ x: 0 }}
              exit={{ x: off }}
              transition={{ type: 'spring', stiffness: 380, damping: 40 }}
              className="glass-strong fixed inset-y-0 start-0 z-[71] w-[280px] max-w-[85vw] rounded-e-3xl lg:hidden"
            >
              <div className="flex h-16 items-center justify-between px-4">
                <span className="font-display text-sm font-semibold text-strong">{t('app.name')}</span>
                <button type="button" onClick={() => dispatch(setMobileNav(false))} aria-label={t('common.close')} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[var(--glass-hover)]">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="h-[calc(100%-4rem)]">
                <SidebarBody collapsed={false} mobile onNavigate={() => dispatch(setMobileNav(false))} />
              </div>
            </m.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
