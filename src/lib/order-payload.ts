import { CatalogOrderData, NicheType, LayoutModel, ThemeVariant, ProcedureItem } from '@/types/catalog';
import { nichePresetsMap } from '@/data/niche-presets';

/**
 * Fonte única pra "quais campos um catálogo precisa" — usada por todo ponto
 * que cria (INSERT) ou edita (UPDATE) um catálogo em `orders`, e por todo
 * ponto que grava seus procedimentos em `order_services`. Existe pra evitar
 * a classe de bug que já aconteceu várias vezes neste projeto: um campo novo
 * (ex: hero_phrase, specs, cta_bg_url) sendo lembrado em um fluxo de escrita
 * e esquecido em outro, silenciosamente.
 */

export interface OrderInsertInput {
  slug: string;
  clientName: string;
  whatsappNumber: string;
  instagramHandle?: string;
  niche: NicheType;
  layoutModel: LayoutModel;
  themeVariant: ThemeVariant;
  coverUrl: string;
  avatarUrl?: string;
}

/** Monta o payload completo pra criar um catálogo novo. Os campos "de
 *  identidade do nicho" (frase, bio, nome de marca, imagens de fundo,
 *  tolerâncias, cuidados) vêm sempre do preset — nunca ficam de fora. */
export function buildOrderInsertPayload(input: OrderInsertInput) {
  const preset = nichePresetsMap[input.niche] || nichePresetsMap.lash;

  return {
    slug: input.slug,
    client_name: input.clientName,
    studio_name: preset.studio_name,
    hero_phrase: preset.hero_phrase,
    bio_description: preset.bio_description || '',
    cover_media_url: input.coverUrl,
    avatar_url: input.avatarUrl || input.coverUrl,
    instructions_bg_url: preset.instructions_bg_url || null,
    final_screen_bg_url: preset.final_screen_bg_url || null,
    cta_bg_url: preset.cta_bg_url || null,
    niche: input.niche,
    layout_model: input.layoutModel,
    theme_variant: input.themeVariant,
    whatsapp_number: input.whatsappNumber,
    instagram_handle: input.instagramHandle || '',
    address: '',
    tolerances: preset.instructions?.tolerances || 'Tolerância máxima de 15 minutos de atraso.',
    pre_care: preset.instructions?.pre_care || [],
    post_care: preset.instructions?.post_care || [],
    categories: [] as string[],
  };
}

/** Monta o payload de UPDATE em `orders` a partir do estado completo do
 *  editor — mesma lista de colunas editáveis do catálogo, pra nenhum campo
 *  novo do editor ficar "preso" fora do salvamento por esquecimento. */
export function buildOrderUpdatePayload(data: CatalogOrderData) {
  return {
    studio_name: data.studio_name,
    client_name: data.client_name,
    bio_description: data.bio_description,
    hero_phrase: data.hero_phrase,
    whatsapp_number: data.whatsapp_number,
    instagram_handle: data.instagram_handle,
    address: data.address,
    maps_url: data.maps_url,
    avatar_url: data.avatar_url,
    cover_media_url: data.cover_media_url,
    instructions_bg_url: data.instructions_bg_url,
    final_screen_bg_url: data.final_screen_bg_url,
    cta_bg_url: data.cta_bg_url,
    niche: data.niche,
    layout_model: data.layout_model,
    theme_variant: data.theme_variant,
    pre_care: data.instructions?.pre_care || [],
    post_care: data.instructions?.post_care || [],
    tolerances: data.instructions?.tolerances || '',
    procedures: data.procedures || [],
    categories: data.categories || [],
    updated_at: new Date().toISOString(),
  };
}

/** Monta as linhas de `order_services` a partir de uma lista de procedimentos. */
export function buildServicesPayload(procedures: ProcedureItem[], orderId: string) {
  return procedures.map((p, index) => ({
    order_id: orderId,
    order_index: index,
    title: p.title,
    description: p.description || '',
    price: p.price || 'Sob Consulta',
    duration: p.duration || '',
    category: p.category || 'Geral',
    image_url: p.image_url || '',
    badge: p.badge || '',
    is_highlight: Boolean(p.is_highlight),
    specs: p.specs || [],
  }));
}
