import { supabaseAdmin } from './supabase-admin';
import { sendTelegramMessage } from './telegram';

/** Lógica de ativação/desativação da assinatura — usada tanto pelo webhook
 *  quanto pelo polling de fallback (check-payment), pra garantir que os dois
 *  caminhos decidem exatamente a mesma coisa (resiliência dupla, mesmo
 *  espírito do LashAgenda, mas de fato compartilhada aqui, não duplicada). */

/** Ativa a assinatura e avisa o dono do produto no Telegram — só na
 *  transição de verdade (não estava "ativo" antes), pra não duplicar o
 *  aviso quando o webhook e o check-payment confirmam o mesmo pagamento
 *  quase ao mesmo tempo. */
export async function activateSubscription(orderId: string): Promise<void> {
  const { data: before } = await supabaseAdmin
    .from('orders')
    .select('subscription_status, client_name, slug, pending_plan_tier')
    .eq('id', orderId)
    .single();

  // Qual tier essa confirmação de pagamento é PARA — setado no checkout
  // antes de criar/atualizar a assinatura no Asaas (Fase 19). Sem
  // `pending_plan_tier` (dado antigo, ou fluxo legado) assume Plus, único
  // tier que existia antes dessa fase.
  const tier = before?.pending_plan_tier === 'basico' ? 'basico' : 'plus';

  // `booking_enabled` liga junto só pro Plus — sem isso, pagar o Plus não
  // fazia o agendamento automático funcionar de verdade pro cliente final
  // até o admin lembrar de ligar manualmente o toggle no painel (achado da
  // revisão pós-Fase 7, ver docs/PLANO_AGENDAMENTO_STUDIOMENU_PLUS.md). O
  // Básico nunca liga agendamento (só catálogo + edição).
  await supabaseAdmin
    .from('orders')
    .update({ plan_tier: tier, subscription_status: 'ativo', booking_enabled: tier === 'plus', pending_plan_tier: null })
    .eq('id', orderId);

  if (before && before.subscription_status !== 'ativo') {
    const nowStr = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const planLabel = tier === 'basico' ? 'StudioMenu Básico' : 'StudioMenu+';
    await sendTelegramMessage(
      `💳 Nova assinatura ${planLabel}!\n\n👤 ${before.client_name}\n🔗 https://studiomenu.art/c/${before.slug}\n🕒 ${nowStr}`
    );
  }
}

export async function setSubscriptionStatus(
  orderId: string,
  status: 'suspenso' | 'cancelado'
): Promise<void> {
  // Cancelamento definitivo desliga `booking_enabled` junto — ela parou de
  // pagar, o agendamento pro cliente final para de funcionar. Também limpa
  // `asaas_subscription_id`/`pending_plan_tier` — sem isso, um cancelamento
  // que chega só pelo webhook (ex: assinatura excluída direto no painel do
  // Asaas, sem passar pelo botão "Cancelar" do app) deixava um id de
  // assinatura morta preso na profissional, e uma futura reassinatura ia
  // tentar reaproveitar/atualizar uma assinatura que não existe mais no
  // Asaas (Fase 19, achado pós-implementação do tier Básico). Suspensão
  // (pagamento atrasado, pode ser passageiro) não mexe em nenhum dos dois
  // de propósito — evita cortar o agendamento de clientes já em andamento
  // por um atraso pontual; o toggle manual do admin continua disponível
  // como via de escape se for preciso agir antes disso.
  const updates: { subscription_status: string; booking_enabled?: boolean; asaas_subscription_id?: null; pending_plan_tier?: null } = {
    subscription_status: status,
  };
  if (status === 'cancelado') {
    updates.booking_enabled = false;
    updates.asaas_subscription_id = null;
    updates.pending_plan_tier = null;
  }
  await supabaseAdmin.from('orders').update(updates).eq('id', orderId);
}

/** Resolve o `order_id` a partir de um evento do Asaas — por
 *  `asaas_subscription_id` primeiro (mais específico), com fallback pro
 *  `asaas_customer_id` (cobre o raro caso de o evento não trazer o id da
 *  assinatura). */
export async function findOrderIdByAsaasIds(input: { subscriptionId?: string | null; customerId?: string | null }): Promise<string | null> {
  if (input.subscriptionId) {
    const { data } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('asaas_subscription_id', input.subscriptionId)
      .single();
    if (data) return data.id;
  }
  if (input.customerId) {
    const { data } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('asaas_customer_id', input.customerId)
      .single();
    if (data) return data.id;
  }
  return null;
}
