import { supabaseAdmin } from '../supabase-admin';
import {
  computeAvailableSlots,
  isInstantAvailable,
  localDateTimeToUTC,
  AvailabilitySlot,
  BusinessHoursRow,
  ScheduleBlockRow,
  BusyInterval,
} from './availability';

/** Busca em paralelo horário de atendimento + bloqueios que cobrem `dateStr`
 *  + agendamentos existentes numa janela de +-1 dia — usada tanto por
 *  `getAvailableSlotsForDate` quanto por `isSlotAvailableForBooking`. */
async function fetchDayContext(
  orderId: string,
  dateStr: string
): Promise<{ businessHours: BusinessHoursRow[]; blocks: ScheduleBlockRow[]; busyAppointments: BusyInterval[] }> {
  const [{ data: businessHours }, { data: blocks }] = await Promise.all([
    supabaseAdmin.from('business_hours').select('weekday, start_time, end_time').eq('order_id', orderId),
    supabaseAdmin
      .from('schedule_blocks')
      .select('start_date, end_date, all_day, start_time, end_time')
      .eq('order_id', orderId)
      .lte('start_date', dateStr)
      .gte('end_date', dateStr),
  ]);

  const windowStart = localDateTimeToUTC(dateStr, '00:00:00');
  const windowStartMinus1 = new Date(windowStart.getTime() - 24 * 60 * 60000);
  const windowEndPlus1 = new Date(windowStart.getTime() + 2 * 24 * 60 * 60000);

  const { data: appointments } = await supabaseAdmin
    .from('appointments')
    .select('starts_at, ends_at')
    .eq('order_id', orderId)
    .neq('status', 'cancelled')
    .gte('starts_at', windowStartMinus1.toISOString())
    .lte('starts_at', windowEndPlus1.toISOString());

  return {
    businessHours: (businessHours || []) as BusinessHoursRow[],
    blocks: (blocks || []) as ScheduleBlockRow[],
    busyAppointments: (appointments || []).map((a) => ({
      startsAt: new Date(a.starts_at as string),
      endsAt: new Date(a.ends_at as string),
    })),
  };
}

/** Busca horário de atendimento + bloqueios + agendamentos existentes no
 *  banco e calcula os slots livres pra uma data — fonte única usada pela
 *  rota pública de disponibilidade, pela revalidação antes de gravar o
 *  agendamento do cliente final, e pelo agendamento manual da profissional
 *  (que precisa respeitar o próprio horário/bloqueio, senão ela consegue se
 *  auto-conflitar sem perceber). Antes essa busca estava duplicada em cada
 *  rota; centralizada aqui pra não divergir. */
export async function getAvailableSlotsForDate(
  orderId: string,
  dateStr: string,
  durationMinutes: number,
  options?: { applyTodayBuffer?: boolean }
): Promise<AvailabilitySlot[]> {
  const ctx = await fetchDayContext(orderId, dateStr);
  return computeAvailableSlots({
    dateStr,
    durationMinutes,
    ...ctx,
    applyTodayBuffer: options?.applyTodayBuffer,
  });
}

/** Confere se um instante exato (não precisa estar na grade de 30min) está
 *  livre — usada pelo agendamento manual da profissional, que digita
 *  qualquer horário em vez de escolher de uma lista. */
export async function isSlotAvailableForBooking(
  orderId: string,
  startsAt: Date,
  dateStr: string,
  durationMinutes: number
): Promise<boolean> {
  const ctx = await fetchDayContext(orderId, dateStr);
  return isInstantAvailable({ startsAt, dateStr, durationMinutes, ...ctx });
}
