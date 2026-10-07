import { m } from 'framer-motion';
import { Film } from 'lucide-react';
import { BRIEFINGS } from '../config/viewers.js';
import { useI18n } from '../i18n/I18nProvider.jsx';
import ExplainButton from '../components/common/ExplainButton.jsx';
import LazyMedia from '../components/common/LazyMedia.jsx';
import { Badge, PageHeader } from '../components/ui/primitives.jsx';
import { fadeUp, stagger } from '../components/ui/motion.js';

const GROUP_TONE = { state: 'sky', forecast: 'ai', process: 'green', exercise: 'amber' };

export default function Briefings() {
  const { t } = useI18n();
  const groups = ['state', 'forecast', 'process', 'exercise'];
  return (
    <m.div variants={stagger(0.06)} initial="hidden" animate="show" className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
      <PageHeader icon={Film} title={t('briefings.title')} subtitle={t('briefings.subtitle')} actions={<ExplainButton variant="pill" subject={{ kind: 'feature', id: 'briefings', title: t('briefings.title'), breadcrumb: [t('nav.briefings')] }} />} />
      {groups.map((g) => (
        <section key={g} aria-labelledby={`bg-${g}`}>
          <m.h2 variants={fadeUp} id={`bg-${g}`} className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-strong">
            <Badge tone={GROUP_TONE[g]}>{t(`briefings.groups.${g}`)}</Badge>
          </m.h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {BRIEFINGS.filter((b) => b.group === g).map((b) => (
              <m.article key={b.id} variants={fadeUp} className="glass overflow-hidden rounded-3xl p-2">
                <LazyMedia file={b.file} kind={b.kind} title={t(`briefings.items.${b.id}`)} />
                <div className="flex items-center justify-between gap-2 px-2.5 pb-1.5 pt-3">
                  <h3 className="truncate text-sm font-medium text-strong">{t(`briefings.items.${b.id}`)}</h3>
                  <span className="font-mono text-[10px] uppercase text-muted">{b.kind === 'video' ? 'MP4' : 'GIF'}</span>
                </div>
              </m.article>
            ))}
          </div>
        </section>
      ))}
    </m.div>
  );
}
