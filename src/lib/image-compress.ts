/** Compressão de imagem no navegador, antes do upload — mesmo motor do
 *  projeto vanilla anterior (`image-compressor.js`), reescrito em TS:
 *  redimensiona via `<canvas>` e reexporta em WebP. Sem isso, uma foto de
 *  celular (3-8MB) subia inteira pro Storage e chegava assim pra quem via o
 *  catálogo — daí a demora de carregamento que o usuário reportou.
 *
 *  GIF fica de fora de propósito (diferença do vanilla, que também
 *  comprimia): um GIF pode ser animado, e tanto isso quanto a compressão no
 *  servidor (`sharp`, ver route.ts) achatariam pro primeiro frame.
 *
 *  Roda só no cliente (usa `Image`/`canvas`/`FileReader`) — nunca é chamado
 *  durante SSR. Qualquer falha (arquivo corrompido, navegador sem suporte a
 *  canvas grande, etc) devolve o arquivo original em vez de travar o upload;
 *  a rota de upload comprime de novo no servidor como rede de segurança. */
export async function compressImageFile(
  file: File,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  if (!file.type || !file.type.startsWith('image/') || file.type === 'image/gif') {
    return file;
  }

  // Já pequeno e já no formato final — nada a ganhar comprimindo de novo.
  if (file.size < 150 * 1024 && file.type === 'image/webp') {
    return file;
  }

  const maxDimension = options.maxDimension ?? 1200;
  const quality = options.quality ?? 0.82;

  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Falha ao decodificar a imagem.'));
      el.src = dataUrl;
    });

    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
    if (!blob) return file;

    // Não vale a pena trocar se a compressão não ganhou nada (ex: imagem já
    // pequena com pouco a reduzir) — mantém o arquivo original nesse caso.
    if (blob.size >= file.size) return file;

    const fileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
    return new File([blob], fileName, { type: 'image/webp', lastModified: Date.now() });
  } catch (error) {
    console.warn('[compressImageFile] Falha ao comprimir, usando original:', error);
    return file;
  }
}
