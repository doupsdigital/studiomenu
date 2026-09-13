import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequestAuthorized } from '@/lib/admin-session';

export async function PATCH(request: Request) {
  if (!(await isAdminRequestAuthorized())) {
    return NextResponse.json({ success: false, message: 'Não autorizado.' }, { status: 403 });
  }

  try {
    const { id, status, booking_enabled } = (await request.json()) as {
      id: string;
      status?: string;
      booking_enabled?: boolean;
    };
    if (!id || (status === undefined && booking_enabled === undefined)) {
      return NextResponse.json({ success: false, message: 'id e status/booking_enabled são obrigatórios.' }, { status: 400 });
    }

    const updates: { status?: string; booking_enabled?: boolean } = {};
    if (status !== undefined) updates.status = status;
    if (booking_enabled !== undefined) updates.booking_enabled = booking_enabled;

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
