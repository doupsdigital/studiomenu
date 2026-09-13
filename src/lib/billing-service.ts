import { supabaseAdmin } from './supabase-admin';

/** Lógica de ativação/desativação da assinatura — usada tanto pelo webhook
 *  quanto pelo polling de fallback (check-payment), pra garantir que os dois
 *  caminhos decidem exatamente a mesma coisa (resiliência dupla, mesmo
 *  espírito do LashAgenda, mas de fato compartilhada aqui, não duplicada). */

export async function activateSubscription(orderId: string): Promise<void> {
  await supabaseAdmin.from('orders').update({ plan_tier: 'plus', subscription_status: 'ativo' }).eq('id', orderId);
}

export async function setSubscriptionStatus(
  orderId: string,
  status: 'suspenso' | 'cancelado'
): Promise<void> {
  await supabaseAdmin.from('orders').update({ subscription_status: status }).eq('id', orderId);
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
