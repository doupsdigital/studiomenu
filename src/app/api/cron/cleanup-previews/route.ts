import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { CAKTO_GRACE_MS } from '@/lib/cakto';

/** GET /api/cron/cleanup-previews
 *  Chamada 1x/dia por um Vercel Cron Job (`vercel.json`), mesma proteção por
 *  `CRON_SECRET` de `cleanup-rate-limits`.
 *
 *  1. Apaga as prévias gratuitas do funil `/lash` vencidas e nunca pagas
 *     (`order_services` sai junto, em cascata) — libera o nome/subdomínio.
 *     O catálogo público já mostra "prévia expirada" sozinho no momento em
 *     que vence; isso aqui é só faxina.
 *  2. Marca como 'suspenso' os catálogos da Cakto com `paid_until` vencido
 *     (fora da folga) que ainda constam 'ativo' — só pra manter o status
 *     coerente no admin/app; quem tira o catálogo do ar é `paid_until`.
 *
 *  Nunca toca em catálogos do Asaas (`billing_provider = 'asaas'`). */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, message: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const now = new Date();

    const { error: deleteError, count: deleted } = await supabaseAdmin
      .from('orders')
      .delete({ count: 'exact' })
      .eq('billing_provider', 'cakto')
      .eq('plan_tier', 'catalog')
      .not('preview_expires_at', 'is', null)
      .lt('preview_expires_at', now.toISOString());

    if (deleteError) {
      console.error('[Cron Cleanup Previews] Erro ao apagar prévias:', deleteError);
      return NextResponse.json({ success: false, message: 'Erro ao apagar prévias.' }, { status: 500 });
    }

    const lapsedCutoff = new Date(now.getTime() - CAKTO_GRACE_MS).toISOString();
    const { error: suspendError, count: suspended } = await supabaseAdmin
      .from('orders')
      .update({ subscription_status: 'suspenso' }, { count: 'exact' })
      .eq('billing_provider', 'cakto')
      .neq('plan_tier', 'catalog')
      .eq('subscription_status', 'ativo')
      .eq('manual_plan', false)
      .lt('paid_until', lapsedCutoff);

    if (suspendError) {
      console.error('[Cron Cleanup Previews] Erro ao suspender vencidos:', suspendError);
      return NextResponse.json({ success: false, message: 'Erro ao suspender vencidos.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedPreviews: deleted, suspended });
  } catch (error) {
    console.error('[Cron Cleanup Previews Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
