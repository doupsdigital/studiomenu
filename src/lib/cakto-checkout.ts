/** Links de checkout da Cakto do funil de autosserviço Lash (2026-11-17).
 *  Arquivo SEM `server-only` de propósito — é lido pela página `/lash` no
 *  navegador. Os IDs dos produtos NÃO ficam aqui: vão na variável de
 *  ambiente `CAKTO_PRODUCT_MAP` (lida só pelo webhook, `src/lib/cakto.ts`).
 *
 *  Mensal: R$ 22,90/mês, assinatura, só cartão de crédito.
 *  Anual:  R$ 127, pagamento único no Pix, acesso de 1 ano. */
/** Pixel da Meta do funil `/lash` (2026-11-17) — o mesmo cadastrado nos 2
 *  produtos da Cakto. NÃO é o pixel antigo da landing `/`
 *  (`1042165951490026`, com restrição na Meta); a página `/lash` deve usar
 *  este explicitamente, sem depender de `NEXT_PUBLIC_META_PIXEL_ID`. */
export const LASH_FUNNEL_PIXEL_ID = '1015955554886103';

export const CAKTO_CHECKOUT_URLS = {
  mensal: 'https://pay.cakto.com.br/h2p6djs_1336617',
  anual: 'https://pay.cakto.com.br/ts7e24e_1336652',
} as const;
