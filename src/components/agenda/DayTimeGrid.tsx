'use client';

import React, { useMemo } from 'react';
import type { AgendaAppointment } from '@/lib/scheduling/agenda-service';
import type { BusinessHoursConfigRow, ScheduleBlockConfigRow } from '@/lib/scheduling/config-service';
import { localDateTimeToUTC } from '@/lib/scheduling/availability';

const SLOT_HEIGHT = 44; // px por meia-hora

interface DayTimeGridProps {
  dateStr: string;
  /** Agendamentos do dia, já sem cancelados (mesmo filtro de `getAppointmentsForDay`). */
  appointments: AgendaAppointment[];
  businessHours: BusinessHoursConfigRow[];
  scheduleBlocks: ScheduleBlockConfigRow[];
  onSlotClick: (time: string) => void;
  onAppointmentClick: (appointment: AgendaAppointment) => void;
}

const STATUS_STYLES: Record<AgendaAppointment['status'], { bg: string; border: string; text: string }> = {
  pending: { bg: 'bg-amber-50', border: 'border-amber-200 border-l-amber-500', text: 'text-amber-800' },
  confirmed: { bg: 'bg-emerald-50', border: 'border-emerald-200 border-l-emerald-500', text: 'text-emerald-800' },
  completed: { bg: 'bg-sky-50', border: 'border-sky-200 border-l-sky-500', text: 'text-sky-800' },
  no_show: { bg: 'bg-rose-50', border: 'border-rose-200 border-l-rose-400', text: 'text-rose-700' },
  cancelled: { bg: 'bg-linen', border: 'border-linen border-l-ink-faint', text: 'text-ink-faint' },
};

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
                className={`absolute left-1 right-1 rounded-lg border border-l-[3px] overflow-hidden text-left px-2 py-1 shadow-sm z-10 ${style.bg} ${style.border}`}
              >
                <p className={`text-[11px] font-bold truncate leading-tight ${style.text}`}>
                  {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')} · {appt.client_name}
                </p>
                {height >= 38 && (
                  <p className={`text-[10px] truncate opacity-80 leading-tight ${style.text}`}>{appt.service_title}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
