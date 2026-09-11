import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ProcedureItem, NicheType, LayoutModel, ThemeVariant } from '@/types/catalog';
import { isAdminRequestAuthorized } from '@/lib/admin-session';
import { buildOrderInsertPayload, buildServicesPayload } from '@/lib/order-payload';
import { isAllowedImageType } from '@/lib/file-validation';

const MAX_COVER_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(request: Request) {
  try {
    if (!(await isAdminRequestAuthorized())) {
      return NextResponse.json({ success: false, message: 'Não autorizado.' }, { status: 403 });
    }

    const formData = await request.formData();
    const clientName = (formData.get('clientName') as string) || '';
    const whatsappNumber = (formData.get('whatsappNumber') as string) || '';
    const instagramHandle = (formData.get('instagramHandle') as string) || '';
    const niche = (formData.get('niche') as string) || 'lash';
    const layoutModel = (formData.get('layoutModel') as string) || 'mosaico';
    const themeVariant = (formData.get('themeVariant') as string) || 'rose';
    const proceduresRaw = (formData.get('procedures') as string) || '[]';
    const coverFile = formData.get('coverFile') as File | null;

    if (!clientName || !whatsappNumber) {
      return NextResponse.json({ success: false, message: 'Nome e WhatsApp são obrigatórios.' }, { status: 400 });
    }

    let procedures: ProcedureItem[] = [];
    try {
      procedures = JSON.parse(proceduresRaw);
    } catch {
      return NextResponse.json({ success: false, message: 'Lista de procedimentos inválida.' }, { status: 400 });
    }

    const baseSlug = clientName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const finalSlug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

    let coverUrl = layoutModel === 'classico' ? '/modelos/classico/assets/img/Hero.png' : '/modelos/mosaico/assets/img/Hero.png';

    if (coverFile) {
      if (!isAllowedImageType(coverFile.type)) {
        return NextResponse.json({ success: false, message: 'Formato de imagem não suportado. Use JPG, PNG, WEBP ou GIF.' }, { status: 400 });
      }
      if (coverFile.size > MAX_COVER_SIZE) {
        return NextResponse.json({ success: false, message: 'Foto de capa muito grande. O limite é 8MB.' }, { status: 400 });
      }

      const fileExt = coverFile.name.split('.').pop() || 'jpg';
      const fileName = `${finalSlug}/${Date.now()}_cover.${fileExt}`;
      const buffer = Buffer.from(await coverFile.arrayBuffer());

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('catalog-assets')
        .upload(fileName, buffer, { contentType: coverFile.type, upsert: true });

      if (uploadError) {
        console.error('[Finalize Catalog] Erro no upload da capa:', uploadError);
        return NextResponse.json({ success: false, message: 'Erro ao enviar a foto de capa.' }, { status: 500 });
      }

      const { data: publicUrlData } = supabaseAdmin.storage.from('catalog-assets').getPublicUrl(uploadData.path);
      coverUrl = publicUrlData.publicUrl;
    }

    const { data: orderData, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert(
        buildOrderInsertPayload({
          slug: finalSlug,
          clientName,
          whatsappNumber: whatsappNumber.replace(/\D/g, ''),
          instagramHandle,
          niche: niche as NicheType,
          layoutModel: layoutModel as LayoutModel,
          themeVariant: themeVariant as ThemeVariant,
          coverUrl,
        })
      )
      .select()
      .single();

    if (orderErr) {
      console.error('[Finalize Catalog] Erro ao criar pedido:', orderErr);
      return NextResponse.json({ success: false, message: 'Erro ao criar o catálogo. Tente novamente.' }, { status: 500 });
    }

    if (procedures.length > 0) {
      const servicesPayload = buildServicesPayload(procedures, orderData.id);

      const { error: servicesErr } = await supabaseAdmin.from('order_services').insert(servicesPayload);
      if (servicesErr) {
        console.error('[Finalize Catalog] Erro ao gravar procedimentos:', servicesErr);
        return NextResponse.json({ success: false, message: 'Erro ao gravar os procedimentos do catálogo.' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      slug: finalSlug,
      editToken: orderData.edit_token,
    });
  } catch (error: any) {
    console.error('[Finalize Catalog Exception]:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Erro interno ao criar o catálogo.' }, { status: 500 });
  }
}
