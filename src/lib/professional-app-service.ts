import { supabaseAdmin } from './supabase-admin';

export interface ProfessionalOrderSummary {
  id: string;
  slug: string;
  edit_token: string;
  client_name: string;
  studio_name?: string;
  whatsapp_number: string;
  plan_tier: 'catalog' | 'basico' | 'plus';
  subscription_status: 'none' | 'ativo' | 'suspenso' | 'cancelado';
  billing_email?: string;
  billing_cpf_cnpj?: string;
  /** Forma de pagamento da assinatura atual (Fase 21) — null se nunca assinou. */
  payment_method: 'pix' | 'card' | null;
  /** Se o agendamento automático está de fato ligado pro cliente final — via
   *  assinatura Plus ativa OU via toggle manual do admin (Fase 6). É essa
   *  flag, não o plano, que decide se a Agenda mostra conteúdo real ou o
   *  upsell (ver docs/PLANO_AGENDAMENTO_STUDIOMENU_PLUS.md, achado da
   *  revisão pós-Fase 7). */
  booking_enabled: boolean;
  /** Conta do Supabase Auth vinculada pro login real (Fase 17), se a
   *  profissional já "reivindicou" o login — null enquanto ela só entra
   *  pelo link mágico. */
  auth_user_id: string | null;
  /** Qual plano aparece em destaque na tela de primeiro contato (Fase 22) —
   *  'plus' pra venda focada em agendamento automático. */
  first_offer_tier: 'basico' | 'plus';
  /** Ela mesma pausou o agendamento automático temporariamente (Fase 23) —
   *  só afeta o catálogo público (cliente final cai no WhatsApp); a Agenda
   *  dela dentro do app continua acessível normalmente. */
  agenda_paused: boolean;
}

/** Busca os dados que o app da profissional (`/app/[slug]`) precisa — um
 *  recorte diferente do `getCatalogBySlug` (que monta o shape público do
 *  catálogo): inclui `edit_token` e os campos de assinatura do Plus. */
export async function getOrderForProfessionalApp(slug: string): Promise<ProfessionalOrderSummary | null> {
  const normalizedSlug = slug.toLowerCase().trim();

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, slug, edit_token, client_name, studio_name, whatsapp_number, plan_tier, subscription_status, billing_email, billing_cpf_cnpj, payment_method, booking_enabled, auth_user_id, first_offer_tier, agenda_paused')
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
    plan_tier: data.plan_tier === 'plus' || data.plan_tier === 'basico' ? data.plan_tier : 'catalog',
    subscription_status: ['ativo', 'suspenso', 'cancelado'].includes(data.subscription_status)
      ? data.subscription_status
      : 'none',
    billing_email: data.billing_email || undefined,
    billing_cpf_cnpj: data.billing_cpf_cnpj || undefined,
    payment_method: data.payment_method === 'card' ? 'card' : data.payment_method === 'pix' ? 'pix' : null,
    booking_enabled: Boolean(data.booking_enabled),
    auth_user_id: data.auth_user_id || null,
    first_offer_tier: data.first_offer_tier === 'plus' ? 'plus' : 'basico',
    agenda_paused: Boolean(data.agenda_paused),
  };
}
