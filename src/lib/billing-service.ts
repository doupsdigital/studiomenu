import { NextResponse } from 'next/server';
import { supabaseAdmin } from './supabase-admin';
import { sendTelegramMessage } from './telegram';
import { sendMetaCapiEvent } from './meta-capi';
import {
  AsaasApiError,
  cancelSubscription,
  createSubscription,
  getPixQrCode,
  getSubscription,
  type AsaasBillingType,
  type AsaasCycle,
  type AsaasPayment,
} from './asaas';

type PaymentMethod = 'pix' | 'card';

/** Meio-dia fixo evita variar com fuso horário do servidor (Vercel roda em
 *  UTC) — mesmo padrão já usado em `formatShortDate`
 *  (`PlanSubscribeCard.tsx`) pra datas no formato YYYY-MM-DD do Asaas. */
function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(`${fromISO}T12:00:00`).getTime();
  const to = new Date(`${toISO}T12:00:00`).getTime();
  return Math.round((to - from) / 86400000);
}

function addDays(fromISO: string, days: number): string {
  const d = new Date(`${fromISO}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Resposta do checkout conforme o método — Pix devolve o QR na hora; cartão
 *  devolve o link da página de pagamento do Asaas (onde ela digita o cartão,
 *  nunca no nosso servidor). Compartilhada entre `/api/billing/checkout` e
 *  `/api/billing/upgrade-to-lifetime` (Fase 28) — mesmo shape de resposta
 *  pra qualquer cobrança avulsa ou de assinatura. */
export async function buildPaymentResponse(payment: AsaasPayment, method: PaymentMethod) {
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

/** Lógica de ativação/desativação da assinatura — usada tanto pelo webhook
 *  quanto pelo polling de fallback (check-payment), pra garantir que os dois
 *  caminhos decidem exatamente a mesma coisa (resiliência dupla, mesmo
 *  espírito do LashAgenda, mas de fato compartilhada aqui, não duplicada). */

/** Ativa a assinatura e avisa o dono do produto no Telegram — só na
 *  transição de verdade (não estava "ativo" antes), pra não duplicar o
 *  aviso quando o webhook e o check-payment confirmam o mesmo pagamento
 *  quase ao mesmo tempo.
 *
 *  `confirmedPaymentId` (Fase 28, achado em auditoria antes de promover pra
 *  main): esta função roda pra QUALQUER pagamento confirmado da order (ex:
 *  a mensalidade normal) — sem saber qual foi, o bloco de "virar vitalício"
 *  abaixo só checava "existe uma conversão pendente?", nunca "foi ESSE
 *  pagamento que confirmou?". Isso cancelava a assinatura de graça se a
 *  mensalidade normal confirmasse enquanto o Pix do vitalício ainda estava
 *  pendente (não pago). Passado pelo webhook e pelo check-payment, que já
 *  sabem qual pagamento confirmou; `undefined` (ex: chamada direta do
 *  checkout na troca de tier, sem pagamento novo nenhum) nunca aciona esse
 *  bloco, o que já é o comportamento certo pra esse caso. */
export async function activateSubscription(orderId: string, confirmedPaymentId?: string): Promise<void> {
  const { data: before } = await supabaseAdmin
    .from('orders')
    .select('subscription_status, client_name, whatsapp_number, slug, pending_plan_tier, asaas_subscription_id, pending_lifetime_payment_id')
    .eq('id', orderId)
    .single();

  // Qual tier essa confirmação de pagamento é PARA — setado no checkout
  // antes de criar/atualizar a assinatura no Asaas (Fase 19). Sem
  // `pending_plan_tier` (dado antigo, ou fluxo legado) assume Plus, único
  // tier que existia antes dessa fase.
  //
  // IMPORTANTE: `pending_plan_tier` NÃO é zerado depois de usado — fica
  // sempre refletindo o último tier pedido no checkout. Chegou a ser
  // zerado numa versão anterior, e isso criava uma corrida real: o webhook
  // e o polling do navegador (`check-payment`) podem confirmar o MESMO
  // pagamento duas vezes; na segunda chamada, com o valor já zerado, caía
  // no fallback 'plus' e reclassificava a assinatura pra Plus de graça,
  // sem nenhum pagamento de Plus de verdade (achado testando manualmente,
  // Fase 19). Mantendo o valor, toda chamada — quantas vezes for repetida —
  // lê o mesmo dado e converge pro mesmo resultado (idempotente de verdade).
  const tier = before?.pending_plan_tier === 'basico' ? 'basico' : 'plus';

  // `booking_enabled` liga junto só pro Plus — sem isso, pagar o Plus não
  // fazia o agendamento automático funcionar de verdade pro cliente final
  // até o admin lembrar de ligar manualmente o toggle no painel (achado da
  // revisão pós-Fase 7, ver docs/historico/PLANO_AGENDAMENTO_STUDIOMENU_PLUS.md). O
  // Básico nunca liga agendamento (só catálogo + edição).
  await supabaseAdmin
    .from('orders')
    .update({ plan_tier: tier, subscription_status: 'ativo', booking_enabled: tier === 'plus' })
    .eq('id', orderId);

  if (before && before.subscription_status !== 'ativo') {
    const nowStr = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    // Catálogo é pagamento único por padrão — "Nova assinatura" seria texto
    // errado nesse caso. Mas se o admin marcou esse catálogo como recorrente
    // (Fase 27), já existe `asaas_subscription_id` nesse ponto (criado no
    // checkout antes da confirmação chegar aqui) — aí é assinatura de verdade.
    const label =
      tier === 'basico' && !before.asaas_subscription_id
        ? '💳 Novo pagamento (Plano Catálogo)!'
        : tier === 'basico'
          ? '💳 Nova assinatura (Plano Catálogo)!'
          : '💳 Nova assinatura (Plano Agenda)!';
    await sendTelegramMessage(
      `${label}\n\n👤 ${before.client_name}\n🔗 https://studiomenu.art/c/${before.slug}\n🕒 ${nowStr}`
    );
    // Dispara evento CAPI Purchase no Meta Ads para nova assinatura
    sendMetaCapiEvent({
      eventName: 'Purchase',
      value: tier === 'basico' ? 24.90 : 69.90,
      currency: 'BRL',
      phone: before.whatsapp_number || undefined,
      contentName: tier === 'basico' ? 'Plano Básico StudioMenu' : 'Plano Plus StudioMenu',
    }).catch((err) => console.error('[Meta CAPI Async Error]:', err));
  }

  // Confirmação do pagamento avulso de "virar vitalício" (Fase 28) — setado
  // em `pending_lifetime_payment_id` por `/api/billing/upgrade-to-lifetime`
  // antes de criar a cobrança. Cancela a mensalidade de verdade só agora,
  // depois do pagamento confirmado (nunca antes — mesma cautela antifraude
  // do resto do fluxo). `catalog_billing_mode` volta pra 'avulso': ela não
  // tem mais assinatura nenhuma por trás, e a tela de Plano já passa a
  // mostrar "Ativo ✓ - Sem mensalidade" sozinha assim que
  // `asaas_subscription_id` fica vazio (ver `hasRealSubscription` em
  // `SubscriptionSection.tsx`), sem precisar de nenhuma flag nova de exibição.
  if (before?.pending_lifetime_payment_id && before.pending_lifetime_payment_id === confirmedPaymentId) {
    if (before.asaas_subscription_id) {
      try {
        await cancelSubscription(before.asaas_subscription_id);
      } catch (cancelError) {
        // Já cancelada/removida (ex: segunda confirmação quase simultânea
        // do mesmo pagamento, webhook + check-payment) — não interrompe o
        // resto da limpeza, que é o que importa pra não travar o fluxo.
        if (!(cancelError instanceof AsaasApiError && cancelError.status === 404)) {
          throw cancelError;
        }
      }
    }
    await supabaseAdmin
      .from('orders')
      .update({
        asaas_subscription_id: null,
        pending_plan_tier: null,
        pending_lifetime_payment_id: null,
        catalog_billing_mode: 'avulso',
      })
      .eq('id', orderId);

    if (before) {
      const nowStr = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      await sendTelegramMessage(
        `💰 Catálogo virou vitalício!\n\n👤 ${before.client_name}\n🔗 https://studiomenu.art/c/${before.slug}\n🕒 ${nowStr}`
      );
      // Dispara evento CAPI Purchase no Meta Ads para Plano Vitalício (R$ 197,00)
      sendMetaCapiEvent({
        eventName: 'Purchase',
        value: 197.00,
        currency: 'BRL',
        phone: before.whatsapp_number || undefined,
        contentName: 'Plano Vitalício StudioMenu',
      }).catch((err) => console.error('[Meta CAPI Async Error]:', err));
    }
  }
}

