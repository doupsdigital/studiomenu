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
    status TEXT DEFAULT 'active'
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
    specs JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_order_services_order_id ON public.order_services(order_id);

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
