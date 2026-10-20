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

/** Bug real, 2026-10-20: `identify()` grava o `distinct_id` no
 *  localStorage/cookie do navegador e ele fica lá — sem um `reset()` em
 *  algum momento, qualquer página seguinte carregada no MESMO navegador
 *  (inclusive a landing page pública, que nunca chama `identify`) herda
 *  a identidade de uma cliente que nem é quem está navegando agora. Usado
 *  em dois lugares: `PostHogTracker.tsx` (landing — sempre começa
 *  anônima) e `AppPostHogTracker.tsx` (só quando o slug muda, pra não
 *  gerar reset desnecessário na mesma cliente). */
export function reset() {
  if (!isProductionHost() || !posthog.__loaded) return;
  posthog.reset();
}

/** Usado só por `AppPostHogTracker.tsx` pra decidir se precisa de
 *  `reset()` antes do `identify()` (ver comentário acima). */
export function getDistinctId(): string | null {
  if (!isProductionHost() || !posthog.__loaded) return null;
  return posthog.get_distinct_id();
}
