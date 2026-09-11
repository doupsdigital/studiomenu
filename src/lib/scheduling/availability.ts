/**
 * Motor de disponibilidade do agendamento automático (Fase 1 do plano em
 * docs/PLANO_AGENDAMENTO_STUDIOMENU_PLUS.md). Função pura: recebe os dados já
 * carregados do banco (horários de atendimento, bloqueios, agendamentos
 * existentes) e devolve os horários livres pra uma data + duração de serviço.
 *
 * Inspirado no scheduling-engine.js do protótipo do LashMenu (nunca chegou a
 * ser ligado no catálogo real de lá), reescrito como código de servidor.
 *
 * Fuso horário: fixo em America/Sao_Paulo (UTC-3, sem horário de verão desde
 * 2019/2020) — simplificação deliberada pro v1, já que o público-alvo inteiro
 * é BR. Se algum dia for preciso suportar outro fuso por catálogo, é só
 * trocar esse offset por uma coluna em `orders`.
 */

const TIMEZONE_OFFSET = '-03:00';
const SLOT_STEP_MINUTES = 30;
const TODAY_BUFFER_MINUTES = 30;

export interface BusinessHoursRow {
  weekday: number;
  start_time: string; // "HH:MM:SS" ou "HH:MM"
  end_time: string;
}

export interface ScheduleBlockRow {
  start_date: string; // "YYYY-MM-DD"
  end_date: string;
  all_day: boolean;
  start_time: string | null;
  end_time: string | null;
}

export interface BusyInterval {
  startsAt: Date;
  endsAt: Date;
}

export interface AvailabilitySlot {
  /** Horário local pra exibir, ex. "14:00". */
  time: string;
  /** Instante absoluto de início, ISO 8601 (UTC). */
  startsAt: string;
  /** Instante absoluto de fim, ISO 8601 (UTC). */
  endsAt: string;
}

function normalizeTime(t: string): string {
  return t.length === 5 ? `${t}:00` : t;
}

/** Converte uma data+hora "de parede" no fuso do catálogo pra um Date (UTC). */
export function localDateTimeToUTC(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${normalizeTime(timeStr)}${TIMEZONE_OFFSET}`);
}

/** Dia da semana (0=domingo..6=sábado) de uma data "YYYY-MM-DD", calculado
 *  no fuso do catálogo — não no fuso do servidor (Vercel roda em UTC). */
export function getWeekdayForDate(dateStr: string): number {
  return localDateTimeToUTC(dateStr, '00:00:00').getUTCDay();
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

function intervalsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export interface ComputeAvailableSlotsParams {
  /** Data alvo, "YYYY-MM-DD" no fuso do catálogo. */
  dateStr: string;
  durationMinutes: number;
  businessHours: BusinessHoursRow[];
  blocks: ScheduleBlockRow[];
  /** Agendamentos já existentes (status != cancelled) próximos dessa data. */
  busyAppointments: BusyInterval[];
  /** Injetável pra teste; default `new Date()`. */
  now?: Date;
}

/** Calcula os horários livres pra uma data, considerando grade semanal,
 *  bloqueios (integrais ou parciais) e agendamentos já existentes. Gera
 *  candidatos a cada 30min, só oferece um horário se o serviço inteiro
 *  couber antes do fechamento, e aplica um buffer de 30min a partir de agora
 *  quando a data pedida é hoje. */
export function computeAvailableSlots(params: ComputeAvailableSlotsParams): AvailabilitySlot[] {
  const { dateStr, durationMinutes, businessHours, blocks, busyAppointments } = params;
  const now = params.now ?? new Date();

  if (!durationMinutes || durationMinutes <= 0) return [];

  const weekday = getWeekdayForDate(dateStr);
  const hoursRow = businessHours.find((h) => h.weekday === weekday);
  if (!hoursRow) return []; // fechado nesse dia da semana

  const hasFullDayBlock = blocks.some(
    (b) => b.all_day && dateStr >= b.start_date && dateStr <= b.end_date
  );
  if (hasFullDayBlock) return [];

  const dayStart = localDateTimeToUTC(dateStr, hoursRow.start_time);
  const dayEnd = localDateTimeToUTC(dateStr, hoursRow.end_time);
  if (dayEnd <= dayStart) return [];

  const partialBlockIntervals: BusyInterval[] = blocks
    .filter((b) => !b.all_day && dateStr >= b.start_date && dateStr <= b.end_date && b.start_time && b.end_time)
    .map((b) => ({
      startsAt: localDateTimeToUTC(dateStr, b.start_time as string),
      endsAt: localDateTimeToUTC(dateStr, b.end_time as string),
    }));

  const busyIntervals = [...busyAppointments, ...partialBlockIntervals];
  const earliestAllowed = addMinutes(now, TODAY_BUFFER_MINUTES);

  const slots: AvailabilitySlot[] = [];
  let cursor = dayStart;
  while (addMinutes(cursor, durationMinutes) <= dayEnd) {
    const slotEnd = addMinutes(cursor, durationMinutes);
    const isPast = cursor < earliestAllowed;
    const isBusy = busyIntervals.some((b) => intervalsOverlap(cursor, slotEnd, b.startsAt, b.endsAt));

    if (!isPast && !isBusy) {
      slots.push({
        time: cursor.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Sao_Paulo',
        }),
        startsAt: cursor.toISOString(),
        endsAt: slotEnd.toISOString(),
      });
    }

    cursor = addMinutes(cursor, SLOT_STEP_MINUTES);
  }

  return slots;
}
