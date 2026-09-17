'use client';

import React, { useMemo } from 'react';
import { Lock } from 'lucide-react';
import type { AgendaAppointment } from '@/lib/scheduling/agenda-service';
import type { BusinessHoursConfigRow, ScheduleBlockConfigRow } from '@/lib/scheduling/config-service';
import { getWeekdayForDate } from '@/lib/scheduling/availability';
import { STATUS_STYLES } from './status-styles';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const VISIBLE_CHIPS = 2;

interface MonthCalendarProps {
  /** Dia 1 do mês exibido, "YYYY-MM-DD" — só usado pra saber quais das 42
   *  células da grade pertencem ao mês atual (as outras, do mês
   *  anterior/seguinte, aparecem esmaecidas). */
  monthDateStr: string;
  /** As 42 datas da grade (6 semanas), já incluindo os dias de borda dos
   *  meses vizinhos pra fechar as semanas completas. */
  days: string[];
  todayStr: string;
  /** Agendamentos em todo o intervalo da grade — `getAppointmentsForRange`
   *  já nunca inclui cancelados. */
  appointments: AgendaAppointment[];
  businessHours: BusinessHoursConfigRow[];
  scheduleBlocks: ScheduleBlockConfigRow[];
  onDayClick: (dateStr: string) => void;
}

function getSaoPauloDateStr(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

/** Visão mensal da Agenda — grade de 6 semanas, cada dia com contagem visual
 *  de agendamentos (chips coloridos por status) e um cadeado quando o dia
 *  inteiro está fechado (sem expediente configurado pra aquele dia da semana
 *  ou coberto por um bloqueio de dia inteiro). Mesma estrutura do LashAgenda
 *  (ver docs/REESTRUTURACAO_VISUAL_APP.md, Fase 11) — clicar num dia navega
 *  pra visão diária daquela data, em vez de abrir o formulário de novo
 *  agendamento direto como a referência faz (mais natural aqui, já que o
 *  "Dia" é a visão de trabalho de verdade). */
export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  monthDateStr,
  days,
  todayStr,
  appointments,
  businessHours,
  scheduleBlocks,
  onDayClick,
}) => {
  const monthIndex = monthDateStr.slice(5, 7);

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, AgendaAppointment[]>();
    for (const appt of appointments) {
      const key = getSaoPauloDateStr(appt.starts_at);
      const list = map.get(key);
      if (list) list.push(appt);
      else map.set(key, [appt]);
    }
    for (const list of map.values()) list.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    return map;
  }, [appointments]);

  const isDayClosed = (dateStr: string): boolean => {
    const fullDayBlocked = scheduleBlocks.some((b) => b.all_day && dateStr >= b.start_date && dateStr <= b.end_date);
    if (fullDayBlocked) return true;
    const weekday = getWeekdayForDate(dateStr);
    return !businessHours.some((h) => h.weekday === weekday);
  };

  return (
    <div className="bg-surface border border-linen rounded-2xl overflow-hidden shadow-sm">
      <div className="grid grid-cols-7 border-b border-linen bg-rose-50/40 text-center text-[11px] font-bold text-ink-soft py-2.5">
        {WEEKDAY_LABELS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 divide-x divide-y divide-linen/70">
        {days.map((dateStr) => {
          const isCurrentMonth = dateStr.slice(5, 7) === monthIndex;
          const isToday = dateStr === todayStr;
          const closed = isDayClosed(dateStr);
          const dayAppts = appointmentsByDate.get(dateStr) || [];
          const dayNumber = Number(dateStr.slice(8, 10));

          return (
            <button
              type="button"
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              style={{ minHeight: 82 }}
              className={`p-1.5 flex flex-col items-stretch text-left overflow-hidden transition-colors ${
                closed ? 'bg-linen/40' : isCurrentMonth ? 'bg-surface hover:bg-rose-50/50' : 'bg-cream/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-bold shrink-0 ${
                    isToday ? 'bg-rose-600 text-white' : isCurrentMonth ? 'text-ink' : 'text-ink-faint'
                  }`}
                >
                  {dayNumber}
                </span>
                {closed && <Lock className="w-2.5 h-2.5 text-ink-faint/70 shrink-0" />}
              </div>

              <div className="flex-1 flex flex-col gap-0.5 mt-1 overflow-hidden">
                {dayAppts.slice(0, VISIBLE_CHIPS).map((appt) => {
                  const style = STATUS_STYLES[appt.status];
                  const time = new Date(appt.starts_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo',
                  });
                  return (
                    <span
                      key={appt.id}
                      className={`px-1 py-[1px] rounded text-[9px] leading-tight font-semibold truncate border ${style.border} ${style.bg} ${style.text}`}
                    >
                      {time} {appt.client_name.split(' ')[0]}
                    </span>
                  );
                })}
                {dayAppts.length > VISIBLE_CHIPS && (
                  <span className="text-[9px] text-rose-600 font-bold leading-tight">+{dayAppts.length - VISIBLE_CHIPS} mais</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
