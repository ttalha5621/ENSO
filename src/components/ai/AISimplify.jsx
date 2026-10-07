import { WandSparkles } from 'lucide-react';
import { Button } from '../ui/primitives.jsx';
import { useI18n } from '../../i18n/I18nProvider.jsx';

export default function AISimplify({ onSimplify, disabled }) {
  const { t } = useI18n();
  return (
    <Button size="sm" variant="glass" icon={WandSparkles} onClick={onSimplify} disabled={disabled} className="text-violet-200">
      {t('common.simplify')}
    </Button>
  );
}
