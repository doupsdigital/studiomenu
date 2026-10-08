import type { NicheType } from '@/types/catalog';

/** Capa padrão por nicho (pedido real, 2026-10-07, Studio adicionado
 *  2026-10-08) — antes, cada nicho caía na mesma foto genérica de mulher
 *  (`Hero.webp`) quando a profissional não mandava capa própria; agora cada
 *  um tem sua própria imagem "padronizada". Nichos sem entrada aqui
 *  (Estética) continuam com o fallback de sempre (foto da tela final,
 *  depois o Hero.webp genérico) — ver `HeaderCover.tsx` e
 *  `og/catalog/[slug]/route.ts`, os dois únicos lugares que leem isso
 *  (preciso ficar sincronizado nos dois: um decide o que a página mostra, o
 *  outro o que aparece no preview do link no WhatsApp). */
export const NICHE_DEFAULT_COVER: Partial<Record<NicheType, string>> = {
  lash: '/capa_lash.png',
  nail: '/capa_nail.png',
  studio: '/capa_studio.png',
};
