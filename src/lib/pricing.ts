import type { AsaasCycle } from './asaas';

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
// R$79,00 (2026-10-28) — período de teste vendendo só o produto "Catálogo
// apenas" como padrão (pedido real: "vou vender sempre esse catálogo mais
// simples por 79 reais, pelo menos por enquanto"). Era R$89,90 antes disso.
export const CATALOGO_PRICE = 79.0;
export const CATALOGO_PRICE_LABEL = 'R$ 79,00';

/** Preço/modo padrão pra catálogo NOVO criado pelo admin (2026-10-13,
 *  atualizado pra R$22,90 em 2026-10-14) — passa a nascer como assinatura
 *  mensal (`catalog_billing_mode: 'recorrente'`) em vez de pagamento único
 *  avulso, usando esse valor como `billing_price_override` inicial.
 *  Catálogos já existentes NÃO são afetados por mudar esse valor (o preço
 *  de cada cliente já está gravado na própria linha em
 *  `orders.billing_price_override` desde a criação) — o admin continua
 *  podendo trocar modo/preço por cliente em `/admin/catalogos`. */
export const CATALOGO_RECORRENTE_DEFAULT_PRICE = 22.9;

/** Preço sugerido pro Plano Catálogo vendido como assinatura ANUAL
 *  (2026-10-15) — só usado como placeholder no input de preço do admin em
 *  `/admin/catalogos`; o valor de verdade cobrado continua vindo de
 *  `billing_price_override` por cliente, igual ao modo recorrente mensal.
 *  Não é seedado automaticamente em nenhum catálogo novo (diferente de
 *  `CATALOGO_RECORRENTE_DEFAULT_PRICE`) — esse modo só existe quando o admin
 *  escolhe manualmente pra uma cliente específica. */
export const CATALOGO_ANUAL_DEFAULT_PRICE = 139.9;

export const AGENDA_PRICE = 34.9;
export const AGENDA_PRICE_LABEL = 'R$ 34,90/mês';

/** Preço do Plano Agenda vendido como assinatura ANUAL (2026-10-15) — mesma
 *  ideia do Catálogo anual, produto próprio, admin escolhe por cliente em
 *  `/admin/catalogos` (`orders.agenda_billing_mode`). */
export const AGENDA_ANUAL_PRICE = 249.9;
export const AGENDA_ANUAL_PRICE_LABEL = 'R$ 249,90/ano';

export type PayablePlanTier = 'basico' | 'plus';
export type AgendaBillingMode = 'recorrente' | 'anual';
export type CatalogBillingMode = 'avulso' | 'recorrente' | 'anual';

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

/** Preço do Plano Agenda conforme o modo de cobrança (2026-10-15) — preço
 *  base muda (mensal `AGENDA_PRICE` ou anual `AGENDA_ANUAL_PRICE`), e
 *  `agenda_price_override` funciona só como DESCONTO (teto no preço base,
 *  nunca acima). Rótulo ganha "/mês" ou "/ano" conforme o modo.
 *
 *  Campo PRÓPRIO, separado de `billing_price_override` (o do Catálogo) desde
 *  2026-10-15 — achado real testando: compartilhar o mesmo campo cobrava o
 *  valor customizado do Catálogo no Agenda por engano (ex: Catálogo mensal
 *  R$22,90 vazava pro Agenda, que deveria cobrar R$34,90). */
export function resolveAgendaPrice(
  mode: AgendaBillingMode,
  agendaPriceOverride: number | null | undefined
): { price: number; label: string } {
  const basePrice = mode === 'anual' ? AGENDA_ANUAL_PRICE : AGENDA_PRICE;
  const override = agendaPriceOverride === null || agendaPriceOverride === undefined ? null : Number(agendaPriceOverride);
  const price = override !== null && Number.isFinite(override) && override >= 5 && override <= basePrice ? override : basePrice;
  const suffix = mode === 'anual' ? '/ano' : '/mês';
  return { price, label: `R$ ${price.toFixed(2).replace('.', ',')}${suffix}` };
}

/** Preço do upsell "Catálogo Completo" (as 3 telas escondidas no produto
 *  "Catálogo apenas" — Capa/Orientações/Contato — de volta, pedido real
 *  2026-10-28). Dois valores, mesmo padrão de override por cliente de
 *  `resolveCatalogPrice`:
 *  - ANTES de pagar qualquer coisa (tela de primeiro contato): preço cheio.
 *  - DEPOIS de já ter pago o Catálogo simples (R$79): só a diferença.
 *  Qual dos dois mostrar/cobrar é decidido por quem chama (olhando
 *  `plan_tier`/`subscription_status`), não aqui. */
export const CATALOGO_COMPLETO_PRICE = 139.0;
export const CATALOGO_COMPLETO_PRICE_LABEL = 'R$ 139,00';
export const CATALOGO_COMPLETO_UPGRADE_PRICE = 60.0;
export const CATALOGO_COMPLETO_UPGRADE_PRICE_LABEL = 'R$ 60,00';

export function resolveFullCatalogPrice(fullCatalogPriceOverride: number | null | undefined): { price: number; label: string } {
  const override = fullCatalogPriceOverride === null || fullCatalogPriceOverride === undefined ? null : Number(fullCatalogPriceOverride);
  const price = override !== null && Number.isFinite(override) && override >= 5 ? override : CATALOGO_COMPLETO_PRICE;
  return { price, label: `R$ ${price.toFixed(2).replace('.', ',')}` };
}

export function resolveFullCatalogUpgradePrice(fullCatalogUpgradePriceOverride: number | null | undefined): { price: number; label: string } {
  const override = fullCatalogUpgradePriceOverride === null || fullCatalogUpgradePriceOverride === undefined ? null : Number(fullCatalogUpgradePriceOverride);
  const price = override !== null && Number.isFinite(override) && override >= 5 ? override : CATALOGO_COMPLETO_UPGRADE_PRICE;
  return { price, label: `R$ ${price.toFixed(2).replace('.', ',')}` };
}

/** Única fonte de verdade pra "qual ciclo Asaas (MONTHLY/YEARLY) esse tier
 *  resolve hoje" (2026-10-15) — usada tanto pela cobrança real
 *  (`checkout/route.ts`, decide se precisa trocar de ciclo numa troca de
 *  tier) quanto pela exibição de preço ANTES de pagar
 *  (`FirstContactScreen.tsx`/`SubscriptionSection.tsx`), pra nunca mostrar
 *  um rótulo "/mês" ou "/ano" diferente do que de fato vai ser cobrado. */
export function resolveBillingCycle(
  plan: PayablePlanTier,
  order: { catalog_billing_mode?: string | null; agenda_billing_mode?: string | null }
): AsaasCycle {
  if (plan === 'basico') {
    return order.catalog_billing_mode === 'anual' ? 'YEARLY' : 'MONTHLY';
  }
  return order.agenda_billing_mode === 'anual' ? 'YEARLY' : 'MONTHLY';
}
