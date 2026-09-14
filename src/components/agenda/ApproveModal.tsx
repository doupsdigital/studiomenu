'use client';

import React from 'react';
import { X, CheckCircle } from 'lucide-react';
import type { AgendaAppointment } from '@/lib/scheduling/agenda-service';

interface ApproveModalProps {
  appointment: AgendaAppointment;
  busy: boolean;
  onClose: () => void;
  onConfirm: (sendWhatsApp: boolean) => void;
}

/** Modal "Confirmar agendamento" — mesma estrutura exata do LashAgenda:
 *  cabeçalho gradiente rose, cartão com cliente/serviço, e duas formas de
 *  confirmar (com ou sem aviso automático no WhatsApp) + voltar. */
export const ApproveModal: React.FC<ApproveModalProps> = ({ appointment, busy, onClose, onConfirm }) => {
  const dateStr = new Date(appointment.starts_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', timeZone: 'America/Sao_Paulo' });
  const timeStr = new Date(appointment.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-br from-rose-600 to-rose-500 px-6 pt-3.5 pb-3.5 shrink-0">
          <div className="flex items-start justify-between">
            <h3 className="font-serif-pro font-bold text-lg text-white">Confirmar agendamento</h3>
            <button type="button" onClick={onClose} className="text-rose-200 hover:text-white mt-0.5" aria-label="Fechar">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-4 space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Cliente</p>
              <p className="font-semibold text-sm text-rose-900 mt-0.5">
                {appointment.client_name} — {dateStr} às {timeStr}
              </p>
            </div>
            <div className="border-t border-rose-100 pt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Serviço(s)</p>
              <p className="font-semibold text-sm text-rose-900 mt-0.5">{appointment.service_title}</p>
              {appointment.client_notes && <p className="text-rose-700 italic text-xs mt-1">&quot;{appointment.client_notes}&quot;</p>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onConfirm(true)}
              disabled={busy}
              className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              {busy ? 'Confirmando...' : 'Confirmar e enviar pelo WhatsApp'}
            </button>
            <button
              type="button"
              onClick={() => onConfirm(false)}
              disabled={busy}
              className="flex items-center justify-center gap-2 w-full py-3 bg-rose-600 hover:bg-rose-800 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              {busy ? 'Confirmando...' : 'Confirmar sem enviar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="w-full py-3 border border-linen hover:bg-cream text-ink-soft rounded-xl text-sm font-semibold transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
