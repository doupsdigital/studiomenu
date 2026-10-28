-- ==========================================================================
-- Migração — Flags de visibilidade por pedido (produto "Catálogo apenas").
-- Rodar uma vez no SQL Editor do Supabase, nos dois projetos (dev e
-- produção). Idempotente (IF NOT EXISTS).
--
-- DEFAULT true em todas — não muda nada nos catálogos já existentes; só
-- pedidos novos criados pelo /admin/criar-com-ia nascem com `false`
-- (produto "Catálogo apenas" vira o padrão de venda daqui pra frente).
--
-- IMPORTANTE: rodar em produção ANTES (ou junto, sem intervalo) do deploy do
-- código que depende dessas colunas — `getOrderForProfessionalApp`
-- (src/lib/professional-app-service.ts) faz um `select` com lista explícita
-- de colunas incluindo `show_full_app`; se essa coluna não existir ainda, a
-- consulta falha pra QUALQUER profissional abrindo o próprio app, não só
-- pra quem usa o produto novo.
-- ==========================================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS show_cover BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS show_instructions BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS show_contact_cta BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS show_full_app BOOLEAN NOT NULL DEFAULT true;
