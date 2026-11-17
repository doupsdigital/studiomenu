/** Regra única de "este catálogo é uma prévia gratuita do funil `/lash`"
 *  (2026-11-17). Prévia = nunca pagou (`plan_tier = 'catalog'`) e tem
 *  `preview_expires_at` — o webhook da Cakto zera esse campo ao aprovar o
 *  pagamento. Catálogos antigos (admin/onboarding) nunca têm esse campo, então
 *  nada muda pra eles.
 *
 *  Enquanto for prévia: sem edição (nem pelo link mágico, nem pelo app, nem
 *  pelas APIs de salvar/upload). Arquivo puro (sem `server-only`) pra poder
 *  ser usado também em componentes. */
export interface PreviewFields {
  plan_tier?: string | null;
  preview_expires_at?: string | null;
}

export function isPreviewOrder(row: PreviewFields | null | undefined): boolean {
  return Boolean(row && row.plan_tier === 'catalog' && row.preview_expires_at);
}

export function isPreviewExpired(row: PreviewFields | null | undefined, nowMs = Date.now()): boolean {
  if (!isPreviewOrder(row)) return false;
  const t = new Date(row!.preview_expires_at as string).getTime();
  return !Number.isFinite(t) || t <= nowMs;
}
