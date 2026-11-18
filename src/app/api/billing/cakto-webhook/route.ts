import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendTelegramMessage } from '@/lib/telegram';
import { assignAppShortCode } from '@/lib/short-link';
import { normalizeWhatsappBR } from '@/lib/format';
import { CAKTO_ANUAL_PRICE, CAKTO_MENSAL_PRICE } from '@/lib/pricing';
import { createSelfServeLashCatalog } from '@/lib/self-serve-catalog';
import { buildAccessEmail, sendEmail } from '@/lib/email';
import {
  CAKTO_APPROVED_EVENTS,
  CAKTO_GRACE_MS,
  CAKTO_CANCELED_EVENTS,
  CAKTO_RENEWAL_REFUSED_EVENTS,
  CAKTO_REVOKE_EVENTS,
  computePaidUntil,
  extractPreviewCode,
  extractSubscriptionRef,
  isValidCaktoSecret,
  pick,
  resolveCaktoPlan,
  type CaktoPlan,
  type Json,
} from '@/lib/cakto';

/** POST /api/billing/cakto-webhook
 *
 *  Webhook da Cakto do funil de autosserviço Lash (2026-11-17). Totalmente
 *  separado do webhook do Asaas (`/api/billing/webhook`, intocado): só lê e
 *  escreve catálogos com `billing_provider = 'cakto'`.
 *
 *  A Cakto NÃO reenvia evento que falhou — por isso responde 200 sempre que o
 *  segredo é válido (o resultado real fica em `cakto_events`), e todo
 *  payload é salvo (sem o segredo) pra conferir e corrigir à mão. */

type LogResult = 'processed' | 'ignored' | 'rejected' | 'error';

interface OrderRow {
  id: string;
  slug: string;
  client_name: string | null;
  plan_tier: string;
  billing_provider: string;
  paid_until: string | null;
  whatsapp_number: string | null;
  app_short_code: string | null;
  subscription_status: string | null;
}

const ORDER_COLUMNS =
  'id, slug, client_name, plan_tier, billing_provider, paid_until, whatsapp_number, app_short_code, subscription_status';

async function logEvent(row: {
  event: string | null;
  cakto_order_id: string | null;
  dedupe_key: string | null;
  slug?: string | null;
  result: LogResult;
  message: string;
  payload: Json;
}) {
  const { error } = await supabaseAdmin.from('cakto_events').insert({ ...row, slug: row.slug ?? null });
  if (error) console.error('[Cakto Webhook] Falha ao gravar log:', error, row.message);
}

async function findOrder(column: string, value: string | null): Promise<OrderRow | null> {
  if (!value) return null;
  const { data } = await supabaseAdmin
    .from('orders')
    .select(ORDER_COLUMNS)
    .eq(column, value)
    .eq('billing_provider', 'cakto')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as OrderRow | null) ?? null;
}

