'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, CalendarCheck } from 'lucide-react';

interface BottomNavProps {
  slug: string;
}

const SIDE_TAB_LEFT = { key: 'inicio', label: 'Início', icon: Home } as const;
const SIDE_TAB_RIGHT = { key: 'config', label: 'Config', icon: Settings } as const;

/** Navegação inferior do app da profissional — Início à esquerda, Config à
 *  direita, e um botão central elevado pra Agenda, mesmo padrão do `TabBar`
 *  do LashAgenda (docs/REESTRUTURACAO_VISUAL_APP.md, Fase 1). O Catálogo
 *  saiu da tabbar — agora só se chega lá pelo card de destaque no Início. */
export const BottomNav: React.FC<BottomNavProps> = ({ slug }) => {
  const pathname = usePathname();

  // O editor do catálogo (chegado pelo card do Início, não mais uma aba) já
  // tem sua própria barra flutuante fixa na base (`#lm-editor-bottom-bar`,
  // `bottom:16px`) — duas barras fixas na base colidiriam visualmente, então
  // a navegação continua escondida enquanto o editor está aberto.
  if (pathname?.includes(`/app/${slug}/catalogo`)) return null;

  const isAgendaActive = pathname?.startsWith(`/app/${slug}/agenda`);

  const renderTab = ({ key, label, icon: Icon }: typeof SIDE_TAB_LEFT | typeof SIDE_TAB_RIGHT) => {
    const href = `/app/${slug}/${key}`;
    const isActive = pathname?.startsWith(href);
    return (
      <Link
        key={key}
        href={href}
        className={`flex-1 flex flex-col items-center justify-center gap-1.5 text-[13px] font-semibold transition-colors ${
          isActive ? 'text-rose-600' : 'text-ink-faint hover:text-ink-soft'
        }`}
      >
        <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.75} />
        {label}
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-linen pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto relative flex items-stretch h-[68px]">
        {/* Sem coluna reservada pro botão central — ele já é posicionado de
         *  forma absoluta por cima, então as 2 abas dividem a largura toda
         *  em metades (mais perto do centro do que ficariam em 3 colunas
         *  iguais, que empurrava tudo pras bordas). */}
        {renderTab(SIDE_TAB_LEFT)}
        {renderTab(SIDE_TAB_RIGHT)}

        {/* Botão central em destaque — Agenda */}
        <Link
          href={`/app/${slug}/agenda`}
          className={`absolute left-1/2 -translate-x-1/2 -top-6 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-600/30 border-4 border-surface transition-colors ${
            isAgendaActive ? 'bg-rose-700' : 'bg-rose-600'
          }`}
        >
          <CalendarCheck className="w-7 h-7" />
        </Link>
      </div>
    </nav>
  );
};
