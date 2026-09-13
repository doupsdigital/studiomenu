import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';
import { buildAppointmentInsertPayload } from '@/lib/scheduling/appointment-payload';

/** POST /api/professional/appointments
 *  Agendamento manual criado pela própria profissional (walk-in, telefone,
 *  etc) — diferente de `/api/scheduling/book` (público, cliente final), este
 *  exige sessão autenticada e já nasce `confirmed` (ela não precisa
 *  confirmar o próprio agendamento). */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`professional-manual-booking:${ip}`, 20, 5 * 60);
    if (!allowed) {
      return NextResponse.json({ success: false, message: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 });
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
      return NextResponse.json({ success: false, message: 'Preencha serviço, horário, nome e WhatsApp.' }, { status: 400 });
    }

    const normalizedSlug = slug.toLowerCase().trim();
    if (!(await isProfessionalRequestAuthorized(normalizedSlug))) {
      return NextResponse.json({ success: false, message: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    const startsAtDate = new Date(starts_at);
    if (Number.isNaN(startsAtDate.getTime())) {
      return NextResponse.json({ success: false, message: 'Horário inválido.' }, { status: 400 });
    }

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('slug', normalizedSlug)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ success: false, message: 'Catálogo não encontrado.' }, { status: 404 });
    }

    const { data: service, error: serviceErr } = await supabaseAdmin
      .from('order_services')
      .select('id, title, price, duration_minutes')
      .eq('id', service_id)
      .eq('order_id', order.id)
      .single();

    if (serviceErr || !service || !service.duration_minutes || service.duration_minutes <= 0) {
      return NextResponse.json(
        { success: false, message: 'Esse serviço ainda não tem duração configurada.' },
        { status: 400 }
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
      origin: 'professional',
      status: 'confirmed',
    });

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('appointments')
      .insert(payload)
      .select('id, starts_at, ends_at, status')
      .single();

    if (insertErr) {
      if ((insertErr as { code?: string }).code === '23P01') {
        return NextResponse.json(
          { success: false, message: 'Já existe um agendamento nesse horário.' },
          { status: 409 }
        );
      }
      console.error('[API Professional Appointments] Erro ao inserir:', insertErr);
      return NextResponse.json({ success: false, message: 'Erro ao criar o agendamento.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, appointment: inserted });
  } catch (error) {
    console.error('[API Professional Appointments Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
