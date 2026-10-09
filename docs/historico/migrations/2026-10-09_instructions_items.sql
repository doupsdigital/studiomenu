-- Lista livre de itens (título + descrição) pra tela de Orientações
-- ("Antes de vir"), no lugar dos 4 bullets fixos de antes. A profissional
-- adiciona/edita/remove à vontade pelo Editor Visual. Catálogos que nunca
-- editaram essa tela continuam vendo o mesmo conteúdo de sempre, via
-- fallback a partir de tolerances/pre_care em getCatalogBySlug
-- (catalog-service.ts) — por isso não é preciso popular nada aqui.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS instructions_items JSONB DEFAULT NULL;
