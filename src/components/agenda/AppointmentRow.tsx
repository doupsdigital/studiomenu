'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import type { AgendaAppointment } from '@/lib/scheduling/agenda-service';

interface AppointmentRowProps {
  appointment: AgendaAppointment;
  onUpdateStatus: (appointment: AgendaAppointment, status: 'confirmed' | 'cancelled') => void;
  busy: boolean;
}

const STATUS_LABEL: Record<AgendaAppointment['status'], string> = {
  pending: 'Aguardando',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Concluído',
  no_show: 'Não compareceu',
};

const STATUS_CLASS: Record<AgendaAppointment['status'], string> = {
  pending: 'bg-amber-500/15 text-amber-400',
  confirmed: 'bg-emerald-500/15 text-emerald-400',
  cancelled: 'bg-slate-700/40 text-slate-400',
  completed: 'bg-sky-500/15 text-sky-400',
  no_show: 'bg-slate-700/40 text-slate-400',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
}

export const AppointmentRow: React.FC<AppointmentRowProps> = ({ appointment, onUpdateStatus, busy }) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white">
            {formatTime(appointment.starts_at)} — {appointment.service_title}
          </p>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {appointment.client_name} · {appointment.client_whatsapp}
          </p>
          {appointment.client_notes && (
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{appointment.client_notes}</p>
          )}
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${STATUS_CLASS[appointment.status]}`}>
          {STATUS_LABEL[appointment.status]}
        </span>
      </div>

      {appointment.status === 'pending' && (
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => onUpdateStatus(appointment, 'confirmed')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" /> Confirmar
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onUpdateStatus(appointment, 'cancelled')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500/15 text-rose-400 text-xs font-bold hover:bg-rose-500/25 disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" /> Recusar
          </button>
        </div>
      )}

      {appointment.status === 'confirmed' && (
        <div className="mt-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => onUpdateStatus(appointment, 'cancelled')}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" /> Cancelar agendamento
          </button>
        </div>
      )}
    </div>
  );
};
