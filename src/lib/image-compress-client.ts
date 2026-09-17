/**
 * Comprime uma imagem no navegador antes do upload — existe pra evitar o
 * limite fixo de 4.5MB por requisição das funções serverless da Vercel
 * (`FUNCTION_PAYLOAD_TOO_LARGE`, não configurável via Next.js). Fotos de
 * celular somadas (ex: 5 fotos de tabela de preços) passam disso fácil; a
 * IA não precisa de resolução máxima pra ler texto/reconhecer uma pessoa
 * numa foto. Sempre reencoda em JPEG — se não for possível (não é imagem,
 * ou o navegador não suporta canvas por algum motivo), devolve o arquivo
 * original sem lançar, pra nunca travar o upload por causa disso.
 */
export async function compressImageFile(file: File, maxDimension = 1600, quality = 0.82): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) return file;

    // Só troca se realmente compensou — em fotos já pequenas/bem comprimidas
    // o reencode pode ficar maior que o original.
    if (blob.size >= file.size) return file;

    const newName = file.name.replace(/\.\w+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

/** Aplica `compressImageFile` numa lista de arquivos, em paralelo. */
export async function compressImageFiles(files: File[], maxDimension = 1600, quality = 0.82): Promise<File[]> {
  return Promise.all(files.map((f) => compressImageFile(f, maxDimension, quality)));
}
