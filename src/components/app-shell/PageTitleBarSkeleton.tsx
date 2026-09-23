import React from 'react';

interface PageTitleBarSkeletonProps {
  title: string;
  icon: React.ReactNode;
}

/** Versão estática do `PageTitleBar`, só pra uso em `loading.tsx` — esses
 *  arquivos não recebem `params` (documentado: "Loading UI components do
 *  not accept any parameters"), então não tem como montar o `PageTitleBar`
 *  de verdade aqui (ele precisa do `slug`, usado nos hooks de notificação/
 *  instalação). Mesma marcação/altura exata do real, só sem o sino de
 *  notificações nem o botão de instalar — evita a barra "pular" de
 *  tamanho quando a tela de verdade assume o lugar dessa aqui. */
export const PageTitleBarSkeleton: React.FC<PageTitleBarSkeletonProps> = ({ title, icon }) => (
  <header className="sticky top-0 z-20 h-[60px] bg-surface border-b border-linen flex items-center justify-center relative shrink-0 px-4">
    <h1 className="font-serif-pro font-semibold text-2xl text-ink leading-tight">{title}</h1>
    <div className="absolute right-4 flex items-center gap-3 opacity-40">{icon}</div>
  </header>
);
