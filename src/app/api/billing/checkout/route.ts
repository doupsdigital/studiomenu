import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';
import { PLAN_PRICING, type PayablePlanTier } from '@/lib/pricing';
import {
  AsaasConfigError,
  AsaasApiError,
  findOrCreateCustomer,
  createSubscription,
  updateSubscription,
  getFirstSubscriptionPayment,
  getPixQrCode,
} from '@/lib/asaas';

/** POST /api/billing/checkout
 *  Body: { slug, email, cpf_cnpj, plan }
 *  Cria (ou reaproveita) o customer/subscription no Asaas e devolve o Pix
 *  pra pagar. NUNCA escreve `plan_tier`/`subscription_status` aqui — só o
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
    const { slug, email, cpf_cnpj, plan } = body as { slug?: string; email?: string; cpf_cnpj?: string; plan?: PayablePlanTier };

    if (!slug || !email?.trim() || !cpf_cnpj?.trim()) {
      return NextResponse.json({ success: false, message: 'Preencha e-mail e CPF/CNPJ.' }, { status: 400 });
    }
    if (plan !== 'basico' && plan !== 'plus') {
      return NextResponse.json({ success: false, message: 'Plano inválido.' }, { status: 400 });
    }

    const normalizedSlug = slug.toLowerCase().trim();
    if (!(await isProfessionalRequestAuthorized(normalizedSlug))) {
      return NextResponse.json({ success: false, message: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('id, client_name, plan_tier, subscription_status, asaas_customer_id, asaas_subscription_id')
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

    // Já tem assinatura Asaas e é um tier DIFERENTE do atual → troca de
    // plano (ex: Básico → Plus): atualiza valor/descrição em vez de criar
    // uma assinatura nova, evitando cobrança duplicada.
    if (order.asaas_subscription_id && order.plan_tier !== plan && order.plan_tier !== 'catalog') {
      await updateSubscription({ subscriptionId: order.asaas_subscription_id, value: pricing.price, description: pricing.description });
      await supabaseAdmin.from('orders').update({ pending_plan_tier: plan }).eq('id', order.id);

      const updatedPayment = await getFirstSubscriptionPayment(order.asaas_subscription_id);
      if (!updatedPayment) {
        return NextResponse.json(
          { success: false, message: 'Assinatura atualizada, mas o Pix ainda não ficou pronto. Tente novamente em instantes.' },
          { status: 202 }
        );
      }
      const updatedQr = await getPixQrCode(updatedPayment.id);
      return NextResponse.json({
        success: true,
        paymentId: updatedPayment.id,
        pixQrCodeImage: updatedQr.encodedImage,
        pixKey: updatedQr.payload,
        expirationDate: updatedQr.expirationDate,
      });
    }

    // Reaproveita uma assinatura já criada pro MESMO tier (ex: a
    // profissional recarregou a página no meio do Pix) em vez de criar
    // outra — evita cobrança duplicada.
    if (order.asaas_subscription_id) {
      const existingPayment = await getFirstSubscriptionPayment(order.asaas_subscription_id);
      if (existingPayment) {
        const qr = await getPixQrCode(existingPayment.id);
        return NextResponse.json({
          success: true,
          paymentId: existingPayment.id,
          pixQrCodeImage: qr.encodedImage,
          pixKey: qr.payload,
          expirationDate: qr.expirationDate,
        });
      }
    }

    const customer = await findOrCreateCustomer({ name: order.client_name, email: email.trim(), cpfCnpj: cpfCnpjDigits });

    await supabaseAdmin
      .from('orders')
      .update({ asaas_customer_id: customer.id, billing_email: email.trim(), billing_cpf_cnpj: cpfCnpjDigits })
      .eq('id', order.id);

    const subscription = await createSubscription({
      customerId: customer.id,
      value: pricing.price,
      description: pricing.description,
    });

    await supabaseAdmin.from('orders').update({ asaas_subscription_id: subscription.id, pending_plan_tier: plan }).eq('id', order.id);

    const payment = await getFirstSubscriptionPayment(subscription.id);
    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'Assinatura criada, mas o Pix ainda não ficou pronto. Tente novamente em instantes.' },
        { status: 202 }
      );
    }

    const qr = await getPixQrCode(payment.id);

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      pixQrCodeImage: qr.encodedImage,
      pixKey: qr.payload,
      expirationDate: qr.expirationDate,
    });
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
