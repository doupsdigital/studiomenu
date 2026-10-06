// Funil de Vendas X1 WhatsApp — Versão 2.0, criada a partir de análise de mercado da própria
// usuária (2026-10-05) com roteiros e mensagens novas para objeções e abordagens específicas.
// Convive lado a lado com o Funil ADS original (`funil-ads-scripts.ts`) — nenhuma mensagem de
// lá foi alterada, essa é uma estrutura irmã com conteúdo próprio.
//
// Diferente do funil original (que varia por formato de anúncio: vídeo x imagem), aqui os 3
// funis principais variam por abordagem comercial (Principal, "ela usa PDF?", Criar Desejo) —
// quem está vendendo escolhe qual linha seguir conforme o perfil da lead. A única variação por
// nicho é a abertura (1️⃣A Lash / 1️⃣B Nail), porque é o único passo que depende de qual foto
// enviar e qual link de exemplo mandar — o resto da conversa é idêntico pros dois nichos.
//
// Preços centralizados em `src/lib/pricing.ts` (R$27,90 Básico / R$47,90 Plus) — os valores
// usados aqui já refletem o preço atual.

export interface FunilV2Step {
  title: string;
  badge: string;
  tip?: string;
  content: string;
}

export type FunilV2Kind = 'funnel' | 'followup' | 'objection' | 'strategy';

export interface FunilV2Group {
  id: string;
  title: string;
  subtitle: string;
  kind: FunilV2Kind;
  steps: FunilV2Step[];
}

type Niche = 'lash' | 'nail';
const NICHE_LABEL: Record<Niche, string> = { lash: 'Lash', nail: 'Nail' };

/** Abertura varia só por nicho (qual foto enviar + qual link de exemplo mandar) — compartilhada
 *  pelos 3 funis principais, que divergem a partir da 2ª etapa. */
function buildOpeningSteps(): FunilV2Step[] {
  return (['lash', 'nail'] as Niche[]).map((niche, i) => ({
    title: `1️⃣${i === 0 ? 'A' : 'B'} — Abertura (${NICHE_LABEL[niche]})`,
    badge: `Início / Recepção · ${NICHE_LABEL[niche]}`,
    tip: `Mande como 2 mensagens separadas: primeiro o texto de saudação, depois envie manualmente uma foto de trabalho de ${NICHE_LABEL[niche]} antes de mandar o link abaixo.`,
    content: `Olá!! seja bem vinda 🥰!

[Enviar uma foto de ${niche === 'lash' ? 'Lash' : 'Nail'}]

Segue o link pra você testar o Catálogo na prática:
https://studiomenu.art/c/showcase/${niche}designer

Entra nele e clica em um dos serviços pra ver como funciona 😊`,
  }));
}

