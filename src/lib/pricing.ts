/** Preços dos planos pagos — fonte única de verdade, não hardcoded em
 *  vários arquivos (decisão registrada em docs/PLANO_AGENDAMENTO_STUDIOMENU_PLUS.md,
 *  ampliada na Fase 19 pro tier Básico). */
export const BASICO_PRICE = 39.9;
export const BASICO_PRICE_LABEL = 'R$ 39,90/mês';

export const PLUS_PRICE = 69.9;
export const PLUS_PRICE_LABEL = 'R$ 69,90/mês';

export type PayablePlanTier = 'basico' | 'plus';

/** Preço + descrição (texto que vai pro Asaas e aparece no extrato da
 *  profissional) de cada tier pago — usado pelo checkout genérico. */
export const PLAN_PRICING: Record<PayablePlanTier, { price: number; label: string; description: string }> = {
  basico: { price: BASICO_PRICE, label: BASICO_PRICE_LABEL, description: 'StudioMenu Básico' },
  plus: { price: PLUS_PRICE, label: PLUS_PRICE_LABEL, description: 'StudioMenu+' },
};
