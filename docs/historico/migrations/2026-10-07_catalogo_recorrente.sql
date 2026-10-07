-- ==========================================================================
-- Migração — Fase 27: Plano Catálogo com cobrança escolhida pelo admin
-- (pagamento único, padrão, OU assinatura mensal). Rodar uma vez no SQL
-- Editor do Supabase, nos dois projetos (dev e produção). Idempotente.
-- ==========================================================================

-- Decide, ANTES do pagamento, qual caminho o checkout oferece pro Plano
-- Catálogo (`plan === 'basico'`) dessa cliente: 'avulso' (createPayment, sem
-- recorrência) ou 'recorrente' (createSubscription, igual ao Plano Agenda).
-- Nasce 'avulso' pra todo mundo — comportamento de hoje, sem regressão.
-- Depois que ela paga, a tela "Plano" não olha mais pra essa coluna: usa a
-- presença de `asaas_subscription_id` como fonte de verdade (ver
-- `SubscriptionSection.tsx`), então um catálogo recorrente de antes dessa
-- coluna existir (ex: assinatura legada) já se exibe certo sem precisar
-- setar nada aqui retroativamente.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS catalog_billing_mode TEXT NOT NULL DEFAULT 'avulso'
    CHECK (catalog_billing_mode IN ('avulso', 'recorrente'));
