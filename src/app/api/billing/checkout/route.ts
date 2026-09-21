import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';
import { PLAN_PRICING, type PayablePlanTier } from '@/lib/pricing';
import { activateSubscription } from '@/lib/billing-service';
import {
  AsaasConfigError,
  AsaasApiError,
  findOrCreateCustomer,
  createSubscription,
  updateSubscription,
  updateSubscriptionBillingType,
  getFirstSubscriptionPayment,
  getPayableSubscriptionPayment,
  getSubscription,
  getPixQrCode,
  type AsaasPayment,
  type AsaasBillingType,
} from '@/lib/asaas';

type PaymentMethod = 'pix' | 'card';

const BILLING_TYPE: Record<PaymentMethod, AsaasBillingType> = { pix: 'PIX', card: 'CREDIT_CARD' };

/** Resposta do checkout conforme o método — Pix devolve o QR na hora; cartão
 *  devolve o link da página de pagamento do Asaas (onde ela digita o cartão,
 *  nunca no nosso servidor). */
async function buildPaymentResponse(payment: AsaasPayment, method: PaymentMethod) {
  if (method === 'card') {
    if (!payment.invoiceUrl) {
      return NextResponse.json(
        { success: false, message: 'Assinatura criada, mas o link de pagamento ainda não ficou pronto. Tente novamente em instantes.' },
        { status: 202 }
      );
    }
    return NextResponse.json({ success: true, method, paymentId: payment.id, invoiceUrl: payment.invoiceUrl });
  }
  const qr = await getPixQrCode(payment.id);
  return NextResponse.json({
    success: true,
    method,
    paymentId: payment.id,
    pixQrCodeImage: qr.encodedImage,
    pixKey: qr.payload,
    expirationDate: qr.expirationDate,
  });
}

