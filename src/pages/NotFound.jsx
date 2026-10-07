import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Compass } from 'lucide-react';
import { Button } from '../components/ui/primitives.jsx';
import { useI18n } from '../i18n/I18nProvider.jsx';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="grid h-full place-items-center p-6">
      <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass max-w-sm rounded-3xl p-8 text-center">
        <Compass className="mx-auto h-10 w-10 animate-float text-sky-400" />
        <p className="mt-4 font-display text-5xl font-semibold text-strong">404</p>
        <p className="mt-2 text-sm text-muted">This page is off the map.</p>
        <Link to="/" className="mt-5 inline-block"><Button variant="primary">{t('nav.dashboard')}</Button></Link>
      </m.div>
    </div>
  );
}
