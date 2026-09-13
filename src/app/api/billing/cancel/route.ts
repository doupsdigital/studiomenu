import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';
import { AsaasConfigError, AsaasApiError, cancelSubscription } from '@/lib/asaas';
import { setSubscriptionStatus } from '@/lib/billing-service';

/** POST /api/billing/cancel
 *  Body: { slug } */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`billing-cancel:${ip}`, 10, 15 * 60);
    if (!allowed) {
      return NextResponse.json({ success: false, message: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 });
    }

    const body = await request.json();
    const { slug } = body as { slug?: string };
    if (!slug) {
      return NextResponse.json({ success: false, message: 'Dados inválidos.' }, { status: 400 });
    }

    const normalizedSlug = slug.toLowerCase().trim();
    if (!(await isProfessionalRequestAuthorized(normalizedSlug))) {
      return NextResponse.json({ success: false, message: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('id, asaas_subscription_id')
      .eq('slug', normalizedSlug)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ success: false, message: 'Catálogo não encontrado.' }, { status: 404 });
    }

    if (!order.asaas_subscription_id) {
      return NextResponse.json({ success: false, message: 'Nenhuma assinatura ativa pra cancelar.' }, { status: 400 });
    }

    await cancelSubscription(order.asaas_subscription_id);
    await setSubscriptionStatus(order.id, 'cancelado');
    await supabaseAdmin.from('orders').update({ asaas_subscription_id: null }).eq('id', order.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AsaasConfigError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 503 });
    }
    if (error instanceof AsaasApiError) {
      console.error('[API Billing Cancel] Erro do Asaas:', error.status, error.message);
      return NextResponse.json({ success: false, message: 'Não foi possível cancelar agora.' }, { status: 502 });
    }
    console.error('[API Billing Cancel Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
