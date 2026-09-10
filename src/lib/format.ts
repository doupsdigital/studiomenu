export function formatPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) return digits.replace(/^(\d*)/, '($1');
  if (digits.length <= 7) return digits.replace(/^(\d{2})(\d*)/, '($1) $2');
  return digits.replace(/^(\d{2})(\d{5})(\d*)/, '($1) $2-$3');
}
