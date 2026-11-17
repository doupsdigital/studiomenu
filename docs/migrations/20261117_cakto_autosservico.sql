-- Migração: funil de autosserviço Lash (prévia grátis de 24h + checkout Cakto)
-- Data: 2026-11-17
--
-- Rodar no SQL Editor do Supabase: PRIMEIRO no projeto `studiomenu-dev`,
-- testar, e só depois no de produção.
--
-- Tudo aqui é ADITIVO e com padrão seguro: nenhuma linha existente muda de
-- comportamento. `billing_provider` nasce 'asaas' em todos os catálogos
-- atuais — só catálogos criados pelo funil novo (`/lash`) ganham 'cakto'.
-- Pode rodar mais de uma vez sem erro (IF NOT EXISTS).

-- 1. Colunas novas em `orders`
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS billing_provider TEXT NOT NULL DEFAULT 'asaas';
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_billing_provider_check') THEN
        ALTER TABLE public.orders
            ADD CONSTRAINT orders_billing_provider_check CHECK (billing_provider IN ('asaas', 'cakto'));
    END IF;
END $$;

-- Prévia gratuita: preenchido só enquanto o catálogo é uma prévia (24h).
-- Vira NULL quando o pagamento é aprovado.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS preview_expires_at TIMESTAMPTZ;
-- Código curto da prévia — vai no parâmetro `sck` do link da Cakto e volta
-- no webhook, pra saber de qual prévia é a compra.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS preview_code TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_preview_code ON public.orders(preview_code) WHERE preview_code IS NOT NULL;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cakto_order_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cakto_subscription_ref TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_cakto_subscription_ref ON public.orders(cakto_subscription_ref) WHERE cakto_subscription_ref IS NOT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cakto_plan TEXT;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_cakto_plan_check') THEN
        ALTER TABLE public.orders
            ADD CONSTRAINT orders_cakto_plan_check CHECK (cakto_plan IS NULL OR cakto_plan IN ('mensal', 'anual'));
    END IF;
END $$;

-- Até quando o acesso está pago (só Cakto). Decide se o catálogo sai do ar —
-- resistente a eventos perdidos (a Cakto não reenvia webhook com erro).
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_until TIMESTAMPTZ;
-- De onde veio o catálogo (ex: 'lp_preview', 'cakto_sem_previa').
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS acquisition_source TEXT;
-- Progresso do "Primeiros passos" pós-pagamento (Fase 4).
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS onboarding_steps JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Log de todo evento recebido da Cakto (ela não reenvia em caso de erro,
-- então tudo fica aqui pra conferir e corrigir à mão).
CREATE TABLE IF NOT EXISTS public.cakto_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    event TEXT,
    cakto_order_id TEXT,
    dedupe_key TEXT,
    slug TEXT,
    result TEXT NOT NULL CHECK (result IN ('processed', 'ignored', 'rejected', 'error')),
    message TEXT,
    payload JSONB
);
CREATE INDEX IF NOT EXISTS idx_cakto_events_dedupe ON public.cakto_events(dedupe_key);
CREATE INDEX IF NOT EXISTS idx_cakto_events_received ON public.cakto_events(received_at DESC);

ALTER TABLE public.cakto_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cakto_events FROM anon;
