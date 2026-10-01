import 'server-only';
import sharp from 'sharp';

/** Redimensiona/reconverte pra WebP no servidor — usado por todo caminho que
 *  sobe imagem pro Storage (`/api/catalog/upload`, editor da profissional;
 *  `/api/admin/finalize-catalog`, capa criada pelo admin). Rede de segurança
 *  atrás da compressão que já roda no navegador quando existe (o admin não
 *  tem essa etapa no navegador — daqui é a única compressão que a capa dele
 *  recebe). GIF passa direto (pode ser animado — `sharp` achataria pro 1º
 *  frame). Qualquer falha aqui devolve o buffer original: melhor subir sem
 *  comprimir do que travar o upload. */
export async function optimizeImage(buffer: Buffer, contentType: string): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  if (contentType === 'image/gif') {
    return { buffer, contentType, ext: 'gif' };
  }
  try {
    const rotated = await sharp(buffer).rotate().toBuffer(); // aplica a orientação EXIF (fotos de celular) antes de medir/redimensionar

    // Corta bordas de cor sólida já gravadas na foto (ex: faixas pretas de
    // letterboxing de quem exportou de um vídeo/outro formato antes de subir
    // — pedido real, 2026-10-01: card do mosaico é 9:16 e fica feio com faixa
    // preta em cima/embaixo). `trim()` mede a partir do pixel do canto quanto
    // dessa cor se estende a partir de cada borda e corta só isso — sem IA,
    // detecção pura de cor sólida. Se a foto não tiver borda sólida (ou for
    // uma cor só, o que faria o corte zerar a imagem), sharp lança erro:
    // seguimos com a imagem só rotacionada, sem cortar nada.
    let trimmed = rotated;
    try {
      trimmed = await sharp(rotated).trim({ threshold: 20 }).toBuffer();
    } catch {
      // Sem borda sólida detectável — mantém a imagem como está.
    }

    const optimized = await sharp(trimmed)
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    return { buffer: optimized, contentType: 'image/webp', ext: 'webp' };
  } catch (error) {
    console.warn('[optimizeImage] Falha ao otimizar, usando original:', error);
    const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
    return { buffer, contentType, ext };
  }
}
