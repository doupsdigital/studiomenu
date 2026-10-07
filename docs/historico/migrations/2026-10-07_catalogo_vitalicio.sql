-- ==========================================================================
-- Migração — Fase 28: autoatendimento pra converter Catálogo recorrente em
-- vitalício (pagamento único, cancela a mensalidade). Rodar uma vez no SQL
-- Editor do Supabase, nos dois projetos (dev e produção). Idempotente.
-- ==========================================================================

-- Guarda o id do pagamento avulso da Asaas enquanto aguarda confirmação —
-- permite reaproveitar a mesma cobrança (não duplicar) se ela recarregar a
-- página antes de pagar. Limpo depois que `activateSubscription` processa
-- a confirmação (cancela a assinatura real e volta `catalog_billing_mode`
-- pra 'avulso').
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pending_lifetime_payment_id TEXT;

-- Preço customizado da conversão pra vitalício, por cliente — admin
-- negocia caso a caso. `NULL` usa o padrão (`CATALOGO_VITALICIO_PRICE`,
-- src/lib/pricing.ts). Valor PRÓPRIO, separado de `billing_price_override`
-- (que é o preço do Catálogo em si, não dessa conversão).
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS lifetime_price_override NUMERIC(10,2)
    CHECK (lifetime_price_override IS NULL OR lifetime_price_override >= 5);
