import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';

/** PUT /api/professional/agenda-pause
 *  Body: { slug, paused: boolean }
 *  Liga/desliga `orders.agenda_paused` (Fase 23) — a profissional pausa o
 *  agendamento automático temporariamente sem mexer na assinatura. Não toca
 *  em `booking_enabled` (ver comentário na migração): ela continua com
 *  acesso total à própria Agenda enquanto pausada, só o catálogo público
 *  (cliente final) passa a cair no WhatsApp. */
export async function PUT(request: Request) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`professional-agenda-pause:${ip}`, 20, 5 * 60);
    if (!allowed) {
      return NextResponse.json({ success: false, message: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 });
    }

    const body = await request.json();
    const { slug, paused } = body as { slug?: string; paused?: boolean };

    if (!slug || typeof paused !== 'boolean') {
      return NextResponse.json({ success: false, message: 'Dados inválidos.' }, { status: 400 });
    }

    const normalizedSlug = slug.toLowerCase().trim();
    if (!(await isProfessionalRequestAuthorized(normalizedSlug))) {
      return NextResponse.json({ success: false, message: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('id, booking_enabled')
      .eq('slug', normalizedSlug)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ success: false, message: 'Catálogo não encontrado.' }, { status: 404 });
    }

    // Pausar sem ter o agendamento automático de fato ligado não tem efeito
    // nenhum — evita um estado "pausada" órfão que confundiria se ela virasse
    // Plus depois (a agenda apareceria já pausada sem ela nunca ter mexido).
    if (!order.booking_enabled) {
      return NextResponse.json({ success: false, message: 'O agendamento automático não está ativo pra esse catálogo.' }, { status: 400 });
    }

    const { error: updateErr } = await supabaseAdmin.from('orders').update({ agenda_paused: paused }).eq('id', order.id);
    if (updateErr) {
      console.error('[API Agenda Pause] Erro ao atualizar:', updateErr);
      return NextResponse.json({ success: false, message: 'Erro ao salvar.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, agenda_paused: paused });
  } catch (error) {
    console.error('[API Agenda Pause Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
