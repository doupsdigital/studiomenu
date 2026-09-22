-- ==========================================================================
-- Migração — Fase 0 do Agendamento + StudioMenu+
-- docs/PLANO_AGENDAMENTO_STUDIOMENU_PLUS.md
-- Rodar uma vez no SQL Editor do projeto Supabase (orrfslursoielebvdhbf).
-- Todos os comandos são idempotentes (seguro rodar mais de uma vez).
-- ==========================================================================

-- 1. Colunas novas em `orders`
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS booking_enabled BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'catalog',
    ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none',
    ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT,
    ADD COLUMN IF NOT EXISTS asaas_subscription_id TEXT,
    ADD COLUMN IF NOT EXISTS billing_email TEXT,
    ADD COLUMN IF NOT EXISTS billing_cpf_cnpj TEXT,
    ADD COLUMN IF NOT EXISTS cancellation_notice_hours INTEGER DEFAULT 24;

DO $$ BEGIN
    ALTER TABLE public.orders ADD CONSTRAINT orders_plan_tier_check CHECK (plan_tier IN ('catalog', 'plus'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.orders ADD CONSTRAINT orders_subscription_status_check
        CHECK (subscription_status IN ('none', 'ativo', 'suspenso', 'cancelado'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Colunas novas em `order_services`
ALTER TABLE public.order_services
    ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
    ADD COLUMN IF NOT EXISTS bookable BOOLEAN DEFAULT true;

-- 3. Tabelas novas de agendamento
CREATE TABLE IF NOT EXISTS public.business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    weekday INT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    UNIQUE (order_id, weekday)
);
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.business_hours FROM anon;

CREATE TABLE IF NOT EXISTS public.schedule_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    all_day BOOLEAN DEFAULT true,
    start_time TIME,
    end_time TIME,
    reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_order_id ON public.schedule_blocks(order_id);
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.schedule_blocks FROM anon;

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.order_services(id) ON DELETE SET NULL,
    service_title TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    price_snapshot TEXT,
    client_name TEXT NOT NULL,
    client_whatsapp TEXT NOT NULL,
    client_notes TEXT,
    starts_at TIMESTAMPTZ NOT NULL,
    -- Calculado e gravado pela aplicação no momento do insert (starts_at +
    -- duration_minutes), não pelo banco: `timestamptz + interval` não é
    -- IMMUTABLE no Postgres (por causa de DST em geral), então não pode
    -- aparecer dentro da expressão de um índice/exclusion constraint.
    ends_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    origin TEXT NOT NULL DEFAULT 'catalog' CHECK (origin IN ('catalog', 'professional')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    EXCLUDE USING gist (
        order_id WITH =,
        tstzrange(starts_at, ends_at) WITH &&
    ) WHERE (status <> 'cancelled')
);
CREATE INDEX IF NOT EXISTS idx_appointments_order_id ON public.appointments(order_id);
CREATE INDEX IF NOT EXISTS idx_appointments_starts_at ON public.appointments(starts_at);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.appointments FROM anon;
