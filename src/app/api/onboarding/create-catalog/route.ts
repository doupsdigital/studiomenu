import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { NicheType, LayoutModel, ThemeVariant } from '@/types/catalog';
import { nichePresetsMap } from '@/data/niche-presets';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { buildOrderInsertPayload, buildServicesPayload, generateUniqueSlug } from '@/lib/order-payload';

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

    const finalSlug = await generateUniqueSlug(clientName);

    const coverUrl =
      layoutModel === 'classico' ? '/modelos/classico/assets/img/Hero.png' : '/modelos/mosaico/assets/img/Hero.png';

    const { data: orderData, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert(
        buildOrderInsertPayload({
          slug: finalSlug,
          clientName,
          whatsappNumber: whatsappDigits,
          niche,
          layoutModel,
          themeVariant,
          coverUrl,
        })
      )
      .select()
      .single();

    if (orderErr) {
      console.error('[Onboarding Create Catalog] Erro ao criar pedido:', orderErr);
      return NextResponse.json({ success: false, message: 'Erro ao criar o catálogo. Tente novamente.' }, { status: 500 });
    }

    if (preset.procedures.length > 0) {
      const servicesPayload = buildServicesPayload(preset.procedures, orderData.id);

      const { error: servicesErr } = await supabaseAdmin.from('order_services').insert(servicesPayload);
      if (servicesErr) {
        console.error('[Onboarding Create Catalog] Erro ao gravar procedimentos:', servicesErr);
        return NextResponse.json({ success: false, message: 'Erro ao gravar os procedimentos do catálogo.' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      slug: finalSlug,
      editToken: orderData.edit_token,
    });
  } catch (error: any) {
    console.error('[Onboarding Create Catalog Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno ao criar o catálogo.' }, { status: 500 });
  }
}
