import { CatalogOrderData } from '@/types/catalog';
import { lashPreset } from './lash';

/** Preset dedicado só pro modal de teste da landing nichada de Lash
 *  (pedido real, 2026-10-14) — cópia do `lashPreset` com só 6 procedimentos
 *  (pedido real, 2026-10-19: eram 4, aumentado pra 6 — Volume Brasileiro,
 *  Clássico Fio a Fio, Volume Egípcio, Volume Híbrido, Volume Russo e Mega
 *  Volume, todos já existentes no `lashPreset`, mesma categoria "Extensão
 *  de Cílios"). Reduzido pra 4 Extensão de Cílios + 2 Sobrancelhas (pedido
 *  real, 2026-10-26) — pra mostrar 2 categorias na demo (2 "pílulas" na
 *  capa em vez de 1, já que os chips em `HeaderCover.tsx` são derivados
 *  direto das categorias dos procedimentos), não só pra variar o texto.
 *  Todos já existentes no `lashPreset`, livre pra editar sem afetar o
 *  showroom real do nicho Lash (`/c/showcase/lash`) nem catálogos de
 *  clientes de verdade. Usado via rota `/c/showcase/lashlanding` (ver
 *  `SHOWCASE_SLUGS` em `page.tsx`), não entra no `nichePresetsMap`.
 *
 *  `instructions.items` zerado (pedido real, 2026-10-19) — esconde a tela
 *  de Orientações nesse mockup (fica "muita informação" pro lead frio ler
 *  nesse primeiro contato). A tela já esconde sozinha pra visitante quando
 *  não tem nenhum item, então zerar aqui é suficiente — ver comentário
 *  equivalente em `nail-landing-mockup.ts`. */
export const lashLandingMockupPreset: CatalogOrderData = {
  ...lashPreset,
  slug: 'modelo-lashlanding',
  procedures: lashPreset.procedures.filter((p) =>
    ['brasileiro', 'classico', 'russo', 'mega', 'design-sobrancelha', 'sobrancelha-henna'].includes(p.id)
  ),
  instructions: { ...lashPreset.instructions, items: [] },
};
