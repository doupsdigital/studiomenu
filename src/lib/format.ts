export function formatPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) return digits.replace(/^(\d*)/, '($1');
  if (digits.length <= 7) return digits.replace(/^(\d{2})(\d*)/, '($1) $2');
  return digits.replace(/^(\d{2})(\d{5})(\d*)/, '($1) $2-$3');
}

/** Máscara de CPF (000.000.000-00) enquanto ela digita, trocando sozinha
 *  pra CNPJ (00.000.000/0000-00) assim que passar de 11 dígitos — nunca
 *  bloqueia CNPJ, só começa mostrando o formato mais comum (pessoa física,
 *  a maioria das assinantes). Usado no card de assinar (Fase 20, feedback
 *  de teste real: o campo de CPF/CNPJ não tinha máscara nenhuma). */
export function formatCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);

  if (digits.length <= 11) {
    const p1 = digits.slice(0, 3);
    const p2 = digits.slice(3, 6);
    const p3 = digits.slice(6, 9);
    const p4 = digits.slice(9, 11);
    let out = p1;
    if (p2) out += `.${p2}`;
    if (p3) out += `.${p3}`;
    if (p4) out += `-${p4}`;
    return out;
  }

  const p1 = digits.slice(0, 2);
  const p2 = digits.slice(2, 5);
  const p3 = digits.slice(5, 8);
  const p4 = digits.slice(8, 12);
  const p5 = digits.slice(12, 14);
  let out = p1;
  if (p2) out += `.${p2}`;
  if (p3) out += `.${p3}`;
  if (p4) out += `/${p4}`;
  if (p5) out += `-${p5}`;
  return out;
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
