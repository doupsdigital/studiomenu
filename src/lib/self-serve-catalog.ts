import 'server-only';
import { supabaseAdmin } from './supabase-admin';
import { buildOrderInsertPayload, buildServicesPayload, resolveProfessionalSlug } from './order-payload';
import { generateCode } from './short-link';
import { nichePresetsMap } from '@/data/niche-presets';

/** Duração da prévia gratuita do funil de autosserviço (`/lash`). */
export const PREVIEW_TTL_MS = 24 * 60 * 60 * 1000;

/** Procedimentos de exemplo com que a prévia nasce: 4 extensões de cílios +
 *  2 de sobrancelha (2026-11-18, eram 6 extensões) — assim a capa já mostra
 *  as duas "cápsulas" de categoria. Ela troca pelos dela depois de pagar. */
const PREVIEW_PROCEDURE_IDS = ['brasileiro', 'classico', 'egipcio', 'hibrido', 'design-sobrancelha', 'sobrancelha-henna'];

export type CreateSelfServeResult =
  | { ok: true; orderId: string; slug: string; previewCode: string; previewExpiresAt: string | null }
  | { ok: false; reason: 'invalid_name' | 'slug_taken' | 'db_error'; attemptedSlug?: string };

interface CreateSelfServeInput {
  name: string;
  /** true = prévia de 24h (página de vendas). false = catálogo criado direto
   *  pelo webhook (compra na Cakto sem prévia encontrada). */
  asPreview: boolean;
  acquisitionSource: string;
  whatsappNumber?: string;
  /** Webhook não pode falhar por slug ocupado (a venda já aconteceu): tenta
   *  sufixos legíveis (`studio`, `lash`) antes de desistir. */
  allowSlugSuffix?: boolean;
}

/** Apaga uma prévia vencida e nunca paga que esteja ocupando o slug —
 *  libera o nome pra outra pessoa (ou ela mesma) gerar de novo sem esperar
 *  a limpeza diária. Nunca apaga catálogo pago ou de outro provedor. */
async function releaseExpiredPreviewSlug(slug: string): Promise<void> {
  await supabaseAdmin
    .from('orders')
    .delete()
    .eq('slug', slug)
    .eq('plan_tier', 'catalog')
    .not('preview_expires_at', 'is', null)
    .lt('preview_expires_at', new Date().toISOString());
}

async function resolveSlug(name: string, allowSuffix: boolean) {
  const first = await resolveProfessionalSlug(name);
  if (first.ok) return first;
  if (first.attemptedSlug) {
    await releaseExpiredPreviewSlug(first.attemptedSlug);
    const retry = await resolveProfessionalSlug(name);
    if (retry.ok || !allowSuffix) return retry;
  }
  if (allowSuffix) {
    for (const suffix of ['studio', 'lash', 'lashdesigner']) {
      const attempt = await resolveProfessionalSlug(`${name} ${suffix}`);
      if (attempt.ok) return attempt;
    }
  }
  return first;
}

/** Cria um catálogo Lash no formato do produto vendido no funil novo (Capa +
 *  Catálogo, sem Orientações/Contato, app só com a aba Início), já marcado
 *  como `billing_provider = 'cakto'`. Usado pela geração da prévia e pelo
 *  webhook da Cakto (compra sem prévia). Nunca devolve o `edit_token`. */
export async function createSelfServeLashCatalog(input: CreateSelfServeInput): Promise<CreateSelfServeResult> {
  const name = input.name.trim().replace(/\s+/g, ' ').slice(0, 60);
  if (name.replace(/[^\p{L}]/gu, '').length < 2) return { ok: false, reason: 'invalid_name' };

  const slugResult = await resolveSlug(name, Boolean(input.allowSlugSuffix));
  if (!slugResult.ok) return { ok: false, reason: 'slug_taken', attemptedSlug: slugResult.attemptedSlug };

  const preset = nichePresetsMap.lash;
  const previewExpiresAt = input.asPreview ? new Date(Date.now() + PREVIEW_TTL_MS).toISOString() : null;

  let orderData: { id: string } | null = null;
  let previewCode = '';
  // `preview_code` é UNIQUE — em caso (raríssimo) de colisão, tenta outro.
  for (let attempt = 0; attempt < 5 && !orderData; attempt += 1) {
    previewCode = generateCode();
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert({
        ...buildOrderInsertPayload({
          slug: slugResult.slug,
          clientName: name,
          whatsappNumber: input.whatsappNumber || '',
          niche: 'lash',
          layoutModel: preset.layout_model,
          themeVariant: preset.theme_variant,
          // Vazio de propósito (mesmo motivo de finalize-catalog): sem capa
          // própria, a Capa usa a foto da tela final do preset.
          coverUrl: '',
          showCover: true,
          showInstructions: false,
          showContactCta: false,
          showFullApp: false,
        }),
        billing_provider: 'cakto',
        preview_expires_at: previewExpiresAt,
        preview_code: previewCode,
        acquisition_source: input.acquisitionSource,
      })
      .select('id')
      .single();

    if (!error && data) {
      orderData = data;
      break;
    }
    if (error?.code !== '23505' || !String(error.message || '').includes('preview_code')) {
      console.error('[SelfServeCatalog] Erro ao criar pedido:', error);
      return { ok: false, reason: 'db_error' };
    }
  }

  if (!orderData) return { ok: false, reason: 'db_error' };

  const procedures = preset.procedures.filter((p) => PREVIEW_PROCEDURE_IDS.includes(p.id));
  const { error: servicesErr } = await supabaseAdmin
    .from('order_services')
    .insert(buildServicesPayload(procedures.length ? procedures : preset.procedures.slice(0, 6), orderData.id));

  if (servicesErr) {
    console.error('[SelfServeCatalog] Erro ao gravar procedimentos:', servicesErr);
    await supabaseAdmin.from('orders').delete().eq('id', orderData.id);
    return { ok: false, reason: 'db_error' };
  }

  return { ok: true, orderId: orderData.id, slug: slugResult.slug, previewCode, previewExpiresAt };
}
