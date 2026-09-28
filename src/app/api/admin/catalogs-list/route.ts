import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequestAuthorized } from '@/lib/admin-session';
import { assignAppShortCode } from '@/lib/short-link';

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

    const catalogs = data || [];
    // Backfill sob demanda (Fase 25) — cobre tanto catálogos criados antes
    // dessa funcionalidade quanto novos, sem precisar de uma migração de
    // dados separada.
    await Promise.all(
      catalogs
        .filter((c) => !c.app_short_code)
        .map(async (c) => {
          c.app_short_code = await assignAppShortCode(c.id);
        })
    );

    return NextResponse.json({ success: true, catalogs });
  } catch (error: any) {
    console.error('[Admin Catalogs List Exception]:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Erro interno.' }, { status: 500 });
  }
}
