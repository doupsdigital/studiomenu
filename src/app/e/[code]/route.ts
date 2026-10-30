import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { usesSubdomainRouting, PRODUCTION_DOMAIN } from '@/lib/public-url';

/** GET /e/[code] — alias curto do link de edição do catálogo
 *  (`/c/[slug]?edit=<token>`), mesmo modelo de `/a/[code]` e reaproveitando
 *  o mesmo `app_short_code` (pedido real, 2026-10-30: o link de edição vai
 *  pra cliente testar antes da compra, e o token cru de 32 caracteres na
 *  mensagem "pode parecer suspeito"). Só resolve o código e redireciona —
 *  a autorização do modo edição continua toda em `/c/[slug]` (o token
 *  ainda aparece na barra de endereço depois do redirect, aceito). */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const ip = getClientIp(request);
  const allowed = await checkRateLimit(`short-link:${ip}`, 20, 5 * 60);
  if (!allowed) {
    return new NextResponse('Muitas tentativas. Aguarde alguns minutos e tente novamente.', { status: 429 });
  }

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('slug, edit_token')
    .eq('app_short_code', code)
    .maybeSingle();

  if (!order || !order.edit_token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Em produção o link é servido no subdomínio da própria cliente
  // (`anapaula.studiomenu.art/e/<code>`, ver `buildProfessionalLinks` no
  // admin) — redireciona pro catálogo oficial dela, sempre pelo slug do
  // código (nunca pelo subdomínio acessado, pra um código num subdomínio
  // errado não cair no catálogo de outra pessoa).
  // Host do cabeçalho (igual `proxy.ts`), não de `request.url` — em `next
  // dev` o `request.url` vem sempre como localhost.
  const hostname = (request.headers.get('host') || '').split(':')[0];
  const target = usesSubdomainRouting(hostname)
    ? `https://${order.slug}.${PRODUCTION_DOMAIN}/?edit=${order.edit_token}`
    : new URL(`/c/${order.slug}?edit=${order.edit_token}`, request.url);
  return NextResponse.redirect(target);
}