/** Troca de CICLO de cobrança (MONTHLY↔YEARLY) entre Catálogo e Agenda
 *  (2026-10-15) — a troca de tier comum (`updateSubscription`, PUT) só
 *  atualiza valor/descrição, nunca o `cycle`; quando o ciclo muda de
 *  verdade (ex: Catálogo ANUAL → Agenda mensal), precisa de uma assinatura
 *  Asaas NOVA. Cria a nova ANTES de cancelar a antiga — se criar falhar,
 *  nada foi perdido (ela continua na antiga); se cancelar a antiga falhar
 *  depois, o pior caso é 2 assinaturas simultâneas por um tempo
 *  (recuperável, só avisa no Telegram), bem menos grave que ficar sem
 *  nenhuma.
 *
 *  Crédito do que ainda não foi "gasto" na assinatura antiga é proporcional
 *  por VALOR, não por tempo corrido — empurra a 1ª cobrança da assinatura
 *  nova proporcionalmente ao que ela já pagou, nunca pelos mesmos dias que
 *  sobravam (senão uma cliente que acabou de pagar o Catálogo anual e
 *  evoluísse pro Agenda ganharia quase 1 ano de Agenda de graça — um valor
 *  bem maior do que o que ela pagou). Funciona igual pra regressão
 *  (downgrade): mesma fórmula, sem caso especial.
 *
 *  Só calcula crédito se a assinatura antiga está `ativo` (em dia) — se
 *  estiver suspensa/atrasada, crédito zero e a nova começa cobrando hoje
 *  (evita depender do comportamento do Asaas pra `nextDueDate` numa
 *  assinatura atrasada, que não foi confirmado em sandbox). */
