-- ==========================================================================
-- Migração — Fase 19: tier "Básico" (R$39/mês) + funil de primeiro contato
-- docs/PLANO_... (ver plano da tarefa)
-- Rodar uma vez no SQL Editor do projeto Supabase (orrfslursoielebvdhbf).
-- Todos os comandos são idempotentes (seguro rodar mais de uma vez).
-- ==========================================================================

-- 1. Amplia o CHECK de plan_tier pra aceitar o novo tier 'basico'.
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_plan_tier_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_plan_tier_check
    CHECK (plan_tier IN ('catalog', 'basico', 'plus'));

-- 2. Qual tier uma assinatura Asaas recém-criada/atualizada representa —
--    setado no checkout logo antes de criar/atualizar a subscription,
--    consumido por activateSubscription() quando o pagamento é confirmado
--    (webhook ou check-payment). Sem isso não há como saber, só pelo
--    evento do Asaas, se o pagamento confirmado é do Básico ou do Plus.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pending_plan_tier TEXT
    CHECK (pending_plan_tier IN ('basico', 'plus'));
