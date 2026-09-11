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
