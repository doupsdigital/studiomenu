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
  billing_email?: string;
  billing_cpf_cnpj?: string;
  /** Se o agendamento automático está de fato ligado pro cliente final — via
   *  assinatura Plus ativa OU via toggle manual do admin (Fase 6). É essa
   *  flag, não o plano, que decide se a Agenda mostra conteúdo real ou o
   *  upsell (ver docs/PLANO_AGENDAMENTO_STUDIOMENU_PLUS.md, achado da
   *  revisão pós-Fase 7). */
  booking_enabled: boolean;
}

/** Busca os dados que o app da profissional (`/app/[slug]`) precisa — um
 *  recorte diferente do `getCatalogBySlug` (que monta o shape público do
 *  catálogo): inclui `edit_token` e os campos de assinatura do Plus. */
export async function getOrderForProfessionalApp(slug: string): Promise<ProfessionalOrderSummary | null> {
  const normalizedSlug = slug.toLowerCase().trim();

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, slug, edit_token, client_name, studio_name, whatsapp_number, plan_tier, subscription_status, billing_email, billing_cpf_cnpj, booking_enabled')
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
    billing_email: data.billing_email || undefined,
    billing_cpf_cnpj: data.billing_cpf_cnpj || undefined,
    booking_enabled: Boolean(data.booking_enabled),
  };
}
