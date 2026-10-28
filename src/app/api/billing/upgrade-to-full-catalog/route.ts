import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';
import { resolveFullCatalogUpgradePrice } from '@/lib/pricing';
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

/** POST /api/billing/upgrade-to-full-catalog
 *  Body: { slug, method? ('pix' | 'card', padrão pix) }
 *  Autoatendimento da oferta "Catálogo Completo" (2026-10-28) pra quem JÁ
 *  paga o Catálogo simples (R$79) — paga só a diferença (padrão R$60,
 *  `resolveFullCatalogUpgradePrice`) e, só depois do pagamento confirmado
 *  (dentro de `activateSubscription`, nunca antes), destrava
 *  Capa/Orientações/Contato de verdade. Não pede CPF/e-mail de novo: ela já
 *  é cliente paga confirmada, a cobrança usa o `asaas_customer_id` que já
 *  existe na order. Clone direto de `/api/billing/upgrade-to-lifetime`. */
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
      .select(
        'id, plan_tier, subscription_status, asaas_customer_id, full_catalog_offer_enabled, full_catalog_offer_decision, full_catalog_upgrade_price_override, pending_full_catalog_payment_id'
      )
      .eq('slug', normalizedSlug)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ success: false, message: 'Catálogo não encontrado.' }, { status: 404 });
    }

    // Só faz sentido pra quem já paga o Catálogo simples (plan_tier
    // 'basico', ativo), com a oferta ligada pelo admin pra essa cliente e
    // ainda não recusada.
    if (
      order.plan_tier !== 'basico' ||
      order.subscription_status !== 'ativo' ||
      !order.asaas_customer_id ||
      !order.full_catalog_offer_enabled ||
      order.full_catalog_offer_decision === 'declined'
    ) {
      return NextResponse.json(
        { success: false, message: 'Essa oferta não está disponível agora.' },
        { status: 400 }
      );
    }

    const allowed = await checkRateLimit(`billing-full-catalog-upgrade:${order.id}`, 10, 15 * 60);
    if (!allowed) {
      return NextResponse.json({ success: false, message: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 });
    }

    // Reaproveita a cobrança pendente, se ela recarregou a página antes de
    // pagar — mesmo cuidado do checkout genérico e da conversão vitalício.
    if (order.pending_full_catalog_payment_id) {
      try {
        const existingPayment = await getPayment(order.pending_full_catalog_payment_id);
        if (UNPAID_STATUSES.has(existingPayment.status)) {
          return buildPaymentResponse(existingPayment, method);
        }
      } catch (fetchError) {
        if (!(fetchError instanceof AsaasApiError && fetchError.status === 404)) {
          throw fetchError;
        }
      }
    }

    const price = resolveFullCatalogUpgradePrice(order.full_catalog_upgrade_price_override).price;

    const payment = await createPayment({
      customerId: order.asaas_customer_id,
      value: price,
      description: 'StudioMenu Catálogo Completo — upgrade',
      billingType: BILLING_TYPE[method],
    });

    await supabaseAdmin
      .from('orders')
      .update({ pending_full_catalog_payment_id: payment.id, full_catalog_offer_decision: 'accepted' })
      .eq('id', order.id);

    return buildPaymentResponse(payment, method);
  } catch (error) {
    if (error instanceof AsaasConfigError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 503 });
    }
    if (error instanceof AsaasApiError) {
      console.error('[API Billing Upgrade To Full Catalog] Erro do Asaas:', error.status, error.message);
      return NextResponse.json({ success: false, message: 'Não foi possível processar o pagamento agora.' }, { status: 502 });
    }
    console.error('[API Billing Upgrade To Full Catalog Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
