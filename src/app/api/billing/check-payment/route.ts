import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';
import { AsaasConfigError, AsaasApiError, getPayment } from '@/lib/asaas';
import { activateSubscription } from '@/lib/billing-service';

const CONFIRMED_STATUSES = new Set(['CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH']);

/** POST /api/billing/check-payment
 *  Body: { slug, payment_id }
 *  Polling de fallback pro frontend, resiliência dupla junto com o webhook —
 *  reusa a mesma `activateSubscription` (src/lib/billing-service.ts), então
 *  os dois caminhos decidem exatamente igual. */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`billing-check-payment:${ip}`, 60, 5 * 60);
    if (!allowed) {
      return NextResponse.json({ success: false, message: 'Muitas tentativas. Aguarde um instante.' }, { status: 429 });
    }

    const body = await request.json();
    const { slug, payment_id } = body as { slug?: string; payment_id?: string };

    if (!slug || !payment_id) {
      return NextResponse.json({ success: false, message: 'Dados inválidos.' }, { status: 400 });
    }

    const normalizedSlug = slug.toLowerCase().trim();
    if (!(await isProfessionalRequestAuthorized(normalizedSlug))) {
      return NextResponse.json({ success: false, message: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('id, asaas_subscription_id, asaas_customer_id')
      .eq('slug', normalizedSlug)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ success: false, message: 'Catálogo não encontrado.' }, { status: 404 });
    }

    const payment = await getPayment(payment_id);

    // Confirma que o pagamento é mesmo desse catálogo antes de ativar
    // qualquer coisa — sem isso, a profissional poderia (por engano ou não)
    // consultar o payment_id de outra pessoa.
    const belongsToOrder =
      (payment.subscription && payment.subscription === order.asaas_subscription_id) ||
      (payment.customer && payment.customer === order.asaas_customer_id);

    if (!belongsToOrder) {
      return NextResponse.json({ success: false, message: 'Pagamento não encontrado pra este catálogo.' }, { status: 403 });
    }

    const active = CONFIRMED_STATUSES.has(payment.status);
    if (active) {
      await activateSubscription(order.id);
    }

    return NextResponse.json({ success: true, active, status: payment.status });
  } catch (error) {
    if (error instanceof AsaasConfigError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 503 });
    }
    if (error instanceof AsaasApiError) {
      console.error('[API Billing Check Payment] Erro do Asaas:', error.status, error.message);
      return NextResponse.json({ success: false, message: 'Não foi possível consultar o pagamento agora.' }, { status: 502 });
    }
    console.error('[API Billing Check Payment Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
