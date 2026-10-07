import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, m, useDragControls } from 'framer-motion';
import { MessageSquare, Sparkles, X } from 'lucide-react';
import { closeAI, setTab } from '../../store/slices/aiSlice.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { IconButton, Segmented } from '../ui/primitives.jsx';
import AIExplanationPanel from './AIExplanationPanel.jsx';
import AIAssistant from './AIAssistant.jsx';

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const on = () => setMobile(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return mobile;
}

/**
 * Non-blocking AI surface: a side drawer on desktop, a bottom sheet on mobile.
 * There is no backdrop, so the map stays fully interactive while AI works.
 */
export default function AIDrawer() {
  const dispatch = useDispatch();
  const { t, lang } = useI18n();
  const off = lang.dir === 'rtl' ? '-105%' : '105%';
  const { open, tab } = useSelector((s) => s.ai);
  const mobile = useIsMobile();
  const panelRef = useRef(null);
  const lastFocus = useRef(null);
  const drag = useDragControls();

  useEffect(() => {
    if (!open) return undefined;
    lastFocus.current = document.activeElement;
    const tmr = setTimeout(() => panelRef.current?.querySelector('[data-autofocus]')?.focus(), 60);
    const onKey = (e) => e.key === 'Escape' && dispatch(closeAI());
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(tmr);
      document.removeEventListener('keydown', onKey);
      if (lastFocus.current instanceof HTMLElement) lastFocus.current.focus?.();
    };
  }, [open, dispatch]);

  const motionProps = mobile
    ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, drag: 'y', dragControls: drag, dragListener: false, dragConstraints: { top: 0, bottom: 0 }, dragElastic: { top: 0, bottom: 0.6 }, onDragEnd: (_, i) => (i.offset.y > 120 || i.velocity.y > 600) && dispatch(closeAI()) }
    : { initial: { x: off, opacity: 0.6 }, animate: { x: 0, opacity: 1 }, exit: { x: off, opacity: 0.6 } };

  return (
    <AnimatePresence>
      {open && (
        <m.aside
          ref={panelRef}
          role="complementary"
          aria-label={t('ai.title')}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          className={
            mobile
              ? 'glass-strong fixed inset-x-0 bottom-0 z-[60] flex h-[82dvh] flex-col rounded-t-3xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))]'
              : 'glass-strong fixed bottom-12 end-3 top-[76px] z-[60] flex w-[420px] max-w-[calc(100vw-1.5rem)] flex-col rounded-3xl px-5 pb-5'
          }
          {...motionProps}
        >
          {mobile && (
            <div onPointerDown={(e) => drag.start(e)} className="mx-auto flex w-full cursor-grab touch-none justify-center py-3" aria-hidden>
              <span className="h-1.5 w-12 rounded-full bg-[var(--border-strong)]" />
            </div>
          )}
          <header className={`flex items-center gap-3 ${mobile ? 'pb-3' : 'py-4'}`}>
            <span className="relative grid h-9 w-9 place-items-center rounded-xl ai-gradient text-white shadow-lg shadow-violet-500/30">
              <Sparkles className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 data-autofocus tabIndex={-1} className="font-display text-[15px] font-semibold text-strong focus:outline-none">{t('ai.title')}</h2>
              <p className="text-[11px] text-muted">Google Gemini · context-aware</p>
            </div>
            <IconButton icon={X} label={t('common.close')} onClick={() => dispatch(closeAI())} tooltipSide="left" />
          </header>

          <div className="mb-4">
            <Segmented
              size="sm"
              label={t('ai.title')}
              value={tab}
              onChange={(v) => dispatch(setTab(v))}
              options={[
                { value: 'explain', label: <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />{t('ai.explainTab')}</span> },
                { value: 'ask', label: <span className="inline-flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" />{t('ai.askTab')}</span> },
              ]}
            />
          </div>

          <div className={`min-h-0 flex-1 ${tab === 'explain' ? 'scrollbar-thin -me-2 overflow-y-auto pe-2' : 'flex flex-col'}`}>
            {tab === 'explain' ? <AIExplanationPanel /> : <AIAssistant />}
          </div>
        </m.aside>
      )}
    </AnimatePresence>
  );
}
