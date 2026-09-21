import Link from 'next/link';
import { LayoutGrid, ChevronRight } from 'lucide-react';

interface EditCatalogCardProps {
  slug: string;
  /** Âncora pro tour guiado (Fase 20) apontar um balão nesse card. */
  dataTour?: string;
}

/** Card de destaque no Início que leva direto pro editor do catálogo — único
 *  jeito de chegar lá agora que "Catálogo" saiu da tabbar (só sobrou o link
 *  de edição em si, sem a opção de copiar por aqui; isso fica disponível no
 *  painel admin). */
export const EditCatalogCard: React.FC<EditCatalogCardProps> = ({ slug, dataTour }) => {
  return (
    <Link
      href={`/app/${slug}/catalogo`}
      data-tour={dataTour}
      className="flex items-center gap-4 rounded-2xl p-5 bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-sm shadow-rose-600/20 transition-transform active:scale-[0.98]"
    >
      <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
        <LayoutGrid className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="font-serif-pro font-bold text-lg leading-tight">Editar meu catálogo</h2>
        <p className="text-sm text-white/70 mt-0.5">Serviços, fotos, preços e mais</p>
      </div>
      <ChevronRight className="w-5 h-5 text-white/70 shrink-0" />
    </Link>
  );
};
