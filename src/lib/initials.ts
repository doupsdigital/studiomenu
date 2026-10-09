/** Extrai as iniciais do nome da profissional pro círculo do placeholder de
 *  foto (pedido real, 2026-10-09) — "Milena Rodrigues" vira "MR". Cai em
 *  "SM" (StudioMenu) sempre que o nome vier vazio, só com 1 caractere
 *  estranho, ou com algo que não seja letra (emoji, número, símbolo) —
 *  nunca deixa aparecer um círculo com lixo dentro. */
export function getInitials(name?: string | null): string {
  const cleaned = (name || '').trim();
  if (!cleaned) return 'SM';

  const parts = cleaned.split(/\s+/).filter(Boolean);
  const raw = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0];
  const initials = raw.toUpperCase();

  return /^[A-ZÀ-ÖØ-Þ]{1,2}$/.test(initials) ? initials : 'SM';
}
