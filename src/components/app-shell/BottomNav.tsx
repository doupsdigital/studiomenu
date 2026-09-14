'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Settings, CalendarCheck } from 'lucide-react';

interface BottomNavProps {
  slug: string;
}

const SIDE_TABS_LEFT = [
  { key: 'inicio', label: 'Início', icon: Home },
  { key: 'catalogo', label: 'Catálogo', icon: LayoutGrid },
] as const;

const SIDE_TABS_RIGHT = [{ key: 'config', label: 'Config', icon: Settings }] as const;

/** Navegação inferior do app da profissional — 3 abas laterais (Início,
 *  Catálogo, Config) + um botão central elevado pra Agenda, mesmo padrão do
 *  `TabBar` do LashAgenda (docs/REESTRUTURACAO_VISUAL_APP.md, Fase 1). */
export const BottomNav: React.FC<BottomNavProps> = ({ slug }) => {
  const pathname = usePathname();

  // A aba Catálogo reaproveita o editor visual do catálogo público, que já
  // tem sua própria barra flutuante fixa na base (`#lm-editor-bottom-bar`,
  // `bottom:16px`) — duas barras fixas na base colidiriam visualmente, então
  // a navegação de abas fica escondida enquanto o editor está aberto.
  if (pathname?.includes(`/app/${slug}/catalogo`)) return null;

  const isAgendaActive = pathname?.startsWith(`/app/${slug}/agenda`);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-linen pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto relative flex items-stretch h-[68px]">
        {SIDE_TABS_LEFT.map(({ key, label, icon: Icon }) => {
          const href = `/app/${slug}/${key}`;
          const isActive = pathname?.startsWith(href);
          return (
            <Link
              key={key}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
                isActive ? 'text-rose-600' : 'text-ink-faint hover:text-ink-soft'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.75} />
              {label}
            </Link>
          );
        })}

        {/* Espaço reservado pro botão central flutuante */}
        <div className="flex-1" />

        {SIDE_TABS_RIGHT.map(({ key, label, icon: Icon }) => {
          const href = `/app/${slug}/${key}`;
          const isActive = pathname?.startsWith(href);
          return (
            <Link
              key={key}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
                isActive ? 'text-rose-600' : 'text-ink-faint hover:text-ink-soft'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.75} />
              {label}
            </Link>
          );
        })}

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
