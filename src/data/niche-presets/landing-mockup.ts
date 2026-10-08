import { CatalogOrderData } from '@/types/catalog';

/** Preset dedicado só pro mockup de celular da landing page de vendas
 *  (pedido real, 2026-10-08) — cópia independente do `studioPreset`, livre
 *  pra editar à vontade sem afetar o showroom real do nicho Studio nem
 *  catálogos de clientes. Usado via rota `/c/showcase/landingpage`
 *  (ver `SHOWCASE_SLUGS` em `page.tsx`), não entra no `nichePresetsMap`. */
export const landingMockupPreset: CatalogOrderData = {
  slug: 'modelo-landingpage',
  client_name: 'Mariana Alves',
  studio_name: 'Beauty Lounge Studio',
  hero_phrase: 'Seu espaço completo de beleza: Lash, Nails, Cabelo e Estética em um só lugar.',
  bio_description: 'Studio de Beleza Multi-disciplinar com especialistas de alto padrão.',
  cover_media_url: '/modelos/mosaico/assets/img/Hero.webp',
  avatar_url: '/modelos/mosaico/assets/img/Hero.webp',
  instructions_bg_url: '/modelos/studio/assets/img/tela-orientacoes.webp',
  cta_bg_url: '/modelos/studio/assets/img/ultima-tela.webp',
  final_screen_bg_url: '/modelos/studio/assets/img/ultima-tela.webp',
  niche: 'studio',
  layout_model: 'mosaico',
  theme_variant: 'luxury',
  whatsapp_number: '5562991083435',
  instagram_handle: '@beautylounge.studio',
  address: 'São Paulo',
  procedures: [
    {
      id: 'brasileiro',
      title: 'Volume Brasileiro',
      description: 'Fios tecnológicos com formato Y que preenchem as falhas naturais com leveza incomparável, alta durabilidade e acabamento marcante.',
      price: 'R$ 150',
      duration: '1h30',
      category: 'Extensão de Cílios',
      badge: 'Mais Pedido',
      is_highlight: true,
      image_url: '/modelos/mosaico/assets/img/volume-brasileiro.webp',
      specs: [
        ['Investimento', 'R$ 150'],
        ['Duração', '1h30'],
        ['Manutenção', 'R$ 90 (até 20 dias)'],
      ],
    },
    {
      id: 's2',
      title: 'Alongamento em Gel + Esmaltação',
      description: 'Unhas impecáveis por até 30 dias com estrutura perfeita e brilho intenso.',
      price: '210,00',
      duration: '2h',
      category: 'Nails & Gel',
      image_url: '/modelos/studio/assets/img/alongamento-em-gel.webp',
      specs: [
        ['Investimento', 'R$ 210,00'],
        ['Duração', '2h'],
        ['Durabilidade', 'Até 30 dias'],
      ],
    },
    {
      id: 's3',
      title: 'Limpeza de Pele Fotônica',
      description: 'Higienização facial profunda, extração de cravos e LED regenerador.',
      price: '190,00',
      duration: '1h30min',
      category: 'Estética',
      image_url: '/modelos/studio/assets/img/limpeza-de-pele.webp',
      specs: [
        ['Investimento', 'R$ 190,00'],
        ['Duração', '1h30min'],
        ['Tecnologia', 'Extração + LED Fototerapia'],
      ],
    },
    {
      id: 's4',
      title: 'Escova Modeladora + Tratamento',
      description: 'Lavagem especial, reconstrução capilar intensiva e escova modeladora.',
      price: '130,00',
      duration: '1h',
      category: 'Hair Studio',
      image_url: '/modelos/studio/assets/img/escova-modeladora.webp',
      specs: [
        ['Investimento', 'R$ 130,00'],
        ['Duração', '1h'],
        ['Procedimento', 'Lavagem + Reconstrução + Escova'],
      ],
    },
  ],
  instructions: {
    pre_care: [
      'Chegue com 5 a 10 minutos de antecedência.',
      'Siga as orientações prévias de cada procedimento agendado.',
    ],
    post_care: [
      'Seguir os guias de cuidados pós fornecidos por cada profissional.',
    ],
    tolerances: 'Tolerância de 15 minutos de atraso.',
  },
};
