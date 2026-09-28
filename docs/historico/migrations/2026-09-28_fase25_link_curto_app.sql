-- Fase 25 — Link curto do app: o link enviado no primeiro contato
-- (/api/professional/login?slug=...&token=...) expõe o token de 32
-- caracteres cru na mensagem, o que fica "poluído" na hora de entregar o
-- app pra profissional. Esse código curto (7 caracteres, gerado sob
-- demanda na listagem do admin) mapeia pra um alias público em
-- /a/[code] que só resolve slug+token e redireciona — a lógica de sessão
-- em si continua inteira em /api/professional/login, sem duplicação.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS app_short_code TEXT UNIQUE;
