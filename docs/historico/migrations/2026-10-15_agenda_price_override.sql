-- ==========================================================================
-- Migração — separa o preço customizado do Plano Agenda do campo do
-- Catálogo. Rodar uma vez no SQL Editor do Supabase, nos dois projetos
-- (dev e produção). Idempotente.
-- ==========================================================================

-- Até aqui, `billing_price_override` era compartilhado entre Catálogo e
-- Agenda (reinterpretado conforme o plano no checkout) — achado real
-- testando o cenário "Catálogo mensal R$22,90 → Evolua pro Agenda" (2026-10-15):
-- a tela (e o checkout de verdade) lia esse MESMO campo pro Agenda, cobrando
-- 22,90 em vez de 34,90 por engano, sempre que o valor do Catálogo for menor
-- que o preço de tabela do Agenda. Campo próprio resolve de vez.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS agenda_price_override NUMERIC(10,2)
    CHECK (agenda_price_override IS NULL OR agenda_price_override >= 5);
