import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';

/** Cookie `sm_preview` (2026-11-17): prova que ESTE navegador gerou a prévia
 *  do funil `/lash`. Usado depois do pagamento (`/ativando`, Fase 4) pra
 *  logar a profissional sozinha no app — só o navegador que criou a prévia,
 *  e só depois do pagamento confirmado pelo webhook.
 *
 *  Mesmo modelo de `professional-session.ts` (`slug.expiresAt.assinatura`),
 *  com a chave derivada de `PROFESSIONAL_SESSION_SECRET` + prefixo próprio,
 *  pra um cookie de prévia nunca valer como sessão do app e vice-versa. */
export const PREVIEW_SESSION_COOKIE = 'sm_preview';
// Mais longo que a prévia (24h): ela pode pagar perto do fim e o Pix cair
// depois. Só serve pra reconhecer o navegador, não dá acesso a nada sozinho.
export const PREVIEW_SESSION_TTL_MS = 3 * 24 * 60 * 60 * 1000;

function sign(slug: string, expiresAt: number): string {
  const secret = process.env.PROFESSIONAL_SESSION_SECRET;
  if (!secret) throw new Error('PROFESSIONAL_SESSION_SECRET não está definida no ambiente do servidor.');
  return createHmac('sha256', `preview:${secret}`).update(`${slug}.${expiresAt}`).digest('hex');
}

export function createPreviewSessionValue(slug: string): string {
  const expiresAt = Date.now() + PREVIEW_SESSION_TTL_MS;
  return `${slug}.${expiresAt}.${sign(slug, expiresAt)}`;
}

/** Devolve o slug do cookie se a assinatura for válida e não tiver expirado. */
export function readPreviewSessionSlug(cookieValue: string | undefined | null): string | null {
  if (!cookieValue) return null;
  const [slug, expiresAtRaw, signature] = cookieValue.split('.');
  const expiresAt = Number(expiresAtRaw);
  if (!slug || !signature || !Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;
  const a = Buffer.from(signature);
  const b = Buffer.from(sign(slug, expiresAt));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return slug;
}
