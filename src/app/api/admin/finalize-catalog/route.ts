import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ProcedureItem, NicheType } from '@/types/catalog';
import { nichePresetsMap } from '@/data/niche-presets';

const MAX_COVER_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(request: Request) {
  try {
    const adminSecret = request.headers.get('x-admin-secret');
    if (!adminSecret || adminSecret !== process.env.ADMIN_API_SECRET) {
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

    const preset = nichePresetsMap[niche as NicheType] || nichePresetsMap.lash;

    let coverUrl = layoutModel === 'classico' ? '/modelos/classico/assets/img/Hero.png' : '/modelos/mosaico/assets/img/Hero.png';

    if (coverFile) {
      if (!coverFile.type.startsWith('image/')) {
        return NextResponse.json({ success: false, message: 'A foto de capa precisa ser uma imagem.' }, { status: 400 });
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
      .insert({
        slug: finalSlug,
        client_name: clientName,
        cover_media_url: coverUrl,
        avatar_url: coverUrl,
        instructions_bg_url: preset.instructions_bg_url || null,
        final_screen_bg_url: preset.final_screen_bg_url || null,
        cta_bg_url: preset.cta_bg_url || null,
        niche,
        layout_model: layoutModel,
        theme_variant: themeVariant,
        whatsapp_number: whatsappNumber.replace(/\D/g, ''),
        instagram_handle: instagramHandle,
        address: '',
        tolerances: preset.instructions?.tolerances || 'Tolerância máxima de 15 minutos de atraso.',
        pre_care: preset.instructions?.pre_care || [],
        post_care: preset.instructions?.post_care || [],
        categories: [],
      })
      .select()
      .single();

    if (orderErr) {
      console.error('[Finalize Catalog] Erro ao criar pedido:', orderErr);
      return NextResponse.json({ success: false, message: orderErr.message }, { status: 500 });
    }

    if (procedures.length > 0) {
      const servicesPayload = procedures.map((p, index) => ({
        order_id: orderData.id,
        order_index: index,
        title: p.title,
        description: p.description || '',
        price: p.price || 'Sob Consulta',
        duration: p.duration || '',
        category: p.category || 'Geral',
        image_url: p.image_url || '',
        is_highlight: Boolean(p.is_highlight),
        badge: p.badge || '',
      }));

      const { error: servicesErr } = await supabaseAdmin.from('order_services').insert(servicesPayload);
      if (servicesErr) {
        console.error('[Finalize Catalog] Erro ao gravar procedimentos:', servicesErr);
        return NextResponse.json({ success: false, message: servicesErr.message }, { status: 500 });
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
