import sharp from 'sharp';

const TARGET_W = 1024;
const TARGET_H = 1536; // maior retrato suportado pela API de imagem da OpenAI — o mais próximo de 9:16 disponível
const TARGET_RATIO = TARGET_W / TARGET_H;

const OUTPAINT_PROMPT =
  'Estenda o fundo desta foto de forma natural e realista para preencher todo o quadro vertical, mantendo a pessoa e os elementos originais exatamente como estão, na mesma posição e proporção, sem adicionar texto, objetos novos ou logotipos, preservando o estilo, iluminação e cores originais.';

/**
 * Remove faixas pretas sólidas nas bordas (comum em fotos exportadas/print de
 * vídeo, tipo a da capa dessa foto de cílios) — sem isso o cálculo de
 * proporção abaixo é enganado: o arquivo já "parece" retrato por causa da
 * faixa preta, mesmo a foto real sendo quadrada. Analisa uma miniatura em
 * escala de cinza (rápido) e só recorta bordas realmente uniformes e escuras
 * — nunca mais que 35% de cada lado, pra não arriscar cortar cabelo escuro
 * ou fundo escuro de verdade.
 */
async function trimLetterboxBars(buffer: Buffer): Promise<Buffer> {
  const base = sharp(buffer).rotate(); // aplica a orientação EXIF antes de tudo
  const meta = await base.metadata();
  const width = meta.width;
  const height = meta.height;
  if (!width || !height) return buffer;

  const THUMB_W = 48;
  const { data, info } = await base
    .clone()
    .resize({ width: THUMB_W, fit: 'fill' })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  const rowStats = (y: number) => {
    let sum = 0;
    let sumSq = 0;
    for (let x = 0; x < w; x += 1) {
      const v = data[y * w + x];
      sum += v;
      sumSq += v * v;
    }
    const mean = sum / w;
    return { mean, std: Math.sqrt(Math.max(sumSq / w - mean * mean, 0)) };
  };
  const colStats = (x: number) => {
    let sum = 0;
    let sumSq = 0;
    for (let y = 0; y < h; y += 1) {
      const v = data[y * w + x];
      sum += v;
      sumSq += v * v;
    }
    const mean = sum / h;
    return { mean, std: Math.sqrt(Math.max(sumSq / h - mean * mean, 0)) };
  };
  const isBar = (s: { mean: number; std: number }) => s.mean < 25 && s.std < 12;

  let top = 0;
  while (top < h - 1 && isBar(rowStats(top))) top += 1;
  let bottom = 0;
  while (bottom < h - 1 - top && isBar(rowStats(h - 1 - bottom))) bottom += 1;
  let left = 0;
  while (left < w - 1 && isBar(colStats(left))) left += 1;
  let right = 0;
  while (right < w - 1 - left && isBar(colStats(w - 1 - right))) right += 1;

  const maxFractionV = Math.floor(h * 0.35);
  const maxFractionH = Math.floor(w * 0.35);
  top = Math.min(top, maxFractionV);
  bottom = Math.min(bottom, maxFractionV);
  left = Math.min(left, maxFractionH);
  right = Math.min(right, maxFractionH);

  if (top === 0 && bottom === 0 && left === 0 && right === 0) return buffer;

  const scaleX = width / w;
  const scaleY = height / h;
  const cropLeft = Math.round(left * scaleX);
  const cropTop = Math.round(top * scaleY);
  const cropWidth = Math.max(1, width - Math.round((left + right) * scaleX));
  const cropHeight = Math.max(1, height - Math.round((top + bottom) * scaleY));

  return base.extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight }).toBuffer();
}

function mimeForFormat(format: string | undefined): string {
  switch (format) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return 'image/jpeg';
  }
}

async function callOutpaint(buffer: Buffer, apiKey: string): Promise<Buffer | null> {
  const padded = await sharp(buffer)
    .resize(TARGET_W, TARGET_H, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const form = new FormData();
  form.append('model', 'gpt-image-1');
  form.append('image', new Blob([new Uint8Array(padded)], { type: 'image/png' }), 'cover.png');
  form.append('prompt', OUTPAINT_PROMPT);
  form.append('size', `${TARGET_W}x${TARGET_H}`);

  const res = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    console.error('[Cover AI] Erro da API OpenAI:', await res.text());
    return null;
  }

  const json = await res.json();
  const b64 = json.data?.[0]?.b64_json;
  return b64 ? Buffer.from(b64, 'base64') : null;
}

/**
 * Prepara a foto de capa pro formato retrato do catálogo: primeiro recorta
 * faixas pretas de borda (se houver, sem custo de IA), depois — se o que
 * sobrou ainda não for retrato o suficiente — pede pra IA (gpt-image-1,
 * outpainting) estender o fundo, mesmo processo manual que a operação fazia
 * via ChatGPT antes de subir a capa de cada catálogo. Retorna `null` só
 * quando não há nada a melhorar (a foto já veio limpa e no formato certo);
 * em qualquer outro caso devolve a melhor versão possível (corte, ou corte +
 * IA), nunca lança — se a chamada da IA falhar, ainda assim devolve a versão
 * já recortada.
 */
export async function adaptCoverToPortrait(buffer: Buffer): Promise<{ buffer: Buffer; contentType: string } | null> {
  let working = buffer;
  let changed = false;
  let trimmedContentType = 'image/jpeg';

  try {
    const trimmed = await trimLetterboxBars(buffer);
    if (trimmed !== buffer) {
      working = trimmed;
      changed = true;
      trimmedContentType = mimeForFormat((await sharp(trimmed).metadata()).format);
    }
  } catch (err) {
    console.error('[Cover AI] Falha ao remover faixas pretas:', err);
  }

  const trimmedResult = changed ? { buffer: working, contentType: trimmedContentType } : null;

  try {
    const meta = await sharp(working).metadata();
    if (!meta.width || !meta.height) return trimmedResult;

    const ratio = meta.width / meta.height;
    const apiKey = process.env.OPENAI_API_KEY;
    if (ratio <= TARGET_RATIO + 0.05 || !apiKey) {
      // Já é retrato o suficiente (com ou sem o corte acima), ou não há
      // chave de IA configurada — nesses casos não vale (ou não dá) chamar
      // outpainting, só devolve o que já foi recortado.
      return trimmedResult;
    }

    const outpainted = await callOutpaint(working, apiKey);
    return outpainted ? { buffer: outpainted, contentType: 'image/png' } : trimmedResult;
  } catch (err) {
    console.error('[Cover AI] Falha ao adaptar capa:', err);
    return trimmedResult;
  }
}
