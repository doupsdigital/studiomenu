import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`notify-telegram:${ip}`, 10, 10 * 60);
    if (!allowed) {
      return NextResponse.json({ success: false, message: 'Muitas notificações em pouco tempo.' }, { status: 429 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn('[Telegram] TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID não configurados — notificação ignorada.');
      return NextResponse.json({ success: false, skipped: true });
    }

    const body = await request.json();
    const {
      clientName = 'Profissional',
      whatsapp = 'Não informado',
      instagram = '',
      layoutModel = 'mosaico',
      themeVariant = 'rose',
      slug,
      editToken,
    } = body as {
      clientName?: string;
      whatsapp?: string;
      instagram?: string;
      layoutModel?: string;
      themeVariant?: string;
      slug: string;
      editToken?: string;
    };

    if (!slug) {
      return NextResponse.json({ success: false, message: 'slug é obrigatório.' }, { status: 400 });
    }

    const nowStr = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const cleanInsta = instagram ? instagram.toString().replace(/^@/, '').trim() : '';
    const editUrl = editToken ? `https://studiomenu.art/c/${slug}?edit=${editToken}` : null;

    const message =
      `🎉 Novo catálogo criado no StudioMenu!\n\n` +
      `👤 ${clientName}\n` +
      `📱 ${whatsapp || 'Não informado'}\n` +
      (cleanInsta ? `📸 @${cleanInsta}\n` : '') +
      `🎨 Layout ${layoutModel.toUpperCase()} · ${themeVariant.toUpperCase()}\n` +
      `🔗 https://studiomenu.art/c/${slug}\n` +
      `🕒 ${nowStr}` +
      (editUrl ? `\n\n⚡ Link mágico de edição:\n${editUrl}` : '');

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });

    const tgJson = await tgRes.json();
    return NextResponse.json({ success: Boolean(tgJson.ok), telegram: tgJson });
  } catch (error: any) {
    console.error('[Telegram] Erro ao notificar:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Erro interno.' }, { status: 500 });
  }
}
