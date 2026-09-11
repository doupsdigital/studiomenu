import { NextResponse } from 'next/server';
import { checkAdminPassword, createAdminSessionValue, ADMIN_SESSION_COOKIE } from '@/lib/admin-session';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`admin-login:${ip}`, 10, 15 * 60);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
        { status: 429 }
      );
    }

    const { password } = (await request.json()) as { password?: string };

    if (!password || !checkAdminPassword(password)) {
      return NextResponse.json({ success: false, message: 'Senha incorreta.' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionValue(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    return response;
  } catch (error: any) {
    console.error('[Admin Login Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
