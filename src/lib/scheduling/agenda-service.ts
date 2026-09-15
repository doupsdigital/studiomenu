import { supabaseAdmin } from '../supabase-admin';
import { localDateTimeToUTC } from './availability';

export interface AgendaAppointment {
  id: string;
  service_title: string;
  duration_minutes: number;
  price_snapshot: string | null;
  client_name: string;
  client_whatsapp: string;
  client_notes: string | null;
  starts_at: string;
  ends_at: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  origin: 'catalog' | 'professional';
}

export interface ManualBookingService {
  id: string;
  title: string;
  price: string;
  duration_minutes: number;
}

/** Todos os agendamentos dentro dos limites do dia `dateStr` (fuso
 *  America/Sao_Paulo), ordenados por horário — inclui os cancelados/
 *  recusados de propósito (mesmo comportamento do LashAgenda: eles
 *  continuam aparecendo no dia, cinza, como rastro histórico; o horário já
 *  fica livre pra outro agendamento de qualquer forma, já que nem a trava
 *  de conflito no banco nem a checagem de disponibilidade da grade
 *  consideram agendamentos cancelados). */
export async function getAppointmentsForDay(orderId: string, dateStr: string): Promise<AgendaAppointment[]> {
  const dayStart = localDateTimeToUTC(dateStr, '00:00:00');
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60000);

  const { data } = await supabaseAdmin
    .from('appointments')
    .select('id, service_title, duration_minutes, price_snapshot, client_name, client_whatsapp, client_notes, starts_at, ends_at, status, origin')
    .eq('order_id', orderId)
    .gte('starts_at', dayStart.toISOString())
    .lt('starts_at', dayEnd.toISOString())
    .order('starts_at', { ascending: true });

  return (data as AgendaAppointment[]) || [];
}

/** Fila de agendamentos aguardando confirmação — sem filtro de data, é uma
 *  lista de pendências, não do dia visualizado. */
export async function getPendingAppointments(orderId: string, limit = 50): Promise<AgendaAppointment[]> {
  const { data } = await supabaseAdmin
    .from('appointments')
    .select('id, service_title, duration_minutes, price_snapshot, client_name, client_whatsapp, client_notes, starts_at, ends_at, status, origin')
    .eq('order_id', orderId)
    .eq('status', 'pending')
    .order('starts_at', { ascending: true })
    .limit(limit);

  return (data as AgendaAppointment[]) || [];
}

/** Serviços que a profissional pode escolher pra um agendamento manual —
 *  todos com duração configurada, não só os `bookable` (ela pode agendar
 *  manualmente o que quiser, diferente do agendamento automático do cliente
 *  final que respeita `bookable`). */
export async function getManualBookingServices(orderId: string): Promise<ManualBookingService[]> {
  const { data } = await supabaseAdmin
    .from('order_services')
    .select('id, title, price, duration_minutes')
    .eq('order_id', orderId)
    .not('duration_minutes', 'is', null)
    .order('order_index', { ascending: true });

  return (data as ManualBookingService[]) || [];
}
