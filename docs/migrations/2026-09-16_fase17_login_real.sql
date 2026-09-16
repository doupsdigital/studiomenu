-- ==========================================================================
-- Migração — Fase 17 (Login real da profissional via Supabase Auth)
-- docs/PLANO_PRODUCAO_V1.md
-- Rodar uma vez no SQL Editor do projeto Supabase (orrfslursoielebvdhbf).
-- Idempotente (seguro rodar mais de uma vez).
-- ==========================================================================

-- Vínculo 1:1 opcional entre um catálogo e uma conta do Supabase Auth. Fica
-- NULL até a profissional "reivindicar" o login (ela continua entrando só
-- pelo link mágico até fazer isso, ver AccountSection em Config).
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
