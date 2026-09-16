import { NextResponse } from 'next/server';
import { PROFESSIONAL_SESSION_COOKIE } from '@/lib/professional-session';

/** POST /api/professional/logout — apaga o cookie de sessão (`sm_pro_session`),
 *  seja ela originada do link mágico ou do login real (Fase 17). */
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(PROFESSIONAL_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
