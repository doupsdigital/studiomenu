import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';
import { resolveLifetimePrice } from '@/lib/pricing';
import { buildPaymentResponse } from '@/lib/billing-service';
import {
  AsaasConfigError,
  AsaasApiError,
  createPayment,
  getPayment,
  UNPAID_STATUSES,
  type AsaasBillingType,
} from '@/lib/asaas';

type PaymentMethod = 'pix' | 'card';

const BILLING_TYPE: Record<PaymentMethod, AsaasBillingType> = { pix: 'PIX', card: 'CREDIT_CARD' };

/** POST /api/billing/upgrade-to-lifetime
 *  Body: { slug, method? ('pix' | 'card', padrão pix) }
 *  Autoatendimento (Fase 28): quem já tem o Catálogo recorrente ativo paga
 *  uma taxa única pra virar vitalício — cancela a mensalidade de verdade
 *  (dentro de `activateSubscription`, só depois do pagamento confirmado,
 *  nunca antes) e volta a ser pagamento único a partir daí. Não pede
 *  CPF/e-mail de novo: ela já é cliente paga confirmada, a cobrança usa o
 *  `asaas_customer_id` que já existe na order. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, method: rawMethod } = body as { slug?: string; method?: string };

    if (!slug) {
      return NextResponse.json({ success: false, message: 'Dados inválidos.' }, { status: 400 });
    }
    if (rawMethod !== undefined && rawMethod !== 'pix' && rawMethod !== 'card') {
      return NextResponse.json({ success: false, message: 'Forma de pagamento inválida.' }, { status: 400 });
    }
    const method: PaymentMethod = rawMethod === 'card' ? 'card' : 'pix';

    const normalizedSlug = slug.toLowerCase().trim();
    if (!(await isProfessionalRequestAuthorized(normalizedSlug))) {
      return NextResponse.json({ success: false, message: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('id, plan_tier, subscription_status, catalog_billing_mode, asaas_subscription_id, asaas_customer_id, lifetime_price_override, pending_lifetime_payment_id')
      .eq('slug', normalizedSlug)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ success: false, message: 'Catálogo não encontrado.' }, { status: 404 });
    }

    // Só faz sentido pra quem tem mesmo uma mensalidade real do Catálogo
    // rodando — sem isso não existe o que cancelar (ex: quem já é avulso,
    // ou nunca assinou nada).
    if (order.plan_tier !== 'basico' || order.catalog_billing_mode !== 'recorrente' || !order.asaas_subscription_id || !order.asaas_customer_id) {
      return NextResponse.json(
        { success: false, message: 'Isso só está disponível pra quem já tem o Catálogo recorrente.' },
        { status: 400 }
      );
    }
    // Com mensalidade atrasada (suspensa), bloqueia a conversão — pedido
    // explícito, 2026-10-07: pagar o vitalício cancela a assinatura, e a
    // dívida da mensalidade em aberto ficaria sem rastreamento nenhum
    // depois disso (o app só sabe de cobrança em aberto via
    // `asaas_subscription_id`, que deixa de existir). Precisa regularizar a
    // mensalidade primeiro.
    if (order.subscription_status !== 'ativo') {
      return NextResponse.json(
        { success: false, message: 'Regularize sua mensalidade em atraso antes de virar vitalício.' },
        { status: 400 }
      );
    }

    const allowed = await checkRateLimit(`billing-lifetime:${order.id}`, 10, 15 * 60);
    if (!allowed) {
      return NextResponse.json({ success: false, message: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 });
    }

    // Reaproveita a cobrança pendente, se ela recarregou a página antes de
    // pagar — evita cobrar a taxa de conversão duas vezes (mesmo cuidado do
    // checkout genérico com assinaturas pendentes). Se essa cobrança não
    // existir mais no Asaas (404 — achado em auditoria: sem isso, qualquer
    // tentativa futura travava pra sempre nesse mesmo erro, nunca criando
    // uma cobrança nova), trata como se não tivesse nenhuma pendente.
    if (order.pending_lifetime_payment_id) {
      try {
        const existingPayment = await getPayment(order.pending_lifetime_payment_id);
        if (UNPAID_STATUSES.has(existingPayment.status)) {
          return buildPaymentResponse(existingPayment, method);
        }
      } catch (fetchError) {
        if (!(fetchError instanceof AsaasApiError && fetchError.status === 404)) {
          throw fetchError;
        }
      }
    }

    const price = resolveLifetimePrice(order.lifetime_price_override).price;

    const payment = await createPayment({
      customerId: order.asaas_customer_id,
      value: price,
      description: 'StudioMenu Catálogo — Vitalício',
      billingType: BILLING_TYPE[method],
    });

    await supabaseAdmin.from('orders').update({ pending_lifetime_payment_id: payment.id }).eq('id', order.id);

    return buildPaymentResponse(payment, method);
  } catch (error) {
    if (error instanceof AsaasConfigError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 503 });
    }
    if (error instanceof AsaasApiError) {
      console.error('[API Billing Upgrade To Lifetime] Erro do Asaas:', error.status, error.message);
      return NextResponse.json({ success: false, message: 'Não foi possível processar o pagamento agora.' }, { status: 502 });
    }
    console.error('[API Billing Upgrade To Lifetime Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
