import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ProcedureItem } from '@/types/catalog';

interface AgendaPreviewScreenProps {
  service: ProcedureItem;
  time: string;
  dateLabel: string;
  onContinue: () => void;
}

function formatPrice(val: string): string {
  if (!val) return 'Sob Consulta';
  const lower = val.toLowerCase();
  if (lower.includes('r$') || lower.includes('incluso') || lower.includes('guia') || lower.includes('consulta')) {
    return val;
  }
  return `R$ ${val}`;
}

/** Depois que ela escolhe um horário na demo, em vez de só um "Ok,
 *  entendido", mostramos como o agendamento vai aparecer na Agenda de
 *  verdade — mesmo cartão do dia-a-dia (`DayTimeline.tsx`), preenchido com
 *  o serviço real dela (2026-09-24, pra aumentar a percepção de valor: "o
 *  toque final pra ela ver a agenda que vai ver no dia-a-dia"). */
export const AgendaPreviewScreen: React.FC<AgendaPreviewScreenProps> = ({ service, time, dateLabel, onContinue }) => {
  const [h, m] = time.split(':').map(Number);
  const endTotal = h * 60 + m + (service.duration_minutes || 60);
  const endTime = `${String(Math.floor(endTotal / 60) % 24).padStart(2, '0')}:${String(endTotal % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream" role="dialog" aria-modal="true" aria-label="Prévia da sua agenda">
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 py-8 max-w-sm mx-auto w-full text-center">
        <div className="w-full rounded-2xl bg-surface border border-rose-100 shadow-sm px-6 py-6 mb-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <p className="font-serif-pro font-bold text-xl text-ink mb-1.5">Agendamento reservado!</p>
          <p className="text-[15px] text-ink-soft leading-snug">
            É assim que ele aparece na sua Agenda — organizado, com o nome da cliente, o serviço e
            o horário, sem você precisar anotar nada.
          </p>
        </div>

        <div className="w-full rounded-2xl bg-surface border border-linen shadow-sm p-4 mb-8 text-left">
          <p className="text-[12px] font-bold uppercase tracking-wide text-ink-faint mb-3">{dateLabel}</p>
          <div className="flex gap-2.5">
            <div className="w-[52px] shrink-0 pt-0.5 text-sm tabular-nums font-semibold text-ink">{time}</div>
            <div className="relative overflow-hidden flex-1 min-h-[88px] rounded-[14px] border border-l-4 bg-cream border-linen border-l-rose-600 px-3.5 py-3">
              <p className="text-[17px] font-semibold text-ink">Cliente Exemplo</p>
              <p className="text-[15px] text-ink-soft mt-0.5">{service.title}</p>
              <p className="text-sm text-ink-faint mt-2">
                {time} – {endTime} · {formatPrice(service.price)}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-bold shadow-sm transition-colors"
        >
          Quero isso na minha agenda →
        </button>
      </div>
    </div>
  );
};
