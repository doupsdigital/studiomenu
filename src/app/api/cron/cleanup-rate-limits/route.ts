import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/** GET /api/cron/cleanup-rate-limits
 *  Chamada 1x/dia por um Vercel Cron Job (`vercel.json`) — apaga linhas de
 *  `rate_limits` mais velhas que 24h. As janelas de rate limit usadas no
 *  projeto (`src/lib/rate-limit.ts`) nunca passam de 1h, então qualquer
 *  linha com mais de 24h já não tem função nenhuma, só ocupa espaço.
 *
 *  Protegida por `CRON_SECRET`: a Vercel injeta esse valor automaticamente
 *  como `Authorization: Bearer <CRON_SECRET>` em toda chamada de Cron Job
 *  (ver https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs) —
 *  sem isso, essa URL ficaria publicamente chamável por qualquer um. */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, message: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { error, count } = await supabaseAdmin.from('rate_limits').delete({ count: 'exact' }).lt('window_start', cutoff);

    if (error) {
      console.error('[Cron Cleanup Rate Limits] Erro:', error);
      return NextResponse.json({ success: false, message: 'Erro ao limpar.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: count });
  } catch (error) {
    console.error('[Cron Cleanup Rate Limits Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
