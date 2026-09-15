'use client';

import React, { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import type { AgendaAppointment } from '@/lib/scheduling/agenda-service';
import type { BusinessHoursConfigRow, ScheduleBlockConfigRow } from '@/lib/scheduling/config-service';
import { localDateTimeToUTC } from '@/lib/scheduling/availability';

const SLOT_HEIGHT = 44; // px por meia-hora

interface DayTimeGridProps {
  dateStr: string;
  /** Agendamentos do dia, incluindo cancelados/recusados (mostrados cinza,
   *  como rastro histórico — mesmo comportamento do LashAgenda). */
  appointments: AgendaAppointment[];
  businessHours: BusinessHoursConfigRow[];
  scheduleBlocks: ScheduleBlockConfigRow[];
  onSlotClick: (time: string) => void;
  onAppointmentClick: (appointment: AgendaAppointment) => void;
}

/** Mesmas cores exatas do `getStatusColorStyles` do LashAgenda (nomes de
 *  status em inglês aqui, mas o mapeamento de cor é o mesmo: pendente=amber,
 *  confirmado=green, concluído=blue, falta=red, cancelado=gray). */
const STATUS_STYLES: Record<AgendaAppointment['status'], { bg: string; border: string; badge: string; text: string; accent: string }> = {
  pending: { bg: 'bg-amber-50 hover:bg-amber-100', border: 'border-amber-300', badge: 'bg-amber-200 text-amber-900', text: 'text-amber-800', accent: 'border-l-amber-500' },
  confirmed: { bg: 'bg-green-50 hover:bg-green-100', border: 'border-green-300', badge: 'bg-green-200 text-green-900', text: 'text-green-800', accent: 'border-l-green-500' },
  completed: { bg: 'bg-blue-50 hover:bg-blue-100', border: 'border-blue-300', badge: 'bg-blue-200 text-blue-950', text: 'text-blue-800', accent: 'border-l-blue-500' },
  no_show: { bg: 'bg-red-50 hover:bg-red-100 opacity-70', border: 'border-red-400', badge: 'bg-red-200 text-red-900', text: 'text-red-800', accent: 'border-l-red-500' },
  cancelled: { bg: 'bg-gray-100 hover:bg-gray-200 opacity-50', border: 'border-gray-200', badge: 'bg-gray-200 text-gray-600', text: 'text-gray-400', accent: 'border-l-gray-400' },
};

const STATUS_LABEL: Record<AgendaAppointment['status'], string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  no_show: 'Falta',
  cancelled: 'Cancelado',
};

function formatGridDateLabel(dateStr: string): string {
  const label = new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    timeZone: 'America/Sao_Paulo',
  });
  return label.toUpperCase();
}

function toMinutes(hhmmss: string): number {
  const [h, m] = hhmmss.split(':').map(Number);
  return h * 60 + (m || 0);
}

/** Hora/minuto de um instante no fuso America/Sao_Paulo — não no fuso do
 *  navegador (mesmo cuidado do resto do agendamento). */
function getSaoPauloHourMinute(date: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(date);
  return {
    hour: Number(parts.find((p) => p.type === 'hour')?.value ?? 0),
    minute: Number(parts.find((p) => p.type === 'minute')?.value ?? 0),
  };
}

/** Grade de horário real do dia — coluna de rótulos de hora + coluna de
 *  slots de 30min clicáveis, com os agendamentos desenhados como blocos
 *  posicionados por cima (mesma mecânica do LashAgenda, ver
 *  docs/REESTRUTURACAO_VISUAL_APP.md, Fase 4). Célula livre = dentro do
 *  expediente do dia da semana e sem bloqueio cobrindo aquele horário — não
 *  confere agendamentos existentes (isso quem cobre, visual e
 *  interativamente, são os blocos absolutos por cima da grade). */
