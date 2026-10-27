import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequestAuthorized } from '@/lib/admin-session';
import { AsaasConfigError, AsaasApiError, cancelSubscription } from '@/lib/asaas';

export async function PATCH(request: Request) {
  if (!(await isAdminRequestAuthorized())) {
    return NextResponse.json({ success: false, message: 'Não autorizado.' }, { status: 403 });
  }

  try {
    const {
      id,
      status,
      booking_enabled,
      first_offer_tier,
      catalog_disabled,
      plan_tier,
      subscription_status,
      manual_plan,
      billing_price_override,
      catalog_billing_mode,
      agenda_billing_mode,
      agenda_price_override,
      lifetime_price_override,
      show_cover,
      show_instructions,
      show_contact_cta,
      show_full_app,
    } = (await request.json()) as {
      id: string;
      status?: string;
      booking_enabled?: boolean;
      first_offer_tier?: 'basico' | 'plus';
      catalog_disabled?: boolean;
      plan_tier?: 'catalog' | 'basico' | 'plus';
      subscription_status?: 'none' | 'ativo' | 'suspenso' | 'cancelado';
      manual_plan?: boolean;
      /** Flags do produto "Catálogo apenas" (2026-10-27) — editáveis a
       *  qualquer momento, mesmo depois do catálogo já criado. */
      show_cover?: boolean;
      show_instructions?: boolean;
      show_contact_cta?: boolean;
      show_full_app?: boolean;
      /** Preço customizado do Plano Catálogo pra essa cliente específica —
       *  `null` volta ao padrão (`CATALOGO_PRICE`, src/lib/pricing.ts). */
      billing_price_override?: number | null;
      /** Se o Plano Catálogo dessa cliente é vendido avulso, como assinatura
       *  mensal (Fase 27) ou anual (2026-10-15) — só tem efeito ANTES de ela
       *  pagar. */
      catalog_billing_mode?: 'avulso' | 'recorrente' | 'anual';
      /** Se o Plano Agenda dessa cliente é vendido mensal ou anual
       *  (2026-10-15) — só tem efeito ANTES de ela pagar o Agenda. */
      agenda_billing_mode?: 'recorrente' | 'anual';
      /** Preço customizado do Plano Agenda — campo PRÓPRIO, separado de
       *  `billing_price_override` (2026-10-15). `null` volta ao padrão
       *  (`AGENDA_PRICE`/`AGENDA_ANUAL_PRICE`, src/lib/pricing.ts). */
      agenda_price_override?: number | null;
      /** Preço customizado da conversão de Catálogo recorrente pra vitalício
       *  (Fase 28) — `null` volta ao padrão (`CATALOGO_VITALICIO_PRICE`,
       *  src/lib/pricing.ts). */
      lifetime_price_override?: number | null;
    };
    if (
      !id ||
      (status === undefined &&
        booking_enabled === undefined &&
        first_offer_tier === undefined &&
        catalog_disabled === undefined &&
        plan_tier === undefined &&
        subscription_status === undefined &&
        manual_plan === undefined &&
        billing_price_override === undefined &&
        catalog_billing_mode === undefined &&
        agenda_billing_mode === undefined &&
        agenda_price_override === undefined &&
        lifetime_price_override === undefined &&
        show_cover === undefined &&
        show_instructions === undefined &&
        show_contact_cta === undefined &&
        show_full_app === undefined)
    ) {
      return NextResponse.json(
        { success: false, message: 'id e ao menos um campo pra atualizar são obrigatórios.' },
        { status: 400 }
      );
    }

    if (billing_price_override !== undefined && billing_price_override !== null) {
      if (!Number.isFinite(billing_price_override) || billing_price_override < 5) {
        return NextResponse.json({ success: false, message: 'Preço inválido (mínimo R$5).' }, { status: 400 });
      }
    }
    if (agenda_price_override !== undefined && agenda_price_override !== null) {
      if (!Number.isFinite(agenda_price_override) || agenda_price_override < 5) {
        return NextResponse.json({ success: false, message: 'Preço inválido (mínimo R$5).' }, { status: 400 });
      }
    }
    if (lifetime_price_override !== undefined && lifetime_price_override !== null) {
      if (!Number.isFinite(lifetime_price_override) || lifetime_price_override < 5) {
        return NextResponse.json({ success: false, message: 'Preço inválido (mínimo R$5).' }, { status: 400 });
      }
    }

    const updates: {
      status?: string;
      booking_enabled?: boolean;
      first_offer_tier?: 'basico' | 'plus';
      catalog_disabled?: boolean;
      plan_tier?: 'catalog' | 'basico' | 'plus';
      subscription_status?: 'none' | 'ativo' | 'suspenso' | 'cancelado';
      manual_plan?: boolean;
      billing_price_override?: number | null;
      catalog_billing_mode?: 'avulso' | 'recorrente' | 'anual';
      agenda_billing_mode?: 'recorrente' | 'anual';
      agenda_price_override?: number | null;
      lifetime_price_override?: number | null;
      show_cover?: boolean;
      show_instructions?: boolean;
      show_contact_cta?: boolean;
      show_full_app?: boolean;
      /** Só escrito internamente aqui (nunca vem do request) — limpa a
       *  assinatura real cancelada ao conceder plano manual, ver abaixo. */
      asaas_subscription_id?: string | null;
      pending_plan_tier?: 'basico' | 'plus' | null;
      pending_lifetime_payment_id?: string | null;
    } = {};
    if (status !== undefined) updates.status = status;
    if (booking_enabled !== undefined) updates.booking_enabled = booking_enabled;
    if (first_offer_tier !== undefined) updates.first_offer_tier = first_offer_tier;
    if (catalog_disabled !== undefined) updates.catalog_disabled = catalog_disabled;
    if (plan_tier !== undefined) updates.plan_tier = plan_tier;
    if (subscription_status !== undefined) updates.subscription_status = subscription_status;
    if (manual_plan !== undefined) updates.manual_plan = manual_plan;
    if (billing_price_override !== undefined) updates.billing_price_override = billing_price_override;
    if (catalog_billing_mode !== undefined) updates.catalog_billing_mode = catalog_billing_mode;
    if (agenda_billing_mode !== undefined) updates.agenda_billing_mode = agenda_billing_mode;
    if (agenda_price_override !== undefined) updates.agenda_price_override = agenda_price_override;
    if (lifetime_price_override !== undefined) updates.lifetime_price_override = lifetime_price_override;
    if (show_cover !== undefined) updates.show_cover = show_cover;
    if (show_instructions !== undefined) updates.show_instructions = show_instructions;
    if (show_contact_cta !== undefined) updates.show_contact_cta = show_contact_cta;
    if (show_full_app !== undefined) updates.show_full_app = show_full_app;

    // Conceder plano manual (Fase 26) numa cliente que JÁ tem uma assinatura
    // Asaas de verdade por trás (Fase 27: Plano Catálogo recorrente, ou um
    // Plano Agenda ativo) precisa cancelar essa assinatura antes — senão o
    // app passa a mostrar "Sem cobrança — concedido manualmente" enquanto o
    // Asaas continua cobrando ela todo mês por baixo dos panos (achado real,
    // 2026-10-07: só virou um risco de verdade depois que o Catálogo passou
    // a poder ser recorrente). Se o cancelamento falhar, não aplica nada do
    // PATCH — a admin fica sabendo na hora em vez de a cliente continuar
    // sendo cobrada com a tela já dizendo "sem cobrança".
    if (manual_plan === true) {
      const { data: existing, error: fetchErr } = await supabaseAdmin
        .from('orders')
        .select('asaas_subscription_id')
        .eq('id', id)
        .single();
      if (fetchErr) {
        console.error('[Admin Catalog Actions] Erro ao buscar assinatura antes de conceder manual:', fetchErr);
        return NextResponse.json({ success: false, message: 'Erro ao conceder o plano manual.' }, { status: 500 });
      }
      if (existing?.asaas_subscription_id) {
        try {
          await cancelSubscription(existing.asaas_subscription_id);
        } catch (cancelError) {
          if (cancelError instanceof AsaasConfigError) {
            return NextResponse.json({ success: false, message: cancelError.message }, { status: 503 });
          }
          if (cancelError instanceof AsaasApiError) {
            console.error('[Admin Catalog Actions] Erro do Asaas ao cancelar antes de conceder manual:', cancelError.status, cancelError.message);
            return NextResponse.json(
              { success: false, message: 'Ela tem uma assinatura real ativa e não foi possível cancelá-la agora. Tente de novo em instantes.' },
              { status: 502 }
            );
          }
          throw cancelError;
        }
        updates.asaas_subscription_id = null;
        updates.pending_plan_tier = null;
        // Achado em auditoria (Fase 28): se ela tivesse um Pix de "virar
        // vitalício" pendente (não pago) no momento da concessão manual,
        // sem limpar esse id um pagamento futuro desse Pix velho reativaria
        // a assinatura do zero (via activateSubscription) a partir de um
        // pagamento que não tem mais nenhuma assinatura real por trás.
        updates.pending_lifetime_payment_id = null;
      }
    }

    const { error } = await supabaseAdmin.from('orders').update(updates).eq('id', id);
    if (error) {
      console.error('[Admin Catalog Actions] Erro ao atualizar status:', error);
      return NextResponse.json({ success: false, message: 'Erro ao atualizar o catálogo.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Admin Catalog Actions Exception]:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Erro interno.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequestAuthorized())) {
    return NextResponse.json({ success: false, message: 'Não autorizado.' }, { status: 403 });
  }

  try {
    const { id } = (await request.json()) as { id: string };
    if (!id) {
      return NextResponse.json({ success: false, message: 'id é obrigatório.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('orders').delete().eq('id', id);
    if (error) {
      console.error('[Admin Catalog Actions] Erro ao excluir catálogo:', error);
      return NextResponse.json({ success: false, message: 'Erro ao excluir o catálogo.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Admin Catalog Actions Exception]:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Erro interno.' }, { status: 500 });
  }
}
