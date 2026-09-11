import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { computeAvailableSlots, localDateTimeToUTC, BusinessHoursRow, ScheduleBlockRow } from '@/lib/scheduling/availability';
import { buildAppointmentInsertPayload } from '@/lib/scheduling/appointment-payload';

/** POST /api/scheduling/book
 *  Pública (o cliente final não tem conta — só nome + WhatsApp), rate-limited.
 *  Body: { slug, service_id, starts_at (ISO), client_name, client_whatsapp, client_notes? } */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`scheduling-book:${ip}`, 10, 300);
    if (!allowed) {
      return NextResponse.json({ success: false, message: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' }, { status: 429 });
    }

    const body = await request.json();
    const { slug, service_id, starts_at, client_name, client_whatsapp, client_notes } = body as {
      slug?: string;
      service_id?: string;
      starts_at?: string;
      client_name?: string;
      client_whatsapp?: string;
      client_notes?: string;
    };

    if (!slug || !service_id || !starts_at || !client_name?.trim() || !client_whatsapp?.trim()) {
      return NextResponse.json({ success: false, message: 'Preencha nome, WhatsApp e escolha um horário.' }, { status: 400 });
    }

    const startsAtDate = new Date(starts_at);
    if (Number.isNaN(startsAtDate.getTime())) {
      return NextResponse.json({ success: false, message: 'Horário inválido.' }, { status: 400 });
    }

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('id, booking_enabled')
      .eq('slug', slug.toLowerCase().trim())
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
      .eq('id', service_id)
      .eq('order_id', order.id)
      .single();

    if (serviceErr || !service || service.bookable === false || !service.duration_minutes || service.duration_minutes <= 0) {
      return NextResponse.json({ success: false, message: 'Serviço indisponível pra agendamento automático.' }, { status: 400 });
    }

    // Revalida o slot antes de gravar (o front pode ter uma lista de horários
    // desatualizada) — recalcula a disponibilidade real do dia e confirma que
    // o horário pedido ainda está livre. A garantia final e definitiva contra
    // corrida continua sendo a exclusion constraint no banco (ver catch abaixo).
    const dateStr = startsAtDate.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }); // YYYY-MM-DD

    const [{ data: businessHours }, { data: blocks }] = await Promise.all([
      supabaseAdmin.from('business_hours').select('weekday, start_time, end_time').eq('order_id', order.id),
      supabaseAdmin
        .from('schedule_blocks')
        .select('start_date, end_date, all_day, start_time, end_time')
        .eq('order_id', order.id)
        .lte('start_date', dateStr)
        .gte('end_date', dateStr),
    ]);

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

    const stillAvailable = slots.some((s) => s.startsAt === startsAtDate.toISOString());
    if (!stillAvailable) {
      return NextResponse.json(
        { success: false, message: 'Esse horário não está mais disponível. Escolha outro, por favor.' },
        { status: 409 }
      );
    }

    const payload = buildAppointmentInsertPayload({
      orderId: order.id,
      serviceId: service.id,
      serviceTitle: service.title,
      durationMinutes: service.duration_minutes,
      priceSnapshot: service.price,
      clientName: client_name,
      clientWhatsapp: client_whatsapp,
      clientNotes: client_notes,
      startsAt: startsAtDate.toISOString(),
      origin: 'catalog',
      status: 'pending',
    });

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('appointments')
      .insert(payload)
      .select('id, starts_at, ends_at, status')
      .single();

    if (insertErr) {
      // 23P01 = violação da exclusion constraint (choque de horário) — última
      // trava, pro caso raro de duas requisições passarem pela revalidação
      // acima ao mesmo tempo.
      if ((insertErr as { code?: string }).code === '23P01') {
        return NextResponse.json(
          { success: false, message: 'Esse horário acabou de ser reservado por outra pessoa. Escolha outro, por favor.' },
          { status: 409 }
        );
      }
      console.error('[API Scheduling Book] Erro ao inserir appointment:', insertErr);
      return NextResponse.json({ success: false, message: 'Erro ao confirmar o agendamento.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, appointment: inserted, service: { title: service.title, price: service.price } });
  } catch (error) {
    console.error('[API Scheduling Book Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno ao criar o agendamento.' }, { status: 500 });
  }
}
