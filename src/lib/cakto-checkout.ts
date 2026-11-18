/** Links de checkout da Cakto do funil de autosserviço Lash (2026-11-17).
 *  Arquivo SEM `server-only` de propósito — é lido pela página `/lash` no
 *  navegador. Os IDs dos produtos NÃO ficam aqui: vão na variável de
 *  ambiente `CAKTO_PRODUCT_MAP` (lida só pelo webhook, `src/lib/cakto.ts`).
 *
 *  Mensal: R$ 22,90/mês, assinatura, só cartão de crédito.
 *  Anual:  R$ 127, pagamento único no Pix, acesso de 1 ano. */
/** Pixel da Meta do funil de autosserviço Lash — exclusivo do StudioMenu,
 *  criado em 2026-11-17 (o anterior, `1015955554886103`, era de outro
 *  produto). Precisa ser o MESMO cadastrado nos 2 produtos da Cakto, que
 *  dispara o Purchase. NÃO é o pixel antigo da landing `/`
 *  (`1042165951490026`); a página Lash usa este explicitamente, sem
 *  depender de `NEXT_PUBLIC_META_PIXEL_ID`. */
export const LASH_FUNNEL_PIXEL_ID = '1170978082151966';

export const CAKTO_CHECKOUT_URLS = {
  mensal: 'https://pay.cakto.com.br/h2p6djs_1336617',
  anual: 'https://pay.cakto.com.br/ts7e24e_1336652',
} as const;
