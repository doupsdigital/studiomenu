-- Fase 22 — Oferta do Plus direto (venda focada em agendamento, sem passar
-- pelo Básico). Decide qual plano aparece em destaque na tela de primeiro
-- contato (FirstContactScreen) — não muda nenhuma regra de cobrança, só a
-- tela: o checkout já aceitava 'basico' ou 'plus' pra assinatura nova.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS first_offer_tier TEXT NOT NULL DEFAULT 'basico'
    CHECK (first_offer_tier IN ('basico', 'plus'));
