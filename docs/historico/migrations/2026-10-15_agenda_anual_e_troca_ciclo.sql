-- ==========================================================================
-- Migração — Plano Agenda anual + trava de troca de ciclo de cobrança.
-- Rodar uma vez no SQL Editor do Supabase, nos dois projetos (dev e
-- produção). Idempotente.
-- ==========================================================================

-- Mesma ideia de `catalog_billing_mode` (migração 2026-10-15_catalogo_anual.sql),
-- só que pro Plano Agenda — sem 'avulso' (Agenda nunca foi pagamento único).
-- Admin escolhe por cliente em /admin/catalogos, só tem efeito ANTES de ela
-- pagar o Agenda (ver resolveBillingCycle em src/lib/pricing.ts).
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS agenda_billing_mode TEXT NOT NULL DEFAULT 'recorrente'
    CHECK (agenda_billing_mode IN ('recorrente', 'anual'));

-- Trava de idempotência pra troca de ciclo de cobrança (switchSubscriptionCycle,
-- src/lib/billing-service.ts) — evita duplo-clique/retry criando 2
-- assinaturas novas órfãs antes de qualquer uma virar a oficial na order.
-- Liberada (volta a NULL) no fim da operação, com ou sem erro.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS plan_switch_lock_at TIMESTAMPTZ DEFAULT NULL;
