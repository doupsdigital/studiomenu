import { CatalogOrderData } from '@/types/catalog';
import { lashPreset } from './lash';

/** Preset dedicado só pro modal de teste da landing nichada de Lash
 *  (pedido real, 2026-10-14) — cópia do `lashPreset` com um recorte de
 *  procedimentos. Voltou a mostrar os 6 Extensão de Cílios completos
 *  (Volume Brasileiro, Clássico Fio a Fio, Volume Egípcio, Volume Híbrido,
 *  Volume Russo e Mega Volume) + 2 Sobrancelhas (pedido real, 2026-10-28,
 *  pra testar o produto "Catálogo apenas" com uma lista que não pareça
 *  pequena). Todos já existentes no `lashPreset`, livre pra editar sem
 *  afetar o showroom real do nicho Lash (`/c/showcase/lash`) nem catálogos
 *  de clientes de verdade. Usado via rota `/c/showcase/lashlanding` (ver
 *  `SHOWCASE_SLUGS` em `page.tsx`), não entra no `nichePresetsMap`.
 *
 *  `show_cover`/`show_instructions`/`show_contact_cta` todos `false`
 *  (pedido real, 2026-10-28) — testa o produto "Catálogo apenas" na
 *  landing: a tela abre direto no mini-cabeçalho "STUDIO + Nome" +
 *  procedimentos, sem Capa/Orientações/Contato, igual o produto de verdade
 *  (`CatalogLayout.tsx`/`ProcedureGrid.tsx`). Vale tanto no mockup estático
 *  da Hero (`HeroMockup.tsx`, `?tela=catalogo`) quanto no modal fullscreen
 *  de teste (`MockupModal.tsx`, sem esse parâmetro) — os 3 flags não
 *  dependem de `hideCoverSection`. */
export const lashLandingMockupPreset: CatalogOrderData = {
  ...lashPreset,
  slug: 'modelo-lashlanding',
  procedures: lashPreset.procedures.filter((p) =>
    ['brasileiro', 'classico', 'egipcio', 'hibrido', 'russo', 'mega', 'design-sobrancelha', 'sobrancelha-henna'].includes(p.id)
  ),
  instructions: { ...lashPreset.instructions, items: [] },
  show_cover: false,
  show_instructions: false,
  show_contact_cta: false,
};
