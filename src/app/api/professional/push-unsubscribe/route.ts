import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';

/** POST /api/professional/push-unsubscribe
 *  Remove a inscrição de push do navegador atual (ex: profissional desativou
 *  as notificações). Body: { slug, endpoint }. */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const slug = (body?.slug || '').toLowerCase().trim();
    const endpoint = body?.endpoint;

    if (!slug || !endpoint) {
      return NextResponse.json({ success: false, message: 'Dados inválidos.' }, { status: 400 });
    }

    const isAuthorized = await isProfessionalRequestAuthorized(slug);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    const { data: order, error: orderError } = await supabaseAdmin.from('orders').select('id').eq('slug', slug).single();
    if (orderError || !order) {
      return NextResponse.json({ success: false, message: 'Catálogo não encontrado.' }, { status: 404 });
    }

    await supabaseAdmin.from('push_subscriptions').delete().eq('order_id', order.id).eq('endpoint', endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Push Unsubscribe Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
