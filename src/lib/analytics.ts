import posthog from 'posthog-js';

/** Só registra no PostHog quando o host é produção de verdade
 *  (`studiomenu.art` ou `{slug}.studiomenu.art`) — localhost e previews da
 *  Vercel (domínio `*.vercel.app`) nunca inicializam o PostHog, pra não
 *  poluir os dados reais com testes/desenvolvimento (pedido explícito,
 *  2026-10-13). Pra testar captura de verdade de propósito, combinar isso
 *  antes (ex: testar direto em studiomenu.art). */
function isProductionHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'studiomenu.art' || host.endsWith('.studiomenu.art');
}

type PostHogInitOptions = Parameters<typeof posthog.init>[1];

export function initPostHog(options: PostHogInitOptions) {
  if (!isProductionHost()) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || posthog.__loaded) return;
  posthog.init(key, options);
}

export function capture(event: string, properties?: Record<string, unknown>) {
  if (!isProductionHost() || !posthog.__loaded) return;
  posthog.capture(event, properties);
}

export function identify(distinctId: string, properties?: Record<string, unknown>) {
  if (!isProductionHost() || !posthog.__loaded) return;
  posthog.identify(distinctId, properties);
}
