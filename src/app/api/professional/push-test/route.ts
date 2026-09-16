import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isProfessionalRequestAuthorized } from '@/lib/professional-session';
import { sendPushToOrder } from '@/lib/push-notifications';

/** POST /api/professional/push-test
 *  Manda uma notificação de teste pros dispositivos inscritos do catálogo.
 *  Existe porque a permissão que o site pede (`Notification.permission`)
 *  pode aparecer como concedida mesmo com a notificação do Chrome desligada
 *  no nível do Android — o único jeito confiável de saber se realmente
 *  funciona é mandar uma de verdade e perguntar pra profissional se chegou. */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const slug = (body?.slug || '').toLowerCase().trim();
    if (!slug) {
      return NextResponse.json({ success: false, message: 'Parâmetros inválidos.' }, { status: 400 });
    }

    const isAuthorized = await isProfessionalRequestAuthorized(slug);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    const { data: order, error: orderError } = await supabaseAdmin.from('orders').select('id').eq('slug', slug).single();
    if (orderError || !order) {
      return NextResponse.json({ success: false, message: 'Catálogo não encontrado.' }, { status: 404 });
    }

    await sendPushToOrder(order.id, {
      title: 'Notificação de teste',
      body: 'Se você recebeu isso, as notificações do StudioMenu estão funcionando neste dispositivo.',
      url: `/app/${slug}/config`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Push Test Exception]:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
