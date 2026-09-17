export function formatPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) return digits.replace(/^(\d*)/, '($1');
  if (digits.length <= 7) return digits.replace(/^(\d{2})(\d*)/, '($1) $2');
  return digits.replace(/^(\d{2})(\d{5})(\d*)/, '($1) $2-$3');
}

/** Normaliza um número de WhatsApp pra sempre incluir o código do país (55),
 *  formato exigido pelos links `wa.me`/`api.whatsapp.com`. Aceita tanto
 *  "DDD+número" (10-11 dígitos) quanto números já prefixados com 55. */
export function normalizeWhatsappBR(value: string | undefined | null): string {
  const digits = (value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length <= 11) return `55${digits}`;
  return digits;
}

/** Converte um texto livre de duração ("1h30", "1h30min", "2h", "45min",
 *  "30 minutos") pro total em minutos — usado como rede de segurança pra
 *  preencher `duration_minutes` (o campo numérico que o agendamento
 *  automático exige) sempre que só existir o campo de texto livre, seja
 *  vindo da extração por IA, de um preset de nicho, ou de edição manual.
 *  Textos sem nenhum número (ex: "Guia", "Diário") devolvem `null` —
 *  correto, já que esses itens não são agendáveis mesmo. */
export function parseDurationToMinutes(text: string | undefined | null): number | null {
  if (!text) return null;
  const s = text.toLowerCase().trim();

  const withHours = s.match(/(\d+)\s*h\s*(\d+)?/);
  if (withHours) {
    const hours = parseInt(withHours[1], 10);
    const minutes = withHours[2] ? parseInt(withHours[2], 10) : 0;
    return hours * 60 + minutes;
  }

  const minutesOnly = s.match(/(\d+)\s*(min|minutos?)/);
  if (minutesOnly) return parseInt(minutesOnly[1], 10);

  return null;
}
