-- ==========================================================================
-- Migração — Fase 18 (Push notifications)
-- docs/PLANO_PRODUCAO_V1.md
-- Rodar uma vez no SQL Editor do projeto Supabase (orrfslursoielebvdhbf).
-- Idempotente (seguro rodar mais de uma vez).
-- ==========================================================================

-- Uma linha por dispositivo/navegador inscrito nas notificações push de um
-- catálogo (uma profissional pode ter mais de um: celular + notebook, etc).
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (order_id, endpoint)
);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_order_id ON public.push_subscriptions(order_id);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.push_subscriptions FROM anon;
