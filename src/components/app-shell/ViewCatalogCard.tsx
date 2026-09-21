import Link from 'next/link';
import { Eye, ChevronRight } from 'lucide-react';

interface ViewCatalogCardProps {
  slug: string;
  /** Âncora pro tour guiado (Fase 20) apontar um balão nesse card. */
  dataTour?: string;
}

/** Leva pro catálogo público (`/c/slug`), a mesma página que a cliente final
 *  vê — abre em nova aba, já que sai do contexto do app. Mesmo tratamento
 *  visual do `EditCatalogCard` (gradiente rose sólido) — as 2 versões mais
 *  claras/leves (fundo branco, depois contorno rosé) ficaram destoando
 *  demais da dupla "Editar"/"Compartilhar catálogo", que já são sólidas;
 *  os 3 cards de catálogo do Início formam um grupo visualmente coeso agora
 *  (Fase 14). */
export const ViewCatalogCard: React.FC<ViewCatalogCardProps> = ({ slug, dataTour }) => {
  return (
    <Link
      href={`/c/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      data-tour={dataTour}
      className="flex items-center gap-4 rounded-2xl p-5 bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-sm shadow-rose-600/20 transition-transform active:scale-[0.98]"
    >
      <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
        <Eye className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="font-serif-pro font-bold text-lg leading-tight">Visualizar catálogo</h2>
        <p className="text-sm text-white/70 mt-0.5">Veja como a cliente vê</p>
      </div>
      <ChevronRight className="w-5 h-5 text-white/70 shrink-0" />
    </Link>
  );
};
