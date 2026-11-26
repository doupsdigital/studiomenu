import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { PREVIEW_SESSION_COOKIE, readPreviewSession } from '@/lib/preview-session';
import { isPreviewExpired, isPreviewOrder } from '@/lib/preview';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { CAKTO_CHECKOUT_URLS, parseOfferMode } from '@/lib/cakto-checkout';
import { CAKTO_ANUAL_PRICE, CAKTO_MENSAL_PRICE } from '@/lib/pricing';
import { PRODUCTION_DOMAIN, usesSubdomainRouting } from '@/lib/public-url';
import { buildPreviewSavedEmail, sendEmail, type PreviewEmailParams } from '@/lib/email';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function brl(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

/** "hoje às 18h", "amanhã às 9h30" — no fuso de Brasília, relativo a `ref`. */
function expiresLabel(expiresAt: Date, ref: Date): string {
  const tz = 'America/Sao_Paulo';
  const day = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: tz });
  const [h, m] = expiresAt
    .toLocaleTimeString('pt-BR', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false })
    .split(':')
    .map(Number);
  const time = m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
  const tomorrow = new Date(ref.getTime() + 24 * 60 * 60 * 1000);
  if (day(expiresAt) === day(ref)) return `hoje às ${time}`;
  if (day(expiresAt) === day(tomorrow)) return `amanhã às ${time}`;
  return `${expiresAt.toLocaleDateString('pt-BR', { timeZone: tz, day: '2-digit', month: '2-digit' })} às ${time}`;
}

function checkoutLinks(offer: string, previewCode: string, campaign: string): PreviewEmailParams['checkouts'] {
  const build = (plan: 'mensal' | 'anual') => {
    const url = new URL(CAKTO_CHECKOUT_URLS[plan]);
    url.searchParams.set('sck', previewCode);
    url.searchParams.set('utm_source', 'email');
    url.searchParams.set('utm_medium', 'email');
    url.searchParams.set('utm_campaign', campaign);
    return url.toString();
  };
  const mode = parseOfferMode(offer);
  if (mode === 'mensal') return [{ label: 'Ativar meu menu', url: build('mensal') }];
  if (mode === 'anual') return [{ label: 'Ativar meu menu', url: build('anual') }];
  return [
    { label: `Ativar anual · R$ ${brl(CAKTO_ANUAL_PRICE)}`, url: build('anual') },
    { label: `Ativar mensal · R$ ${brl(CAKTO_MENSAL_PRICE)}/mês`, url: build('mensal') },
  ];
}

/** POST /api/preview/email  { email, offer? }
 *
 *  "Quer pensar com calma?" (2026-11-26) — fim da página `/lash`, pra quem viu
 *  tudo e não comprou. Só vale pra quem gerou a prévia (cookie `sm_preview`)
 *  e enquanto ela ainda é prévia. Manda UM e-mail, na hora, com o link do
 *  menu, até quando ele fica guardado e os botões de ativar. Sem lembrete,
 *  agendamento nem gravação no banco (decisão da dona: o mais simples
 *  possível) — o histórico de envios fica no painel do Resend. */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = String(body?.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 160) {
      return NextResponse.json({ ok: false, code: 'invalid_email', message: 'Confira o e-mail, parece que tem algo errado.' }, { status: 400 });
    }

    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`preview-email:${ip}`, 5, 60 * 60);
    if (!allowed) {
      return NextResponse.json({ ok: false, code: 'rate_limited', message: 'Muitas tentativas agora. Tente de novo daqui a pouco.' }, { status: 429 });
    }

    const cookieStore = await cookies();
    const session = readPreviewSession(cookieStore.get(PREVIEW_SESSION_COOKIE)?.value);
    if (!session) {
      return NextResponse.json({ ok: false, code: 'no_session', message: 'Não encontramos o seu menu neste aparelho. Crie de novo, é grátis.' }, { status: 403 });
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('slug, client_name, plan_tier, preview_expires_at, preview_code')
      .eq('slug', session.slug)
      .maybeSingle();
    if (error) throw error;
    if (!order || order.preview_code !== session.previewCode || !isPreviewOrder(order) || isPreviewExpired(order)) {
      return NextResponse.json({ ok: false, code: 'not_preview', message: 'Esse menu não está mais disponível. Crie de novo, é grátis.' }, { status: 403 });
    }

    const url = new URL(request.url);
    const menuUrl = usesSubdomainRouting(url.hostname)
      ? `https://${order.slug}.${PRODUCTION_DOMAIN}`
      : `${url.origin}/c/${order.slug}`;
    const mail = buildPreviewSavedEmail({
      name: order.client_name || '',
      menuUrl,
      menuLabel: `${order.slug}.${PRODUCTION_DOMAIN}`,
      checkouts: checkoutLinks(body?.offer, order.preview_code as string, 'preview_saved'),
      expiresLabel: expiresLabel(new Date(order.preview_expires_at as string), new Date()),
    });
    const sent = await sendEmail({ to: email, ...mail });
    if (!sent.ok) {
      console.error('[Preview Email] Falha ao enviar:', sent.error);
      return NextResponse.json({ ok: false, code: 'send_failed', message: 'Não conseguimos enviar agora. Tente de novo em instantes.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Preview Email Exception]:', error);
    return NextResponse.json({ ok: false, code: 'error', message: 'Não conseguimos enviar agora. Tente de novo em instantes.' }, { status: 500 });
  }
}
