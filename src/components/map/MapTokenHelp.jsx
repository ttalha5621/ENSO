import { useState } from 'react';
import { m } from 'framer-motion';
import { ExternalLink, KeyRound, RefreshCw, TriangleAlert, WifiOff } from 'lucide-react';
import { checkTokenFormat, getMapboxTokenSource, saveMapboxToken } from '../../config/env.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { Button } from '../ui/primitives.jsx';

const TOKEN_REASONS = new Set(['missing', 'secret', 'malformed', 'invalid', 'restricted']);

/** Explains exactly why the map could not start and lets the user paste a working token. */
export default function MapTokenHelp({ reason, onRetry }) {
  const { t } = useI18n();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const tokenProblem = TOKEN_REASONS.has(reason);
  const message = ['webgl', 'failed'].includes(reason) ? t(reason === 'webgl' ? 'map.webgl' : 'map.failed') : t(`map.reason.${reason}`);
  const Icon = reason === 'network' || reason === 'timeout' ? WifiOff : tokenProblem ? KeyRound : TriangleAlert;

  const submit = (e) => {
    e.preventDefault();
    const token = value.trim();
    const format = checkTokenFormat(token);
    if (format !== 'ok') {
      setError(t(`map.reason.${format}`));
      return;
    }
    saveMapboxToken(token);
    window.location.reload(); // one clean start with the new token
  };

  return (
    <div className="ambient absolute inset-0 z-20 grid place-items-center overflow-y-auto p-4">
      <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass w-full max-w-md rounded-3xl p-6" role="alert">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-400/15 text-amber-400">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-strong">{reason === 'missing' ? t('map.tokenTitle') : tokenProblem ? t('map.tokenRejected') : t('state.error')}</h2>
            <p className="mt-1 text-sm text-[var(--text)]">{message}</p>
            {getMapboxTokenSource() === 'browser' && tokenProblem && <p className="mt-1 text-xs text-muted">{t('map.savedInBrowser')}</p>}
          </div>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-2">
          <label htmlFor="mapbox-token" className="text-xs font-medium text-strong">{t('map.pasteLabel')}</label>
          <input
            id="mapbox-token"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError('');
            }}
            placeholder="pk.eyJ1Ijoi…"
            spellCheck={false}
            autoComplete="off"
            className="h-10 w-full rounded-xl bg-[var(--glass-soft)] px-3 font-mono text-xs text-strong ring-1 ring-[var(--border)] placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          />
          {error && <p className="text-xs text-amber-300">{error}</p>}
          <p className="text-[11px] leading-relaxed text-muted">{t('map.saveHint')}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button type="submit" variant="primary" icon={KeyRound} disabled={!value.trim()}>{t('map.useToken')}</Button>
            <Button icon={RefreshCw} onClick={onRetry}>{t('common.retry')}</Button>
            {getMapboxTokenSource() === 'browser' && (
              <Button variant="ghost" onClick={() => (saveMapboxToken(''), window.location.reload())}>{t('map.clearToken')}</Button>
            )}
          </div>
        </form>
        <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noreferrer noopener" className="mt-4 inline-flex items-center gap-1.5 text-xs text-sky-400 hover:underline">
          <ExternalLink className="h-3.5 w-3.5" /> {t('map.getToken')}
        </a>
      </m.div>
    </div>
  );
}
