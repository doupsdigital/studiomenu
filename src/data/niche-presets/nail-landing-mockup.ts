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
 *  entra no `nichePresetsMap`. Mesmo padrão de `lash-landing-mockup.ts`.
 *
 *  2 procedimentos extras (pedido real, 2026-10-19 — eram 4, aumentado pra
 *  6 igual o lash) — `nailPreset` só tem 4 cadastrados no total (sem outro
 *  procedimento "pronto" pra destravar, diferente do lash), e não existe
 *  foto própria pros 2 novos. Reaproveita fotos que já existem (autorizado
 *  por ela, 2026-10-19: "pode repetir fotos") só nesse preset de mockup —
 *  não mexe no `nailPreset` real nem no showroom `/c/showcase/nail`. */
export const nailLandingMockupPreset: CatalogOrderData = {
  ...nailPreset,
  slug: 'modelo-naillanding',
  procedures: [
    ...nailPreset.procedures,
    {
      id: 'n5-landing',
      title: 'Esmaltação em Gel',
      description: 'Esmaltação de longa duração com brilho espelhado e secagem em cabine LED — acabamento impecável por semanas.',
      price: '60,00',
      duration: '45min',
      category: 'Unhas de Gel',
      image_url: '/modelos/nail/assets/img/banho-de-gel.webp',
      specs: [
        ['Investimento', 'R$ 60,00'],
        ['Duração', '45min'],
        ['Durabilidade', 'Até 15 dias'],
      ],
    },
    {
      id: 'n6-landing',
      title: 'Spa dos Pés',
      description: 'Esfoliação, hidratação profunda e esmaltação em gel para pés macios e unhas impecáveis.',
      price: '90,00',
      duration: '1h',
      category: 'Manutenção',
      image_url: '/modelos/nail/assets/img/manutencao-de-gel.webp',
      specs: [
        ['Investimento', 'R$ 90,00'],
        ['Duração', '1h'],
      ],
    },
  ],
  instructions: { ...nailPreset.instructions, items: [] },
};
