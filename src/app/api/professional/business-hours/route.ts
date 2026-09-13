import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';

interface HoursInput {
  weekday: number;
  start_time: string;
  end_time: string;
}

const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;

/** PUT /api/professional/business-hours
 *  Substitui a grade semanal inteira (delete-all + insert) — diferente de
 *  `order_services` (Fase 0), nada referencia o id de `business_hours`, só o
 *  `weekday` importa pro motor de disponibilidade, então não há necessidade
 *  de manter ids estáveis aqui. */
export async function PUT(request: Request) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`professional-business-hours:${ip}`, 20, 5 * 60);
    if (!allowed) {
      return NextResponse.json({ success: false, message: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 });
    }

    const body = await request.json();
    const { slug, hours } = body as { slug?: string; hours?: HoursInput[] };

    if (!slug || !Array.isArray(hours)) {
      return NextResponse.json({ success: false, message: 'Dados inválidos.' }, { status: 400 });
    }

    const seenWeekdays = new Set<number>();
    for (const h of hours) {
      if (
        typeof h.weekday !== 'number' ||
        h.weekday < 0 ||
        h.weekday > 6 ||
        !TIME_RE.test(h.start_time) ||
        !TIME_RE.test(h.end_time) ||
        h.start_time >= h.end_time
      ) {
        return NextResponse.json(
          { success: false, message: 'Horário inválido — confira se o início é antes do fim.' },
          { status: 400 }
        );
      }
      if (seenWeekdays.has(h.weekday)) {
        return NextResponse.json({ success: false, message: 'Dia da semana duplicado.' }, { status: 400 });
      }
      seenWeekdays.add(h.weekday);
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

    const { error: deleteErr } = await supabaseAdmin.from('business_hours').delete().eq('order_id', order.id);
    if (deleteErr) {
      console.error('[API Business Hours] Erro ao limpar grade anterior:', deleteErr);
      return NextResponse.json({ success: false, message: 'Erro ao salvar os horários.' }, { status: 500 });
    }

    if (hours.length > 0) {
      const { error: insertErr } = await supabaseAdmin.from('business_hours').insert(
        hours.map((h) => ({ order_id: order.id, weekday: h.weekday, start_time: h.start_time, end_time: h.end_time }))
      );
      if (insertErr) {
        console.error('[API Business Hours] Erro ao inserir grade nova:', insertErr);
        return NextResponse.json({ success: false, message: 'Erro ao salvar os horários.' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Business Hours Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
