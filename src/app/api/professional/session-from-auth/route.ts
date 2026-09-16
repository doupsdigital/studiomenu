import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { createProfessionalSessionValue, PROFESSIONAL_SESSION_COOKIE } from '@/lib/professional-session';

/** POST /api/professional/session-from-auth
 *  Recebe o access_token de uma sessão do Supabase Auth (login por
 *  e-mail/senha ou Google, feito no client em `/entrar`), confirma o token
 *  no servidor e troca pelo mesmo cookie de sessão do link mágico
 *  (`sm_pro_session`) — o resto do app (`isProfessionalRequestAuthorized`)
 *  não precisa saber por qual via a profissional entrou. */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`professional-session-from-auth:${ip}`, 20, 15 * 60);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const accessToken = body?.access_token;
    if (!accessToken || typeof accessToken !== 'string') {
      return NextResponse.json({ success: false, message: 'Sessão inválida.' }, { status: 400 });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      return NextResponse.json({ success: false, message: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('slug')
      .eq('auth_user_id', userData.user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          message: 'Essa conta ainda não está vinculada a nenhum catálogo. Entre pelo link mágico e ative o login em Configurações.',
        },
        { status: 404 }
      );
    }

    const response = NextResponse.json({ success: true, slug: order.slug });
    response.cookies.set(PROFESSIONAL_SESSION_COOKIE, createProfessionalSessionValue(order.slug), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 90, // 90 dias
    });

    return response;
  } catch (error) {
    console.error('[Session From Auth Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