/** POST /api/billing/checkout
 *  Body: { slug, email, cpf_cnpj, plan, method? ('pix' | 'card', padrão pix) }
 *  Cria (ou reaproveita) o customer/subscription no Asaas e devolve o Pix
 *  (QR) ou o link de pagamento por cartão (Fase 21). NUNCA escreve `plan_tier`/`subscription_status` aqui — só o
 *  webhook ou o check-payment fazem isso, depois de confirmar o pagamento
 *  de verdade (mesma prevenção antifraude do LashAgenda).
 *
 *  Uma profissional só tem UM `asaas_subscription_id` a vida toda — trocar
 *  de tier (ex: Básico → Plus) ATUALIZA essa mesma assinatura no Asaas
 *  (`updateSubscription`) em vez de criar uma segunda em paralelo, senão
 *  ela pagaria os dois planos ao mesmo tempo (Fase 19). */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, email, cpf_cnpj, plan, method: rawMethod } = body as {
      slug?: string;
      email?: string;
      cpf_cnpj?: string;
      plan?: PayablePlanTier;
      method?: string;
    };

    if (!slug || !email?.trim() || !cpf_cnpj?.trim()) {
      return NextResponse.json({ success: false, message: 'Preencha e-mail e CPF/CNPJ.' }, { status: 400 });
    }
    if (plan !== 'basico' && plan !== 'plus') {
      return NextResponse.json({ success: false, message: 'Plano inválido.' }, { status: 400 });
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
      .select('id, client_name, plan_tier, subscription_status, asaas_customer_id, asaas_subscription_id, payment_method, billing_price_override')
      .eq('slug', normalizedSlug)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ success: false, message: 'Catálogo não encontrado.' }, { status: 404 });
    }

    const allowed = await checkRateLimit(`billing-checkout:${order.id}`, 10, 15 * 60);
    if (!allowed) {
      return NextResponse.json({ success: false, message: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 });
    }

    if (order.plan_tier === plan && order.subscription_status === 'ativo') {
      return NextResponse.json({ success: true, alreadyActive: true });
    }

    const cpfCnpjDigits = cpf_cnpj.replace(/\D/g, '');
    if (cpfCnpjDigits.length !== 11 && cpfCnpjDigits.length !== 14) {
      return NextResponse.json({ success: false, message: 'CPF/CNPJ inválido.' }, { status: 400 });
    }

    const pricing = PLAN_PRICING[plan];

    // Preço reduzido só pra teste real em produção (ex: R$5 no catálogo de
    // teste) — definido manualmente no banco, nunca pela tela. Só vale se
    // estiver entre o mínimo do Asaas (R$5) e o preço de tabela: nunca cobra
    // MAIS que o preço do plano, mesmo se o dado for editado errado.
    const override = order.billing_price_override === null ? null : Number(order.billing_price_override);
    const price = override !== null && Number.isFinite(override) && override >= 5 && override <= pricing.price ? override : pricing.price;

    // Já tem assinatura Asaas e é um tier DIFERENTE do atual → troca de
    // plano (ex: Básico → Plus): atualiza valor/descrição em vez de criar
    // uma assinatura nova, evitando cobrança duplicada. Confirmado contra o
    // sandbox real (Fase 19): um PUT /subscriptions NÃO gera cobrança nova
    // nem afeta a do ciclo atual (já paga) — o novo valor só vale a partir
    // do próximo vencimento. Sem pagamento novo pra confirmar, não dá pra
    // esperar o webhook de sempre; como ela já é assinante paga validada
    // (não uma desconhecida tentando ganhar acesso de graça), ativa o novo
    // tier direto aqui.
    if (order.asaas_subscription_id && order.plan_tier !== plan && order.plan_tier !== 'catalog') {
      const updated = await updateSubscription({ subscriptionId: order.asaas_subscription_id, value: price, description: pricing.description });
      await supabaseAdmin.from('orders').update({ pending_plan_tier: plan }).eq('id', order.id);
      await activateSubscription(order.id);
      // `nextDueDate` só alimenta o aviso "a partir de dd/mm o valor passa a
      // ser X" no modal de sucesso — se o Asaas não devolver, o aviso sai sem data.
      return NextResponse.json({ success: true, upgraded: true, nextDueDate: updated.nextDueDate ?? null });
    }

    // Reaproveita uma assinatura já criada e ainda não paga (ex: a
    // profissional recarregou a página no meio do Pix, ou voltou pra trocar
    // de Pix pra cartão) em vez de criar outra — evita cobrança duplicada.
    // Se o método pedido é diferente do que ficou salvo, troca o tipo de
    // cobrança na MESMA assinatura (só é seguro porque nunca foi paga — o
    // caso de assinante ativa trocando de tier já retornou acima).
    if (order.asaas_subscription_id) {
      if ((order.payment_method || 'pix') !== method) {
        await updateSubscriptionBillingType({ subscriptionId: order.asaas_subscription_id, billingType: BILLING_TYPE[method] });
      }
      // Não mexe em `pending_plan_tier`: o valor já emitido no Asaas é o do
      // tier original — trocar só o rótulo aqui ativaria um plano diferente
      // do que ela de fato paga.
      await supabaseAdmin.from('orders').update({ payment_method: method }).eq('id', order.id);

      // Cobrança que ela pode pagar agora (pendente ou vencida) — não "a
      // primeira da lista": numa assinatura com vários meses (renovação em
      // atraso) a primeira pode já estar paga, e o QR dela não serve.
      const { payment: existingPayment, total } = await getPayableSubscriptionPayment(order.asaas_subscription_id);
      if (existingPayment) {
        return buildPaymentResponse(existingPayment, method);
      }

      // Nunca cai pra "criar assinatura nova" se a antiga ainda existe no
      // Asaas — seria cobrança em dobro. Só segue pra criar uma nova se a
      // antiga sumiu de verdade (removida/cancelada no painel sem o app
      // ficar sabendo).
      const existingSubscription = await getSubscription(order.asaas_subscription_id);
      if (existingSubscription && !existingSubscription.deleted) {
        return NextResponse.json(
          {
            success: false,
            message:
              total > 0
                ? 'Sua assinatura não tem nenhuma cobrança em aberto agora. Se o acesso está bloqueado, fale com o suporte.'
                : 'Assinatura criada, mas a cobrança ainda não ficou pronta. Tente novamente em instantes.',
          },
          { status: total > 0 ? 409 : 202 }
        );
      }
      await supabaseAdmin.from('orders').update({ asaas_subscription_id: null, pending_plan_tier: null }).eq('id', order.id);
    }

    const customer = await findOrCreateCustomer({ name: order.client_name, email: email.trim(), cpfCnpj: cpfCnpjDigits });

    await supabaseAdmin
      .from('orders')
      .update({ asaas_customer_id: customer.id, billing_email: email.trim(), billing_cpf_cnpj: cpfCnpjDigits })
      .eq('id', order.id);

    const subscription = await createSubscription({
      customerId: customer.id,
      value: price,
      description: pricing.description,
      billingType: BILLING_TYPE[method],
    });

    await supabaseAdmin
      .from('orders')
      .update({ asaas_subscription_id: subscription.id, pending_plan_tier: plan, payment_method: method })
      .eq('id', order.id);

    const payment = await getFirstSubscriptionPayment(subscription.id);
    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'Assinatura criada, mas a cobrança ainda não ficou pronta. Tente novamente em instantes.' },
        { status: 202 }
      );
    }

    return buildPaymentResponse(payment, method);
  } catch (error) {
    if (error instanceof AsaasConfigError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 503 });
    }
    if (error instanceof AsaasApiError) {
      console.error('[API Billing Checkout] Erro do Asaas:', error.status, error.message);
      return NextResponse.json({ success: false, message: 'Não foi possível processar o pagamento agora.' }, { status: 502 });
    }
    console.error('[API Billing Checkout Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
