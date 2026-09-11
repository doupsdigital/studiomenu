import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { CatalogOrderData } from '@/types/catalog';
import { buildOrderUpdatePayload, buildServicesPayload } from '@/lib/order-payload';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, edit_token, catalogData } = body as {
      slug: string;
      edit_token: string;
      catalogData: CatalogOrderData;
    };

    if (!slug || !edit_token) {
      return NextResponse.json(
        { success: false, message: 'Slug e edit_token são obrigatórios.' },
        { status: 400 }
      );
    }

    // 1. Verificar se o slug e edit_token correspondem no Supabase
    const { data: existingOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, edit_token')
      .eq('slug', slug.toLowerCase().trim())
      .single();

    if (fetchError || !existingOrder) {
      return NextResponse.json(
        { success: false, message: 'Catálogo não encontrado.' },
        { status: 404 }
      );
    }

    if (existingOrder.edit_token !== edit_token) {
      return NextResponse.json(
        { success: false, message: 'Token de edição inválido ou não autorizado.' },
        { status: 403 }
      );
    }

    const orderId = existingOrder.id;

    // 2. Atualizar dados principais na tabela `orders`
    const { error: updateOrderError } = await supabaseAdmin
      .from('orders')
      .update(buildOrderUpdatePayload(catalogData))
      .eq('id', orderId);

    if (updateOrderError) {
      console.error('[API Catalog Save] Erro ao atualizar tabela orders:', updateOrderError);
      return NextResponse.json(
        { success: false, message: 'Erro ao atualizar dados gerais do catálogo.' },
        { status: 500 }
      );
    }

    // 3. Atualizar procedimentos na tabela `order_services`
    if (Array.isArray(catalogData.procedures)) {
      // Deletar procedimentos anteriores do order_id
      const { error: deleteErr } = await supabaseAdmin
        .from('order_services')
        .delete()
        .eq('order_id', orderId);

      if (deleteErr) {
        console.warn('[API Catalog Save] Aviso ao limpar order_services:', deleteErr);
      }

      // Inserir novos procedimentos com os nomes corretos da tabela
      if (catalogData.procedures.length > 0) {
        const servicesToInsert = buildServicesPayload(catalogData.procedures, orderId);

        const { error: insertServicesError } = await supabaseAdmin
          .from('order_services')
          .insert(servicesToInsert);

        if (insertServicesError) {
          console.warn('[API Catalog Save] Tentando inserção com esquema legados:', insertServicesError);
          // Fallback para nomes legados caso a tabela use nomes legados
          const legacyServicesToInsert = catalogData.procedures.map((proc, index) => ({
            order_id: orderId,
            order_index: index,
            title: proc.title,
            desc: proc.description || '',
            preco: proc.price || 'Sob Consulta',
            duracao: proc.duration || '',
            category: proc.category || 'Geral',
            img: proc.image_url || '',
            badge: proc.badge || '',
            is_highlight: Boolean(proc.is_highlight),
          }));

          await supabaseAdmin.from('order_services').insert(legacyServicesToInsert);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Catálogo publicado com sucesso!',
    });
  } catch (error: any) {
    console.error('[API Catalog Save Exception]:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro interno ao salvar catálogo.' },
      { status: 500 }
    );
  }
}
