import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { getAvailableSlotsForDate } from '@/lib/scheduling/slot-lookup';
import { buildAppointmentInsertPayload } from '@/lib/scheduling/appointment-payload';
import { sendPushToOrder } from '@/lib/push-notifications';

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

    const slots = await getAvailableSlotsForDate(order.id, dateStr, service.duration_minutes);

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

    // Só agendamentos feitos pela cliente (origin 'catalog', sempre o caso
    // nesta rota) disparam push — a profissional já sabe dos que ela mesma
    // cria manualmente pelo app.
    // Dia e hora sempre no fuso de São Paulo (o servidor roda em UTC) — é o
    // dado que ela mais precisa pra decidir aceitar sem abrir o app.
    const weekday = startsAtDate.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'America/Sao_Paulo' }).replace('.', '');
    const dayMonth = startsAtDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
    const time = startsAtDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

    await sendPushToOrder(order.id, {
      title: '📅 Novo agendamento',
      body: `${client_name.trim()} · ${service.title} · ${weekday}, ${dayMonth} às ${time}`,
      url: `/app/${slug.toLowerCase().trim()}/agenda#pendentes`,
    });

    return NextResponse.json({ success: true, appointment: inserted, service: { title: service.title, price: service.price } });
  } catch (error) {
    console.error('[API Scheduling Book Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno ao criar o agendamento.' }, { status: 500 });
  }
}
