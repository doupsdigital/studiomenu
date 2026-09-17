const TARGET_SIZE = '1024x1536'; // maior retrato suportado pela API de imagem da OpenAI — o mais próximo de 9:16 disponível

// Mesmo pedido que a operação já faz manualmente no ChatGPT — a foto inteira
// vai pra IA sem nenhum pré-processamento nosso (sem detectar faixa preta,
// sem recortar nada), e o próprio modelo decide como adaptar. Uma tentativa
// anterior de "ajudar" recortando a foto antes de mandar acabou comendo
// pedaço de cabelo escuro achando que era faixa preta — deixar a IA ver a
// foto original inteira, do jeito que o ChatGPT faz, é mais simples e mais
// confiável.
const ADAPT_PROMPT =
  'Gere esta foto no formato retrato 9:16, fazendo as adaptações necessárias para preencher o quadro por completo — se a foto tiver espaços vazios, faixas pretas ou cortes nas bordas (em cima, embaixo ou nas laterais), estenda o fundo de forma natural e realista para completá-los, mantendo o mesmo ambiente, iluminação e estilo da foto original. Não altere, distorça, redesenhe ou reenquadre (não dê zoom em) a pessoa, o rosto ou qualquer elemento já visível na foto — apenas complete o que estiver faltando ao redor, sem mexer no resto.';

/**
 * Manda a foto de capa pra IA (gpt-image-1) pedir a adaptação pro formato
 * retrato do catálogo — mesmo processo manual que a operação já fazia no
 * ChatGPT ("gere essa imagem no formato 9:16, faça os ajustes necessários"),
 * só que automático. Sem nenhum pré-processamento nosso: a foto original
 * inteira vai pra IA, que decide sozinha o que cortar/estender, do mesmo
 * jeito que decide quando é pedido diretamente no ChatGPT. Retorna `null`
 * (sem lançar) se não houver chave configurada ou a chamada falhar — quem
 * chamou usa o arquivo original nesse caso.
 */
export async function adaptCoverToPortrait(buffer: Buffer, mimeType: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const form = new FormData();
    form.append('model', 'gpt-image-1');
    form.append('image', new Blob([new Uint8Array(buffer)], { type: mimeType || 'image/jpeg' }), 'cover');
    form.append('prompt', ADAPT_PROMPT);
    form.append('size', TARGET_SIZE);
    // Preserva rosto/detalhes finos da imagem de entrada em vez de tratá-la só
    // como referência solta — parâmetro que a própria OpenAI recomenda pra
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

    return { buffer: Buffer.from(b64, 'base64'), contentType: 'image/png' };
  } catch (err) {
    console.error('[Cover AI] Falha ao adaptar capa:', err);
    return null;
  }
}
