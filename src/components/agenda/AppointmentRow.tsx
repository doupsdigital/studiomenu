'use client';

import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { AgendaAppointment } from '@/lib/scheduling/agenda-service';

interface AppointmentRowProps {
  appointment: AgendaAppointment;
  onApprove: (appointment: AgendaAppointment) => void;
  onReject: (appointment: AgendaAppointment) => void;
}

/** Linha compacta de um agendamento pendente na fila "Aguardando
 *  confirmação" — mesma estrutura exata do LashAgenda: nome + dia/hora à
 *  esquerda, botões Aprovar/Recusar à direita, que abrem os modais de
 *  confirmação (não agem direto). */
export const AppointmentRow: React.FC<AppointmentRowProps> = ({ appointment, onApprove, onReject }) => {
  const dateLabel = new Date(appointment.starts_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'America/Sao_Paulo' });
  const timeLabel = new Date(appointment.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-amber-50/40 transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        <div className="min-w-0">
          <p className="font-semibold text-[15px] text-ink truncate">{appointment.client_name}</p>
          <p className="text-[13px] text-ink-soft mt-0.5">{dateLabel} às {timeLabel}</p>
        </div>
        <p className="text-[13px] text-ink-faint truncate hidden sm:block">{appointment.service_title}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onApprove(appointment)}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Aprovar
        </button>
        <button
          type="button"
          onClick={() => onReject(appointment)}
          className="flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors"
        >
          <XCircle className="w-3.5 h-3.5" />
          Recusar
        </button>
      </div>
    </div>
  );
};
