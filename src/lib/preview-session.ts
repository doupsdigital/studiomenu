import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';

/** Cookie `sm_preview` (2026-11-17): prova que ESTE navegador gerou a prévia
 *  do funil `/lash`. Usado depois do pagamento (`/ativando`) pra logar a
 *  profissional sozinha no app — só o navegador que criou a prévia, e só
 *  depois do pagamento confirmado pelo webhook.
 *
 *  Formato `slug.previewCode.expiresAt.assinatura`. O `previewCode` entra de
 *  propósito (2026-11-18): o slug de uma prévia vencida é liberado e pode ser
 *  reaproveitado por OUTRA pessoa — amarrado só ao slug, um cookie antigo
 *  ainda válido logaria no app dela. O código é único por prévia e continua
 *  no pedido depois da ativação.
 *
 *  Chave derivada de `PROFESSIONAL_SESSION_SECRET` + prefixo próprio, pra um
 *  cookie de prévia nunca valer como sessão do app e vice-versa. */
export const PREVIEW_SESSION_COOKIE = 'sm_preview';
// Mais longo que a prévia (24h): ela pode pagar perto do fim e o Pix cair
// depois. Só serve pra reconhecer o navegador, não dá acesso a nada sozinho.
export const PREVIEW_SESSION_TTL_MS = 3 * 24 * 60 * 60 * 1000;

export interface PreviewSession {
  slug: string;
  previewCode: string;
}

function sign(slug: string, previewCode: string, expiresAt: number): string {
  const secret = process.env.PROFESSIONAL_SESSION_SECRET;
  if (!secret) throw new Error('PROFESSIONAL_SESSION_SECRET não está definida no ambiente do servidor.');
  return createHmac('sha256', `preview:${secret}`).update(`${slug}.${previewCode}.${expiresAt}`).digest('hex');
}

export function createPreviewSessionValue(slug: string, previewCode: string): string {
  const expiresAt = Date.now() + PREVIEW_SESSION_TTL_MS;
  return `${slug}.${previewCode}.${expiresAt}.${sign(slug, previewCode, expiresAt)}`;
}

/** Devolve slug + código do cookie se a assinatura for válida e não tiver expirado. */
export function readPreviewSession(cookieValue: string | undefined | null): PreviewSession | null {
  if (!cookieValue) return null;
  const [slug, previewCode, expiresAtRaw, signature] = cookieValue.split('.');
  const expiresAt = Number(expiresAtRaw);
  if (!slug || !previewCode || !signature || !Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;
  const a = Buffer.from(signature);
  const b = Buffer.from(sign(slug, previewCode, expiresAt));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return { slug, previewCode };
}