export const FUNIL_ADS_V2_DATA: FunilV2Group[] = [
  {
    id: 'funil-v2-principal',
    title: '🎯 Funil 01 — Principal',
    subtitle: 'Abordagem padrão: mostra o catálogo, explica o valor e oferece a prévia.',
    kind: 'funnel',
    steps: [
      ...buildOpeningSteps(),
      {
        title: '2️⃣ Pergunta Aberta',
        badge: 'Qualificação',
        content: `Que bom! ❤️

O que você mais gostou nele?`,
      },
      {
        title: '3️⃣ Explica o Catálogo + Pergunta de Interesse',
        badge: 'Apresentação',
        content: `Sim! E o legal é que suas clientes conseguem ver seus serviços, fotos e valores e, quando escolherem um serviço, já podem clicar em Agendar e ir direto pro seu WhatsApp.

Você pode editar fotos, serviços e valores quando quiser. Você usaria algo assim no seu Studio? 😊`,
      },
      {
        title: '4️⃣ Preço + Oferta de Prévia',
        badge: 'Preço & Valor',
        content: `Perfeito ❤️

Pra ter um catálogo assim, personalizado com a identidade do seu Studio, você paga *R$27,90 por mês*. Sem fidelidade e você pode cancelar quando quiser.

A cliente escolhe o serviço e, ao clicar em Agendar, já vai direto pro seu WhatsApp.

Se quiser, eu posso montar uma prévia do seu catálogo pra você ver como ficaria com a sua identidade. Gostaria de experimentar? 😊`,
      },
      {
        title: '5️⃣ Fechamento — Coleta de @',
        badge: 'Coleta de Informações',
        tip: 'Envie assim que ela topar fazer a prévia.',
        content: `Perfeito 😍

Então vamos fazer um assim pro seu Studio.

Me manda só o @ do seu Instagram. A nossa equipe vai buscar seus dados e já começar a criar. Entregamos o seu link hoje ainda 😊.`,
      },
    ],
  },
  {
    id: 'funil-v2-pdf',
    title: '📄 Funil 02 — Ela Usa PDF?',
    subtitle: 'Ataca a dor de mandar tabela/PDF manualmente — posiciona o link como substituto.',
    kind: 'funnel',
    steps: [
      ...buildOpeningSteps(),
      {
        title: '2️⃣ Descobre o Hábito Atual',
        badge: 'Qualificação',
        content: `Que bom que você gostou!❤️

Me conta uma coisa: hoje, quando uma cliente pergunta seus valores, você manda como? Foto da tabela, PDF, digita na hora?`,
      },
      {
        title: '3️⃣ Posiciona o Link no Lugar do PDF',
        badge: 'Apresentação',
        content: `Então imagina mandar o seu link assim no lugar disso.😍

Diferente de tudo que tem no mercado: Não é um PDF, não é uma tabela. É um Link exclusivo seu! 😊

E o principal: É bonito, é interativo e leva sua cliente até o WhatsApp com apenas 1 clique. ❤️

Gostaria de experimentar um desse para o seu Studio?`,
      },
      {
        title: '4️⃣ Coleta de @ (antes do preço)',
        badge: 'Coleta de Informações',
        content: `Perfeito ❤️

Me passa só seu @ do Instagram que a nossa equipe vai buscar seus dados e já começar a criar. Entregamos o seu link hoje ainda 😊.`,
      },
      {
        title: '5️⃣ Preço + Comparação de Valor',
        badge: 'Preço & Valor',
        tip: 'Use se ela perguntar o preço antes de mandar o @, ou logo depois de mandar — a comparação com o volume brasileiro ajuda a justificar o valor.',
        content: `É *R$ 27,90 por mês*, sem fidelidade, cancela quando quiser 😊

Pra ter uma ideia: uma única cliente de volume brasileiro já paga uns 5 meses do seu site.

E você não paga nada pra ver o seu pronto: eu monto, você testa e *só assina se gostar*. Gostaria de experimentar?`,
      },
      {
        title: '6️⃣ Entrega do Link do App',
        badge: 'Entrega Final',
        tip: 'Mesma entrega padrão do Funil ADS original — link é do APP (catálogo + edição + assinatura juntos).',
        content: `Olha como ficou o seu! ✨

👉 *[LINK DO APP]*

Lá dentro, toque em *"Visualizar catálogo"* pra ver como ficou. Se quiser mudar algo, é só tocar em *"Editar meu catálogo"* — e se quiser ativar a assinatura, a opção já está lá dentro também.

Os serviços que estão aí agora são só exemplos, pra você já ver tudo funcionando de verdade — você troca pelos seus quando quiser, ou, se preferir, a gente cadastra pra você: é só mandar sua tabela, PDF ou print por aqui. 😊

Qualquer dúvida, estou aqui! 💕`,
      },
    ],
  },
  {
    id: 'funil-v2-desejo',
    title: '💭 Funil 03 — Criar Desejo',
    subtitle: 'Foca em projetar a lead usando o catálogo na bio, antes de falar preço.',
    kind: 'funnel',
    steps: [
      ...buildOpeningSteps(),
      {
        title: '2️⃣ Pergunta Aberta',
        badge: 'Qualificação',
        content: `Que bom! ❤️

O que você mais gostou nele?`,
      },
      {
        title: '3️⃣ Explica + Projeta na Bio do Instagram',
        badge: 'Apresentação',
        content: `Sim! E o legal é que suas clientes conseguem ver seus serviços, fotos e valores e, quando escolherem um serviço, já podem clicar em Agendar e ir direto pro seu WhatsApp.😊

Imagina suas clientes acessando um link exclusivo seu e tendo essa experiência.

Você gostaria de ter um Link assim pra colocar na Bio do Instagram do seu Studio?`,
      },
      {
        title: '4️⃣ Preço + Oferta de Prévia',
        badge: 'Preço & Valor',
        content: `Perfeito ❤️

Pra ter um catálogo assim, personalizado com a identidade do seu Studio, você paga *R$27,90 por mês*. Sem fidelidade e você pode cancelar quando quiser.

A cliente escolhe o serviço e, ao clicar em Agendar, já vai direto pro seu WhatsApp.

Se quiser, eu posso montar uma prévia do seu catálogo pra você ver como ficaria com a sua identidade. Gostaria de experimentar? 😊`,
      },
      {
        title: '5️⃣ Fechamento — Coleta de @',
        badge: 'Coleta de Informações',
        tip: 'Envie assim que ela topar fazer a prévia. Nota: esse funil entrega em 24h, não "hoje ainda" como os outros dois.',
        content: `Perfeito 😍

Então vamos fazer um assim pro seu Studio.

Me manda só o @ do seu Instagram. A nossa equipe vai buscar seus dados e já começar a criar. Entregamos o seu link em até 24 horas 😊.`,
      },
    ],
  },
  {
    id: 'funil-v2-followup',
    title: '⏰ Follow-ups',
    subtitle: 'Mensagens pra quando a lead parou de responder depois da prévia/preço.',
    kind: 'followup',
    steps: [
      {
        title: 'Follow-up (1 dia)',
        badge: 'Follow-up · 1 dia',
        tip: 'Use 1 dia depois de ela ver o preço e não responder mais.',
        content: `Oi [nome]! Passando rapidinho 😊 Fiquei curioso: o que você achou do valor e da ideia? Pode ser bem sincera, me ajuda muito a melhorar.`,
      },
      {
        title: 'Follow-up (3 dias)',
        badge: 'Follow-up · 3 dias',
        tip: 'Não é mensagem de texto — é uma ação: grave você mesma um vídeo curto (30s, tela do celular) mostrando como é fácil trocar um preço ou uma foto, e mande esse vídeo pra ela. Isso derruba o medo de "dar trabalho".',
        content: `Mande um vídeo curto (30s, gravado na tela do celular) mostrando como é fácil trocar um preço ou uma foto. Isso derruba o medo de dar trabalho.`,
      },
    ],
  },
  {
    id: 'funil-v2-objecoes',
    title: '🛑 Objeções',
    subtitle: 'Respostas prontas pra "vou pensar", "achei caro" e "tem que pagar todo mês?".',
    kind: 'objection',
    steps: [
      {
        title: '01 — "Vou pensar"',
        badge: 'Objeção',
        content: `Claro ❤️ Sem problema.
Só pra eu entender e até melhorar nossa apresentação: ficou alguma dúvida ou foi mais uma questão de pensar no investimento mesmo?`,
      },
      {
        title: '02 — "Achei caro"',
        badge: 'Objeção',
        content: `Entendi. Você achou caro pelo valor mensal ou imaginava que seria um pagamento único?`,
      },
      {
        title: '03 — "Tem que pagar todo mês?"',
        badge: 'Objeção',
        content: `Sim 😊 O catálogo fica hospedado online igual um site e você pode editar seus serviços, fotos e valores sempre que quiser.

Por isso funciona como uma assinatura.

É *R$27,90/mês*, sem fidelidade — você pode cancelar quando quiser.`,
      },
    ],
  },
  {
    id: 'funil-v2-estrategias',
    title: '💡 Estratégias de Convencimento',
    subtitle: 'Argumentos de reforço pra "por que eu preciso disso?" e a oferta de 7 dias grátis.',
    kind: 'strategy',
    steps: [
      {
        title: 'Estratégia 01 — Não é PDF, é um Link',
        badge: 'Reforço de Valor',
        tip: 'Use quando ela ainda não entendeu bem a diferença entre o catálogo e um PDF/tabela comum.',
        content: `Você deve estar se perguntando, mas porque eu preciso de um catálogo assim?

Diferente de tudo que tem no mercado: Não é um PDF, não é uma tabela. É um Link exclusivo seu! 😊

E o principal: É bonito, é interativo e leva sua cliente até o WhatsApp com apenas 1 clique. ❤️`,
      },
      {
        title: 'Estratégia 02 — Não é só bonito, é funcional',
        badge: 'Reforço de Valor',
        tip: 'Use com leads mais racionais/analíticas, que parecem focadas só na estética e não no resultado prático.',
        content: `Você deve estar se perguntando, mas porque eu preciso de um catálogo assim?

Você não deveria pensar apenas: "Olha como é bonito."

O que você deveria ter em mente é: "Isso faz sua cliente encontrar seu serviço, ver o valor e chegar até você para agendar sem você precisar ficar mandando tabela/PDF."`,
      },
      {
        title: '7 Dias Grátis',
        badge: 'Oferta Especial',
        tip: 'Use como última cartada com leads travadas no preço — reduz o risco percebido a praticamente zero.',
        content: `É *R$ 27,90 por mês*, sem fidelidade. Mas você começa grátis: eu monto o seu, você usa 7 dias com suas clientes de verdade, e só assina se fizer sentido pra você 😊
Me passa seu @ que eu já deixo pronto hoje?`,
      },
    ],
  },
];
