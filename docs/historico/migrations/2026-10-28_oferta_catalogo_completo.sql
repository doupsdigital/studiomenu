-- ==========================================================================
-- Migração — Oferta automática de upsell "Catálogo Completo" (pedido real
-- 2026-10-28). Rodar uma vez no SQL Editor do Supabase, nos dois projetos
-- (dev e produção). Idempotente (IF NOT EXISTS).
--
-- DEFAULT desligado/pendente em todas — não muda nada em nenhum pedido
-- existente; a oferta só aparece pra quem a usuária ligar manualmente em
-- /admin/catalogos.
--
-- IMPORTANTE: rodar em produção ANTES (ou junto, sem intervalo) do deploy do
-- código que depende dessas colunas — `getOrderForProfessionalApp`
-- (src/lib/professional-app-service.ts) faz um `select` com lista explícita
-- de colunas; se alguma delas não existir ainda, a consulta falha pra
-- QUALQUER profissional abrindo o próprio app, não só quem usa a oferta.
-- ==========================================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS full_catalog_offer_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS full_catalog_offer_decision TEXT NOT NULL DEFAULT 'pending'
  CHECK (full_catalog_offer_decision IN ('pending', 'accepted', 'declined'));
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS full_catalog_price_override NUMERIC(10,2)
  CHECK (full_catalog_price_override IS NULL OR full_catalog_price_override >= 5);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS full_catalog_upgrade_price_override NUMERIC(10,2)
  CHECK (full_catalog_upgrade_price_override IS NULL OR full_catalog_upgrade_price_override >= 5);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pending_full_catalog_payment_id TEXT;
