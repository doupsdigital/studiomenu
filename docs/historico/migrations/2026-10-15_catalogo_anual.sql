-- ==========================================================================
-- Migração — Plano Catálogo com 3ª opção de cobrança: assinatura ANUAL
-- (além de 'avulso'/'recorrente' já existentes, Fase 27). Rodar uma vez no
-- SQL Editor do Supabase, nos dois projetos (dev e produção). Idempotente.
-- ==========================================================================

-- A CHECK constraint de `catalog_billing_mode` só aceitava 'avulso'/'recorrente'
-- — precisa trocar pra incluir 'anual' (assinatura Asaas com cycle=YEARLY em
-- vez de MONTHLY, ver src/lib/asaas.ts). Nome da constraint é o padrão que o
-- Postgres gera sozinho pra um CHECK inline sem nome explícito
-- (<tabela>_<coluna>_check) — confirmado contra o schema atual.
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_catalog_billing_mode_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_catalog_billing_mode_check
    CHECK (catalog_billing_mode IN ('avulso', 'recorrente', 'anual'));
