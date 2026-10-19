import { CatalogOrderData } from '@/types/catalog';
import { nailPreset } from './nail';

/** Preset dedicado só pro modal de teste da landing nichada de Nail
 *  (pedido real, 2026-10-19) — cópia do `nailPreset` sem os itens da tela
 *  de Orientações: fica "muita informação" pro lead frio ler nesse primeiro
 *  contato. A tela já esconde sozinha pra visitante quando não tem nenhum
 *  item (ver `(isEditMode || items.length > 0)` em `CatalogLayout.tsx`),
 *  então zerar `items` aqui é suficiente — nenhuma lógica nova precisou ser
 *  criada. Livre pra editar sem afetar o showroom real do nicho Nail
 *  (`/c/showcase/nail`) nem catálogos de clientes de verdade. Usado via
 *  rota `/c/showcase/naillanding` (ver `SHOWCASE_SLUGS` em `page.tsx`), não
 *  entra no `nichePresetsMap`. Mesmo padrão de `lash-landing-mockup.ts`. */
export const nailLandingMockupPreset: CatalogOrderData = {
  ...nailPreset,
  slug: 'modelo-naillanding',
  instructions: { ...nailPreset.instructions, items: [] },
};
