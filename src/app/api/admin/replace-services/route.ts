import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequestAuthorized } from '@/lib/admin-session';
import { buildServicesPayload } from '@/lib/order-payload';
import { ProcedureItem } from '@/types/catalog';

/** Substitui TODOS os serviços de um catálogo já publicado pelos extraídos via
 *  IA ("Cadastrar Serviços com IA", /admin/catalogos) — uso exclusivo do admin,
 *  nunca exposto no self-edit da profissional. Apaga tudo que existe hoje em
 *  `order_services` pro pedido e insere a lista nova (decisão explícita da
 *  usuária: os 4 serviços padrão são só placeholder, substituir e não somar).
 *
 *  Mexe só em `order_services` — nunca em `orders`. Rotas que editam o
 *  catálogo inteiro (ex: /api/catalog/save) usam buildOrderUpdatePayload, que
 *  escreve ~20 colunas de `orders` incondicionalmente; chamar isso aqui com um
 *  catalogData parcial (só procedures) apagaria nome, bio, whatsapp etc. do
 *  catálogo real da cliente. */
export async function POST(request: Request) {
  if (!(await isAdminRequestAuthorized())) {
    return NextResponse.json({ success: false, message: 'Não autorizado.' }, { status: 403 });
  }

  try {
    const { orderId, procedures } = (await request.json()) as {
      orderId: string;
      procedures: ProcedureItem[];
    };

    if (!orderId || !Array.isArray(procedures) || procedures.length === 0) {
      return NextResponse.json(
        { success: false, message: 'orderId e ao menos 1 procedimento são obrigatórios.' },
        { status: 400 }
      );
    }

    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ success: false, message: 'Catálogo não encontrado.' }, { status: 404 });
    }

    const { error: deleteError } = await supabaseAdmin.from('order_services').delete().eq('order_id', orderId);
    if (deleteError) {
      console.error('[Admin Replace Services] Erro ao apagar serviços atuais:', deleteError);
      return NextResponse.json({ success: false, message: 'Erro ao apagar os serviços atuais do catálogo.' }, { status: 500 });
    }

    const rows = buildServicesPayload(procedures, orderId).map((row) => {
      // Full replace: nenhum id provisório (da IA ou do preset) é um UUID de
      // banco de verdade — sempre INSERT novo, nunca upsert por id antigo.
      const { id, ...rest } = row;
      return rest;
    });

    const { error: insertError } = await supabaseAdmin.from('order_services').insert(rows);
    if (insertError) {
      console.error('[Admin Replace Services] Erro ao inserir novos serviços:', insertError);
      return NextResponse.json({ success: false, message: 'Erro ao salvar os novos serviços do catálogo.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Admin Replace Services Exception]:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Erro interno ao substituir os serviços.' }, { status: 500 });
  }
}
