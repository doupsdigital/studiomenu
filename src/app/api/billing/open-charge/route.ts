import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';
import { AsaasConfigError, AsaasApiError, getOpenSubscriptionCharge, getPixQrCode } from '@/lib/asaas';

function todayInSaoPaulo(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

/** POST /api/billing/open-charge
 *  Body: { slug, withQr? }
 *  Devolve a cobrança em aberto (pendente ou vencida) da assinatura dela, pro
 *  aviso "pague sua mensalidade" no app — o Pix recorrente não debita sozinho,
 *  então todo mês existe uma cobrança nova pra ela pagar (Fase 21). Só LÊ do
 *  Asaas, nunca ativa nada: quem ativa continua sendo o webhook/`check-payment`.
 *  Qualquer falha aqui vira "sem cobrança em aberto" — um aviso que não
 *  aparece é melhor do que uma tela de Início quebrada. */
export async function POST(request: Request) {
  try {
    const { slug, withQr } = (await request.json()) as { slug?: string; withQr?: boolean };
    if (!slug) {
      return NextResponse.json({ success: false, message: 'Dados inválidos.' }, { status: 400 });
    }

    const normalizedSlug = slug.toLowerCase().trim();
    if (!(await isProfessionalRequestAuthorized(normalizedSlug))) {
      return NextResponse.json({ success: false, message: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id, plan_tier, asaas_subscription_id')
      .eq('slug', normalizedSlug)
      .single();

    if (!order || order.plan_tier === 'catalog' || !order.asaas_subscription_id) {
      return NextResponse.json({ success: true, open: false });
    }

    const allowed = await checkRateLimit(`billing-open-charge:${order.id}`, 30, 5 * 60);
    if (!allowed) {
      return NextResponse.json({ success: true, open: false });
    }

    const charge = await getOpenSubscriptionCharge(order.asaas_subscription_id);
    if (!charge) {
      return NextResponse.json({ success: true, open: false });
    }

    const dueDate = charge.dueDate || null;
    const isPix = charge.billingType === 'PIX';
    const base = {
      success: true,
      open: true,
      paymentId: charge.id,
      value: charge.value,
      dueDate,
      overdue: dueDate ? dueDate < todayInSaoPaulo() : false,
      billingType: isPix ? 'pix' : 'card',
      invoiceUrl: charge.invoiceUrl || null,
    };

    if (withQr && isPix) {
      const qr = await getPixQrCode(charge.id);
      return NextResponse.json({ ...base, pixQrCodeImage: qr.encodedImage, pixKey: qr.payload });
    }

    return NextResponse.json(base);
  } catch (error) {
    if (!(error instanceof AsaasConfigError) && !(error instanceof AsaasApiError)) {
      console.error('[API Billing Open Charge Exception]:', error);
    }
    return NextResponse.json({ success: true, open: false });
  }
}