export async function switchSubscriptionCycle(input: {
  orderId: string;
  customerId: string;
  oldSubscriptionId: string;
  oldSubscriptionStatus: 'none' | 'ativo' | 'suspenso' | 'cancelado';
  oldCycle: AsaasCycle;
  newCycle: AsaasCycle;
  newValue: number;
  newDescription: string;
  newBillingType: AsaasBillingType;
  newPendingPlanTier: 'basico' | 'plus';
}): Promise<{ nextDueDate: string | null }> {
  // Trava de idempotência — evita duplo-clique/retry criando 2 assinaturas
  // novas órfãs antes de qualquer uma virar a oficial na order. Uma trava
  // com mais de 2 minutos é tratada como travada por engano (ex: um request
  // anterior caiu no meio) e libera sozinha.
  const lockThreshold = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data: locked } = await supabaseAdmin
    .from('orders')
    .update({ plan_switch_lock_at: new Date().toISOString() })
    .eq('id', input.orderId)
    .or(`plan_switch_lock_at.is.null,plan_switch_lock_at.lt.${lockThreshold}`)
    .select('id')
    .maybeSingle();
  if (!locked) {
    throw new Error('Troca de plano já em andamento. Tente novamente em instantes.');
  }

  try {
    let creditDays = 0;
    if (input.oldSubscriptionStatus === 'ativo') {
      const old = await getSubscription(input.oldSubscriptionId);
      if (old?.nextDueDate && typeof old.value === 'number') {
        const todayISO = new Date().toISOString().slice(0, 10);
        const remainingDays = Math.max(0, daysBetween(todayISO, old.nextDueDate));
        const oldCycleDays = input.oldCycle === 'YEARLY' ? 365 : 30;
        const unusedValue = old.value * (remainingDays / oldCycleDays);
        const newCycleDays = input.newCycle === 'YEARLY' ? 365 : 30;
        const newDailyRate = input.newValue / newCycleDays;
        creditDays = newDailyRate > 0 ? Math.round(unusedValue / newDailyRate) : 0;
      }
    }
    const nextDueDateOverride = addDays(new Date().toISOString().slice(0, 10), creditDays);

    const newSubscription = await createSubscription({
      customerId: input.customerId,
      value: input.newValue,
      description: input.newDescription,
      billingType: input.newBillingType,
      cycle: input.newCycle,
      nextDueDateOverride,
    });

    await supabaseAdmin
      .from('orders')
      .update({
        asaas_subscription_id: newSubscription.id,
        pending_plan_tier: input.newPendingPlanTier,
        pending_lifetime_payment_id: null,
      })
      .eq('id', input.orderId);

    try {
      await cancelSubscription(input.oldSubscriptionId);
    } catch (cancelError) {
      // 404 = já cancelada/removida (ex: dupla tentativa) — não é um erro
      // de verdade. Qualquer outro erro aqui NÃO interrompe o fluxo (ela já
      // está no plano novo), mas precisa de atenção manual — a profissional
      // continuaria pagando as duas assinaturas se ninguém perceber.
      if (!(cancelError instanceof AsaasApiError && cancelError.status === 404)) {
        console.error('[switchSubscriptionCycle] Falha ao cancelar assinatura antiga:', cancelError);
        await sendTelegramMessage(
          `⚠️ Troca de ciclo de cobrança: assinatura ANTIGA não foi cancelada, verificar manualmente no Asaas!\n\nOrder: ${input.orderId}\nAssinatura antiga: ${input.oldSubscriptionId}\nAssinatura nova (já ativa): ${newSubscription.id}`
        ).catch((err) => console.error('[Telegram Async Error]:', err));
      }
    }

    await activateSubscription(input.orderId);

    return { nextDueDate: newSubscription.nextDueDate ?? null };
  } finally {
    await supabaseAdmin.from('orders').update({ plan_switch_lock_at: null }).eq('id', input.orderId);
  }
}

