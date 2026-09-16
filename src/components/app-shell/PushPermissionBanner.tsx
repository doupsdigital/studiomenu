'use client';

import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { PushActivationFlow } from '@/components/push/PushActivationFlow';

interface PushPermissionBannerProps {
  slug: string;
}

const dismissedKey = (slug: string) => `sm_push_dismissed_${slug}`;

/** Banner dispensável pra pedir permissão de notificação — some sozinho
 *  assim que o navegador já tiver uma decisão (`granted`/`denied`) ou se a
 *  profissional dispensar ("Agora não", guardado no localStorage, mesmo
 *  espírito do `PushPermissionBanner` do LashAgenda). Não aparece em
 *  navegadores sem suporte a Push API. A ativação em si (incluindo o
 *  envio de uma notificação de teste pra confirmar que chegou de
 *  verdade) fica em `PushActivationFlow`, reaproveitado também em Config. */
export const PushPermissionBanner: React.FC<PushPermissionBannerProps> = ({ slug }) => {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(dismissedKey(slug)) === '1');
    } catch {
      setDismissed(false);
    }
  }, [slug]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(dismissedKey(slug), '1');
    } catch {
      // localStorage indisponível — sem persistência, mas não quebra nada.
    }
  };

  if (dismissed) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-rose-600 to-rose-500 text-white p-5 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
        <Bell className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-serif-pro font-bold text-base">Ative as notificações</p>
        <p className="text-xs text-white/80 mt-0.5 mb-3">Receba um aviso na hora que uma cliente marcar um horário novo.</p>
        <PushActivationFlow
          slug={slug}
          primaryButtonClassName="h-9 px-4 rounded-lg bg-white text-rose-700 text-xs font-bold disabled:opacity-50"
          secondaryButtonClassName="h-9 px-4 rounded-lg bg-white/15 text-white text-xs font-bold disabled:opacity-50"
          textClassName="text-white/90"
          onConfirmed={handleDismiss}
        />
        <button type="button" onClick={handleDismiss} className="text-[11px] text-white/70 mt-2 underline">
          Agora não
        </button>
      </div>
    </div>
  );
};
