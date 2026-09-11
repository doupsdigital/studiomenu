import { CatalogOrderData, NicheType, LayoutModel, ThemeVariant, ProcedureItem } from '@/types/catalog';
import { nichePresetsMap } from '@/data/niche-presets';
import { normalizeWhatsappBR } from './format';
import { supabaseAdmin } from './supabase-admin';

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Gera um slug único a partir do nome da cliente, checando colisão no banco
 *  antes de devolver (em vez de confiar cegamente no sufixo aleatório, que
 *  tinha ~900 combinações por nome-base e podia colidir sem aviso). */
export async function generateUniqueSlug(clientName: string): Promise<string> {
  const base = slugifyName(clientName) || 'catalogo';

  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = Math.floor(100 + Math.random() * 900);
    const candidate = `${base}-${suffix}`;
    const { data } = await supabaseAdmin.from('orders').select('id').eq('slug', candidate).maybeSingle();
    if (!data) return candidate;
  }

  // Último recurso, praticamente impossível de colidir.
  return `${base}-${Date.now()}`;
}

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
    whatsapp_number: normalizeWhatsappBR(input.whatsappNumber),
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
 *  novo do editor ficar "preso" fora do salvamento por esquecimento.
 *  Não inclui `procedures`: os procedimentos vivem só em `order_services`
 *  (ver buildServicesPayload) — a coluna JSONB `orders.procedures` é legado
 *  e não é mais escrita por nenhum fluxo, pra não manter duas fontes de
 *  verdade fora de sincronia. */
export function buildOrderUpdatePayload(data: CatalogOrderData) {
  return {
    studio_name: data.studio_name,
    client_name: data.client_name,
    bio_description: data.bio_description,
    hero_phrase: data.hero_phrase,
    whatsapp_number: normalizeWhatsappBR(data.whatsapp_number),
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
    categories: data.categories || [],
    updated_at: new Date().toISOString(),
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Um `ProcedureItem.id` só é um id de verdade do banco quando é um UUID.
 *  Procedimentos ainda não salvos carregam um id provisório gerado no
 *  cliente (`String(Date.now())`, ver CatalogLayout.handleSaveProcedure) —
 *  esses precisam de um INSERT novo, nunca de um UPDATE por esse id. */
export function isValidServiceId(id: string | null | undefined): id is string {
  return typeof id === 'string' && UUID_RE.test(id);
}

/** Monta as linhas de `order_services` a partir de uma lista de procedimentos.
 *  Quando o procedimento já tem um id de banco válido, o `id` vai incluído no
 *  payload — usado pelo save do editor (`/api/catalog/save`) pra fazer upsert
 *  em vez de apagar-e-reinserir tudo, mantendo os ids estáveis entre saves
 *  (necessário pro agendamento, que referencia `order_services.id`). Rotas de
 *  criação (onboarding/finalize-catalog) nunca têm ids de banco ainda, então
 *  o campo simplesmente não aparece e o Supabase gera um id novo no insert. */
export function buildServicesPayload(procedures: ProcedureItem[], orderId: string) {
  return procedures.map((p, index) => {
    const row: Record<string, unknown> = {
      order_id: orderId,
      order_index: index,
      title: p.title,
      description: p.description || '',
      price: p.price || 'Sob Consulta',
      duration: p.duration || '',
      duration_minutes: typeof p.duration_minutes === 'number' ? p.duration_minutes : null,
      bookable: p.bookable !== false,
      category: p.category || 'Geral',
      image_url: p.image_url || '',
      badge: p.badge || '',
      is_highlight: Boolean(p.is_highlight),
      specs: p.specs || [],
    };
    if (isValidServiceId(p.id)) {
      row.id = p.id;
    }
    return row;
  });
}
