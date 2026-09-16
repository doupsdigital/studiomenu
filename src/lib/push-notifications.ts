import 'server-only';
import webpush from 'web-push';
import { supabaseAdmin } from './supabase-admin';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT;

if (publicKey && privateKey && subject) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

interface PushPayload {
  title: string;
  body: string;
  /** Caminho relativo pra abrir quando a notificação é clicada, ex. `/app/slug/agenda`. */
  url?: string;
}

/** Notifica todos os dispositivos inscritos de um catálogo — nunca lança,
 *  só loga erro (mesmo padrão non-blocking de `src/lib/telegram.ts`, usada
 *  num caminho crítico — `/api/scheduling/book` — que não pode falhar por
 *  causa de uma notificação secundária). */
export async function sendPushToOrder(orderId: string, payload: PushPayload): Promise<void> {
  if (!publicKey || !privateKey || !subject) {
    console.warn('[Push] VAPID keys não configuradas — notificação ignorada.');
    return;
  }

  try {
    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('order_id', orderId);

    if (error || !subscriptions || subscriptions.length === 0) return;

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify(payload)
          );
        } catch (err) {
          const statusCode = (err as { statusCode?: number })?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            // Inscrição expirada/revogada pelo navegador — limpa do banco.
            await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
          } else {
            console.error('[Push] Falha ao enviar notificação:', err);
          }
        }
      })
    );
  } catch (error) {
    console.error('[Push] Exceção ao enviar notificações:', error);
  }
}
