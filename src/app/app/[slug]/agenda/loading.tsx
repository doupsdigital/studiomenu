import { Calendar } from 'lucide-react';
import { PageTitleBarSkeleton } from '@/components/app-shell/PageTitleBarSkeleton';
import { LoadingSpinner } from '@/components/app-shell/LoadingSpinner';

/** Tela de carregamento da Agenda — Next troca pra essa tela IMEDIATAMENTE
 *  ao clicar no ícone da barra inferior, em vez de deixar a aba antiga
 *  parada na tela até os dados chegarem do servidor (bug real reportado,
 *  2026-09-23 — "clico e não sei se cliquei, se travou, se está
 *  carregando"). Convenção de arquivo do Next (`loading.tsx` dentro da
 *  pasta da rota) — nenhuma lógica extra necessária, ele já embrulha a
 *  page.tsx real num Suspense sozinho. */
export default function AgendaLoading() {
  return (
    <>
      <PageTitleBarSkeleton title="Agenda" icon={<Calendar className="w-5 h-5 text-ink-soft" />} />
      <LoadingSpinner />
    </>
  );
}
