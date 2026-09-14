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
    .select('subscription_status, client_name, slug')
    .eq('id', orderId)
    .single();

  // `booking_enabled` liga junto — sem isso, pagar o Plus não fazia o
  // agendamento automático funcionar de verdade pro cliente final até o
  // admin lembrar de ligar manualmente o toggle no painel (achado da
  // revisão pós-Fase 7, ver docs/PLANO_AGENDAMENTO_STUDIOMENU_PLUS.md).
  await supabaseAdmin
    .from('orders')
    .update({ plan_tier: 'plus', subscription_status: 'ativo', booking_enabled: true })
    .eq('id', orderId);

  if (before && before.subscription_status !== 'ativo') {
    const nowStr = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    await sendTelegramMessage(
      `💳 Nova assinatura StudioMenu+!\n\n👤 ${before.client_name}\n🔗 https://studiomenu.art/c/${before.slug}\n🕒 ${nowStr}`
    );
  }
}

export async function setSubscriptionStatus(
  orderId: string,
  status: 'suspenso' | 'cancelado'
): Promise<void> {
  // Cancelamento definitivo desliga `booking_enabled` junto — ela parou de
  // pagar, o agendamento pro cliente final para de funcionar. Suspensão
  // (pagamento atrasado, pode ser passageiro) não mexe em `booking_enabled`
  // de propósito — evita cortar o agendamento de clientes já em andamento
  // por um atraso pontual; o toggle manual do admin continua disponível
  // como via de escape se for preciso agir antes disso.
  const updates: { subscription_status: string; booking_enabled?: boolean } = { subscription_status: status };
  if (status === 'cancelado') {
    updates.booking_enabled = false;
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
