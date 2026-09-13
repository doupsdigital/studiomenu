import 'server-only';

/** Envia uma mensagem pro Telegram do dono do produto — nunca lança, só loga
 *  erro (usado em caminhos críticos como o webhook do Asaas, que precisa
 *  responder rápido e não pode falhar por causa de uma notificação
 *  secundária). Mesma lógica de `src/app/api/notify-telegram/route.ts`
 *  (intocada — essa rota já funciona pra avisar de catálogo novo), só num
 *  arquivo reaproveitável em vez de duplicar dentro de cada rota. */
export async function sendTelegramMessage(message: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID não configurados — notificação ignorada.');
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
    const json = await res.json();
    if (!json.ok) {
      console.error('[Telegram] Falha ao enviar mensagem:', json);
    }
  } catch (error) {
    console.error('[Telegram] Exceção ao enviar mensagem:', error);
  }
}
