import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';

/** POST /api/professional/full-catalog-offer-decision
 *  Body: { slug, decision: 'accepted' | 'declined' }
 *  Grava a decisão dela sobre a oferta "Catálogo Completo" (2026-10-28).
 *  - `declined`: some com a oferta pra sempre (até o admin religar o toggle
 *    em /admin/catalogos, que sempre reseta pra 'pending').
 *  - `accepted` (só faz sentido ANTES de pagar qualquer coisa —
 *    `FullCatalogOfferCard alreadyPaid={false}`): o próximo checkout do
 *    Catálogo passa a cobrar o preço cheio (ver `fullCatalogAccepted`,
 *    `src/app/api/billing/checkout/route.ts`). Quem já pagou usa o endpoint
 *    dedicado `/api/billing/upgrade-to-full-catalog`, que já marca
 *    `accepted` sozinho ao criar a cobrança — não precisa chamar este
 *    endpoint pra isso. */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`professional-full-catalog-decision:${ip}`, 20, 5 * 60);
    if (!allowed) {
      return NextResponse.json({ success: false, message: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 });
    }

    const body = await request.json();
    const { slug, decision } = body as { slug?: string; decision?: string };

    if (!slug || (decision !== 'accepted' && decision !== 'declined')) {
      return NextResponse.json({ success: false, message: 'Dados inválidos.' }, { status: 400 });
    }

    const normalizedSlug = slug.toLowerCase().trim();
    if (!(await isProfessionalRequestAuthorized(normalizedSlug))) {
      return NextResponse.json({ success: false, message: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('id, full_catalog_offer_enabled')
      .eq('slug', normalizedSlug)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ success: false, message: 'Catálogo não encontrado.' }, { status: 404 });
    }

    if (!order.full_catalog_offer_enabled) {
      return NextResponse.json({ success: false, message: 'Essa oferta não está disponível agora.' }, { status: 400 });
    }

    const { error: updateErr } = await supabaseAdmin
      .from('orders')
      .update({ full_catalog_offer_decision: decision })
      .eq('id', order.id);
    if (updateErr) {
      console.error('[API Full Catalog Offer Decision] Erro ao atualizar:', updateErr);
      return NextResponse.json({ success: false, message: 'Erro ao salvar.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, decision });
  } catch (error) {
    console.error('[API Full Catalog Offer Decision Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
