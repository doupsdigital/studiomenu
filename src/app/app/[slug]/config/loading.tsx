import { Settings } from 'lucide-react';
import { PageTitleBarSkeleton } from '@/components/app-shell/PageTitleBarSkeleton';
import { LoadingSpinner } from '@/components/app-shell/LoadingSpinner';

/** Tela de carregamento da Config — ver comentário em agenda/loading.tsx
 *  (mesmo motivo, mesma solução, uma por aba). */
export default function ConfigLoading() {
  return (
    <>
      <PageTitleBarSkeleton title="Configurações" icon={<Settings className="w-5 h-5 text-ink-soft" />} />
      <LoadingSpinner />
    </>
  );
}
