// Funil de Vendas X1 WhatsApp — Versão 3.0, criada pra nova estratégia de anúncios (2026-10-09):
// em vez de vender pelo X1, o anúncio manda direto pra Landing Page de vendas (`SalesLandingPage.tsx`)
// e a lead já chega no WhatsApp dizendo qual plano quer — o botão de cada card da LP manda uma
// mensagem pronta (ver `whatsappLink(...)` em `SalesLandingPage.tsx`):
//   • "Olá! Vi a página do StudioMenu e quero o Plano Catálogo por R$24,90/mês"
//   • "Olá! Vi a página do StudioMenu e quero o Plano Vitalício por R$197,00, pagamento único"
//
// Diferença chave pros outros 2 funis (`funil-ads-scripts.ts`, `funil-ads-v2-scripts.ts`): a lead
// já foi "esquentada" pela própria página de vendas — ela não precisa mais ser convencida do
// valor do produto, só precisa sentir segurança e facilidade no processo de criar o catálogo
// dela. Por isso os 4 funis abaixo NÃO têm etapa de "explicar o que é" ou "perguntar se ela
// quer experimentar" — eles vão direto pra coletar @ do Instagram e entregar.
//
// Primeiro funil (`funil-v3-01-direto`) é transcrição fiel da conversa real com a cliente Milena
// (fechou Vitalício R$197 em 2026-10-08) — o resto varia a abordagem comercial em cima dessa
// mesma espinha dorsal, pra testar qual converte melhor.
//
// Preços centralizados em `src/lib/pricing.ts`; os valores de Catálogo usados aqui (R$24,90/mês)
// são os de teste do X1 atual (`TEST_CATALOGO_PRICE` em `SalesLandingPage.tsx`), não o preço
// "oficial" de catálogo avulso (`CATALOGO_PRICE`, R$89,90) — se o teste mudar de preço, estas
// mensagens devem ser atualizadas junto, porque citam o valor literal que a lead acabou de ver.

export interface FunilV3Step {
  title: string;
  badge: string;
  tip?: string;
  content: string;
}

export type FunilV3Kind = 'funnel' | 'followup' | 'objection' | 'warm' | 'cold';

export interface FunilV3Group {
  id: string;
  title: string;
  subtitle: string;
  kind: FunilV3Kind;
  steps: FunilV3Step[];
}

/** Abertura é a mesma independente do plano que ela escolheu na Landing Page — só o tip muda,
 *  listando as 2 mensagens prontas que podem chegar, pra reconhecer de onde veio. Compartilhada
 *  pelos 4 funis principais, que divergem a partir da 2ª etapa. */
function buildOpeningSteps(): FunilV3Step[] {
  return [
    {
      title: '1️⃣ Boas-vindas',
      badge: 'Recepção',
      tip: 'A mensagem dela já chega pronta, variando só o plano escolhido: "Olá! Vi a página do StudioMenu e quero o Plano Catálogo por R$24,90/mês" ou "...Plano Vitalício por R$197,00, pagamento único". Não precisa confirmar de novo qual plano — ela já escolheu.',
      content: `Olá, seja bem-vinda! 😊`,
    },
  ];
}

