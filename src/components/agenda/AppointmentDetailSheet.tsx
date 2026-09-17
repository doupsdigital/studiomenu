'use client';

import React from 'react';
import { X, Check, MessageCircle, CheckCircle2, XCircle } from 'lucide-react';
import type { AgendaAppointment } from '@/lib/scheduling/agenda-service';

interface AppointmentDetailSheetProps {
  appointment: AgendaAppointment;
  busy: boolean;
  onClose: () => void;
  /** Pendente → abre o modal de aprovar/recusar (não age direto). */
  onApprove: (appointment: AgendaAppointment) => void;
  onReject: (appointment: AgendaAppointment) => void;
  /** Já confirmado → cancelamento direto, sem o fluxo de aprovação. */
  onCancelConfirmed: (appointment: AgendaAppointment) => void;
  /** Marca como concluído/falta — só faz sentido pra um agendamento já
   *  confirmado (controle pós-atendimento). */
  onComplete: (appointment: AgendaAppointment) => void;
  onNoShow: (appointment: AgendaAppointment) => void;
}

const STATUS_LABEL: Record<AgendaAppointment['status'], string> = {
  pending: 'Aguardando',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Concluído',
  no_show: 'Não compareceu',
};

const STATUS_BADGE: Record<AgendaAppointment['status'], string> = {
  pending: 'bg-amber-200 text-amber-900',
  confirmed: 'bg-green-200 text-green-900',
  cancelled: 'bg-gray-200 text-gray-600',
  completed: 'bg-blue-200 text-blue-950',
  no_show: 'bg-red-200 text-red-900',
};

/** Painel de detalhe (bottom sheet) aberto ao clicar num agendamento na
 *  grade de horário da Agenda. */
export const AppointmentDetailSheet: React.FC<AppointmentDetailSheetProps> = ({
  appointment,
  busy,
  onClose,
  onApprove,
  onReject,
  onCancelConfirmed,
  onComplete,
  onNoShow,
}) => {
  const time = new Date(appointment.starts_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
  const dateLabel = new Date(appointment.starts_at).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    timeZone: 'America/Sao_Paulo',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface rounded-t-3xl p-6 pb-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-linen text-ink-soft flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide mb-3 ${STATUS_BADGE[appointment.status]}`}>
          {STATUS_LABEL[appointment.status]}
        </span>

        <h3 className="font-serif-pro text-xl font-bold text-ink mb-1">{appointment.service_title}</h3>
        <p className="text-sm text-ink-soft mb-4 capitalize">
          {dateLabel} às {time} · {appointment.duration_minutes}min
        </p>

        <div className="rounded-xl bg-cream p-4 mb-5 flex flex-col gap-1">
          <p className="text-[15px] text-ink font-bold">{appointment.client_name}</p>
          <p className="text-[13px] text-ink-soft flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" /> {appointment.client_whatsapp}
          </p>
          {appointment.client_notes && <p className="text-[13px] text-ink-faint italic mt-1">{appointment.client_notes}</p>}
          {appointment.price_snapshot && <p className="text-[13px] text-ink-soft mt-1">Investimento: {appointment.price_snapshot}</p>}
        </div>

        {appointment.status === 'pending' && (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => onApprove(appointment)}
              className="flex-1 h-11 rounded-xl bg-emerald-600 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Aprovar
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onReject(appointment)}
              className="flex-1 h-11 rounded-xl border border-red-300 text-red-600 text-sm font-bold disabled:opacity-50"
            >
              Recusar
            </button>
          </div>
        )}

        {appointment.status === 'confirmed' && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => onComplete(appointment)}
                className="flex-1 h-11 rounded-xl bg-emerald-600 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Concluir
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onNoShow(appointment)}
                className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Marcar falta
              </button>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => onCancelConfirmed(appointment)}
              className="w-full h-10 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-[13px] font-bold disabled:opacity-50 transition-colors"
            >
              Cancelar agendamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
