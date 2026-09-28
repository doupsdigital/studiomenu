import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

/** GET /a/[code] — alias curto do link do app (`/api/professional/login`),
 *  pra não expor o token de 32 caracteres cru na mensagem de entrega do
 *  app (pedido real, 2026-09-28: "muita informação" no link do primeiro
 *  contato). Só resolve o código pro slug/token reais e redireciona — toda
 *  a lógica de sessão continua centralizada em `/api/professional/login`,
 *  sem duplicar nada aqui. Rate limit por IP como as outras rotas públicas
 *  de autenticação (defesa extra contra tentativa de adivinhar código,
 *  mesmo o espaço de 58^7 combinações já tornando isso inviável). */
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

  if (!order) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.redirect(new URL(`/api/professional/login?slug=${order.slug}&token=${order.edit_token}`, request.url));
}
