import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence, m } from 'framer-motion';
import { Check, ChevronRight, Copy, Database, RefreshCw, Sparkles, TriangleAlert } from 'lucide-react';
import { aiService, AI_REQUEST } from '../../services/aiService.js';
import { getFeature } from '../../config/aiFeatures.js';
import { mapLayers } from '../../config/mapLayers.js';
import { getLanguage } from '../../i18n/languages.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { useAIContext } from '../../hooks/useAIContext.js';
import { Markdown } from '../../utils/markdown.jsx';
import { Badge, Button } from '../ui/primitives.jsx';
import AIThinking from './AIThinking.jsx';
import AISimplify from './AISimplify.jsx';
import AITranslate from './AITranslate.jsx';

const TYPE_BY_KIND = {
  feature: AI_REQUEST.EXPLAIN_FEATURE,
  kpi: AI_REQUEST.EXPLAIN_FEATURE,
  layer: AI_REQUEST.EXPLAIN_LAYER,
  map: AI_REQUEST.EXPLAIN_MAP,
  selection: AI_REQUEST.EXPLAIN_SELECTED_FEATURE,
};

/** Facts the application already knows — shown instantly and labelled as such. */
function KnownInfo({ subject, customLayers }) {
  const { t } = useI18n();
  const rows = [];
  if (subject.kind === 'feature' || subject.kind === 'kpi') {
    const f = getFeature(subject.featureId || subject.id);
    if (f) {
      rows.push([t('ai.whatItIs'), f.description]);
      if (f.howItWorks) rows.push([t('ai.howItWorks'), f.howItWorks]);
      if (f.userActions) rows.push([t('ai.youCan'), f.userActions.join(' · ')]);
      if (f.considerations) rows.push([t('ai.consider'), f.considerations]);
    }
    if (subject.data) Object.entries(subject.data).forEach(([k, v]) => rows.push([k, String(v)]));
  }
  if (subject.kind === 'layer') {
    const l = [...mapLayers, ...customLayers].find((x) => x.id === subject.id);
    if (l) {
      rows.push([t('ai.whatItIs'), l.description || l.abstract || t('common.notAvailable')]);
      rows.push([t('common.source'), l.source || (l.service === 'geoserver' ? 'GeoServer' : t('common.notAvailable'))]);
      if (l.layer || l.typeName) rows.push(['Service layer', l.layer || l.typeName]);
      if (l.legend) rows.push([t('legend.title'), `${l.legend.min} → ${l.legend.max}`]);
    }
  }
  if (subject.kind === 'selection' && subject.properties) {
    Object.entries(subject.properties).forEach(([k, v]) => k !== 'color' && rows.push([k, String(v)]));
  }
  if (subject.kind === 'map') {
    const f = getFeature('map-tools');
    rows.push([t('ai.whatItIs'), f.description]);
  }
  if (!rows.length) return null;

  return (
    <section aria-label={t('ai.known')} className="rounded-2xl bg-sky-500/[0.06] p-4 ring-1 ring-sky-400/15">
      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-sky-400">
        <Database className="h-3.5 w-3.5" /> {t('ai.known')}
      </div>
      <dl className="space-y-2.5 text-[13px]">
        {rows.map(([k, v], i) => (
          <div key={i}>
            <dt className="text-[11px] font-medium text-muted">{k}</dt>
            <dd className="mt-0.5 text-[var(--text)]">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function AIExplanationPanel() {
  const { t, lang } = useI18n();
  const { subject, requestId } = useSelector((s) => s.ai);
  const customLayers = useSelector((s) => s.map.customLayers);
  const services = useSelector((s) => s.services);
  const buildContext = useAIContext();

  const [language, setLanguage] = useState(lang.code);
  const [state, setState] = useState({ status: 'idle', text: '', error: null, mode: 'explain' });
  const [copied, setCopied] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => setLanguage(lang.code), [lang.code]);

  const run = useCallback(
    async ({ type, content, mode, force, targetLang }) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setState((s) => ({ ...s, status: 'loading', error: null, mode }));
      try {
        const res = await aiService.request({
          type,
          content,
          language: getLanguage(targetLang).english,
          context: buildContext(subject),
          subjectKey: `${subject.kind}:${subject.id}`,
          signal: ctrl.signal,
          force,
        });
        setState({ status: 'done', text: res.text, error: null, mode, cached: res.cached });
      } catch (err) {
        if (err.code === 'CANCELED') return;
        setState((s) => ({ ...s, status: 'error', error: err.code }));
      }
    },
    [buildContext, subject],
  );

  // One request per explicit "Explain" click (requestId bumps only on user action).
  useEffect(() => {
    if (!subject) return undefined;
    setState({ status: 'idle', text: '', error: null, mode: 'explain' });
    if (services.ai === 'notConfigured') {
      setState({ status: 'error', text: '', error: 'AI_NOT_CONFIGURED', mode: 'explain' });
      return undefined;
    }
    run({ type: TYPE_BY_KIND[subject.kind] || AI_REQUEST.EXPLAIN_FEATURE, mode: 'explain', targetLang: lang.code });
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const breadcrumb = useMemo(() => subject?.breadcrumb || [subject?.title].filter(Boolean), [subject]);
  if (!subject) return <p className="p-6 text-sm text-muted">{t('ai.empty')}</p>;

  const busy = state.status === 'loading';
  const hasText = state.status === 'done' && state.text;
  const isRtl = getLanguage(language).dir === 'rtl';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(state.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <nav aria-label={t('ai.context')} className="flex flex-wrap items-center gap-1 text-[11px] text-muted">
          {breadcrumb.map((b, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3 rtl:rotate-180" />}
              <span className={i === breadcrumb.length - 1 ? 'text-[var(--text)]' : ''}>{b}</span>
            </span>
          ))}
        </nav>
        <h2 className="mt-1.5 font-display text-lg font-semibold text-strong">{subject.title}</h2>
      </div>

      <KnownInfo subject={subject} customLayers={customLayers} />

      <section aria-live="polite" className="relative overflow-hidden rounded-2xl bg-violet-500/[0.07] p-4 ring-1 ring-violet-400/20">
        <div className="pointer-events-none absolute -end-16 -top-16 h-40 w-40 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="relative mb-3 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-violet-300">
            <Sparkles className="h-3.5 w-3.5" /> {t('ai.generated')}
          </span>
          {hasText && (
            <Badge tone="ai">
              {getLanguage(language).native}
              {state.mode !== 'explain' && ` · ${t(state.mode === 'simplify' ? 'common.simplify' : 'common.translate')}`}
            </Badge>
          )}
        </div>

        <AnimatePresence mode="wait">
          {busy && (
            <m.div key="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AIThinking />
            </m.div>
          )}
          {!busy && hasText && (
            <m.div key={state.text.slice(0, 40)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} dir={isRtl ? 'rtl' : 'ltr'} className="relative text-[13.5px] text-[var(--text)]">
              <Markdown text={state.text} />
            </m.div>
          )}
          {!busy && state.status === 'error' && (
            <m.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative flex gap-3 text-[13px]">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div>
                <p className="text-strong">{t('ai.unavailable')}</p>
                <p className="mt-1 text-muted">{t(`ai.errors.${state.error}`) !== `ai.errors.${state.error}` ? t(`ai.errors.${state.error}`) : ''}</p>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="ai" icon={RefreshCw} disabled={busy} onClick={() => run({ type: TYPE_BY_KIND[subject.kind], mode: 'explain', force: true, targetLang: language })}>
          {state.status === 'idle' || state.status === 'error' ? t('common.explain') : t('common.regenerate')}
        </Button>
        <AISimplify disabled={busy || !hasText} onSimplify={() => run({ type: AI_REQUEST.SIMPLIFY_CONTENT, content: state.text, mode: 'simplify', targetLang: language })} />
        <AITranslate language={language} onLanguage={setLanguage} disabled={busy || !hasText} onTranslate={() => run({ type: AI_REQUEST.TRANSLATE_CONTENT, content: state.text, mode: 'translate', targetLang: language })} />
        <Button size="sm" variant="ghost" icon={copied ? Check : Copy} disabled={!hasText} onClick={copy}>
          {copied ? t('common.copied') : t('common.copy')}
        </Button>
      </div>
      <p className="text-[11px] text-muted">{t('ai.disclaimer')}</p>
    </div>
  );
}
