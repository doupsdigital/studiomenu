import { CatalogOrderData } from '@/types/catalog';
import { lashPreset } from './lash';

/** 2 presets dedicados pra mandar de exemplo real do produto "Catálogo
 *  apenas" pro lead no WhatsApp (pedido real, 2026-11-04) — cópia do
 *  `lashPreset` completo (todos os procedimentos reais, diferente do
 *  `lashLandingMockupPreset` que filtra pra caber no mockup da landing),
 *  só escondendo Orientações/Contato (o produto nunca mostra essas 2
 *  telas). Livre pra editar sem afetar o showroom real do nicho Lash
 *  (`/c/showcase/lash`) nem catálogos de clientes de verdade.
 *
 *  Diferença entre os 2: `lashCatalogoMockupPreset` esconde a Capa também
 *  (abre direto no mini-cabeçalho "STUDIO + Nome" + grid, igual o produto
 *  de verdade sem Capa); `lashCapaCatalogoMockupPreset` mantém a Capa
 *  (primeira tela) e cai no Catálogo depois — pro perfil de lead que ela
 *  prefere mostrar a foto/frase de capa antes dos procedimentos. */
export const lashCatalogoMockupPreset: CatalogOrderData = {
  ...lashPreset,
  slug: 'modelo-lashcatalogo',
  show_cover: false,
  show_instructions: false,
  show_contact_cta: false,
};

export const lashCapaCatalogoMockupPreset: CatalogOrderData = {
  ...lashCatalogoMockupPreset,
  slug: 'modelo-lashcapacatalogo',
  show_cover: true,
};
