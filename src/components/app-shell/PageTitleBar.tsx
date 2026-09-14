import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageTitleBarProps {
  title: string;
  icon: LucideIcon;
}

/** Barra branca do topo com título centralizado + ícone da seção à direita —
 *  mesmo padrão do cabeçalho mobile do LashAgenda, sem o menu hamburguer
 *  (não há menu lateral na StudioMenu pra ele abrir). Presente nas 3 abas
 *  Início/Agenda/Config pra manter consistência entre elas; a aba Catálogo
 *  não usa (tem seu próprio botão de voltar flutuante sobre o editor). */
export const PageTitleBar: React.FC<PageTitleBarProps> = ({ title, icon: Icon }) => {
  return (
    <header className="sticky top-0 z-20 h-[60px] bg-surface border-b border-linen flex items-center justify-center relative shrink-0">
      <h1 className="font-serif-pro font-semibold text-2xl text-ink leading-tight">{title}</h1>
      <Icon className="w-5 h-5 text-ink-soft absolute right-4" />
    </header>
  );
};
