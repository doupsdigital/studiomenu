import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { CatalogOrderData } from '@/types/catalog';
import { buildOrderUpdatePayload, buildServicesPayload, isValidServiceId } from '@/lib/order-payload';

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
    //
    // Upsert em vez de apagar-e-reinserir tudo: procedimentos que já têm um
    // id de banco (UUID) são atualizados no lugar, mantendo o id estável;
    // só procedimentos novos (id provisório do cliente) geram INSERT com id
    // novo; só o que foi de fato removido no editor é apagado. Isso existe
    // pra não quebrar agendamentos que referenciam order_services.id (ver
    // docs/PLANO_AGENDAMENTO_STUDIOMENU_PLUS.md, Fase 0) — antes, o id de
    // todo procedimento mudava a cada save, mesmo sem edição nenhuma nele.
    // Mapa id-provisório → id-real (pedido real, 2026-10-22, ver
    // comentário mais abaixo sobre por que isso agora importa de verdade).
    const idMap: Record<string, string> = {};

    if (Array.isArray(catalogData.procedures)) {
      const rows = buildServicesPayload(catalogData.procedures, orderId);
      const rowsWithId = rows.filter((r) => isValidServiceId(r.id as string | undefined));
      const rowsWithoutId = rows.filter((r) => !isValidServiceId(r.id as string | undefined));
      // Mesmo filtro aplicado direto nos procedimentos originais (não nas
      // rows, que não carregam `id` nenhum pros provisórios) — preserva a
      // MESMA ordem relativa de `rowsWithoutId`, pra conseguir casar cada
      // id provisório com o id real devolvido pelo INSERT logo abaixo.
      const provisionalIdsForNewRows = catalogData.procedures
        .filter((p) => !isValidServiceId(p.id))
        .map((p) => p.id);
      const keepIds = new Set<string>(rowsWithId.map((r) => r.id as string));

      if (rowsWithId.length > 0) {
        const { error: upsertErr } = await supabaseAdmin
          .from('order_services')
          .upsert(rowsWithId, { onConflict: 'id' });

        if (upsertErr) {
          console.error('[API Catalog Save] Erro ao atualizar order_services (upsert):', upsertErr);
          return NextResponse.json(
            { success: false, message: 'Erro ao salvar os procedimentos do catálogo.' },
            { status: 500 }
          );
        }
      }

      if (rowsWithoutId.length > 0) {
        const { data: inserted, error: insertErr } = await supabaseAdmin
          .from('order_services')
          .insert(rowsWithoutId)
          .select('id');

        if (insertErr) {
          console.error('[API Catalog Save] Erro ao inserir novos order_services:', insertErr);
          return NextResponse.json(
            { success: false, message: 'Erro ao salvar os procedimentos do catálogo.' },
            { status: 500 }
          );
        }
        // Devolve o id real pro cliente trocar o provisório (pedido real,
        // 2026-10-22) — sem isso, salvar de novo o MESMO procedimento novo
        // antes de recarregar a página (agora bem mais provável, já que o
        // "Salvar Alterações" do Procedimento passou a persistir na hora)
        // inseria uma linha DUPLICADA a cada vez, em vez de atualizar a
        // mesma — o cliente nunca aprendia o id real da primeira vez.
        (inserted || []).forEach((r, i) => {
          const realId = r.id as string;
          keepIds.add(realId);
          const provisionalId = provisionalIdsForNewRows[i];
          if (provisionalId) idMap[provisionalId] = realId;
        });
      }

      // Apaga só os procedimentos que o editor de fato removeu (existiam no
      // banco pra este catálogo, mas não vieram no payload desta gravação).
      const { data: existingRows, error: existingErr } = await supabaseAdmin
        .from('order_services')
        .select('id')
        .eq('order_id', orderId);

      if (existingErr) {
        console.error('[API Catalog Save] Erro ao listar order_services existentes:', existingErr);
      } else {
        const toDelete = (existingRows || [])
          .map((r) => r.id as string)
          .filter((id) => !keepIds.has(id));

        if (toDelete.length > 0) {
          const { error: deleteErr } = await supabaseAdmin
            .from('order_services')
            .delete()
            .in('id', toDelete);

          if (deleteErr) {
            console.error('[API Catalog Save] Erro ao apagar order_services removidos:', deleteErr);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Catálogo publicado com sucesso!',
      idMap,
    });
  } catch (error: any) {
    console.error('[API Catalog Save Exception]:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro interno ao salvar catálogo.' },
      { status: 500 }
    );
  }
}
