/** Preços dos planos pagos — fonte única de verdade, não hardcoded em
 *  vários arquivos (decisão registrada em docs/historico/PLANO_AGENDAMENTO_STUDIOMENU_PLUS.md,
 *  ampliada na Fase 19 pro tier Básico).
 *
 *  Modelo novo (2026-10-06): "Plano Catálogo" (pagamento único) + "Plano
 *  Agenda" (assinatura recorrente, upsell dentro do app). Os nomes internos
 *  (`PayablePlanTier`) continuam 'basico'/'plus' de propósito — batem com o
 *  CHECK de `orders.plan_tier` no banco, que nunca foi migrado. IMPORTANTE:
 *  `orders.plan_tier = 'catalog'` é um valor DIFERENTE, já existente desde
 *  sempre, que significa "catálogo grátis, nunca pagou nada" — não confundir
 *  com o produto "Plano Catálogo" (que por baixo dos panos é `plan_tier =
 *  'basico'`, só pago). */
export const CATALOGO_PRICE = 89.9;
export const CATALOGO_PRICE_LABEL = 'R$ 89,90';

export const AGENDA_PRICE = 34.9;
export const AGENDA_PRICE_LABEL = 'R$ 34,90/mês';

export type PayablePlanTier = 'basico' | 'plus';

/** Preço + descrição (texto que vai pro Asaas e aparece no extrato da
 *  profissional) de cada tier pago — usado pelo checkout genérico.
 *  `basico` = Plano Catálogo (pagamento único), `plus` = Plano Agenda
 *  (assinatura mensal). */
export const PLAN_PRICING: Record<PayablePlanTier, { price: number; label: string; description: string }> = {
  basico: { price: CATALOGO_PRICE, label: CATALOGO_PRICE_LABEL, description: 'StudioMenu Catálogo' },
  plus: { price: AGENDA_PRICE, label: AGENDA_PRICE_LABEL, description: 'StudioMenu Agenda' },
};

/** Preço resolvido do Plano Catálogo pra uma order específica — padrão
 *  (`CATALOGO_PRICE`) a não ser que o admin tenha definido um valor
 *  customizado (`orders.billing_price_override`). Só piso de R$5 (mínimo
 *  do Asaas), sem teto — liberdade total pro admin, decisão confirmada
 *  2026-10-06. Usada tanto no checkout (preço cobrado de verdade) quanto na
 *  tela (preço mostrado antes de pagar), pra nunca divergir uma da outra. */
export function resolveCatalogPrice(billingPriceOverride: number | null | undefined): { price: number; label: string } {
  const override = billingPriceOverride === null || billingPriceOverride === undefined ? null : Number(billingPriceOverride);
  const price = override !== null && Number.isFinite(override) && override >= 5 ? override : CATALOGO_PRICE;
  return { price, label: `R$ ${price.toFixed(2).replace('.', ',')}` };
}

/** Preço de converter um Catálogo recorrente em vitalício (pagamento único
 *  que cancela a mensalidade e deixa o Catálogo permanente, Fase 28) — valor
 *  PRÓPRIO, separado do preço do Catálogo em si (`CATALOGO_PRICE`/
 *  `billing_price_override`), porque é uma oferta diferente (ela já paga a
 *  mensalidade; isso é "pare de pagar pra sempre"). Customizável por admin
 *  por cliente via `orders.lifetime_price_override`, mesmo padrão de
 *  `resolveCatalogPrice`. */
export const CATALOGO_VITALICIO_PRICE = 197.0;
export const CATALOGO_VITALICIO_PRICE_LABEL = 'R$ 197,00';

export function resolveLifetimePrice(lifetimePriceOverride: number | null | undefined): { price: number; label: string } {
  const override = lifetimePriceOverride === null || lifetimePriceOverride === undefined ? null : Number(lifetimePriceOverride);
  const price = override !== null && Number.isFinite(override) && override >= 5 ? override : CATALOGO_VITALICIO_PRICE;
  return { price, label: `R$ ${price.toFixed(2).replace('.', ',')}` };
}
