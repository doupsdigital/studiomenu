'use client';

import React from 'react';
import { X, Bell } from 'lucide-react';
import { PushActivationFlow } from './PushActivationFlow';

interface NotificationCenterSheetProps {
  slug: string;
  onClose: () => void;
}

/** Bottom sheet aberto pelo sino no cabeçalho (`PageTitleBar`, só quando o
 *  app já está instalado) — mesmo padrão visual de `ManualBookingForm`/
 *  `BlockSlotForm`. Por enquanto só reúne a ativação de "novo agendamento"
 *  (`PushActivationFlow`, já existente e testado); o lembrete de 1h antes
 *  do atendimento entra aqui como uma seção a mais quando existir. */
export const NotificationCenterSheet: React.FC<NotificationCenterSheetProps> = ({ slug, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-surface rounded-t-3xl p-6 pb-8 shadow-2xl flex flex-col gap-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-linen text-ink-soft flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 pr-8">
          <Bell className="w-5 h-5 text-rose-600" />
          <p className="font-serif-pro font-bold text-lg text-ink">Central de notificações</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-cream border border-rose-200 p-5">
          <p className="font-serif-pro font-bold text-base text-ink mb-1">Novo agendamento</p>
          <p className="text-xs text-ink-soft mb-3">Receba um aviso na hora que uma cliente marcar um horário novo.</p>
          <PushActivationFlow
            slug={slug}
            primaryButtonClassName="h-11 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold disabled:opacity-50 transition-colors w-full"
            secondaryButtonClassName="h-11 px-4 rounded-xl bg-surface border border-linen text-ink text-sm font-bold disabled:opacity-50 transition-colors w-full"
            onConfirmed={onClose}
          />
        </div>
      </div>
    </div>
  );
};
