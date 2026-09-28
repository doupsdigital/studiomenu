-- Fase 24 — "Desativar Catálogo": o admin pausa temporariamente um catálogo
-- (falta de pagamento, pedido da profissional pra pausar o serviço, etc) sem
-- excluir nada. Campo separado de `status` (workflow de aprovação/entrega,
-- 'aprovado' vs pendente) e de `agenda_paused` (self-service dela, só afeta
-- o agendamento automático) — este aqui bloqueia o catálogo inteiro (link
-- público e link mágico de edição) tanto pra ela quanto pras clientes dela.
-- O acesso ao app (/app/slug) continua normal de propósito.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS catalog_disabled BOOLEAN NOT NULL DEFAULT false;
