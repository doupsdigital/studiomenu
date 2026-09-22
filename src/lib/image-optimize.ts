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
    const optimized = await sharp(buffer)
      .rotate() // aplica a orientação EXIF (fotos de celular) antes de medir/redimensionar
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
