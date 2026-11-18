import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sendTelegramMessage } from '@/lib/telegram';
import { createSelfServeLashCatalog } from '@/lib/self-serve-catalog';
import { isPreviewExpired, isPreviewOrder } from '@/lib/preview';
import {
  PREVIEW_SESSION_COOKIE,
  PREVIEW_SESSION_TTL_MS,
  createPreviewSessionValue,
  readPreviewSession,
} from '@/lib/preview-session';
import { PRODUCTION_DOMAIN, usesSubdomainRouting } from '@/lib/public-url';

/** POST /api/preview/create  { name }
 *
 *  Gera a prévia gratuita de 24h do funil `/lash` (2026-11-17): catálogo Lash
 *  com o nome dela, serviços de exemplo, sem edição. Pública (qualquer
 *  visitante da página de vendas), por isso com limite por IP. Nunca devolve
 *  o `edit_token` — a edição só existe depois do pagamento. */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`preview-create:${ip}`, 5, 60 * 60);
    if (!allowed) {
      return NextResponse.json(
        { success: false, code: 'rate_limited', message: 'Você já criou várias prévias agora há pouco. Tente de novo daqui a pouco.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const name = typeof body?.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
    if (name.length < 2 || name.length > 60 || /https?:|www\.|@|\d{4,}/i.test(name)) {
      return NextResponse.json(
        { success: false, code: 'invalid_name', message: 'Digite seu nome profissional, por exemplo: Fernanda Lima.' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const hostname = (request.headers.get('host') || '').split(':')[0];
    const respond = (slug: string, previewCode: string, expiresAt: string, reused: boolean) => {
      const res = NextResponse.json({
        success: true,
        slug,
        previewCode,
        expiresAt,
        reused,
        displayUrl: `${slug}.${PRODUCTION_DOMAIN}`,
        publicUrl: usesSubdomainRouting(hostname) ? `https://${slug}.${PRODUCTION_DOMAIN}` : `/c/${slug}`,
      });
      res.cookies.set(PREVIEW_SESSION_COOKIE, createPreviewSessionValue(slug, previewCode), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: Math.floor(PREVIEW_SESSION_TTL_MS / 1000),
      });
      return res;
    };

    // Mesmo navegador gerando de novo com o mesmo nome: devolve a prévia que
    // ela já tem. Conferido ANTES de criar (2026-11-18) — com nome de 3+
    // palavras, o slug de 2 palavras ocupado pela própria prévia fazia
    // `resolveProfessionalSlug` cair no slug de 3 palavras e criar uma
    // SEGUNDA prévia em vez de reaproveitar.
    const session = readPreviewSession(cookieStore.get(PREVIEW_SESSION_COOKIE)?.value);
    if (session) {
      const { data: own } = await supabaseAdmin
        .from('orders')
        .select('slug, client_name, plan_tier, preview_code, preview_expires_at')
        .eq('slug', session.slug)
        .maybeSingle();
      const sameName = (own?.client_name || '').trim().toLowerCase() === name.toLowerCase();
      if (own && sameName && isPreviewOrder(own) && !isPreviewExpired(own) && own.preview_code === session.previewCode) {
        return respond(own.slug, own.preview_code, own.preview_expires_at, true);
      }
    }

    const created = await createSelfServeLashCatalog({ name, asPreview: true, acquisitionSource: 'lp_preview' });

    if (!created.ok) {
      if (created.reason === 'slug_taken') {
        return NextResponse.json(
          {
            success: false,
            code: 'slug_taken',
            message: `Já existe um menu com o nome "${name}". Coloque também seu sobrenome ou o nome do seu studio.`,
          },
          { status: 409 }
        );
      }
      if (created.reason === 'invalid_name') {
        return NextResponse.json(
          { success: false, code: 'invalid_name', message: 'Digite seu nome profissional, por exemplo: Fernanda Lima.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, code: 'error', message: 'Não conseguimos criar sua prévia agora. Tente de novo em instantes.' },
        { status: 500 }
      );
    }

    // `await` de propósito: na Vercel, promessa solta pode ser cortada quando
    // a resposta sai. Não pesa — ela está olhando a animação de ~3s.
    await sendTelegramMessage(`✨ Nova prévia (/lash): ${name}\n🔗 https://${created.slug}.${PRODUCTION_DOMAIN}`);

    return respond(created.slug, created.previewCode, created.previewExpiresAt as string, false);
  } catch (error) {
    console.error('[Preview Create Exception]:', error);
    return NextResponse.json(
      { success: false, code: 'error', message: 'Não conseguimos criar sua prévia agora. Tente de novo em instantes.' },
      { status: 500 }
    );
  }
}
