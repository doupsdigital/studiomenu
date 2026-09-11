import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { NicheType, LayoutModel, ThemeVariant } from '@/types/catalog';
import { nichePresetsMap } from '@/data/niche-presets';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`onboarding-create:${ip}`, 5, 60 * 60);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'Muitos catálogos criados em pouco tempo. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { clientName, whatsappDigits, niche, layoutModel, themeVariant } = body as {
      clientName: string;
      whatsappDigits: string;
      niche: NicheType;
      layoutModel: LayoutModel;
      themeVariant: ThemeVariant;
    };

    if (!clientName || !whatsappDigits) {
      return NextResponse.json({ success: false, message: 'Nome e WhatsApp são obrigatórios.' }, { status: 400 });
    }

    const preset = nichePresetsMap[niche] || nichePresetsMap.lash;

    const baseSlug = clientName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const finalSlug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

    const coverUrl =
      layoutModel === 'classico' ? '/modelos/classico/assets/img/Hero.png' : '/modelos/mosaico/assets/img/Hero.png';

    const { data: orderData, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        slug: finalSlug,
        client_name: clientName,
        hero_phrase: preset.hero_phrase,
        bio_description: preset.bio_description || '',
        cover_media_url: coverUrl,
        avatar_url: coverUrl,
        instructions_bg_url: preset.instructions_bg_url || null,
        final_screen_bg_url: preset.final_screen_bg_url || null,
        cta_bg_url: preset.cta_bg_url || null,
        niche,
        layout_model: layoutModel,
        theme_variant: themeVariant,
        whatsapp_number: whatsappDigits,
        instagram_handle: '',
        address: '',
        tolerances: preset.instructions?.tolerances || 'Tolerância máxima de 15 minutos de atraso.',
        pre_care: preset.instructions?.pre_care || [],
        post_care: preset.instructions?.post_care || [],
        categories: [],
      })
      .select()
      .single();

    if (orderErr) {
      console.error('[Onboarding Create Catalog] Erro ao criar pedido:', orderErr);
      return NextResponse.json({ success: false, message: orderErr.message }, { status: 500 });
    }

    if (preset.procedures.length > 0) {
      const servicesPayload = preset.procedures.map((p, index) => ({
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
        specs: p.specs || [],
      }));

      const { error: servicesErr } = await supabaseAdmin.from('order_services').insert(servicesPayload);
      if (servicesErr) {
        console.error('[Onboarding Create Catalog] Erro ao gravar procedimentos:', servicesErr);
        return NextResponse.json({ success: false, message: servicesErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      slug: finalSlug,
      editToken: orderData.edit_token,
    });
  } catch (error: any) {
    console.error('[Onboarding Create Catalog Exception]:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Erro interno ao criar o catálogo.' }, { status: 500 });
  }
}
