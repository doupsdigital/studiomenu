import 'server-only';
import { supabaseAdmin } from './supabase-admin';

/** Extrai o IP real do cliente a partir dos headers que a Vercel injeta. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Checa e incrementa um contador de limite de taxa via RPC no Postgres
 * (público.check_rate_limit — ver docs/schema.sql). Retorna `true` se o
 * pedido pode prosseguir, `false` se o limite foi excedido.
 *
 * Em caso de falha na própria checagem (RPC indisponível, etc.), falha
 * "aberto" — não bloqueia um usuário legítimo por causa de uma falha
 * de infraestrutura secundária.
 */
export async function checkRateLimit(key: string, maxHits: number, windowSeconds: number): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
    p_key: key,
    p_max_hits: maxHits,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error('[Rate Limit] Erro ao checar limite, permitindo por padrão:', error);
    return true;
  }

  return Boolean(data);
}
