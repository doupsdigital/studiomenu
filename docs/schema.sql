-- ==========================================================================
-- STUDIOMENU — SCHEMA DO BANCO DE DADOS SUPABASE (ESTRUTURA OFICIAL V2)
-- Execute este script no SQL Editor do seu projeto Supabase (orrfslursoielebvdhbf)
-- ==========================================================================

-- 1. TABELA DE PEDIDOS / CATÁLOGOS (`orders`)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    slug TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    studio_name TEXT,
    niche TEXT DEFAULT 'lash',
    layout_model TEXT DEFAULT 'mosaico',
    theme_variant TEXT DEFAULT 'rose',
    whatsapp_number TEXT,
    instagram_handle TEXT,
    hero_phrase TEXT,
    bio_description TEXT,
    cover_media_url TEXT,
    avatar_url TEXT,
    instructions_bg_url TEXT,
    final_screen_bg_url TEXT,
    cta_bg_url TEXT,
    address TEXT,
    maps_url TEXT,
    tolerances TEXT DEFAULT 'Tolerância máxima de 15 minutos de atraso.',
    pre_care JSONB DEFAULT '[]'::jsonb,
    post_care JSONB DEFAULT '[]'::jsonb,
    procedures JSONB DEFAULT '[]'::jsonb,
    edit_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    status TEXT DEFAULT 'active',
    -- Agendamento + StudioMenu+ (docs/PLANO_AGENDAMENTO_STUDIOMENU_PLUS.md, Fase 0)
    booking_enabled BOOLEAN DEFAULT false,
    plan_tier TEXT DEFAULT 'catalog' CHECK (plan_tier IN ('catalog', 'plus')),
    subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none', 'ativo', 'suspenso', 'cancelado')),
    asaas_customer_id TEXT,
    asaas_subscription_id TEXT,
    billing_email TEXT,
    billing_cpf_cnpj TEXT,
    cancellation_notice_hours INTEGER DEFAULT 24
);

-- Index para buscas ultrarrápidas por slug e edit_token
CREATE INDEX IF NOT EXISTS idx_orders_slug ON public.orders(slug);
CREATE INDEX IF NOT EXISTS idx_orders_edit_token ON public.orders(edit_token);

-- 2. TABELA DE PROCEDIMENTOS / SERVIÇOS (`order_services`)
CREATE TABLE IF NOT EXISTS public.order_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    order_index INT DEFAULT 0,
    title TEXT NOT NULL,
    description TEXT,
    price TEXT DEFAULT 'Sob Consulta',
    duration TEXT,
    category TEXT DEFAULT 'Geral',
    image_url TEXT,
    badge TEXT,
    is_highlight BOOLEAN DEFAULT false,
    specs JSONB DEFAULT '[]'::jsonb,
    -- Agendamento (docs/PLANO_AGENDAMENTO_STUDIOMENU_PLUS.md, Fase 0): duração
    -- estruturada em minutos, usada pelo motor de disponibilidade. O campo
    -- `duration` (texto livre, ex. "1h30min") continua existindo só pra exibição.
    duration_minutes INTEGER,
    bookable BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_order_services_order_id ON public.order_services(order_id);

-- 2.1 TABELAS DE AGENDAMENTO (docs/PLANO_AGENDAMENTO_STUDIOMENU_PLUS.md, Fase 0)
--
-- Mesma postura de segurança das tabelas acima: RLS ligado, zero policies
-- pra `anon`, acesso só via supabaseAdmin (service_role) nas rotas de servidor.

-- Grade semanal de horário de atendimento (uma linha por dia da semana ativo).
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

-- Bloqueios de agenda: folga/férias (intervalo de dias) ou bloqueio parcial
-- num dia específico (ex. almoço), via a mesma tabela com `all_day`.
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

-- Agendamentos em si. Guarda uma cópia (snapshot) do serviço no momento da
-- marcação (`service_title`/`duration_minutes`/`price_snapshot`) pra que
-- renomear/apagar um serviço depois não corrompa o histórico de agendamentos.
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
    -- Trava de banco (não só checagem de aplicação) contra choque de horário:
    -- dois agendamentos não-cancelados do mesmo catálogo não podem se sobrepor.
    EXCLUDE USING gist (
        order_id WITH =,
        tstzrange(starts_at, ends_at) WITH &&
    ) WHERE (status <> 'cancelled')
);
CREATE INDEX IF NOT EXISTS idx_appointments_order_id ON public.appointments(order_id);
CREATE INDEX IF NOT EXISTS idx_appointments_starts_at ON public.appointments(starts_at);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.appointments FROM anon;

-- 3. PERMISSÕES DE LEITURA E GRAVAÇÃO (ROW LEVEL SECURITY - RLS)
--
-- ATUALIZADO (auditoria de segurança, item C1): `orders` e `order_services` não têm
-- MAIS nenhuma política pública. Toda leitura e escrita passa exclusivamente pelas
-- rotas server-side do Next.js (src/app/api/**), que usam a service_role key — nunca
-- exposta ao navegador (ver src/lib/supabase-admin.ts). O papel "anon" (chave pública
-- usada no front) não tem mais nenhum privilégio nessas duas tabelas.
--
-- Antes disso, as policies eram todas `USING (true)`/`WITH CHECK (true)`, o que permitia
-- que qualquer pessoa com a anon key (pública, embutida no bundle) lesse, editasse ou
-- apagasse qualquer catálogo direto pela REST API do Supabase, e lesse o `edit_token`
-- de qualquer linha — ignorando por completo o modelo de "link mágico" de edição.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_services ENABLE ROW LEVEL SECURITY;

-- Nenhuma policy pública: sem policy + RLS habilitado = acesso negado por padrão
-- para qualquer papel sem BYPASSRLS (a service_role usada pelo backend sempre ignora RLS).
REVOKE ALL ON public.orders FROM anon;
REVOKE ALL ON public.order_services FROM anon;

-- 4. BUCKET DE ARMAZENAMENTO PARA FOTOS DOS CATÁLOGOS (`catalog-assets`)
INSERT INTO storage.buckets (id, name, public)
VALUES ('catalog-assets', 'catalog-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Upload agora só acontece via rotas server-side (service_role) — sem policy de INSERT
-- anônima. A leitura pública permanece (as imagens dos catálogos continuam públicas).
CREATE POLICY "Permitir Leitura Pública no Bucket catalog-assets" ON storage.objects
FOR SELECT USING (bucket_id = 'catalog-assets');

-- 5. RATE LIMITING (auditoria de segurança, item C5)
--
-- Contador simples por chave (ex: "admin-login:1.2.3.4"), usado pelas rotas que
-- custam dinheiro (extract-catalog, chama a API da Anthropic), são alvo de força
-- bruta (admin/login) ou de spam (notify-telegram, onboarding/create-catalog).
-- Chamado via src/lib/rate-limit.ts, sempre a partir do client privilegiado
-- (service_role), nunca diretamente pelo navegador.
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    count INT NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limits FROM anon;

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_key TEXT, p_max_hits INT, p_window_seconds INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INT;
BEGIN
    INSERT INTO public.rate_limits (key, count, window_start)
    VALUES (p_key, 1, now())
    ON CONFLICT (key) DO UPDATE SET
        count = CASE
            WHEN public.rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval
                THEN 1
            ELSE public.rate_limits.count + 1
        END,
        window_start = CASE
            WHEN public.rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval
                THEN now()
            ELSE public.rate_limits.window_start
        END
    RETURNING count INTO v_count;

    RETURN v_count <= p_max_hits;
END;
$$;