export async function setSubscriptionStatus(
  orderId: string,
  status: 'suspenso' | 'cancelado'
): Promise<void> {
  // Cancelamento definitivo desliga `booking_enabled` junto — ela parou de
  // pagar, o agendamento pro cliente final para de funcionar. Também limpa
  // `asaas_subscription_id`/`pending_plan_tier` — sem isso, um cancelamento
  // que chega só pelo webhook (ex: assinatura excluída direto no painel do
  // Asaas, sem passar pelo botão "Cancelar" do app) deixava um id de
  // assinatura morta preso na profissional, e uma futura reassinatura ia
  // tentar reaproveitar/atualizar uma assinatura que não existe mais no
  // Asaas (Fase 19, achado pós-implementação do tier Básico). Suspensão
  // (pagamento atrasado, pode ser passageiro) não mexe em nenhum dos dois
  // de propósito — evita cortar o agendamento de clientes já em andamento
  // por um atraso pontual; o toggle manual do admin continua disponível
  // como via de escape se for preciso agir antes disso.
  const updates: {
    subscription_status: string;
    booking_enabled?: boolean;
    asaas_subscription_id?: null;
    pending_plan_tier?: null;
    pending_lifetime_payment_id?: null;
  } = {
    subscription_status: status,
  };
  if (status === 'cancelado') {
    updates.booking_enabled = false;
    updates.asaas_subscription_id = null;
    updates.pending_plan_tier = null;
    // Fase 28, achado em auditoria: se ela cancelar tudo enquanto um Pix de
    // "virar vitalício" ainda estava pendente (gerado, não pago), sem isso o
    // id ficava órfão — e se esse Pix velho fosse pago depois por engano,
    // `activateSubscription` reativava a assinatura do zero a partir de um
    // pagamento que não tem mais nenhuma assinatura real por trás.
    updates.pending_lifetime_payment_id = null;
  }
  await supabaseAdmin.from('orders').update(updates).eq('id', orderId);
}

/** Resolve o `order_id` a partir de um evento do Asaas — por
 *  `asaas_subscription_id` primeiro (mais específico), com fallback pro
 *  `asaas_customer_id` (cobre o raro caso de o evento não trazer o id da
 *  assinatura). */
export async function findOrderIdByAsaasIds(input: { subscriptionId?: string | null; customerId?: string | null }): Promise<string | null> {
  if (input.subscriptionId) {
    const { data } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('asaas_subscription_id', input.subscriptionId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) return data.id;
  }
  if (input.customerId) {
    const { data } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('asaas_customer_id', input.customerId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) return data.id;
  }
  return null;
}
