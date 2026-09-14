'use client';

import React, { useState } from 'react';
import { X, XCircle } from 'lucide-react';
import type { AgendaAppointment } from '@/lib/scheduling/agenda-service';

interface RejectModalProps {
  appointment: AgendaAppointment;
  busy: boolean;
  onClose: () => void;
  onConfirm: (sendWhatsApp: boolean, motivo: string) => void;
}

/** Modal "Recusar agendamento" — mesma estrutura exata do LashAgenda: cartão
 *  cliente/horário + motivo opcional (só usado na mensagem do WhatsApp, não
 *  é salvo no agendamento) + duas formas de recusar (com ou sem aviso) +
 *  voltar. */
export const RejectModal: React.FC<RejectModalProps> = ({ appointment, busy, onClose, onConfirm }) => {
  const [motivo, setMotivo] = useState('');
  const dateStr = new Date(appointment.starts_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', timeZone: 'America/Sao_Paulo' });
  const timeStr = new Date(appointment.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-br from-rose-600 to-rose-500 px-6 pt-3.5 pb-3.5 flex items-start justify-between shrink-0">
          <h3 className="font-serif-pro font-bold text-lg text-white">Recusar agendamento</h3>
          <button type="button" onClick={onClose} className="text-rose-200 hover:text-white mt-0.5" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Cliente</p>
            <p className="font-semibold text-sm text-rose-900 mt-0.5">
              {appointment.client_name} — {dateStr} às {timeStr}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
              Motivo <span className="font-normal normal-case text-ink-faint">(opcional)</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Desculpe, não vou conseguir atender nesse horário :("
              rows={3}
              className="w-full border border-linen rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none bg-surface"
            />
            <p className="text-[11px] text-ink-faint">Se preenchido, o motivo será incluído na mensagem enviada pelo WhatsApp.</p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onConfirm(true, motivo)}
              disabled={busy}
              className="flex items-center justify-center gap-2 w-full py-3 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <XCircle className="w-4 h-4" />
              {busy ? 'Recusando...' : 'Recusar e notificar pelo WhatsApp'}
            </button>
            <button
              type="button"
              onClick={() => onConfirm(false, motivo)}
              disabled={busy}
              className="flex items-center justify-center gap-2 w-full py-3 bg-rose-600 hover:bg-rose-800 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <XCircle className="w-4 h-4" />
              {busy ? 'Recusando...' : 'Recusar sem notificar'}
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
