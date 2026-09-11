import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequestAuthorized } from '@/lib/admin-session';

export async function PATCH(request: Request) {
  if (!(await isAdminRequestAuthorized())) {
    return NextResponse.json({ success: false, message: 'Não autorizado.' }, { status: 403 });
  }

  try {
    const { id, status } = (await request.json()) as { id: string; status: string };
    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'id e status são obrigatórios.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('orders').update({ status }).eq('id', id);
    if (error) {
      console.error('[Admin Catalog Actions] Erro ao atualizar status:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
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
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Admin Catalog Actions Exception]:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Erro interno.' }, { status: 500 });
  }
}
