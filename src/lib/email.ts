import 'server-only';
import { PRODUCTION_DOMAIN } from './public-url';

/** E-mails transacionais via Resend (2026-11-18), por `fetch`, sem
 *  dependência nova (mesmo jeito do manual-lash). O domínio `studiomenu.art`
 *  está verificado na conta Resend com DNS na Vercel. Nunca lança erro: um
 *  e-mail que falhou não pode derrubar o webhook da Cakto, que não reenvia
 *  evento. */

const FROM = 'StudioMenu <acesso@studiomenu.art>';
const SUPPORT_WHATSAPP = '5562991083435';

export async function sendEmail(input: { to: string; subject: string; html: string; text: string }): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY não configurada — e-mail ignorado.');
    return { ok: false, error: 'RESEND_API_KEY ausente' };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [input.to], subject: input.subject, html: input.html, text: input.text }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[Email] Resend recusou:', res.status, body);
      return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (error) {
    console.error('[Email] Exceção ao enviar:', error);
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

/** E-mail de acesso enviado na primeira aprovação da Cakto. É o caminho de
 *  reserva pra quem pagou em outro aparelho (sem o cookie da prévia, a
 *  `/ativando` não consegue logar sozinha). */
export function buildAccessEmail(params: { name: string; slug: string; shortCode: string }) {
  const firstName = params.name.trim().split(/\s+/)[0] || 'Lash';
  const appUrl = `https://${PRODUCTION_DOMAIN}/a/${params.shortCode}`;
  const menuUrl = `https://${params.slug}.${PRODUCTION_DOMAIN}`;
  const menuLabel = `${params.slug}.${PRODUCTION_DOMAIN}`;
  const whatsUrl = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(`Oi! Comprei o StudioMenu (${params.slug}) e preciso de ajuda pra entrar.`)}`;
  const n = escapeHtml(firstName);

  const subject = `${firstName}, seu menu está no ar! Aqui está seu acesso`;

  const step = (num: number, text: string) => `
    <tr><td style="padding:6px 0;vertical-align:top;width:30px">
      <div style="width:22px;height:22px;border-radius:11px;background:#fbe4ea;color:#be4b6a;font-size:12px;font-weight:700;line-height:22px;text-align:center">${num}</div>
    </td><td style="padding:6px 0;font-size:15px;color:#4a3b40;line-height:1.5">${text}</td></tr>`;

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#faf5f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf5f2;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;border:1px solid #efe4df;overflow:hidden">
  <tr><td style="background:linear-gradient(135deg,#e88aa3,#c9587a);background-color:#d16d8c;padding:28px 28px 24px;text-align:center">
    <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#ffe9ef;font-weight:700">StudioMenu</div>
    <div style="font-size:26px;line-height:1.25;color:#ffffff;font-weight:700;margin-top:8px">Pagamento confirmado, ${n}! 🎉</div>
    <div style="font-size:15px;color:#fff3f6;margin-top:6px">Seu menu já está no ar.</div>
  </td></tr>
  <tr><td style="padding:28px">
    <p style="margin:0 0 18px;font-size:15px;color:#4a3b40;line-height:1.6">Toque no botão abaixo para entrar no seu app. É por lá que você edita seus serviços, preços e fotos.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <a href="${appUrl}" style="display:inline-block;background:#c9587a;color:#ffffff;text-decoration:none;font-size:17px;font-weight:700;padding:16px 32px;border-radius:14px">Entrar no meu app</a>
    </td></tr></table>
    <p style="margin:14px 0 0;font-size:13px;color:#8a7a80;line-height:1.5;text-align:center">Se o botão não abrir, copie este link e cole no <b>Chrome</b> ou <b>Safari</b>:<br><a href="${appUrl}" style="color:#c9587a;word-break:break-all">${appUrl}</a></p>

    <div style="margin:26px 0 0;padding:16px;border-radius:14px;background:#faf5f2;border:1px solid #efe4df">
      <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8a7a80;font-weight:700">O link do seu menu</div>
      <a href="${menuUrl}" style="display:block;margin-top:4px;font-size:16px;color:#c9587a;font-weight:700;text-decoration:none">${escapeHtml(menuLabel)}</a>
      <div style="font-size:13px;color:#8a7a80;margin-top:4px">É esse link que vai na bio do Instagram e no seu WhatsApp.</div>
    </div>

    <div style="margin:26px 0 8px;font-size:16px;font-weight:700;color:#2e2428">Seus primeiros passos</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${step(1, 'Confirme o WhatsApp onde suas clientes vão te chamar.')}
      ${step(2, 'Troque os serviços e preços de exemplo pelos seus.')}
      ${step(3, 'Crie seu acesso com Google ou senha, para entrar sem precisar deste e-mail.')}
      ${step(4, 'Coloque o link do menu na bio do Instagram.')}
    </table>
    <p style="margin:18px 0 0;font-size:14px;color:#4a3b40;line-height:1.6">O app te guia em cada passo. 💗</p>
  </td></tr>
  <tr><td style="padding:18px 28px 26px;border-top:1px solid #efe4df;font-size:13px;color:#8a7a80;line-height:1.6;text-align:center">
    Guarde este e-mail: o botão acima sempre te leva para o seu app.<br>
    Ficou com dúvida? <a href="${whatsUrl}" style="color:#c9587a;font-weight:700">Fale com a gente no WhatsApp</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  const text = `Pagamento confirmado, ${firstName}! Seu menu já está no ar.

Entre no seu app (abra no Chrome ou Safari):
${appUrl}

O link do seu menu: ${menuUrl}

Seus primeiros passos:
1. Confirme o WhatsApp onde suas clientes vão te chamar.
2. Troque os serviços e preços de exemplo pelos seus.
3. Crie seu acesso com Google ou senha, para entrar sem precisar deste e-mail.
4. Coloque o link do menu na bio do Instagram.

Guarde este e-mail: o link acima sempre te leva para o seu app.
Dúvidas? Fale com a gente no WhatsApp: ${whatsUrl}`;

  return { subject, html, text };
}
