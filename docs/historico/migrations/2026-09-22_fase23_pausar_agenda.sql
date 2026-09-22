-- Fase 23 — "Desligar Agenda": a profissional Plus pausa o agendamento
-- automático temporariamente (férias, imprevisto) sem mexer na assinatura.
-- Campo separado de `booking_enabled` de propósito: `booking_enabled`
-- continua controlando se ela TEM acesso à Agenda/Horários/Bloqueios dentro
-- do app (Plus ativo ou toggle manual do admin); `agenda_paused` só afeta o
-- que a CLIENTE FINAL vê no catálogo público — pausar não pode tirar dela o
-- acesso à própria agenda pra gerenciar o que já estava marcado.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS agenda_paused BOOLEAN NOT NULL DEFAULT false;