export const DayTimeGrid: React.FC<DayTimeGridProps> = ({
  dateStr,
  appointments,
  businessHours,
  scheduleBlocks,
  onSlotClick,
  onAppointmentClick,
}) => {
  const range = useMemo(() => {
    if (businessHours.length === 0) return { startHour: 8, endHour: 20 };
    const starts = businessHours.map((h) => toMinutes(h.start_time));
    const ends = businessHours.map((h) => toMinutes(h.end_time));
    return {
      startHour: Math.floor(Math.min(...starts) / 60),
      endHour: Math.ceil(Math.max(...ends) / 60),
    };
  }, [businessHours]);

  const slots = useMemo(() => {
    const list: { hour: number; minute: number }[] = [];
    for (let h = range.startHour; h < range.endHour; h += 1) {
      list.push({ hour: h, minute: 0 });
      list.push({ hour: h, minute: 30 });
    }
    return list;
  }, [range]);

  const weekday = useMemo(() => localDateTimeToUTC(dateStr, '00:00:00').getUTCDay(), [dateStr]);
  const hoursForWeekday = businessHours.find((h) => h.weekday === weekday);

  const isSlotOpen = (hour: number, minute: number): boolean => {
    const fullDayBlocked = scheduleBlocks.some((b) => b.all_day && dateStr >= b.start_date && dateStr <= b.end_date);
    if (fullDayBlocked || !hoursForWeekday) return false;

    const slotStart = hour * 60 + minute;
    const slotEnd = slotStart + 30;
    if (slotStart < toMinutes(hoursForWeekday.start_time) || slotEnd > toMinutes(hoursForWeekday.end_time)) return false;

    const partialBlocked = scheduleBlocks.some((b) => {
      if (b.all_day || !b.start_time || !b.end_time) return false;
      if (dateStr < b.start_date || dateStr > b.end_date) return false;
      return slotStart < toMinutes(b.end_time) && slotEnd > toMinutes(b.start_time);
    });
    return !partialBlocked;
  };

  return (
    <div className="bg-surface border border-linen rounded-2xl overflow-hidden shadow-sm">
      <div className="grid grid-cols-[52px_1fr] border-b border-linen bg-rose-50/40 text-center">
        <div className="border-r border-linen" />
        <div className="py-3 flex items-center justify-center gap-1.5 font-serif-pro font-semibold text-sm text-ink">
          <CalendarDays className="w-4 h-4 text-rose-600" />
          {formatGridDateLabel(dateStr)}
        </div>
      </div>

      <div className="grid grid-cols-[52px_1fr] max-h-[560px] overflow-y-auto relative">
        {/* Coluna de rótulos de hora */}
        <div className="border-r border-linen bg-cream/60 text-right select-none">
          {slots.map(({ hour, minute }) => (
            <div
              key={`label-${hour}-${minute}`}
              style={{ height: SLOT_HEIGHT }}
              className={`border-b border-linen/70 flex items-center justify-end pr-1.5 ${
                minute === 0 ? 'text-[11px] font-bold text-ink-soft' : 'text-[9px] text-ink-faint'
              }`}
            >
              {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
            </div>
          ))}
        </div>

        {/* Grade de slots + agendamentos por cima */}
        <div className="relative">
          {slots.map(({ hour, minute }) => {
            const open = isSlotOpen(hour, minute);
            return (
              <div
                key={`slot-${hour}-${minute}`}
                style={{ height: SLOT_HEIGHT }}
                onClick={() => open && onSlotClick(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)}
                className={`border-b border-linen/70 ${
                  open ? 'cursor-pointer hover:bg-rose-50/70 transition-colors' : 'bg-linen/40 cursor-not-allowed'
                }`}
              />
            );
          })}

          {appointments.map((appt) => {
            const { hour, minute } = getSaoPauloHourMinute(new Date(appt.starts_at));
            const minutesFromStart = (hour - range.startHour) * 60 + minute;
            const top = (minutesFromStart / 30) * SLOT_HEIGHT;
            const height = (appt.duration_minutes / 30) * SLOT_HEIGHT;
            const style = STATUS_STYLES[appt.status];

            return (
              <button
                key={appt.id}
                type="button"
                onClick={() => onAppointmentClick(appt)}
                style={{ top: `${top}px`, height: `${height}px` }}
                className={`absolute left-2 right-2 rounded-lg border border-l-[4px] overflow-hidden flex flex-col shadow-sm z-10 text-left transition-all ${style.border} ${style.accent} ${style.bg} ${
                  height < 40 ? 'px-2 py-0.5' : height < 70 ? 'px-2.5 py-1' : 'px-3 py-1.5'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={`font-bold truncate flex-1 leading-tight ${height < 40 ? 'text-[10px]' : 'text-xs'} ${style.text}`}>
                    {appt.client_name}
                  </p>
                  <span className={`font-bold opacity-90 whitespace-nowrap shrink-0 leading-none ${height < 40 ? 'text-[10px]' : 'text-xs'} ${style.text}`}>
                    {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
                  </span>
                </div>
                {height >= 40 && (
                  <p className={`opacity-75 truncate leading-none text-[10px] mt-0.5 ${style.text}`}>{appt.service_title}</p>
                )}
                {height >= 60 && (
                  <div className="flex items-center justify-between mt-auto w-full">
                    {height >= 70 ? (
                      <p className={`text-[10px] opacity-50 font-medium leading-none ${style.text}`}>{appt.duration_minutes} min</p>
                    ) : (
                      <span />
                    )}
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold leading-none ${style.badge}`}>
                      {STATUS_LABEL[appt.status]}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
