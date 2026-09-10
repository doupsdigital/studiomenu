import { NextResponse } from 'next/server';
import { nichePresetsMap } from '@/data/niche-presets';
import { NicheType } from '@/types/catalog';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_FILES = 5;

const PROCEDURES_TOOL = {
  name: 'return_procedures',
  description: 'Retorna a lista de procedimentos/serviços e valores extraídos da tabela de preços enviada.',
  input_schema: {
    type: 'object' as const,
    properties: {
      procedures: {
        type: 'array',
        description: 'Todos os procedimentos/serviços encontrados na imagem ou PDF.',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Nome do procedimento/serviço.' },
            price: { type: 'string', description: 'Preço exatamente como está escrito (ex: "R$ 150", "A partir de R$ 200", "Sob Consulta").' },
            duration: { type: 'string', description: 'Duração do procedimento, se estiver indicada (ex: "1h30"). Deixe vazio se não houver.' },
            category: { type: 'string', description: 'Categoria/agrupamento do procedimento, se a tabela indicar (ex: "Cílios", "Unhas"). Use "Geral" se não houver agrupamento claro.' },
            description: { type: 'string', description: 'Descrição curta, se houver algum detalhe extra no material. Deixe vazio se não houver.' },
            image_url: {
              type: 'string',
              description:
                'Se o nome do procedimento corresponder (mesmo com variação de escrita) a algum item da "lista de referência do catálogo modelo" fornecida, copie aqui EXATAMENTE a URL de imagem daquele item correspondente. Se não houver correspondência clara, deixe este campo como string vazia.',
            },
          },
          required: ['title', 'price'],
        },
      },
    },
    required: ['procedures'],
  },
};

export async function POST(request: Request) {
  try {
    const adminSecret = request.headers.get('x-admin-secret');
    if (!adminSecret || adminSecret !== process.env.ADMIN_API_SECRET) {
      return NextResponse.json({ success: false, message: 'Não autorizado.' }, { status: 403 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, message: 'ANTHROPIC_API_KEY não configurada no servidor.' }, { status: 500 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const niche = (formData.get('niche') as string) || 'lash';

    if (!files.length) {
      return NextResponse.json({ success: false, message: 'Nenhum arquivo enviado.' }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ success: false, message: `Envie no máximo ${MAX_FILES} arquivos.` }, { status: 400 });
    }

    const contentBlocks: any[] = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ success: false, message: `Tipo de arquivo não suportado: ${file.type}` }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ success: false, message: 'Um dos arquivos é muito grande. O limite é 15MB por arquivo.' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString('base64');

      if (file.type === 'application/pdf') {
        contentBlocks.push({
          type: 'document',
          source: { type: 'base64', media_type: file.type, data: base64 },
        });
      } else {
        contentBlocks.push({
          type: 'image',
          source: { type: 'base64', media_type: file.type, data: base64 },
        });
      }
    }

    const nichePreset = nichePresetsMap[niche as NicheType] || nichePresetsMap.lash;
    const referenceList = nichePreset.procedures
      .map((p) => `- "${p.title}" → ${p.image_url}`)
      .join('\n');

    contentBlocks.push({
      type: 'text',
      text:
        `Esta é uma foto/print ou PDF de uma tabela de preços de um studio de beleza (nicho: ${niche}). ` +
        `Extraia TODOS os procedimentos/serviços listados, com nome, preço (mantendo o formato original do texto), ` +
        `duração quando indicada, e categoria quando a tabela deixar clara alguma divisão/agrupamento (senão use "Geral"). ` +
        `Ignore cabeçalhos decorativos, logotipo, informações de contato/endereço/redes sociais. ` +
        `Se houver mais de um arquivo, trate-os como continuação da mesma tabela (não duplique itens repetidos entre eles).\n\n` +
        `Lista de referência do catálogo modelo deste nicho (nome → imagem):\n${referenceList}\n\n` +
        `Para cada procedimento que você extrair, se o nome for equivalente a algum item dessa lista de referência ` +
        `(mesmo com variação de escrita, plural/singular, ou palavras a mais/a menos), preencha o campo "image_url" ` +
        `com a URL exata daquele item. Se não houver correspondência clara, deixe "image_url" vazio.`,
    });

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 4096,
        tools: [PROCEDURES_TOOL],
        tool_choice: { type: 'tool', name: 'return_procedures' },
        messages: [{ role: 'user', content: contentBlocks }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error('[Extract Catalog] Erro da API Anthropic:', errText);
      return NextResponse.json({ success: false, message: 'Erro ao processar o arquivo com a IA.' }, { status: 502 });
    }

    const anthropicJson = await anthropicRes.json();
    const toolUseBlock = (anthropicJson.content || []).find((block: any) => block.type === 'tool_use' && block.name === 'return_procedures');

    if (!toolUseBlock) {
      return NextResponse.json({ success: false, message: 'A IA não conseguiu extrair os procedimentos desse material.' }, { status: 422 });
    }

    const defaultImage = nichePreset.procedures[0]?.image_url || '';

    const procedures = (toolUseBlock.input?.procedures || []).map((p: any, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      title: p.title || 'Procedimento sem nome',
      description: p.description || '',
      price: p.price || 'Sob Consulta',
      duration: p.duration || '',
      category: p.category || 'Geral',
      image_url: p.image_url || defaultImage,
      badge: '',
      is_highlight: false,
    }));

    return NextResponse.json({ success: true, procedures });
  } catch (error: any) {
    console.error('[Extract Catalog Exception]:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Erro interno ao extrair o catálogo.' }, { status: 500 });
  }
}
