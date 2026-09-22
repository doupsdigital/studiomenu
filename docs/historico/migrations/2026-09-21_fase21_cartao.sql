-- ==========================================================================
-- Migração — Fase 21: pagamento por cartão de crédito (além do Pix)
-- Rodar uma vez no SQL Editor do projeto Supabase (orrfslursoielebvdhbf).
-- Idempotente (seguro rodar mais de uma vez).
-- ==========================================================================

-- Forma de pagamento da assinatura atual ('pix' ou 'card') — setada no
-- checkout, serve pra mostrar "via Pix"/"via cartão" em Minha assinatura e
-- pra saber, ao trocar de método antes de pagar, se precisa atualizar a
-- assinatura no Asaas.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT
    CHECK (payment_method IN ('pix', 'card'));
