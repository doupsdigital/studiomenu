import { supabaseAdmin } from '../supabase-admin';

export interface BusinessHoursConfigRow {
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface ScheduleBlockConfigRow {
  id: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
}

export async function getBusinessHours(orderId: string): Promise<BusinessHoursConfigRow[]> {
  const { data } = await supabaseAdmin
    .from('business_hours')
    .select('weekday, start_time, end_time')
    .eq('order_id', orderId)
    .order('weekday', { ascending: true });

  return (data as BusinessHoursConfigRow[]) || [];
}

export async function getScheduleBlocks(orderId: string): Promise<ScheduleBlockConfigRow[]> {
  const { data } = await supabaseAdmin
    .from('schedule_blocks')
    .select('id, start_date, end_date, all_day, start_time, end_time, reason')
    .eq('order_id', orderId)
    .order('start_date', { ascending: true });

  return (data as ScheduleBlockConfigRow[]) || [];
}
