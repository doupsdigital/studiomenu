import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const PROFESSIONAL_SESSION_COOKIE = 'sm_pro_session';
// App de uso recorrente (tipo PWA) — TTL bem mais longo que o do admin, pra
// profissional não precisar carregar o link mágico com token toda hora.
const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 dias

function getSecret(): string {
  const secret = process.env.PROFESSIONAL_SESSION_SECRET;
  if (!secret) {
    throw new Error('PROFESSIONAL_SESSION_SECRET não está definida no ambiente do servidor.');
  }
  return secret;
}

// Diferente do admin (recurso único e global), aqui cada sessão pertence a um
// catálogo específico — a assinatura cobre `slug + expiresAt`, não só
// `expiresAt`, pra um cookie válido de um catálogo não poder ser reaproveitado
// (via requisição forjada, não pelo navegador) pra autenticar em outro.
function sign(slug: string, expiresAt: number): string {
  return createHmac('sha256', getSecret()).update(`${slug}.${expiresAt}`).digest('hex');
}

/** Gera o valor do cookie de sessão da profissional pra um catálogo específico. */
export function createProfessionalSessionValue(slug: string): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  return `${slug}.${expiresAt}.${sign(slug, expiresAt)}`;
}

/** Verifica se o cookie é válido, ainda não expirou, e pertence ao `slug` esperado. */
export function isValidProfessionalSession(cookieValue: string | undefined | null, slug: string): boolean {
  if (!cookieValue || !slug) return false;

  const [cookieSlug, expiresAtRaw, signature] = cookieValue.split('.');
  const expiresAt = Number(expiresAtRaw);
  if (!cookieSlug || !expiresAtRaw || !signature || !Number.isFinite(expiresAt)) return false;
  if (cookieSlug !== slug) return false;
  if (Date.now() > expiresAt) return false;

  const expectedSignature = sign(cookieSlug, expiresAt);
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

/** Usar em route handlers/layouts de `/app/[slug]` pra checar se o pedido vem
 *  de uma profissional autenticada pra aquele catálogo específico. */
export async function isProfessionalRequestAuthorized(slug: string): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidProfessionalSession(cookieStore.get(PROFESSIONAL_SESSION_COOKIE)?.value, slug);
}
