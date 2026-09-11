import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_SESSION_COOKIE = 'sm_admin_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET não está definida no ambiente do servidor.');
  }
  return secret;
}

function sign(expiresAt: number): string {
  return createHmac('sha256', getSecret()).update(String(expiresAt)).digest('hex');
}

/** Gera o valor do cookie de sessão do admin (expiresAt.assinatura). */
export function createAdminSessionValue(): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  return `${expiresAt}.${sign(expiresAt)}`;
}

/** Verifica se o valor do cookie de sessão é válido e ainda não expirou. */
export function isValidAdminSession(cookieValue: string | undefined | null): boolean {
  if (!cookieValue) return false;

  const [expiresAtRaw, signature] = cookieValue.split('.');
  const expiresAt = Number(expiresAtRaw);
  if (!expiresAtRaw || !signature || !Number.isFinite(expiresAt)) return false;
  if (Date.now() > expiresAt) return false;

  const expectedSignature = sign(expiresAt);
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

/** Usar dentro de route handlers (`src/app/api/admin/**`) pra checar se o pedido
 *  vem de um admin autenticado, via o cookie de sessão httpOnly. */
export async function isAdminRequestAuthorized(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

/** Confere a senha do admin contra o valor guardado só no servidor. */
export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