export const FUNIL_ADS_V3_DATA: FunilV3Group[] = [
  {
    id: 'funil-v3-01-direto',
    title: '✅ Funil 01 — Direto ao Ponto (comprovado)',
    subtitle: 'Transcrição fiel da conversa que converteu de verdade (Milena, Vitalício R$197).',
    kind: 'funnel',
    steps: [
      ...buildOpeningSteps(),
      {
        title: '2️⃣ Explica o Processo + Pede Instagram',
        badge: 'Coleta de Informações',
        content: `Pra ter o seu Catálogo funciona assim: nós montamos o seu igualzinho, com seu nome e alguns serviços de exemplo (você pode colocar os seus depois, com calma). 😊

Você recebe o link pronto pra colocar na Bio do Instagram — entregamos em até 24 horas. ⏰

Se quiser experimentar, me manda seu @ do Instagram e o nome que quer colocar na capa, que nossa equipe já vai começar a criar o seu. ✨`,
      },
      {
        title: '3️⃣ Confirmação de Recebimento',
        badge: 'Qualificação',
        tip: 'Envie assim que ela mandar o @ e o nome da capa.',
        content: `Perfeito, [nome]! ❤️

Nossa equipe já vai começar a preparar o seu Catálogo. Te entregamos hoje ainda 😊`,
      },
      {
        title: '4️⃣ Checagem de Capa (enquanto monta)',
        badge: 'Personalização',
        tip: 'Opcional — mande se der tempo antes de finalizar. Se ela não tiver foto à mão, tranquilize: dá pra trocar depois, é bem fácil.',
        content: `[nome], estamos finalizando seu catálogo.

Aqui na capa você gostaria de colocar uma foto sua? Ou prefere deixar essa padrão mesmo?`,
      },
      {
        title: '5️⃣ Entrega do Link',
        badge: 'Entrega Final',
        tip: 'Link é do APP (catálogo + edição + assinatura juntos) — mesma entrega padrão dos outros funis.',
        content: `Prontinho, [nome]! Seu catálogo já está pronto. 🎉

👉 *[LINK DO APP]*

Lá dentro, toque em *"Visualizar catálogo"* pra ver como ficou. Se quiser mudar algo, é só tocar em *"Editar meu catálogo"* 💕

Os serviços que estão aí agora são só exemplos, pra você já ver tudo funcionando de verdade — você troca pelos seus quando quiser, no seu ritmo. ✨

Quando você fizer o pagamento esse link vira um App exclusivo seu. E dentro dele você tem acesso a todos os recursos do seu Catálogo. ➡️📱

Qualquer dúvida é só nos chamar aqui. 😊`,
      },
      {
        title: '6️⃣ Confirmação de Pagamento',
        badge: 'Pós-venda',
        tip: 'Envie assim que o pagamento cair (ou ela avisar "já fiz o pagamento").',
        content: `Olá, [nome]!! Identificamos seu pagamento! 🙏

Esperamos que você goste do StudioMenu! ✨

Esse canal aqui fica aberto pra qualquer dúvida ou dificuldade na edição. 💖`,
      },
    ],
  },
  {
    id: 'funil-v3-02-confianca',
    title: '🛡️ Funil 02 — Reforço de Confiança',
    subtitle: 'Mesma espinha dorsal, mas antecipa e neutraliza o medo de "já me comprometi" antes que ela pense nisso.',
    kind: 'funnel',
    steps: [
      ...buildOpeningSteps(),
      {
        title: '2️⃣A Explica o Processo + Reforça Segurança + Pede Instagram (Catálogo)',
        badge: 'Coleta de Informações · Catálogo',
        content: `Que bom ter você aqui! 😊

Pra você ficar tranquila: nós montamos o seu Catálogo do zero, com seu nome e alguns serviços de exemplo — você troca pelos seus quando tiver tempo, sem pressa nenhuma.

É sem fidelidade: se não fizer sentido pra você lá na frente, cancela quando quiser, sem burocracia.

Me manda seu @ do Instagram e o nome que quer colocar na capa, que a nossa equipe já começa a criar o seu. ✨`,
      },
      {
        title: '2️⃣B Explica o Processo + Reforça Segurança + Pede Instagram (Vitalício)',
        badge: 'Coleta de Informações · Vitalício',
        content: `Que bom ter você aqui! 😊

Pra você ficar tranquila: nós montamos o seu Catálogo do zero, com seu nome e alguns serviços de exemplo — você troca pelos seus quando tiver tempo, sem pressa nenhuma.

É pagamento único, sem mensalidade — o catálogo é seu pra sempre.

Me manda seu @ do Instagram e o nome que quer colocar na capa, que a nossa equipe já começa a criar o seu. ✨`,
      },
      {
        title: '3️⃣ Confirmação de Recebimento',
        badge: 'Qualificação',
        content: `Perfeito, [nome]! ❤️

Nossa equipe já vai começar a preparar o seu Catálogo. Te entregamos hoje ainda 😊`,
      },
      {
        title: '4️⃣ Entrega do Link + Suporte Reforçado',
        badge: 'Entrega Final',
        content: `Prontinho, [nome]! Seu catálogo já está pronto. 🎉

👉 *[LINK DO APP]*

Toque em *"Visualizar catálogo"* pra ver como ficou, e em *"Editar meu catálogo"* se quiser mudar algo. Os serviços que estão aí são só exemplos — você troca pelos seus no seu ritmo. ✨

E fica tranquila: qualquer dúvida na hora de editar, é só me chamar que eu te ajudo passo a passo. Você não vai precisar mexer nisso sozinha. 💕`,
      },
      {
        title: '5️⃣ Confirmação de Pagamento',
        badge: 'Pós-venda',
        content: `Olá, [nome]!! Identificamos seu pagamento! 🙏

Esperamos que você goste do StudioMenu! ✨

Esse canal aqui fica aberto pra qualquer dúvida — vamos juntas até você estar 100% satisfeita com o seu Catálogo. 💖`,
      },
    ],
  },
  {
    id: 'funil-v3-03-prioridade',
    title: '⚡ Funil 03 — Prioridade e Entrega Rápida',
    subtitle: 'Cria antecipação positiva — ela sente que foi priorizada, não só mais uma na fila.',
    kind: 'funnel',
    steps: [
      {
        title: '1️⃣ Boas-vindas com Prioridade',
        badge: 'Recepção',
        tip: 'Funciona pros 2 planos (Catálogo e Vitalício) sem adaptação — a frase não cita valor.',
        content: `Olá! Seja muito bem-vinda à StudioMenu 🥰`,
      },
      {
        title: '2️⃣ Processo + Pede Instagram (com urgência)',
        badge: 'Coleta de Informações',
        content: `Nossa equipe já está de prontidão pra criar o seu Catálogo — entregamos em algumas horas. 🚀

Me manda seu @ do Instagram e o nome que quer colocar na capa, que você já entra na nossa fila de criação prioritária. ⚡`,
      },
      {
        title: '3️⃣ Confirmação — Fila Prioritária',
        badge: 'Qualificação',
        content: `Recebido, [nome]! 🙌

Você já está na nossa fila de criação prioritária — deve ficar pronto ainda hoje 👀✨`,
      },
      {
        title: '4️⃣ Aviso de "Quase Pronto"',
        badge: 'Expectativa',
        tip: 'Envie uns 15-20 minutos antes de mandar o link de verdade — cria antecipação sem fazer ela esperar de fato mais tempo.',
        content: `[nome], já estamos finalizando os últimos detalhes do seu Catálogo! Só mais um pouquinho 🎬✨`,
      },
      {
        title: '5️⃣ Entrega do Link',
        badge: 'Entrega Final',
        content: `Prontinho, [nome]! Seu catálogo já está pronto. 🎉

👉 *[LINK DO APP]*

Toque em *"Visualizar catálogo"* pra ver como ficou, e em *"Editar meu catálogo"* se quiser mudar algo. Os serviços que estão aí são só exemplos — você troca pelos seus quando quiser. ✨

Qualquer dúvida é só nos chamar aqui. 😊`,
      },
      {
        title: '6️⃣ Confirmação de Pagamento',
        badge: 'Pós-venda',
        content: `Olá, [nome]!! Identificamos seu pagamento! 🙏

Esperamos que você goste do StudioMenu! ✨

Esse canal aqui fica aberto pra qualquer dúvida ou dificuldade na edição. 💖`,
      },
    ],
  },
  {
    id: 'funil-v3-04-consultivo',
    title: '🤝 Funil 04 — Consultivo e Personalizado',
    subtitle: 'Uma pergunta extra antes de montar — ela sente que o catálogo foi pensado pra ela, não só mais um genérico.',
    kind: 'funnel',
    steps: [
      ...buildOpeningSteps(),
      {
        title: '2️⃣ Pergunta Consultiva',
        badge: 'Qualificação',
        tip: 'Essa pergunta a mais é o diferencial desse funil — deixa a conversa mais pessoal antes de pedir o @.',
        content: `Antes de começar, me conta rapidinho: você já tem fotos dos seus trabalhos pra eu colocar no catálogo, ou prefere que a gente comece com fotos de exemplo e você troca depois, no seu ritmo? 😊`,
      },
      {
        title: '3️⃣ Pede Instagram com Base na Resposta',
        badge: 'Coleta de Informações',
        tip: 'Ajuste a 1ª frase conforme ela respondeu (tem fotos / prefere exemplo) — o resto é igual.',
        content: `Perfeito! Vou deixar anotado aqui com a gente. 📝

Agora me manda seu @ do Instagram e o nome que quer colocar na capa, que nossa equipe já começa a criar o seu — te entregamos hoje ainda. ✨`,
      },
      {
        title: '4️⃣ Confirmação de Recebimento',
        badge: 'Qualificação',
        content: `Perfeito, [nome]! ❤️

Nossa equipe já vai começar a preparar o seu Catálogo do jeito que a gente combinou. Te entregamos hoje ainda 😊`,
      },
      {
        title: '5️⃣ Entrega Personalizada',
        badge: 'Entrega Final',
        tip: 'Mencione explicitamente que o catálogo refletiu a preferência dela (fotos próprias ou de exemplo) — reforça que foi feito sob medida.',
        content: `Prontinho, [nome]! Seu catálogo já está pronto, do jeito que a gente combinou. 🎉

👉 *[LINK DO APP]*

Toque em *"Visualizar catálogo"* pra ver como ficou, e em *"Editar meu catálogo"* se quiser mudar algo a mais. ✨

Qualquer dúvida é só nos chamar aqui. 😊`,
      },
      {
        title: '6️⃣ Confirmação de Pagamento',
        badge: 'Pós-venda',
        content: `Olá, [nome]!! Identificamos seu pagamento! 🙏

Esperamos que você goste do StudioMenu! ✨

Esse canal aqui fica aberto pra qualquer dúvida ou dificuldade na edição. 💖`,
      },
    ],
  },
  {
    id: 'funil-v3-followup',
    title: '⏰ Follow-ups',
    subtitle: 'Mensagens pra quando a lead some depois de pedir o plano, mas antes de pagar.',
    kind: 'followup',
    steps: [
      {
        title: 'Sumiu depois de pedir o plano, antes de mandar o @',
        badge: 'Follow-up · Sem @',
        tip: 'Use algumas horas depois do primeiro contato, se ela não respondeu pedindo o @.',
        content: `Oi, [nome]! Passando rapidinho 😊 Fico no aguardo do seu @ do Instagram e do nome que você quer na capa pra já começar a criar o seu Catálogo. Qualquer dúvida, é só me chamar!`,
      },
      {
        title: 'Catálogo entregue, ela não pagou ainda',
        badge: 'Follow-up · 1 dia',
        tip: 'Reforça que ela já pode usar/testar o link antes de decidir — reduz a sensação de "comprar no escuro".',
        content: `Oi, [nome]! Tudo bem? 😊 Seu Catálogo já está pronto e no ar: *[LINK DO APP]*

Dá uma navegada com calma, veja como ficou. Qualquer coisa que quiser ajustar antes de assinar, é só me chamar que eu te ajudo. 💕`,
      },
      {
        title: 'Follow-up (3 dias, sem resposta)',
        badge: 'Follow-up · 3 dias',
        tip: 'Não é mensagem de texto — grave um vídeo curto (30s, tela do celular) mostrando como é fácil editar um preço ou trocar uma foto no catálogo dela. Derruba o medo de "dar trabalho".',
        content: `Mande um vídeo curto (30s, gravado na tela do celular) mostrando como é fácil trocar um preço ou uma foto no catálogo dela especificamente. Isso derruba o medo de dar trabalho.`,
      },
    ],
  },
  {
    id: 'funil-v3-objecoes',
    title: '🛑 Objeções',
    subtitle: 'Respostas prontas pras dúvidas mais comuns depois que ela já pediu o plano.',
    kind: 'objection',
    steps: [
      {
        title: '01 — "Posso pagar só depois de ver pronto?"',
        badge: 'Objeção',
        content: `Sim, sem problema! 😊 Eu já deixo o seu Catálogo pronto e você pode ver e testar à vontade. Você só precisa pagar quando quiser liberar o App completo pra editar e usar de verdade.`,
      },
      {
        title: '02 — "Quanto tempo demora pra ficar pronto?"',
        badge: 'Objeção',
        content: `Normalmente entregamos ainda no mesmo dia 😊 Assim que você me mandar o @ do Instagram e o nome da capa, nossa equipe já começa a criar o seu.`,
      },
      {
        title: '03 — "Dá pra trocar de plano depois (mensal ⇄ vitalício)?"',
        badge: 'Objeção',
        content: `Dá sim! Se você começar no Catálogo e depois quiser virar Vitalício (ou o contrário), é só me chamar aqui que a gente ajusta pra você, sem perder nada do que já estava configurado.`,
      },
      {
        title: '04 — "E se eu não souber editar sozinha?"',
        badge: 'Objeção',
        content: `Fica tranquila! 💕 É bem simples, direto no seu celular. E se precisar de ajuda, esse canal aqui fica aberto — é só me chamar que eu te ajudo passo a passo.`,
      },
    ],
  },
  {
    id: 'funil-v3-lead-morna',
    title: '🔥 Catálogo Pronto pra Lead Morna',
    subtitle: 'Pra leads que já demonstraram interesse e você já tem dados (Instagram, catálogo no WhatsApp) pra montar o catálogo sem ela pedir.',
    kind: 'warm',
    steps: [
      {
        title: '1️⃣ Abertura — Catálogo Já Pronto (sem ela pedir)',
        badge: 'Reativação',
        tip: 'Use quando você já tem Instagram/fotos/serviços dela o suficiente pra montar o catálogo de verdade (não um exemplo genérico) antes mesmo dela confirmar.',
        content: `Oi, [nome]! Tudo bem? 😊

Vi que você se interessou pelo Catálogo Digital do StudioMenu.

Sei que às vezes bate aquela dúvida: "será que isso é pra mim?", "será que minhas clientes vão usar?", "será que eu vou saber mexer sozinha?" — é super normal pensar nisso antes de decidir. 💭

Pra facilitar sua decisão, nossa equipe já criou o seu Catálogo com alguns serviços, só pra você sentir na prática a experiência que suas clientes teriam usando o link exclusivo do seu Studio. ✨

👉 *[LINK DO APP]*

Dá uma olhada com calma — é só clicar e navegar como se fosse uma cliente sua agendando um horário. Se curtir, me chama que a gente já ajeita tudo com seus serviços de verdade. 💕`,
      },
      {
        title: '2️⃣ Pergunta Aberta (se ela responder)',
        badge: 'Qualificação',
        content: `Que bom! ❤️ O que você achou?`,
      },
      {
        title: '3️⃣ Pergunta de Preço',
        badge: 'Preço & Valor',
        content: `Fico feliz que gostou! 😊 Você pode ter esse Catálogo de duas formas:

*Plano Catálogo* — R$24,90/mês, sem fidelidade, cancela quando quiser.
*Plano Vitalício* — R$197,00, pagamento único, sem mensalidade nenhuma.

Qual faz mais sentido pra você?`,
      },
      {
        title: '4️⃣ Objeção — "Vou Pensar" / "Não Sei Se Preciso Disso"',
        badge: 'Objeção',
        content: `Claro, sem problema ❤️ Só pra te ajudar a decidir: hoje, quando uma cliente pergunta seus valores, você manda como? Foto da tabela, PDF, digita na hora?

O Catálogo resolve exatamente isso — ela vê tudo sozinha, escolhe o serviço e já vai direto pro seu WhatsApp agendar, sem você precisar ficar respondendo um por um.`,
      },
      {
        title: '5️⃣ Fechamento — Troca pelos Dados de Verdade',
        badge: 'Coleta de Informações',
        content: `Perfeito, [nome]! 😍

Então me confirma: pode deixar os serviços e valores que eu já vi no seu Instagram/WhatsApp, ou prefere me passar atualizados? Assim que confirmar, já deixo tudo certinho no seu link. ✨`,
      },
    ],
  },
  {
    id: 'funil-v3-abordagem-fria',
    title: '❄️ Abordagem Fria',
    subtitle: '5 mensagens pra abordar profissionais encontradas no Google/Instagram que já usam algum catálogo informal (PDF, tabela, lista no WhatsApp).',
    kind: 'cold',
    steps: [
      {
        title: '01 — Elogio + Pergunta Leve',
        badge: 'Abordagem · Leve',
        tip: 'Boa primeira opção padrão — elogio genuíno antes de qualquer pitch, sem mencionar produto ainda.',
        content: `Oi! Vi seu trabalho por aqui e amei ✨ Posso te perguntar uma coisa rápida? Hoje, quando uma cliente pergunta seus valores, você manda como? Tabela, PDF, ou digita na hora?`,
      },
      {
        title: '02 — Descoberta Casual',
        badge: 'Abordagem · Casual',
        tip: 'Use quando ela claramente atende um nicho específico visível no perfil (lash, nail, estética).',
        content: `Oi! Encontrei seu Instagram e vi que você atende [nicho] 😊 Criei uma ferramenta que ajuda profissionais como você a organizar os serviços e preços num link bonitinho, pra não precisar mais mandar PDF ou tabela. Dá uma olhada sem compromisso: studiomenu.art`,
      },
      {
        title: '03 — Problema Comum',
        badge: 'Abordagem · Direta',
        tip: 'Mais direta — vai bem com quem parece ter perfil mais profissional/organizado, que provavelmente já sente essa dor.',
        content: `Oi, tudo bem? Percebi que muitas profissionais de [nicho] ainda mandam PDF ou tabela pra passar os valores — super comum, mas também meio trabalhoso, né? Criei algo que resolve isso: um link interativo só seu. Quer ver como ficaria?`,
      },
      {
        title: '04 — Pergunta Aberta e Consultiva',
        badge: 'Abordagem · Consultiva',
        tip: 'A mais sutil das 5 — não menciona produto na primeira mensagem, só abre a conversa pra entender o cenário dela antes.',
        content: `Oi, [nome]! Vi seu trabalho por aqui 😍 Você já tem algum link ou catálogo online pros seus serviços, ou ainda manda tudo direto na conversa com as clientes?`,
      },
      {
        title: '05 — Convite Direto pra Landing Page',
        badge: 'Abordagem · Direta',
        tip: 'Use quando quiser já mandar o link de cara — a landing page (não o catálogo de demonstração) explica tudo sozinha.',
        content: `Oi! Vi seu perfil e achei seu trabalho muito bonito ✨ Separei um minutinho pra te mostrar uma ideia que pode facilitar sua vida com as clientes — é rapidinho de ver: studiomenu.art

Dá uma olhada quando puder, sem compromisso nenhum 😊`,
      },
    ],
  },
];
