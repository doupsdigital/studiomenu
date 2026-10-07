import sharp from 'sharp';
import { getCatalogBySlug } from '@/lib/catalog-service';
import { NICHE_DEFAULT_COVER } from '@/lib/catalog-covers';
import { PRODUCTION_DOMAIN } from '@/lib/public-url';

/** GET /api/og/catalog/[slug]
 *  Recorta a capa do catálogo (retrato, na maioria dos casos — selfie ou
 *  foto do espaço) pro formato paisagem padrão de preview de link
 *  (1200×630, ~1.91:1) usado por og:image/twitter:image.
 *
 *  Sem isso: o WhatsApp usa as dimensões REAIS da imagem (não confia no
 *  `width`/`height` declarado nos meta tags) — como a capa quase sempre é
 *  retrato, ele desenhava um card alto e estreito, e a mensagem de texto
 *  logo abaixo (entrega do catálogo/app) herdava essa mesma largura
 *  estreita, ficando "espremida" (achado real reportado em produção,
 *  2026-09-28, ao mandar o link do app pra Ana Laura). `fit: 'cover'` com
 *  `position: 'attention'` deixa o libvips escolher a região mais
 *  relevante da foto (geralmente o rosto) em vez de cortar pelo centro
 *  fixo — importante pra retrato virar paisagem sem cortar a cara da
 *  profissional.
 *
 *  Cacheado por 1h no browser/CDN — a capa raramente muda de um instante
 *  pro outro, e esse endpoint só é batido por crawlers de preview
 *  (WhatsApp/Instagram/etc), nunca por gente de verdade navegando. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fallbackUrl = 'https://studiomenu.art/modelos/mosaico/assets/img/Hero.webp';

  try {
    const catalog = await getCatalogBySlug(slug);
    // Mesma cadeia de capa padrão por nicho de `HeaderCover.tsx` (pedido
    // real, 2026-10-07) — sem isso, a página mostraria a capa nova (Lash/
    // Nail) mas o preview do link no WhatsApp continuaria mostrando a foto
    // genérica antiga, inconsistente.
    const nicheDefaultCover = catalog?.niche ? NICHE_DEFAULT_COVER[catalog.niche] : undefined;
    const sourceUrl =
      catalog?.cover_media_url ||
      catalog?.avatar_url ||
      (nicheDefaultCover ? `https://${PRODUCTION_DOMAIN}${nicheDefaultCover}` : undefined) ||
      fallbackUrl;

    const sourceRes = await fetch(sourceUrl);
    if (!sourceRes.ok) throw new Error(`Falha ao buscar imagem de origem: ${sourceRes.status}`);
    const sourceBuffer = Buffer.from(await sourceRes.arrayBuffer());

    const output = await sharp(sourceBuffer)
      .rotate()
      .resize({ width: 1200, height: 630, fit: 'cover', position: sharp.strategy.attention })
      .jpeg({ quality: 85 })
      .toBuffer();

    return new Response(new Uint8Array(output), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (error) {
    console.warn('[API OG Catalog] Falha ao gerar imagem, redirecionando pro fallback:', error);
    return Response.redirect(fallbackUrl, 302);
  }
}
