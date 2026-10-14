import { CatalogOrderData } from '@/types/catalog';
import { lashPreset } from './lash';

/** Preset dedicado só pro modal de teste da landing nichada de Lash
 *  (pedido real, 2026-10-14) — cópia do `lashPreset` com só 4 procedimentos
 *  (os mesmos do criativo de anúncio: Volume Brasileiro, Clássico Fio a
 *  Fio, Volume Egípcio, Volume Híbrido), livre pra editar sem afetar o
 *  showroom real do nicho Lash (`/c/showcase/lash`) nem catálogos de
 *  clientes de verdade. Usado via rota `/c/showcase/lashlanding` (ver
 *  `SHOWCASE_SLUGS` em `page.tsx`), não entra no `nichePresetsMap`. */
export const lashLandingMockupPreset: CatalogOrderData = {
  ...lashPreset,
  slug: 'modelo-lashlanding',
  procedures: lashPreset.procedures.filter((p) =>
    ['brasileiro', 'classico', 'egipcio', 'hibrido'].includes(p.id)
  ),
};
