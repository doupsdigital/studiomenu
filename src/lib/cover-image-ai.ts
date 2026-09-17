import sharp from 'sharp';

const TARGET_W = 1024;
const TARGET_H = 1536; // maior retrato suportado pela API de imagem da OpenAI — o mais próximo de 9:16 disponível
const TARGET_RATIO = TARGET_W / TARGET_H;

const OUTPAINT_PROMPT =
  'This is a photo outpainting task. The image has a photograph in the center and fully transparent regions above and/or below it. Fill ONLY the transparent regions with new, photorealistic content that plausibly continues the same scene (same wall, room, floor, lighting, shadows and color tone visible in the photo) so the canvas becomes one seamless full-height photograph. Do not zoom, crop, rescale, reframe, or move the existing photograph — it must stay at its exact original size and position. Do not alter, redraw, or stylize the person, their face, or any object already visible. Do not add text, watermarks, logos or new objects.';

/** Onde a foto original (redimensionada, sem cortar nada) fica posicionada
 *  dentro do canvas-alvo, igual ao `fit: 'contain'` do sharp — calculado à
 *  parte porque precisamos reusar exatamente essas coordenadas depois, pra
 *  colar a foto original de volta por cima do resultado da IA. */
function computeContainLayout(srcW: number, srcH: number, dstW: number, dstH: number) {
  const scale = Math.min(dstW / srcW, dstH / srcH);
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));
  const left = Math.round((dstW - width) / 2);
  const top = Math.round((dstH - height) / 2);
  return { width, height, left, top };
}

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
  const meta = await sharp(buffer).metadata();
  if (!meta.width || !meta.height) return null;

  const layout = computeContainLayout(meta.width, meta.height, TARGET_W, TARGET_H);
  // Sem `fit: 'contain'` do resize aqui — usamos composite manual pra saber
  // exatamente `left`/`top`, e reaproveitar essa mesma foto redimensionada
  // (nunca repassada pela IA) depois.
  const resizedOriginal = await sharp(buffer).resize(layout.width, layout.height).toBuffer();

  const padded = await sharp({
    create: { width: TARGET_W, height: TARGET_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: resizedOriginal, left: layout.left, top: layout.top }])
    .png()
    .toBuffer();

  const form = new FormData();
  form.append('model', 'gpt-image-1');
  form.append('image', new Blob([new Uint8Array(padded)], { type: 'image/png' }), 'cover.png');
  form.append('prompt', OUTPAINT_PROMPT);
  form.append('size', `${TARGET_W}x${TARGET_H}`);
  // Preserva rosto/detalhes finos da imagem de entrada em vez de tratá-la só
  // como referência solta — é o parâmetro que a própria OpenAI recomenda pra
  // edição que precisa manter uma pessoa reconhecível.
  form.append('input_fidelity', 'high');

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
  if (!b64) return null;

  const generated = Buffer.from(b64, 'base64');

  // O prompt pede pra IA não tocar na foto original, mas o modelo não
  // garante isso de verdade (já alterou traços do rosto numa foto de
  // teste) — então colamos a foto original de volta, sem nenhuma
  // alteração, exatamente na mesma posição. A IA só pode contribuir com a
  // moldura ao redor; a foto da cliente nunca é regenerada.
  return sharp(generated)
    .composite([{ input: resizedOriginal, left: layout.left, top: layout.top }])
    .png()
    .toBuffer();
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
