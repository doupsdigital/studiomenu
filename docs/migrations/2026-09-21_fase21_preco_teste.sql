-- ==========================================================================
-- Migração — Fase 21: preço reduzido opcional por pedido (teste real em produção)
-- Rodar uma vez no SQL Editor do Supabase. Idempotente.
-- ==========================================================================

-- Só é usado no checkout se estiver entre R$5 (mínimo do Asaas) e o preço de
-- tabela do plano. NULL (padrão) = preço normal. Definido manualmente, só
-- no catálogo de teste — nenhuma tela do app escreve nessa coluna.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS billing_price_override NUMERIC(10,2)
    CHECK (billing_price_override IS NULL OR billing_price_override >= 5);
