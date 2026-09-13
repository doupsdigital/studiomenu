import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { createProfessionalSessionValue, PROFESSIONAL_SESSION_COOKIE } from '@/lib/professional-session';

const GENERIC_ERROR = { success: false, message: 'Link inválido ou expirado.' };

function tokensMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** GET /api/professional/login?slug=X&token=Y
 *  Valida o edit_token do catálogo (o mesmo link mágico de sempre) e grava um
 *  cookie de sessão assinado, escopado pra esse slug — pra profissional não
 *  precisar carregar o token na URL toda vez que abrir o app (Fase 4). */
export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`professional-login:${ip}`, 10, 15 * 60);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const slug = (searchParams.get('slug') || '').toLowerCase().trim();
    const token = searchParams.get('token') || '';

    if (!slug || !token) {
      return NextResponse.json({ success: false, message: 'Parâmetros inválidos (slug e token são obrigatórios).' }, { status: 400 });
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('edit_token')
      .eq('slug', slug)
      .single();

    // Mesma resposta genérica pra slug inexistente e token errado — não vaza
    // se o catálogo existe (evita enumeração de slugs).
    if (error || !order || !order.edit_token || !tokensMatch(token, order.edit_token)) {
      return NextResponse.json(GENERIC_ERROR, { status: 401 });
    }

    const response = NextResponse.redirect(new URL(`/app/${slug}`, request.url));
    response.cookies.set(PROFESSIONAL_SESSION_COOKIE, createProfessionalSessionValue(slug), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: `/app/${slug}`,
      maxAge: 60 * 60 * 24 * 90, // 90 dias
    });

    return response;
  } catch (error) {
    console.error('[Professional Login Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
