import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** DELETE /api/professional/schedule-blocks/[id]
 *  Mesmo padrão de autorização do PATCH de agendamento (Fase 4b): resolve o
 *  dono real do recurso no banco antes de checar a sessão, nunca confia em
 *  slug vindo do cliente. */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`professional-schedule-block-delete:${ip}`, 30, 60);
    if (!allowed) {
      return NextResponse.json({ success: false, message: 'Muitas tentativas. Aguarde um instante.' }, { status: 429 });
    }

    const { id } = await params;

    const { data: block, error: blockErr } = await supabaseAdmin
      .from('schedule_blocks')
      .select('id, order_id')
      .eq('id', id)
      .single();

    if (blockErr || !block) {
      return NextResponse.json({ success: false, message: 'Bloqueio não encontrado.' }, { status: 404 });
    }

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('slug')
      .eq('id', block.order_id)
      .single();

    if (orderErr || !order || !(await isProfessionalRequestAuthorized(order.slug))) {
      return NextResponse.json({ success: false, message: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    const { error: deleteErr } = await supabaseAdmin.from('schedule_blocks').delete().eq('id', id);
    if (deleteErr) {
      console.error('[API Schedule Block Delete] Erro:', deleteErr);
      return NextResponse.json({ success: false, message: 'Erro ao apagar o bloqueio.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Schedule Block Delete Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
