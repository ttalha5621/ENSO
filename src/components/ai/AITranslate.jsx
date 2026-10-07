import { Languages } from 'lucide-react';
import { LANGUAGES } from '../../i18n/languages.js';
import { Button } from '../ui/primitives.jsx';
import { useI18n } from '../../i18n/I18nProvider.jsx';

/** Language picker + translate action used inside the AI panel. */
export default function AITranslate({ language, onLanguage, onTranslate, disabled }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-1.5">
      <label className="sr-only" htmlFor="ai-lang">{t('ai.explainIn')}</label>
      <select
        id="ai-lang"
        value={language}
        onChange={(e) => onLanguage(e.target.value)}
        className="h-8 rounded-xl bg-[var(--glass-soft)] px-2 text-xs text-strong ring-1 ring-[var(--border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="bg-slate-900 text-white">{l.native}</option>
        ))}
      </select>
      <Button size="sm" variant="glass" icon={Languages} onClick={onTranslate} disabled={disabled} className="text-violet-200">
        {t('common.translate')}
      </Button>
    </div>
  );
}
