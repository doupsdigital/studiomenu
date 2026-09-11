import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequestAuthorized } from '@/lib/admin-session';

export async function GET() {
  if (!(await isAdminRequestAuthorized())) {
    return NextResponse.json({ success: false, message: 'Não autorizado.' }, { status: 403 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin Catalogs List] Erro ao buscar catálogos:', error);
      return NextResponse.json({ success: false, message: 'Erro ao buscar catálogos.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, catalogs: data || [] });
  } catch (error: any) {
    console.error('[Admin Catalogs List Exception]:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Erro interno.' }, { status: 500 });
  }
}
