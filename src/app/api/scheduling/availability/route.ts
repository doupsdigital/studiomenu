import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { computeAvailableSlots, localDateTimeToUTC, BusinessHoursRow, ScheduleBlockRow } from '@/lib/scheduling/availability';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** GET /api/scheduling/availability?slug=X&service_id=Y&date=YYYY-MM-DD
 *  Pública (usada pelo modal de agendamento do catálogo, sem auth), rate-limited. */
export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`scheduling-availability:${ip}`, 60, 60);
    if (!allowed) {
      return NextResponse.json({ success: false, message: 'Muitas requisições. Tente novamente em instantes.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const slug = (searchParams.get('slug') || '').toLowerCase().trim();
    const serviceId = searchParams.get('service_id') || '';
    const dateStr = searchParams.get('date') || '';

    if (!slug || !serviceId || !DATE_RE.test(dateStr)) {
      return NextResponse.json(
        { success: false, message: 'Parâmetros inválidos (slug, service_id, date são obrigatórios).' },
        { status: 400 }
      );
    }

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('id, booking_enabled')
      .eq('slug', slug)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ success: false, message: 'Catálogo não encontrado.' }, { status: 404 });
    }

    if (!order.booking_enabled) {
      return NextResponse.json({ success: false, message: 'Agendamento automático não está ativo pra este catálogo.' }, { status: 400 });
    }

    const { data: service, error: serviceErr } = await supabaseAdmin
      .from('order_services')
      .select('id, title, price, duration_minutes, bookable')
      .eq('id', serviceId)
      .eq('order_id', order.id)
      .single();

    if (serviceErr || !service) {
      return NextResponse.json({ success: false, message: 'Serviço não encontrado.' }, { status: 404 });
    }

    if (service.bookable === false || !service.duration_minutes || service.duration_minutes <= 0) {
      return NextResponse.json(
        { success: false, message: 'Esse serviço ainda não tem duração configurada pra agendamento automático.' },
        { status: 400 }
      );
    }

    const [{ data: businessHours }, { data: blocks }] = await Promise.all([
      supabaseAdmin.from('business_hours').select('weekday, start_time, end_time').eq('order_id', order.id),
      supabaseAdmin
        .from('schedule_blocks')
        .select('start_date, end_date, all_day, start_time, end_time')
        .eq('order_id', order.id)
        .lte('start_date', dateStr)
        .gte('end_date', dateStr),
    ]);

    // Janela de busca de agendamentos existentes com folga de 1 dia pra cada
    // lado (evita perder agendamentos que cruzam meia-noite no fuso local).
    const windowStart = localDateTimeToUTC(dateStr, '00:00:00');
    const windowStartMinus1 = new Date(windowStart.getTime() - 24 * 60 * 60000);
    const windowEndPlus1 = new Date(windowStart.getTime() + 2 * 24 * 60 * 60000);

    const { data: appointments } = await supabaseAdmin
      .from('appointments')
      .select('starts_at, ends_at')
      .eq('order_id', order.id)
      .neq('status', 'cancelled')
      .gte('starts_at', windowStartMinus1.toISOString())
      .lte('starts_at', windowEndPlus1.toISOString());

    const slots = computeAvailableSlots({
      dateStr,
      durationMinutes: service.duration_minutes,
      businessHours: (businessHours || []) as BusinessHoursRow[],
      blocks: (blocks || []) as ScheduleBlockRow[],
      busyAppointments: (appointments || []).map((a) => ({
        startsAt: new Date(a.starts_at as string),
        endsAt: new Date(a.ends_at as string),
      })),
    });

    return NextResponse.json({ success: true, slots, service: { id: service.id, title: service.title, price: service.price } });
  } catch (error) {
    console.error('[API Scheduling Availability Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno ao calcular disponibilidade.' }, { status: 500 });
  }
}
