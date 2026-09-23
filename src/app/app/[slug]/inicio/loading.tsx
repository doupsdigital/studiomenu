import { Home } from 'lucide-react';
import { PageTitleBarSkeleton } from '@/components/app-shell/PageTitleBarSkeleton';
import { LoadingSpinner } from '@/components/app-shell/LoadingSpinner';

/** Tela de carregamento do Início — ver comentário em agenda/loading.tsx
 *  (mesmo motivo, mesma solução, uma por aba). */
export default function InicioLoading() {
  return (
    <>
      <PageTitleBarSkeleton title="Início" icon={<Home className="w-5 h-5 text-ink-soft" />} />
      <LoadingSpinner />
    </>
  );
}