function nowBR() {
  return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

export async function POST(request: Request) {
  const raw = await request.text();
  let payload: Json = null;
  try {
    payload = JSON.parse(raw);
  } catch {
    payload = null;
  }

  const secret = typeof payload?.secret === 'string' ? payload.secret : '';
  // O segredo nunca vai pro log.
  const safePayload: Json = payload && typeof payload === 'object' ? { ...payload, secret: undefined } : { raw: raw.slice(0, 5000) };
  const data: Json = payload?.data ?? null;
  const event = pick(payload, ['event']);
  const caktoOrderId = pick(data, ['id']);
  const paidAt = pick(data, ['paidAt'], ['paid_at'], ['approvedDate'], ['approved_at']);
  const dedupeKey = event && caktoOrderId ? `${event}:${caktoOrderId}:${paidAt ?? ''}` : null;

  const base = { event, cakto_order_id: caktoOrderId, dedupe_key: dedupeKey, payload: safePayload };

  if (!isValidCaktoSecret(secret)) {
    await logEvent({ ...base, result: 'rejected', message: 'secret inválido ou CAKTO_WEBHOOK_SECRET ausente' });
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const done = async (result: LogResult, message: string, slug?: string | null) => {
    await logEvent({ ...base, result, message, slug });
    return NextResponse.json({ ok: result !== 'error', result, message });
  };

  try {
    if (!event || !data) return done('ignored', 'evento sem dados');

    const isApproved = CAKTO_APPROVED_EVENTS.has(event);
    const isCanceled = CAKTO_CANCELED_EVENTS.has(event);
    const isRefused = CAKTO_RENEWAL_REFUSED_EVENTS.has(event);
    const isRevoke = CAKTO_REVOKE_EVENTS.has(event);
    if (!isApproved && !isCanceled && !isRefused && !isRevoke) {
      return done('ignored', `evento ${event} não altera acesso`);
    }

    // Produto fora do mapa = outro produto da mesma conta Cakto (ex: Manual
    // da Lash). Nunca libera nada por padrão.
    const plan = resolveCaktoPlan(data);
    if (!plan) return done('ignored', `produto fora do CAKTO_PRODUCT_MAP (${pick(data, ['product', 'id']) ?? '?'})`);

    // Idempotência: o mesmo evento do mesmo pagamento chegando 2x não pode
    // estender `paid_until` 2x.
    if (dedupeKey) {
      const { data: previous } = await supabaseAdmin
        .from('cakto_events')
        .select('id')
        .eq('dedupe_key', dedupeKey)
        .eq('result', 'processed')
        .limit(1)
        .maybeSingle();
      if (previous) return done('ignored', 'evento repetido (já processado)');
    }

    const subscriptionRef = extractSubscriptionRef(data);
    const previewCode = extractPreviewCode(data);

    let order =
      (await findOrder('preview_code', previewCode)) ||
      (await findOrder('cakto_subscription_ref', subscriptionRef)) ||
      (await findOrder('cakto_order_id', caktoOrderId));

    if (!isApproved) {
      if (!order) return done('error', `evento ${event} sem catálogo encontrado (sck=${previewCode ?? '-'})`);

      if (isRevoke) {
        // `paid_until` já ANTES da folga (`CAKTO_GRACE_MS`): reembolso corta
        // na hora — gravar só "agora" deixava o menu mais 3 dias no ar
        // (achado no teste local, 2026-11-17).
        await supabaseAdmin
          .from('orders')
          .update({
            paid_until: new Date(Date.now() - CAKTO_GRACE_MS - 60_000).toISOString(),
            subscription_status: 'cancelado',
          })
          .eq('id', order.id);
        await sendTelegramMessage(`⚠️ Cakto: ${event === 'refund' ? 'reembolso' : 'chargeback'}\n\n👤 ${order.client_name}\n🔗 https://studiomenu.art/c/${order.slug}\n🕒 ${nowBR()}`);
        return done('processed', `acesso cortado (${event})`, order.slug);
      }

      if (isCanceled) {
        // Mantém `paid_until`: ela usa até o fim do período que já pagou.
        await supabaseAdmin.from('orders').update({ subscription_status: 'cancelado' }).eq('id', order.id);
        await sendTelegramMessage(`🔕 Cakto: assinatura cancelada\n\n👤 ${order.client_name}\n🔗 https://studiomenu.art/c/${order.slug}\n📅 No ar até ${order.paid_until ? new Date(order.paid_until).toLocaleDateString('pt-BR') : '-'}`);
        return done('processed', 'assinatura cancelada (acesso mantido até paid_until)', order.slug);
      }

      // Renovação recusada
      await supabaseAdmin.from('orders').update({ subscription_status: 'suspenso' }).eq('id', order.id);
      return done('processed', 'renovação recusada (suspenso; paid_until decide quando sai do ar)', order.slug);
    }

    // ---- Pagamento aprovado ----
    // "Aprovada" atrasada chegando depois de um reembolso/chargeback do
    // MESMO pedido não pode devolver o acesso.
    if (caktoOrderId) {
      const { data: revoked } = await supabaseAdmin
        .from('cakto_events')
        .select('id')
        .eq('cakto_order_id', caktoOrderId)
        .in('event', Array.from(CAKTO_REVOKE_EVENTS))
        .eq('result', 'processed')
        .limit(1)
        .maybeSingle();
      if (revoked) return done('ignored', 'aprovação de um pedido já reembolsado/estornado', order?.slug);
    }

    const buyerName = pick(data, ['customer', 'name']) || 'Lash Designer';
    const buyerEmail = pick(data, ['customer', 'email'])?.toLowerCase() ?? null;
    const buyerPhone = pick(data, ['customer', 'phone'], ['customer', 'cellphone'], ['customer', 'mobile']);

    let createdWithoutPreview = false;
    if (!order) {
      // Compra sem prévia encontrada (comprou direto, ou o `sck` não veio):
      // cria o catálogo pelo nome da compradora — a venda nunca se perde.
      const created = await createSelfServeLashCatalog({
        name: buyerName,
        asPreview: false,
        acquisitionSource: previewCode ? 'cakto_previa_nao_encontrada' : 'cakto_sem_previa',
        whatsappNumber: buyerPhone || '',
        allowSlugSuffix: true,
      });
      if (!created.ok) return done('error', `compra aprovada mas não consegui criar o catálogo (${created.reason}) — criar à mão`);
      order = await findOrder('preview_code', created.previewCode);
      if (!order) return done('error', 'catálogo criado mas não encontrado logo depois — conferir à mão');
      createdWithoutPreview = true;
    }

    const isFirstActivation = order.plan_tier === 'catalog';
    const updates: Record<string, unknown> = {
      plan_tier: 'basico',
      subscription_status: 'ativo',
      preview_expires_at: null,
      paid_until: computePaidUntil(plan as CaktoPlan, order.paid_until),
      cakto_plan: plan,
      cakto_order_id: caktoOrderId,
      catalog_billing_mode: plan === 'anual' ? 'anual' : 'recorrente',
      billing_price_override: plan === 'anual' ? CAKTO_ANUAL_PRICE : CAKTO_MENSAL_PRICE,
    };
    if (subscriptionRef) updates.cakto_subscription_ref = subscriptionRef;
    if (buyerEmail) updates.billing_email = buyerEmail;
    if (buyerPhone && !order.whatsapp_number) updates.whatsapp_number = normalizeWhatsappBR(buyerPhone);

    const { error: updateError } = await supabaseAdmin.from('orders').update(updates).eq('id', order.id);
    if (updateError) {
      console.error('[Cakto Webhook] Erro ao ativar:', updateError);
      return done('error', `erro ao ativar catálogo ${order.slug}: ${updateError.message}`, order.slug);
    }

    const shortCode = order.app_short_code || (await assignAppShortCode(order.id));

    // E-mail de acesso só na primeira ativação (renovação não reenvia). Falha
    // não derruba nada: fica anotada no log do evento.
    let emailNote = '';
    if (isFirstActivation) {
      if (buyerEmail && shortCode) {
        const mail = buildAccessEmail({ name: order.client_name || buyerName, slug: order.slug, shortCode });
        const sent = await sendEmail({ to: buyerEmail, ...mail });
        emailNote = sent.ok ? ' · e-mail de acesso enviado' : ` · e-mail FALHOU (${sent.error})`;
      } else {
        emailNote = ` · e-mail não enviado (${buyerEmail ? 'sem código curto' : 'compra sem e-mail'})`;
      }
    }

    if (isFirstActivation) {
      await sendTelegramMessage(
        `💳 Nova venda Cakto (${plan === 'anual' ? 'Anual R$127 Pix' : 'Mensal R$22,90'})!${createdWithoutPreview ? '\n⚠️ Sem prévia — catálogo criado pelo nome da compra, conferir.' : ''}\n\n👤 ${buyerName}\n🔗 https://studiomenu.art/c/${order.slug}\n🕒 ${nowBR()}\n📧${emailNote.replace(' · ', ' ')}`
      );
    }

    return done('processed', `${isFirstActivation ? 'ativado' : 'renovado'} (${plan}) até ${updates.paid_until}${emailNote}`, order.slug);
  } catch (error) {
    console.error('[Cakto Webhook Exception]:', error);
    return done('error', `exceção: ${error instanceof Error ? error.message : String(error)}`);
  }
}
