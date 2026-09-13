import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';

const ALLOWED_STATUSES = ['confirmed', 'cancelled'] as const;

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** PATCH /api/professional/appointments/[id]  Body: { status: 'confirmed' | 'cancelled' }
 *  A autorização nunca confia num `slug` vindo do cliente pra decidir o que
 *  pode ser mexido: resolve o `order_id`/`slug` a partir do próprio
 *  agendamento no banco, e só then confere a sessão contra esse slug real —
 *  impede que uma sessão válida pra um catálogo mexa no agendamento de outro. */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`professional-appointment-action:${ip}`, 30, 60);
    if (!allowed) {
      return NextResponse.json({ success: false, message: 'Muitas tentativas. Aguarde um instante.' }, { status: 429 });
    }

    const { id } = await params;
    const { status } = (await request.json()) as { status?: string };

    if (!status || !ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])) {
      return NextResponse.json({ success: false, message: 'Status inválido.' }, { status: 400 });
    }

    const { data: appointment, error: apptErr } = await supabaseAdmin
      .from('appointments')
      .select('id, order_id')
      .eq('id', id)
      .single();

    if (apptErr || !appointment) {
      return NextResponse.json({ success: false, message: 'Agendamento não encontrado.' }, { status: 404 });
    }

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('slug')
      .eq('id', appointment.order_id)
      .single();

    if (orderErr || !order || !(await isProfessionalRequestAuthorized(order.slug))) {
      return NextResponse.json({ success: false, message: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    const { error: updateErr } = await supabaseAdmin.from('appointments').update({ status }).eq('id', id);

    if (updateErr) {
      console.error('[API Professional Appointment Update] Erro:', updateErr);
      return NextResponse.json({ success: false, message: 'Erro ao atualizar o agendamento.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Professional Appointment Update Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
