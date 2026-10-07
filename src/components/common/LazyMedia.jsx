import { useEffect, useRef, useState } from 'react';
import { FileWarning, Pause, Play } from 'lucide-react';
import { useInView } from '../../hooks/useInView.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { Skeleton } from '../ui/primitives.jsx';

const existence = new Map();
/** HEAD check — dev servers answer unknown paths with index.html, so check the content type too. */
function checkExists(url) {
  if (!existence.has(url)) {
    existence.set(
      url,
      fetch(url, { method: 'HEAD' })
        .then((r) => r.ok && !(r.headers.get('content-type') || '').includes('text/html'))
        .catch(() => false),
    );
  }
  return existence.get(url);
}

/** Video/animation that loads only when scrolled into view and pauses when scrolled away. */
export default function LazyMedia({ file, kind, title }) {
  const { t } = useI18n();
  const [ref, inView] = useInView({ rootMargin: '300px', once: true });
  const [visibleRef, visible] = useInView({ rootMargin: '0px', once: false });
  const [state, setState] = useState('idle'); // idle | ok | missing | loaded
  const [playing, setPlaying] = useState(true);
  const video = useRef(null);
  const url = `/media/${file}`;

  useEffect(() => {
    if (!inView) return;
    let alive = true;
    checkExists(url).then((ok) => alive && setState(ok ? 'ok' : 'missing'));
    return () => {
      alive = false;
    };
  }, [inView, url]);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (visible && playing) v.play().catch(() => {});
    else v.pause();
  }, [visible, playing, state]);

  const setRefs = (el) => {
    ref.current = el;
    visibleRef.current = el;
  };

  return (
    <div ref={setRefs} className="relative aspect-video overflow-hidden rounded-2xl bg-black/40">
      {(state === 'idle' || state === 'ok') && <Skeleton className="absolute inset-0 rounded-none" />}
      {state === 'missing' && (
        <div className="absolute inset-0 grid place-items-center p-4 text-center" style={{ background: 'repeating-linear-gradient(135deg, transparent 0 14px, rgba(148,163,184,0.06) 14px 15px)' }}>
          <div>
            <FileWarning className="mx-auto h-7 w-7 text-amber-400/80" />
            <p className="mt-2 text-sm font-medium text-strong">{t('briefings.missing')}</p>
            <p className="mt-1 font-mono text-[11px] text-muted">{t('briefings.missingHint', { file })}</p>
          </div>
        </div>
      )}
      {(state === 'ok' || state === 'loaded') && kind === 'image' && (
        <img src={url} alt={title} decoding="async" onLoad={() => setState('loaded')} className="absolute inset-0 h-full w-full object-contain transition-opacity duration-700" style={{ opacity: state === 'loaded' ? 1 : 0 }} />
      )}
      {(state === 'ok' || state === 'loaded') && kind === 'video' && (
        <>
          <video
            ref={video}
            src={url}
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => setState('loaded')}
            aria-label={title}
            className="absolute inset-0 h-full w-full object-contain transition-opacity duration-700"
            style={{ opacity: state === 'loaded' ? 1 : 0 }}
          />
          {state === 'loaded' && (
            <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? t('briefings.pause') : t('briefings.play')} className="absolute bottom-3 end-3 grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          )}
        </>
      )}
    </div>
  );
}
