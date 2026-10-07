import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, m } from 'framer-motion';
import { Bot, CornerDownLeft, Eraser, Layers, Sparkles, TriangleAlert, User } from 'lucide-react';
import { aiService, AI_REQUEST } from '../../services/aiService.js';
import { addMessage, clearMessages } from '../../store/slices/aiSlice.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { useAIContext } from '../../hooks/useAIContext.js';
import { useLayerCatalog } from '../../hooks/useLayerCatalog.js';
import { Markdown } from '../../utils/markdown.jsx';
import { IconButton } from '../ui/primitives.jsx';
import AIThinking from './AIThinking.jsx';

export default function AIAssistant() {
  const { t, lang } = useI18n();
  const dispatch = useDispatch();
  const messages = useSelector((s) => s.ai.messages);
  const aiState = useSelector((s) => s.services.ai);
  const buildContext = useAIContext();
  const active = useLayerCatalog().filter((l) => l.visible);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, busy]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const ask = async (question) => {
    const q = question.trim();
    if (!q || busy) return;
    setInput('');
    dispatch(addMessage({ role: 'user', text: q }));
    setBusy(true);
    abortRef.current = new AbortController();
    try {
      const res = await aiService.request({
        type: AI_REQUEST.ANSWER_GIS_QUESTION,
        question: q,
        language: lang.english,
        context: buildContext({ kind: 'assistant', breadcrumb: ['Assistant'] }),
        history: messages.filter((x) => !x.error).slice(-6).map(({ role, text }) => ({ role, text })),
        signal: abortRef.current.signal,
      });
      dispatch(addMessage({ role: 'assistant', text: res.text }));
    } catch (err) {
      if (err.code !== 'CANCELED') dispatch(addMessage({ role: 'assistant', error: err.code, text: '' }));
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const examples = [t('ai.ex1'), t('ai.ex2'), t('ai.ex3'), t('ai.ex4')];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-[var(--glass-soft)] px-3 py-2 text-[11px] text-muted ring-1 ring-[var(--border)]">
        <Layers className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
        <span className="truncate">
          {t('ai.context')}: {active.length ? active.map((l) => l.short || l.name).join(' · ') : '—'}
        </span>
        {messages.length > 0 && <IconButton size="sm" icon={Eraser} label={t('ai.clearChat')} onClick={() => dispatch(clearMessages())} className="ms-auto !h-6 !w-6" tooltipSide="left" />}
      </div>

      <div ref={listRef} className="scrollbar-thin -me-2 min-h-0 flex-1 space-y-4 overflow-y-auto pe-2" aria-live="polite">
        {messages.length === 0 && (
          <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-4 text-center">
            <div className="relative mx-auto mb-4 grid h-16 w-16 place-items-center">
              <span className="absolute inset-0 animate-float rounded-2xl ai-gradient opacity-90 shadow-2xl shadow-violet-500/40" />
              <Sparkles className="relative h-7 w-7 text-white" />
            </div>
            <h3 className="font-display text-base font-semibold text-strong">{t('ai.title')}</h3>
            <p className="mx-auto mt-1 max-w-xs text-xs text-muted">{t('ai.askPlaceholder')}</p>
            {aiState === 'notConfigured' && <p className="mx-auto mt-3 max-w-xs rounded-lg bg-amber-400/10 px-3 py-2 text-xs text-amber-300">{t('ai.errors.AI_NOT_CONFIGURED')}</p>}
            <p className="mt-6 text-start text-[11px] font-semibold uppercase tracking-wider text-muted">{t('ai.examples')}</p>
            <div className="mt-2 grid gap-2">
              {examples.map((ex, i) => (
                <m.button
                  key={ex}
                  type="button"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.08 * i } }}
                  onClick={() => ask(ex)}
                  className="rounded-xl bg-[var(--glass-soft)] px-3.5 py-2.5 text-start text-[13px] text-[var(--text)] ring-1 ring-[var(--border)] transition hover:bg-violet-500/10 hover:text-strong hover:ring-violet-400/30"
                >
                  {ex}
                </m.button>
              ))}
            </div>
          </m.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <m.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${msg.role === 'user' ? 'bg-sky-500/15 text-sky-300' : 'ai-gradient text-white'}`}>
                {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </span>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] ${msg.role === 'user' ? 'bg-sky-500/12 text-strong ring-1 ring-sky-400/20' : 'bg-[var(--glass-soft)] ring-1 ring-[var(--border)]'}`}>
                {msg.error ? (
                  <span className="flex gap-2 text-amber-300">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    {t(`ai.errors.${msg.error}`) !== `ai.errors.${msg.error}` ? t(`ai.errors.${msg.error}`) : t('ai.unavailable')}
                  </span>
                ) : msg.role === 'user' ? (
                  msg.text
                ) : (
                  <Markdown text={msg.text} />
                )}
              </div>
            </m.div>
          ))}
        </AnimatePresence>
        {busy && (
          <div className="flex gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg ai-gradient text-white"><Bot className="h-3.5 w-3.5" /></span>
            <div className="flex-1 rounded-2xl bg-[var(--glass-soft)] px-3.5 py-3 ring-1 ring-[var(--border)]"><AIThinking /></div>
          </div>
        )}
      </div>

      <form
        className="mt-3 flex items-end gap-2 rounded-2xl bg-[var(--glass-soft)] p-1.5 ring-1 ring-[var(--border)] focus-within:ring-2 focus-within:ring-violet-400/50"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <label htmlFor="ai-ask" className="sr-only">{t('ai.askPlaceholder')}</label>
        <textarea
          id="ai-ask"
          ref={inputRef}
          rows={1}
          value={input}
          maxLength={1500}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              ask(input);
            }
          }}
          placeholder={t('ai.askPlaceholder')}
          className="max-h-32 min-h-9 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-strong placeholder:text-muted focus:outline-none"
        />
        <button type="submit" disabled={!input.trim() || busy} aria-label={t('ai.send')} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl ai-gradient text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110 active:scale-95 disabled:opacity-40">
          <CornerDownLeft className="h-4 w-4 rtl:-scale-x-100" />
        </button>
      </form>
      <p className="mt-2 text-center text-[10.5px] text-muted">{t('ai.disclaimer')}</p>
    </div>
  );
}
