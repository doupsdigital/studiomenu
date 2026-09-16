'use client';

import React, { useState } from 'react';
import { Bell, Download } from 'lucide-react';
import { useInstallPrompt } from './InstallPromptProvider';
import { NotificationCenterSheet } from '@/components/push/NotificationCenterSheet';

interface PageTitleBarProps {
  title: string;
  /** Elemento já renderizado (ex. `<Home className="..." />`), não a
   *  referência do componente — como `PageTitleBar` é Client Component
   *  (precisa do botão de instalar/sino), só dá pra receber JSX já
   *  resolvido do lado do servidor, não uma função/componente cru (React
   *  não deixa passar funções pela fronteira servidor→cliente). */
  icon: React.ReactNode;
  slug: string;
}

/** Barra branca do topo com título centralizado + ícone da seção à direita —
 *  mesmo padrão do cabeçalho mobile do LashAgenda, sem o menu hamburguer
 *  (não há menu lateral na StudioMenu pra ele abrir). Presente nas 3 abas
 *  Início/Agenda/Config pra manter consistência entre elas; a aba Catálogo
 *  não usa (tem seu próprio botão de voltar flutuante sobre o editor).
 *
 *  Também abriga o controle de instalação/notificações: antes de instalado,
 *  uma pílula "Instalar" (dispara o diálogo nativo do Chrome sob demanda,
 *  em vez do mini-banner automático dele); depois de instalado, vira um
 *  sino que abre a Central de notificações. */
export const PageTitleBar: React.FC<PageTitleBarProps> = ({ title, icon, slug }) => {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 h-[60px] bg-surface border-b border-linen flex items-center justify-center relative shrink-0 px-4">
        <h1 className="font-serif-pro font-semibold text-2xl text-ink leading-tight">{title}</h1>

        <div className="absolute right-4 flex items-center gap-3">
          {isInstalled ? (
            <button type="button" onClick={() => setNotificationsOpen(true)} aria-label="Central de notificações" className="text-rose-600">
              <Bell className="w-5 h-5" />
            </button>
          ) : canInstall ? (
            <button
              type="button"
              onClick={promptInstall}
              className="flex items-center gap-1.5 h-8 pl-2.5 pr-3 rounded-full bg-rose-50 text-rose-700 text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              Instalar
            </button>
          ) : null}
          {icon}
        </div>
      </header>

      {notificationsOpen && <NotificationCenterSheet slug={slug} onClose={() => setNotificationsOpen(false)} />}
    </>
  );
};
