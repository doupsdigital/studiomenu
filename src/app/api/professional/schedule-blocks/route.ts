import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** POST /api/professional/schedule-blocks
 *  Bloqueio pontual/rápido de horário (a partir da Agenda) — gestão completa
 *  de bloqueios (listar/editar/apagar) é a aba Config (Fase 4c). */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`professional-schedule-block:${ip}`, 20, 5 * 60);
    if (!allowed) {
      return NextResponse.json({ success: false, message: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 });
    }

    const body = await request.json();
    const { slug, start_date, end_date, all_day, start_time, end_time, reason } = body as {
      slug?: string;
      start_date?: string;
      end_date?: string;
      all_day?: boolean;
      start_time?: string;
      end_time?: string;
      reason?: string;
    };

    if (!slug || !start_date || !DATE_RE.test(start_date) || !end_date || !DATE_RE.test(end_date)) {
      return NextResponse.json({ success: false, message: 'Datas inválidas.' }, { status: 400 });
    }

    if (!all_day && (!start_time || !end_time)) {
      return NextResponse.json(
        { success: false, message: 'Informe o horário de início e fim, ou marque "dia inteiro".' },
        { status: 400 }
      );
    }

    const normalizedSlug = slug.toLowerCase().trim();
    if (!(await isProfessionalRequestAuthorized(normalizedSlug))) {
      return NextResponse.json({ success: false, message: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('slug', normalizedSlug)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ success: false, message: 'Catálogo não encontrado.' }, { status: 404 });
    }

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('schedule_blocks')
      .insert({
        order_id: order.id,
        start_date,
        end_date,
        all_day: Boolean(all_day),
        start_time: all_day ? null : start_time,
        end_time: all_day ? null : end_time,
        reason: reason?.trim() || null,
      })
      .select('id')
      .single();

    if (insertErr) {
      console.error('[API Professional Schedule Blocks] Erro ao inserir:', insertErr);
      return NextResponse.json({ success: false, message: 'Erro ao criar o bloqueio.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, block: inserted });
  } catch (error) {
    console.error('[API Professional Schedule Blocks Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
