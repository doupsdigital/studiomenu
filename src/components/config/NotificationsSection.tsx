'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { PushActivationFlow } from '@/components/push/PushActivationFlow';

interface NotificationsSectionProps {
  slug: string;
}

/** Gerenciamento permanente de notificações push, dentro de Config — ao
 *  contrário do banner dispensável do Início, essa seção fica sempre
 *  disponível (pra reativar depois de trocar de celular, testar de novo se
 *  desconfiar que parou de funcionar, etc). Mesmo fluxo de ativação +
 *  confirmação por trás (`PushActivationFlow`). */
export const NotificationsSection: React.FC<NotificationsSectionProps> = ({ slug }) => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-cream border border-rose-200 p-5">
      <div className="text-center mb-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
          <Bell className="w-6 h-6" />
        </div>
        <p className="font-serif-pro font-bold text-lg text-ink">Notificações push</p>
        <p className="text-[15px] text-ink-soft mt-0.5">Receba um aviso nesse dispositivo quando uma cliente agendar.</p>
      </div>

      <PushActivationFlow
        slug={slug}
        primaryButtonClassName="h-11 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-bold disabled:opacity-50 transition-colors w-full"
        secondaryButtonClassName="h-11 px-4 rounded-xl bg-surface border border-linen text-ink text-[15px] font-bold disabled:opacity-50 transition-colors w-full"
      />
    </div>
  );
};
