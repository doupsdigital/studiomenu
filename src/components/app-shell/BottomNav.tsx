'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Calendar, Settings } from 'lucide-react';

interface BottomNavProps {
  slug: string;
}

const TABS = [
  { key: 'inicio', label: 'Início', icon: Home },
  { key: 'catalogo', label: 'Catálogo', icon: LayoutGrid },
  { key: 'agenda', label: 'Agenda', icon: Calendar },
  { key: 'config', label: 'Config', icon: Settings },
] as const;

export const BottomNav: React.FC<BottomNavProps> = ({ slug }) => {
  const pathname = usePathname();

  // A aba Catálogo reaproveita o editor visual do catálogo público, que já
  // tem sua própria barra flutuante fixa na base (`#lm-editor-bottom-bar`,
  // `bottom:16px`) — duas barras fixas na base colidiriam visualmente, então
  // a navegação de abas fica escondida enquanto o editor está aberto.
  if (pathname?.includes(`/app/${slug}/catalogo`)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur border-t border-slate-800 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-4">
        {TABS.map(({ key, label, icon: Icon }) => {
          const href = `/app/${slug}/${key}`;
          const isActive = pathname?.startsWith(href);
          return (
            <Link
              key={key}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold tracking-wide transition-colors ${
                isActive ? 'text-rose-400' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              {label.toUpperCase()}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
