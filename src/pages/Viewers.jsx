import { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Earth, ExternalLink, Loader2, Play } from 'lucide-react';
import { VIEWERS } from '../config/viewers.js';
import { useI18n } from '../i18n/I18nProvider.jsx';
import ExplainButton from '../components/common/ExplainButton.jsx';
import { PageHeader } from '../components/ui/primitives.jsx';
import { fadeUp, stagger } from '../components/ui/motion.js';
import { cx } from '../utils/format.js';

/** External viewers: nothing is embedded until the user picks one (iframes are heavy). */
export default function Viewers() {
  const { t } = useI18n();
  const [active, setActive] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const current = VIEWERS.find((v) => v.id === active);
  const groups = ['fluid', 'nullschool', 'eyes'];

  const pick = (id) => {
    if (id === active) return;
    setLoaded(false);
    setActive(id);
  };

  return (
    <m.div variants={stagger(0.06)} initial="hidden" animate="show" className="mx-auto flex h-full max-w-[1600px] flex-col gap-5 p-4 md:p-8">
      <PageHeader icon={Earth} title={t('viewers.title')} subtitle={t('viewers.subtitle')} actions={<ExplainButton variant="pill" subject={{ kind: 'feature', id: 'viewers', title: t('viewers.title'), breadcrumb: [t('nav.viewers')] }} />} />

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <m.nav variants={fadeUp} aria-label={t('viewers.title')} className="glass scrollbar-thin shrink-0 overflow-y-auto rounded-3xl p-3 lg:w-80">
          {groups.map((g) => (
            <div key={g} className="mb-3 last:mb-0">
              <p className="px-2 pb-1.5 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">{t(`viewers.groups.${g}`)}</p>
              <ul className="grid grid-cols-2 gap-1 lg:grid-cols-1">
                {VIEWERS.filter((v) => v.group === g).map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => pick(v.id)}
                      aria-current={active === v.id}
                      className={cx('flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-start text-[13px] transition', active === v.id ? 'bg-sky-500/12 text-strong ring-1 ring-sky-400/30' : 'text-[var(--text)] hover:bg-[var(--glass-soft)]')}
                    >
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: v.color, boxShadow: `0 0 10px ${v.color}` }} />
                      <span className="truncate">{t(`viewers.items.${v.id}`)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </m.nav>

        <m.section variants={fadeUp} className="glass relative min-h-[60vh] flex-1 overflow-hidden rounded-3xl">
          <AnimatePresence mode="wait">
            {!current ? (
              <m.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 grid place-items-center p-6">
                <div className="grid w-full max-w-3xl grid-cols-2 gap-3 md:grid-cols-3">
                  {VIEWERS.slice(0, 6).map((v, i) => (
                    <m.button
                      key={v.id}
                      type="button"
                      onClick={() => pick(v.id)}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * i } }}
                      whileHover={{ y: -4 }}
                      className="group relative aspect-[4/3] overflow-hidden rounded-2xl p-4 text-start ring-1 ring-[var(--border)]"
                      style={{ background: `radial-gradient(120% 90% at 0% 0%, ${v.color}55, transparent 60%), radial-gradient(100% 100% at 100% 100%, #0ea5e933, transparent 60%), var(--glass-soft)` }}
                    >
                      <span className="absolute end-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition group-hover:scale-110 group-hover:bg-white/20"><Play className="h-4 w-4" /></span>
                      <span className="absolute bottom-3 start-4 end-4 text-sm font-medium text-strong">{t(`viewers.items.${v.id}`)}</span>
                    </m.button>
                  ))}
                </div>
              </m.div>
            ) : (
              <m.div key={current.id} initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col">
                <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: current.color }} />
                  <h2 className="flex-1 truncate text-sm font-medium text-strong">{t(`viewers.items.${current.id}`)}</h2>
                  <a href={current.src} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-sky-400 hover:bg-[var(--glass-hover)]">
                    <ExternalLink className="h-3.5 w-3.5" /> {t('viewers.openNew')}
                  </a>
                </div>
                <div className="relative flex-1 bg-black">
                  {!loaded && (
                    <div className="absolute inset-0 grid place-items-center">
                      <span className="flex items-center gap-2 text-sm text-sky-300"><Loader2 className="h-4 w-4 animate-spin" /> {t('viewers.loading')}</span>
                    </div>
                  )}
                  <iframe
                    key={current.id}
                    title={t(`viewers.items.${current.id}`)}
                    src={current.src}
                    loading="lazy"
                    allow="fullscreen"
                    referrerPolicy="no-referrer"
                    onLoad={() => setLoaded(true)}
                    className={cx('absolute inset-0 h-full w-full border-0 transition-opacity duration-700', loaded ? 'opacity-100' : 'opacity-0')}
                  />
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </m.section>
      </div>
    </m.div>
  );
}
