import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { activateSubscription, setSubscriptionStatus, findOrderIdByAsaasIds } from '@/lib/billing-service';

const ACTIVATE_EVENTS = new Set(['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED']);
const ACTIVATE_STATUSES = new Set(['CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH']);
const SUSPEND_EVENTS = new Set(['PAYMENT_OVERDUE']);
const CANCEL_EVENTS = new Set(['PAYMENT_DELETED', 'SUBSCRIPTION_DELETED', 'SUBSCRIPTION_INACTIVATED']);

function isValidWebhookToken(received: string | null): boolean {
  const expected = process.env.ASAAS_WEBHOOK_SECRET;
  if (!expected || !received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

interface AsaasWebhookPayload {
  event: string;
  payment?: {
    status?: string;
    customer?: string;
    subscription?: string;
  };
  /** Eventos `SUBSCRIPTION_*` trazem os dados aqui, não em `payment`. */
  subscription?: {
    id?: string;
    customer?: string;
  };
}

/** POST /api/billing/webhook
 *  A Asaas manda o header `asaas-access-token` com o valor configurado na
 *  criação do webhook (painel/API do Asaas) — validado aqui contra
 *  `ASAAS_WEBHOOK_SECRET`. Essa validação existe na doc oficial mas o
 *  LashAgenda (referência deste plano) nunca chegou a implementá-la de
 *  verdade; aqui ela é obrigatória desde o início. */
export async function POST(request: Request) {
  try {
    if (!isValidWebhookToken(request.headers.get('asaas-access-token'))) {
      return NextResponse.json({ success: false, message: 'Token inválido.' }, { status: 401 });
    }

    const body = (await request.json()) as AsaasWebhookPayload;
    const { event, payment, subscription } = body;

    // Eventos de cobrança (`PAYMENT_*`) trazem `payment`; eventos da própria
    // assinatura (`SUBSCRIPTION_*`, ex: removida no painel do Asaas) trazem
    // `subscription` — antes só `payment` era lido, então cancelar a
    // assinatura direto no painel nunca chegava no app (achado no teste real
    // em produção, Fase 21).
    const subscriptionId = payment?.subscription ?? subscription?.id;
    const customerId = payment?.customer ?? subscription?.customer;

    if (!event || (!payment && !subscription)) {
      return NextResponse.json({ success: true }); // evento sem dados (ex: teste) — nada a fazer
    }

    const orderId = await findOrderIdByAsaasIds({ subscriptionId, customerId });

    if (!orderId) {
      console.warn('[API Billing Webhook] Nenhum pedido encontrado pra', subscriptionId || customerId);
      return NextResponse.json({ success: true }); // 200 mesmo assim — evita a Asaas insistir num evento que não é nosso
    }

    // "Recebido em dinheiro" (baixa manual no painel do Asaas, ex: cliente
    // pagou por fora) vira status `RECEIVED_IN_CASH` — não dependo só do nome
    // do evento pra ativar, olho também o status da cobrança.
    if (ACTIVATE_EVENTS.has(event) || (payment?.status && ACTIVATE_STATUSES.has(payment.status))) {
      await activateSubscription(orderId);
    } else if (SUSPEND_EVENTS.has(event)) {
      await setSubscriptionStatus(orderId, 'suspenso');
    } else if (CANCEL_EVENTS.has(event)) {
      await setSubscriptionStatus(orderId, 'cancelado');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Billing Webhook Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
