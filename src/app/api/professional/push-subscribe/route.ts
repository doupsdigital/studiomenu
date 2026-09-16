import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';

/** POST /api/professional/push-subscribe
 *  Salva (ou atualiza) a inscrição de push do navegador atual pro catálogo.
 *  Body: { slug, subscription: PushSubscriptionJSON }. Só quem já está
 *  autenticada nesse catálogo pode se inscrever. */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const slug = (body?.slug || '').toLowerCase().trim();
    const subscription = body?.subscription;
    const endpoint = subscription?.endpoint;
    const p256dh = subscription?.keys?.p256dh;
    const auth = subscription?.keys?.auth;

    if (!slug || !endpoint || !p256dh || !auth) {
      return NextResponse.json({ success: false, message: 'Dados de inscrição inválidos.' }, { status: 400 });
    }

    const isAuthorized = await isProfessionalRequestAuthorized(slug);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    const { data: order, error: orderError } = await supabaseAdmin.from('orders').select('id').eq('slug', slug).single();
    if (orderError || !order) {
      return NextResponse.json({ success: false, message: 'Catálogo não encontrado.' }, { status: 404 });
    }

    const { error: upsertError } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert({ order_id: order.id, endpoint, p256dh, auth }, { onConflict: 'order_id,endpoint' });

    if (upsertError) {
      console.error('[Push Subscribe] Erro ao gravar inscrição:', upsertError);
      return NextResponse.json({ success: false, message: 'Erro ao salvar inscrição.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Push Subscribe Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
