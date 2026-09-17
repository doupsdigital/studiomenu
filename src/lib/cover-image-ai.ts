import sharp from 'sharp';

const TARGET_W = 1024;
const TARGET_H = 1536; // maior retrato suportado pela API de imagem da OpenAI — o mais próximo de 9:16 disponível
const TARGET_RATIO = TARGET_W / TARGET_H;

const OUTPAINT_PROMPT =
  'Estenda o fundo desta foto de forma natural e realista para preencher todo o quadro vertical, mantendo a pessoa e os elementos originais exatamente como estão, na mesma posição e proporção, sem adicionar texto, objetos novos ou logotipos, preservando o estilo, iluminação e cores originais.';

/**
 * Se a foto já não for larga o bastante pra render "quadrado" o suficiente,
 * pede pra IA (gpt-image-1, outpainting) estender o fundo até um formato
 * retrato — mesmo processo manual que a operação fazia via ChatGPT antes de
 * subir a capa de cada catálogo. Retorna `null` (sem lançar) sempre que não
 * for possível ou não valer a pena, e quem chamou usa o arquivo original.
 */
export async function adaptCoverToPortrait(buffer: Buffer): Promise<{ buffer: Buffer; contentType: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) return null;

    const ratio = meta.width / meta.height;
    if (ratio <= TARGET_RATIO + 0.05) return null; // já é retrato o suficiente, não gasta crédito de IA à toa

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
    if (!b64) return null;

    return { buffer: Buffer.from(b64, 'base64'), contentType: 'image/png' };
  } catch (err) {
    console.error('[Cover AI] Falha ao adaptar capa:', err);
    return null;
  }
}
