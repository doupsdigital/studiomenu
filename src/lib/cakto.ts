import 'server-only';
import { timingSafeEqual } from 'crypto';

/** Integração com a Cakto (checkout do funil de autosserviço Lash, 2026-11-17).
 *
 *  Formato do webhook (docs da Cakto + o que já foi confirmado no manual-lash,
 *  `../manual-lash/supabase/functions/cakto-webhook/index.ts`):
 *  POST { secret, event, data } — o segredo vai no CORPO (não há HMAC).
 *  `data.id` (pedido), `data.refId` (código curto), `data.customer.{name,email,phone}`,
 *  `data.product.{id,short_id,name}`, `data.status`.
 *
 *  O que AINDA PRECISA ser confirmado com uma compra real (Fase 0 do plano):
 *  os nomes exatos dos eventos de assinatura e onde chega o `sck` passado no
 *  link do checkout. Por isso a leitura abaixo é tolerante (tenta vários
 *  caminhos) e todo payload fica salvo em `cakto_events`. */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Json = any;

export type CaktoPlan = 'mensal' | 'anual';

/** Compra aprovada / renovação paga → libera ou estende o acesso. */
export const CAKTO_APPROVED_EVENTS = new Set(['purchase_approved', 'subscription_renewed']);
/** Assinatura cancelada pela cliente → para de renovar, mas ela usa até `paid_until`. */
export const CAKTO_CANCELED_EVENTS = new Set(['subscription_canceled', 'subscription_cancelled']);
/** Cobrança da renovação recusada (cartão) → suspenso; `paid_until` decide quando sai do ar. */
export const CAKTO_RENEWAL_REFUSED_EVENTS = new Set(['subscription_renewal_refused']);
/** Dinheiro devolvido → acesso cortado na hora. */
export const CAKTO_REVOKE_EVENTS = new Set(['refund', 'chargeback']);

/** Folga depois do vencimento (`paid_until`) antes de tirar o catálogo do ar
 *  — uma renovação que atrase um pouco (cartão recusado e tentado de novo,
 *  Pix do anual pago uns dias depois) não derruba o menu dela. Aplicada só
 *  na checagem (`isCaktoAccessLapsed`), nunca gravada em `paid_until`, pra
 *  não acumular a cada renovação. */
export const CAKTO_GRACE_MS = 3 * 24 * 60 * 60 * 1000;

/** Catálogo da Cakto sem acesso pago agora (fora da folga). Usado pelo
 *  catálogo público (`catalog-service.ts`) e pela limpeza diária. */
export function isCaktoAccessLapsed(paidUntil: string | null | undefined, nowMs = Date.now()): boolean {
  if (!paidUntil) return true;
  const t = new Date(paidUntil).getTime();
  return !Number.isFinite(t) || t + CAKTO_GRACE_MS < nowMs;
}

export function pick(p: Json, ...paths: string[][]): string | null {
  for (const path of paths) {
    let v: Json = p;
    for (const k of path) v = v?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number') return String(v);
  }
  return null;
}

export function isValidCaktoSecret(received: string | null | undefined): boolean {
  const secrets = [process.env.CAKTO_WEBHOOK_SECRET, process.env.CAKTO_WEBHOOK_SECRET_OLD].filter(
    (s): s is string => Boolean(s)
  );
  if (!received || !secrets.length) return false;
  const a = Buffer.from(received);
  return secrets.some((s) => {
    const b = Buffer.from(s);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

/** `CAKTO_PRODUCT_MAP` = "id_ou_short_id:mensal,id_ou_short_id:anual" — mesmo
 *  formato do manual-lash. Sem o produto no mapa, o webhook NÃO libera nada
 *  (a mesma conta da Cakto vende outros produtos). */
export function resolveCaktoPlan(data: Json): CaktoPlan | null {
  const raw = process.env.CAKTO_PRODUCT_MAP || '';
  const map: Record<string, string> = {};
  for (const part of raw.split(',')) {
    const [id, key] = part.split(':').map((s) => s.trim());
    if (id && key) map[id] = key;
  }
  const product = data?.product ?? {};
  const ids = [pick(product, ['id']), pick(product, ['short_id']), pick(data, ['product_id'])].filter(
    (x): x is string => Boolean(x)
  );
  const key = ids.map((id) => map[id]).find(Boolean);
  return key === 'mensal' || key === 'anual' ? key : null;
}

/** Código da prévia que a página `/lash` coloca no link do checkout
 *  (`?sck=<preview_code>`). Procura nos lugares possíveis do payload —
 *  confirmar o caminho real na compra-teste. */
export function extractPreviewCode(data: Json): string | null {
  const direct = pick(
    data,
    ['sck'],
    ['src'],
    ['utm', 'sck'],
    ['utm', 'src'],
    ['tracking', 'sck'],
    ['tracking', 'src'],
    ['trackingParameters', 'sck'],
    ['tracking_parameters', 'sck'],
    ['metadata', 'sck']
  );
  if (direct && /^[A-Za-z0-9]{4,32}$/.test(direct)) return direct;

  const url = pick(data, ['checkoutUrl'], ['checkout_url'], ['url']);
  if (url) {
    try {
      const fromUrl = new URL(url).searchParams.get('sck');
      if (fromUrl && /^[A-Za-z0-9]{4,32}$/.test(fromUrl)) return fromUrl;
    } catch {
      // URL inválida — ignora
    }
  }
  return null;
}

export function extractSubscriptionRef(data: Json): string | null {
  return pick(data, ['subscription', 'id'], ['subscription_id'], ['subscriptionId'], ['subscription']);
}

/** Nova data de "pago até" depois de um pagamento aprovado — sempre soma a
 *  partir do que for maior (hoje ou o vencimento atual), então pagar uma
 *  renovação adiantada não "perde" dias. */
export function computePaidUntil(plan: CaktoPlan, currentPaidUntil: string | null): string {
  const now = Date.now();
  const current = currentPaidUntil ? new Date(currentPaidUntil).getTime() : 0;
  const base = new Date(Math.max(now, Number.isFinite(current) ? current : 0));
  if (plan === 'anual') {
    base.setFullYear(base.getFullYear() + 1);
  } else {
    base.setMonth(base.getMonth() + 1);
  }
  return base.toISOString();
}
