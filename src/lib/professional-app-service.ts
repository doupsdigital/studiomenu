import { supabaseAdmin } from './supabase-admin';

export interface ProfessionalOrderSummary {
  id: string;
  slug: string;
  edit_token: string;
  client_name: string;
  studio_name?: string;
  whatsapp_number: string;
  plan_tier: 'catalog' | 'plus';
  subscription_status: 'none' | 'ativo' | 'suspenso' | 'cancelado';
}

/** Busca os dados que o app da profissional (`/app/[slug]`) precisa — um
 *  recorte diferente do `getCatalogBySlug` (que monta o shape público do
 *  catálogo): inclui `edit_token` e os campos de assinatura do Plus. */
export async function getOrderForProfessionalApp(slug: string): Promise<ProfessionalOrderSummary | null> {
  const normalizedSlug = slug.toLowerCase().trim();

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, slug, edit_token, client_name, studio_name, whatsapp_number, plan_tier, subscription_status')
    .eq('slug', normalizedSlug)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.slug,
    edit_token: data.edit_token,
    client_name: data.client_name || normalizedSlug,
    studio_name: data.studio_name || undefined,
    whatsapp_number: data.whatsapp_number || '',
    plan_tier: data.plan_tier === 'plus' ? 'plus' : 'catalog',
    subscription_status: ['ativo', 'suspenso', 'cancelado'].includes(data.subscription_status)
      ? data.subscription_status
      : 'none',
  };
}
