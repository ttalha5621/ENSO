import { Sparkles } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider.jsx';

export default function AIThinking() {
  const { t } = useI18n();
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="h-4 w-4 animate-pulse text-violet-300" />
        <span className="ai-text">{t('ai.analyzing')}</span>
      </div>
      <div className="space-y-2" aria-hidden>
        {[92, 100, 76, 84].map((w, i) => (
          <div key={i} className="h-2.5 rounded-full bg-gradient-to-r from-violet-500/10 via-fuchsia-400/25 to-violet-500/10 bg-[length:200%_100%] animate-shimmer" style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
    </div>
  );
}
