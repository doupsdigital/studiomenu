import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequestAuthorized } from '@/lib/admin-session';

export async function PATCH(request: Request) {
  if (!(await isAdminRequestAuthorized())) {
    return NextResponse.json({ success: false, message: 'Não autorizado.' }, { status: 403 });
  }

  try {
    const { id, status, booking_enabled, first_offer_tier, catalog_disabled, plan_tier, subscription_status, manual_plan } = (await request.json()) as {
      id: string;
      status?: string;
      booking_enabled?: boolean;
      first_offer_tier?: 'basico' | 'plus';
      catalog_disabled?: boolean;
      plan_tier?: 'catalog' | 'basico' | 'plus';
      subscription_status?: 'none' | 'ativo' | 'suspenso' | 'cancelado';
      manual_plan?: boolean;
    };
    if (
      !id ||
      (status === undefined &&
        booking_enabled === undefined &&
        first_offer_tier === undefined &&
        catalog_disabled === undefined &&
        plan_tier === undefined &&
        subscription_status === undefined &&
        manual_plan === undefined)
    ) {
      return NextResponse.json(
        { success: false, message: 'id e ao menos um campo pra atualizar são obrigatórios.' },
        { status: 400 }
      );
    }

    const updates: {
      status?: string;
      booking_enabled?: boolean;
      first_offer_tier?: 'basico' | 'plus';
      catalog_disabled?: boolean;
      plan_tier?: 'catalog' | 'basico' | 'plus';
      subscription_status?: 'none' | 'ativo' | 'suspenso' | 'cancelado';
      manual_plan?: boolean;
    } = {};
    if (status !== undefined) updates.status = status;
    if (booking_enabled !== undefined) updates.booking_enabled = booking_enabled;
    if (first_offer_tier !== undefined) updates.first_offer_tier = first_offer_tier;
    if (catalog_disabled !== undefined) updates.catalog_disabled = catalog_disabled;
    if (plan_tier !== undefined) updates.plan_tier = plan_tier;
    if (subscription_status !== undefined) updates.subscription_status = subscription_status;
    if (manual_plan !== undefined) updates.manual_plan = manual_plan;

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
