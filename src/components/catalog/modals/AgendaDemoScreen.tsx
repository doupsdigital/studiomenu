'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ProcedureItem } from '@/types/catalog';

interface BookedFake {
  service: ProcedureItem;
  time: string;
  dateLabel: string;
}

interface AgendaDemoScreenProps {
  booked: BookedFake;
  onClose: () => void;
}

interface FakeCard {
  time: string;
  endTime: string;
  clientName: string;
  serviceTitle: string;
  meta: string;
  status: 'pending' | 'confirmed' | 'completed';
}

function formatPrice(val: string): string {
  if (!val) return 'Sob Consulta';
  const lower = val.toLowerCase();
  if (lower.includes('r$') || lower.includes('incluso') || lower.includes('guia') || lower.includes('consulta')) {
    return val;
  }
  return `R$ ${val}`;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Vitrine do showroom (`/c/showcase/[niche]`, sem profissional real por
 *  trás): depois que ela simula um agendamento (`FakeBookingModal`), em vez
 *  de só um "Ok, entendido", mostramos a Agenda dela já preenchida com o
 *  agendamento que acabou de simular NO MEIO de outros cartões fictícios —
 *  pra dar a sensação de "assim vai ser o seu dia a dia", pra ela gravar o
 *  vídeo da experiência completa (pedido explícito, 2026-09-28). Puramente
 *  visual (mesmas cores/formato de cartão do `DayTimeline.tsx` real), sem
 *  nenhum dado de verdade — os outros cartões são sempre os mesmos nomes
 *  fictícios, só o horário/serviço do cartão dela é dinâmico. */
export const AgendaDemoScreen: React.FC<AgendaDemoScreenProps> = ({ booked, onClose }) => {
  const bookedCard: FakeCard = {
    time: booked.time,
    endTime: addMinutes(booked.time, booked.service.duration_minutes || 60),
    clientName: 'Cliente Exemplo',
    serviceTitle: booked.service.title,
    meta: formatPrice(booked.service.price),
    status: 'confirmed',
  };

  const otherCards: FakeCard[] = [
    { time: '09:00', endTime: '09:40', clientName: 'Maria Eduarda', serviceTitle: 'Design de Sobrancelha', meta: 'R$ 45', status: 'confirmed' },
    { time: '12:00', endTime: '13:00', clientName: 'Camila Souza', serviceTitle: 'Manutenção', meta: '', status: 'pending' },
    { time: '15:30', endTime: '16:15', clientName: 'Beatriz Lima', serviceTitle: 'Design + Henna', meta: 'R$ 60', status: 'confirmed' },
    { time: '17:00', endTime: '18:00', clientName: 'Ana Paula', serviceTitle: 'Procedimento Completo', meta: 'R$ 180', status: 'completed' },
  ];

  const cards = [...otherCards, bookedCard].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-rose-200" role="dialog" aria-modal="true" aria-label="Prévia da sua agenda">
      <div className="flex-1 overflow-y-auto flex flex-col items-center px-5 pt-8 pb-8 max-w-sm mx-auto w-full">
        <div className="w-full rounded-2xl bg-surface border border-rose-100 shadow-sm px-6 py-6 mb-5 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <p className="font-serif-pro font-bold text-xl text-ink mb-1.5">Agendamento reservado!</p>
          <p className="text-[15px] text-ink-soft leading-snug">
            É assim que fica a sua Agenda: cada horário marcado já chega organizado, sem você
            precisar anotar nada.
          </p>
        </div>

        <div className="w-full rounded-2xl bg-surface border border-linen shadow-sm p-4 mb-6 text-left">
          <p className="text-[12px] font-bold uppercase tracking-wide text-ink-faint mb-3">{booked.dateLabel}</p>
          <div className="flex flex-col gap-2">
            {cards.map((card) => {
              const isBookedCard = card === bookedCard;
              const isPending = card.status === 'pending';
              const isCompleted = card.status === 'completed';
              const accent = isPending ? 'border-l-[#D79A2B]' : isCompleted ? 'border-l-blue-500' : 'border-l-rose-600';
              const tone = isPending ? 'bg-[#FBF3E3]' : isCompleted ? 'bg-blue-50 border-blue-200' : 'bg-cream border-linen';

              return (
                <div key={`${card.time}-${card.clientName}`} className="flex gap-2.5">
                  <div className="w-[46px] shrink-0 pt-0.5 text-[13px] tabular-nums font-semibold text-ink">{card.time}</div>
                  <div
                    className={`relative overflow-hidden flex-1 min-h-[64px] rounded-[14px] border border-l-4 ${accent} ${tone} px-3.5 py-2.5 ${
                      isBookedCard ? 'ring-2 ring-rose-500/50' : ''
                    }`}
                  >
                    <p className="text-[15px] font-semibold text-ink truncate">{card.clientName}</p>
                    {isPending ? (
                      <p className="text-[13px] text-[#8A6410] truncate">a confirmar · {card.serviceTitle}</p>
                    ) : (
                      <>
                        <p className="text-[13px] text-ink-soft truncate">{card.serviceTitle}</p>
                        <p className="text-xs text-ink-faint mt-1">
                          {card.time} – {card.endTime}
                          {card.meta ? ` · ${card.meta}` : ''}
                          {isCompleted ? ' · Concluído' : ''}
                        </p>
                      </>
                    )}
                    {isBookedCard && (
                      <span className="absolute top-2 right-2.5 text-[10px] font-bold uppercase tracking-wide text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full">
                        Agora
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-bold shadow-sm transition-colors"
        >
          Voltar pro catálogo →
        </button>
      </div>
    </div>
  );
};
