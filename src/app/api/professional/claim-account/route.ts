import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';

/** POST /api/professional/claim-account
 *  Vincula uma conta do Supabase Auth (já criada/logada no client, via
 *  e-mail+senha ou Google) ao catálogo atual — só pode ser chamada por quem
 *  já está autenticada nesse catálogo pelo link mágico de sempre (o cookie
 *  `sm_pro_session`), e só enquanto o catálogo ainda não tiver login
 *  vinculado. Dali em diante a profissional pode entrar direto por
 *  `/entrar`, sem o token na URL. */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`professional-claim-account:${ip}`, 10, 15 * 60);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const slug = (body?.slug || '').toLowerCase().trim();
    const accessToken = body?.access_token;

    if (!slug || !accessToken || typeof accessToken !== 'string') {
      return NextResponse.json({ success: false, message: 'Parâmetros inválidos.' }, { status: 400 });
    }

    const isAuthorized = await isProfessionalRequestAuthorized(slug);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Sessão do catálogo inválida ou expirada.' }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      return NextResponse.json({ success: false, message: 'Sessão de login inválida ou expirada.' }, { status: 401 });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, auth_user_id')
      .eq('slug', slug)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, message: 'Catálogo não encontrado.' }, { status: 404 });
    }

    if (order.auth_user_id) {
      return NextResponse.json(
        { success: false, message: 'Esse catálogo já tem um login vinculado.' },
        { status: 409 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ auth_user_id: userData.user.id })
      .eq('id', order.id);

    if (updateError) {
      // Violação de unicidade = essa conta já está vinculada a outro catálogo.
      if (updateError.code === '23505') {
        return NextResponse.json(
          { success: false, message: 'Essa conta já está vinculada a outro catálogo.' },
          { status: 409 }
        );
      }
      console.error('[Claim Account] Erro ao gravar vínculo:', updateError);
      return NextResponse.json({ success: false, message: 'Erro ao vincular a conta.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Claim Account Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
