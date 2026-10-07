import { CircleHelp, Sparkles } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { explain } from '../../store/slices/aiSlice.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { Tooltip } from '../ui/primitives.jsx';
import { cx } from '../../utils/format.js';

/**
 * The single entry point for contextual AI help.
 * subject: { kind: 'feature'|'layer'|'map'|'selection'|'kpi', id, title, breadcrumb?, properties?, data? }
 */
export default function ExplainButton({ subject, variant = 'icon', label, className }) {
  const dispatch = useDispatch();
  const { t } = useI18n();
  const onClick = (e) => {
    e.stopPropagation();
    dispatch(explain(subject));
  };
  const text = label || (variant === 'how' ? t('common.howItWorks') : t('common.explain'));

  if (variant === 'icon') {
    return (
      <Tooltip label={`${t('common.explain')} · ${subject.title}`}>
        <button
          type="button"
          onClick={onClick}
          aria-label={`${t('common.explain')}: ${subject.title}`}
          className={cx('grid h-7 w-7 place-items-center rounded-lg text-violet-300 transition hover:bg-violet-500/15 hover:text-violet-200 active:scale-90', className)}
        >
          <Sparkles className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </Tooltip>
    );
  }
  if (variant === 'how') {
    return (
      <button type="button" onClick={onClick} className={cx('inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-violet-300 transition hover:bg-violet-500/12 hover:text-violet-200', className)}>
        <CircleHelp className="h-3.5 w-3.5" /> {text}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx('group inline-flex items-center gap-1.5 rounded-full bg-violet-500/12 px-3 py-1.5 text-xs font-medium text-violet-200 ring-1 ring-violet-400/30 transition hover:bg-violet-500/20 hover:ring-violet-400/50', className)}
    >
      <Sparkles className="h-3.5 w-3.5 transition-transform group-hover:rotate-12 group-hover:scale-110" /> {text}
    </button>
  );
}
