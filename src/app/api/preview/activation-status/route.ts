import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isCaktoAccessLapsed } from '@/lib/cakto';
import { PREVIEW_SESSION_COOKIE, readPreviewSession } from '@/lib/preview-session';
import { createProfessionalSessionValue, PROFESSIONAL_SESSION_COOKIE } from '@/lib/professional-session';

export const dynamic = 'force-dynamic';

/** Pra onde ela vai depois de ativar: o checklist guiado. */
function appEntryPath(slug: string): string {
  return `/app/${slug}/primeiros-passos`;
}

/** GET /api/preview/activation-status
 *
 *  Consultada pela página `/ativando` (obrigado da Cakto, 2026-11-18) a cada
 *  poucos segundos enquanto o webhook não confirma o pagamento. Lê o cookie
 *  `sm_preview` (só existe no navegador que gerou a prévia) e, quando o
 *  pedido já está pago na Cakto, grava a sessão da profissional — ela cai
 *  direto no app, sem link mágico nem senha.
 *
 *  Status: `no_session` (outro aparelho / sem prévia), `not_found`,
 *  `pending` (ainda sem confirmação) ou `active`. */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = readPreviewSession(cookieStore.get(PREVIEW_SESSION_COOKIE)?.value);
    if (!session) return NextResponse.json({ status: 'no_session' });

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('slug, client_name, studio_name, plan_tier, preview_code, billing_provider, paid_until')
      .eq('slug', session.slug)
      .maybeSingle();

    if (error) throw error;
    // Código diferente = o slug foi liberado e reaproveitado por outra pessoa.
    if (!order || order.preview_code !== session.previewCode) {
      return NextResponse.json({ status: 'not_found' });
    }

    const isActive =
      order.billing_provider === 'cakto' && order.plan_tier !== 'catalog' && !isCaktoAccessLapsed(order.paid_until);
    // Nome da PESSOA, não do studio: `studio_name` nasce "Studio <nome>" e a
    // tela mostra só a 1ª palavra — saía "Studio" (achado real, 2026-11-18).
    const name = order.client_name || order.studio_name || '';

    if (!isActive) return NextResponse.json({ status: 'pending', name });

    const response = NextResponse.json({ status: 'active', name, redirectTo: appEntryPath(order.slug) });
    // Mesmo cookie/opções de `/api/professional/login` (path `/` de propósito,
    // ver comentário lá).
    response.cookies.set(PROFESSIONAL_SESSION_COOKIE, createProfessionalSessionValue(order.slug), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 90,
    });
    return response;
  } catch (error) {
    console.error('[Preview Activation Status Exception]:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
