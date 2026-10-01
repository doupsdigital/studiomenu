// Playbook de Vendas X1 WhatsApp — funil reconstruído a partir de 2
// conversas reais que converteram no antigo LashMenu (mesma lógica de
// passos, adaptada pro produto e preço atuais do StudioMenu):
// 1. Cria interesse (só na abordagem fria — no anúncio ela já chega
// interessada) → 2. Mostra o catálogo ao vivo → 3. Ela gosta, explica a
// personalização → 4. Pede só o essencial (foto, nome, 3 a 5 procedimentos
// com valores, qualquer formato) → 5. Confirma recebimento → 6. Entrega o
// catálogo pronto (link do app, com catálogo + edição + assinatura dentro)
// → 7. Só AÍ explica preço/pagamento, quando ela reagir ou perguntar.
//
// 4 funis de origem — mesmo funil de fundo (catálogo x agendamento), a
// única diferença real é a abertura: anúncio ela já chegou interessada
// (vai direto pro exemplo ao vivo); abordagem fria precisa criar o
// desejo antes (elogio + dor) pra só depois oferecer o exemplo. A partir
// daí os dois convergem pros mesmos passos de personalização/pedido/
// confirmação — por isso cada funil tem sua sequência completa aqui
// (evita ficar pulando de aba no meio de uma conversa real).
//
// Duas regras fixas em toda mensagem:
// - NUNCA usar "grátis"/"de graça" — não é o foco do produto.
// - Mensagens curtas e diretas (o exemplo real que converteu era enxuto;
//   texto longo derruba conversão).

export type ScriptCategory =
  | 'anuncio-catalogo'
  | 'anuncio-agendamento'
  | 'abordagem-catalogo'
  | 'abordagem-agendamento'
  | 'abordagem-03'
  | 'abordagem-04'
  | 'abordagem-05'
  | 'abordagem-06'
  | 'abordagem-07'
  | 'abordagem-08'
  | 'abordagem-09'
  | 'abordagem-10'
  | 'entrega'
  | 'objecao'
  | 'followup'
  | 'reativacao-lashmenu';

export interface ScriptItem {
  id: string;
  category: ScriptCategory;
  categoryName: string;
  title: string;
  tip?: string;
  content: string;
}

export const SCRIPT_CATEGORIES: { key: 'all' | ScriptCategory; label: string }[] = [
  { key: 'all', label: '⚡ Todos os Scripts' },
  { key: 'anuncio-catalogo', label: '🗂️ Funil Anúncio 01: Catálogo' },
  { key: 'anuncio-agendamento', label: '📅 Funil Anúncio 02: Agendamento Automático' },
  { key: 'abordagem-catalogo', label: '🎯 Funil Abordagem 01: Catálogo' },
  { key: 'abordagem-agendamento', label: '📆 Funil Abordagem 02: Agendamento Automático' },
  { key: 'abordagem-03', label: `🔍 Funil Abordagem 03: Agenda — "Já dá pra agendar por link?"` },
  { key: 'abordagem-04', label: `📲 Funil Abordagem 04: Agenda — "Responde na hora?"` },
  { key: 'abordagem-05', label: `⏰ Funil Abordagem 05: Agenda — "Já perdeu cliente?"` },
  { key: 'abordagem-06', label: `🗂️ Funil Abordagem 06: Catálogo — "Link exclusivo de serviços"` },
  { key: 'abordagem-07', label: `💬 Funil Abordagem 07: Catálogo — "Como manda seus valores?"` },
  { key: 'abordagem-08', label: `🔗 Funil Abordagem 08: Catálogo — "Site aponta pro Instagram"` },
  { key: 'abordagem-09', label: `🔁 Funil Abordagem 09: Já Tem Link — Elogio + Vídeo (Prévia sob Pedido)` },
  { key: 'abordagem-10', label: `📋 Funil Abordagem 10: Já Tem Link — Prévia Pronta` },
  { key: 'entrega', label: '🎁 Entrega, Prévia & Pagamento' },
  { key: 'objecao', label: '🛡️ Quebra de Objeções' },
  { key: 'followup', label: '🔄 Follow-up / Resgate' },
  { key: 'reativacao-lashmenu', label: '⏳ Reativação LashMenu (Temporário)' },
];

export const SCRIPTS_DATA: ScriptItem[] = [
  // ==========================================================================
  // FUNIL ANÚNCIO 01 — CATÁLOGO (ela já chegou interessada, veio de anúncio)
  // ==========================================================================
  {
    id: 'anuncio-catalogo-1',
    category: 'anuncio-catalogo',
    categoryName: 'Funil Anúncio 01: Catálogo',
    title: '1️⃣ Resposta ao Anúncio — Apresenta o Catálogo ao Vivo',
    tip: 'Primeira resposta pra quem chamou pelo anúncio. Troque /lash por /nail, /estetica ou /studio conforme o nicho dela.',
    content: `Oii! Que bom que você se interessou pelo StudioMenu! 😍

Olha como fica um catálogo digital, ao vivo, no celular:
👉 https://studiomenu.art/c/showcase/lash

Consigo montar exatamente assim, com a sua marca. Curtiu o estilo? 💕`,
  },
  {
    id: 'anuncio-catalogo-2',
    category: 'anuncio-catalogo',
    categoryName: 'Funil Anúncio 01: Catálogo',
    title: '2️⃣ Ela Gostou — Explica a Personalização',
    tip: 'Envie assim que ela responder bem sobre o exemplo.',
    content: `Que ótimo! 😍 Fica ainda mais lindo com a identidade do seu estúdio: seu nome, seus procedimentos e valores.

Posso te mostrar como ficaria personalizado pra você? 💕`,
  },
  {
    id: 'anuncio-catalogo-3',
    category: 'anuncio-catalogo',
    categoryName: 'Funil Anúncio 01: Catálogo',
    title: '3️⃣ Pedido das Informações (Só o Essencial)',
    tip: 'Peça só o mínimo pra montar a prévia — nada de formulário longo. Aceite qualquer formato: foto, print, lista solta.',
    content: `Perfeito! Me manda por aqui:

📸 Uma foto sua ou do seu espaço
📝 O nome que você quer no catálogo
💰 De 3 a 5 procedimentos com os valores

Com isso já consigo montar sua prévia! ✨`,
  },
  {
    id: 'anuncio-catalogo-4',
    category: 'anuncio-catalogo',
    categoryName: 'Funil Anúncio 01: Catálogo',
    title: '4️⃣ Confirmação de Recebimento',
    tip: 'Envie assim que ela mandar o material.',
    content: `Recebi tudo por aqui! 🎉

Vamos preparar com muito carinho. Assim que sua prévia estiver pronta eu te mando aqui! 💕`,
  },

  // ==========================================================================
  // FUNIL ANÚNCIO 02 — AGENDAMENTO AUTOMÁTICO (ela já chegou interessada)
  // ==========================================================================
  {
    id: 'anuncio-agendamento-1',
    category: 'anuncio-agendamento',
    categoryName: 'Funil Anúncio 02: Agendamento Automático',
    title: '1️⃣ Resposta ao Anúncio — Dor do Agendamento Manual',
    tip: 'Troque /lash por /nail, /estetica ou /studio conforme o nicho dela.',
    content: `Oi! Cansada de ficar marcando e remarcando horário no WhatsApp? 😮‍💨

Olha esse catálogo ao vivo — nele a cliente agenda sozinha, sem trocar mensagem com você:
👉 https://studiomenu.art/c/showcase/lash

Curtiu a ideia? 💕`,
  },
  {
    id: 'anuncio-agendamento-2',
    category: 'anuncio-agendamento',
    categoryName: 'Funil Anúncio 02: Agendamento Automático',
    title: '2️⃣ Ela Gostou — Explica a Personalização + Agenda',
    tip: 'Envie assim que ela responder bem sobre o exemplo.',
    content: `Que ótimo! 😍 Fica com a identidade do seu estúdio — nome, procedimentos, valores — e com sua própria agenda funcionando dentro dele.

Posso te mostrar como ficaria personalizado pra você? 💕`,
  },
  {
    id: 'anuncio-agendamento-3',
    category: 'anuncio-agendamento',
    categoryName: 'Funil Anúncio 02: Agendamento Automático',
    title: '3️⃣ Pedido das Informações (+ Horários de Atendimento)',
    tip: 'Mesmo pedido do Funil de Catálogo, só acrescenta os dias/horários — essencial pro agendamento automático. Continua aceitando qualquer formato.',
    content: `Perfeito! Me manda por aqui:

📸 Uma foto sua ou do seu espaço
📝 O nome que você quer no catálogo
💰 De 3 a 5 procedimentos com os valores
🗓️ Seus dias e horários de atendimento

Com isso já consigo montar sua prévia! ✨`,
  },
  {
    id: 'anuncio-agendamento-4',
    category: 'anuncio-agendamento',
    categoryName: 'Funil Anúncio 02: Agendamento Automático',
    title: '4️⃣ Confirmação de Recebimento',
    tip: 'Envie assim que ela mandar o material.',
    content: `Recebi tudo por aqui! 🎉

Vamos preparar com muito carinho, já pensando no seu agendamento automático. Assim que sua prévia estiver pronta eu te mando aqui! 💕`,
  },

  // ==========================================================================
  // FUNIL ABORDAGEM 01 — CATÁLOGO (abordagem fria: precisa criar o desejo
  // antes de oferecer o exemplo — ela não chamou primeiro)
  // ==========================================================================
  {
    id: 'abordagem-catalogo-1a',
    category: 'abordagem-catalogo',
    categoryName: 'Funil Abordagem 01: Catálogo',
    title: '1️⃣ Abordagem Fria — Variante A (Achou pelo Google Meu Negócio)',
    tip: 'Use com estúdios encontrados pesquisando no Google Meu Negócio/Maps (ex: "lash designer perto de mim"). Não manda link ainda — só desperta o interesse. Alterne entre as 3 variantes (A/B/C) a cada abordagem nova — mandar sempre a mesma mensagem em massa aumenta risco de bloqueio no WhatsApp.',
    content: `Oii! Achei seu estúdio pesquisando no Google e adorei o que vi! 👏✨

Notei que seu perfil ainda não tem um catálogo digital vinculado — um link que mostra seus serviços e preços de um jeito bem mais profissional.

Posso te mandar um exemplo rápido?`,
  },
  {
    id: 'abordagem-catalogo-1b',
    category: 'abordagem-catalogo',
    categoryName: 'Funil Abordagem 01: Catálogo',
    title: '1️⃣ Abordagem Fria — Variante B (Pergunta, Sem Afirmar Nada)',
    tip: 'Em vez de dizer que notou o PDF dela, pergunta — soa mais natural e abre conversa mesmo se ela já tiver algo digital.',
    content: `Oii! Passei aqui e amei seu trabalho! 👏✨

Você já tem um catálogo digital do seu estúdio, ou ainda manda tabela por print/PDF pras clientes?

Se quiser, te mostro um jeito bem mais profissional de fazer isso 💕`,
  },
  {
    id: 'abordagem-catalogo-1c',
    category: 'abordagem-catalogo',
    categoryName: 'Funil Abordagem 01: Catálogo',
    title: '1️⃣ Abordagem Fria — Variante C (Curiosidade, Ângulo Instagram)',
    tip: 'Ângulo mais leve, sem mencionar PDF/print nenhuma vez — foca em como ela se apresenta hoje.',
    content: `Oii! Seu trabalho é show, parabéns! ✨

Bateu uma curiosidade aqui: você já tem um catálogo digital do seu estúdio, ou as clientes só veem pelo Instagram mesmo?

Posso te mostrar um exemplo bem bacana, se quiser 😊`,
  },
  {
    id: 'abordagem-catalogo-2',
    category: 'abordagem-catalogo',
    categoryName: 'Funil Abordagem 01: Catálogo',
    title: '2️⃣ Ela Topou Ver — Apresenta o Catálogo ao Vivo',
    tip: 'Envie assim que ela topar ver o exemplo. Troque /lash por /nail, /estetica ou /studio conforme o nicho dela.',
    content: `Show! 😍 Olha como fica, ao vivo, no celular:
👉 https://studiomenu.art/c/showcase/lash

Consigo montar exatamente assim, com a sua marca. Curtiu o estilo?`,
  },
  {
    id: 'abordagem-catalogo-3',
    category: 'abordagem-catalogo',
    categoryName: 'Funil Abordagem 01: Catálogo',
    title: '3️⃣ Ela Gostou — Explica a Personalização',
    tip: 'A partir daqui o funil converge com o de anúncio.',
    content: `Que ótimo! 😍 Fica ainda mais lindo com a identidade do seu estúdio: seu nome, seus procedimentos e valores.

Posso te mostrar como ficaria personalizado pra você? 💕`,
  },
  {
    id: 'abordagem-catalogo-4',
    category: 'abordagem-catalogo',
    categoryName: 'Funil Abordagem 01: Catálogo',
    title: '4️⃣ Pedido das Informações (Só o Essencial)',
    tip: 'Peça só o mínimo pra montar a prévia — nada de formulário longo. Aceite qualquer formato: foto, print, lista solta.',
    content: `Perfeito! Me manda por aqui:

📸 Uma foto sua ou do seu espaço
📝 O nome que você quer no catálogo
💰 De 3 a 5 procedimentos com os valores

Com isso já consigo montar sua prévia! ✨`,
  },
  {
    id: 'abordagem-catalogo-5',
    category: 'abordagem-catalogo',
    categoryName: 'Funil Abordagem 01: Catálogo',
    title: '5️⃣ Confirmação de Recebimento',
    tip: 'Envie assim que ela mandar o material.',
    content: `Recebi tudo por aqui! 🎉

Vamos preparar com muito carinho. Assim que sua prévia estiver pronta eu te mando aqui! 💕`,
  },

  // ==========================================================================
  // FUNIL ABORDAGEM 02 — AGENDAMENTO AUTOMÁTICO (abordagem fria: cria o
  // desejo com a dor do agendamento antes de oferecer o exemplo)
  // ==========================================================================
  {
    id: 'abordagem-agendamento-1a',
    category: 'abordagem-agendamento',
    categoryName: 'Funil Abordagem 02: Agendamento Automático',
    title: '1️⃣ Abordagem Fria — Variante A (Achou pelo Google Meu Negócio)',
    tip: 'Use com estúdios encontrados pesquisando no Google Meu Negócio/Maps (ex: "lash designer perto de mim"). Não manda link ainda — só desperta o interesse. Alterne entre as 3 variantes (A/B/C) a cada abordagem nova — mandar sempre a mesma mensagem em massa aumenta risco de bloqueio no WhatsApp.',
    content: `Oi! Achei seu estúdio pesquisando no Google e o trabalho é show! 👏✨

Vi que o agendamento ainda é só por WhatsApp — dá pra deixar sua cliente marcar sozinha, direto por um link no seu perfil.

Posso te mostrar um exemplo rápido?`,
  },
  {
    id: 'abordagem-agendamento-1b',
    category: 'abordagem-agendamento',
    categoryName: 'Funil Abordagem 02: Agendamento Automático',
    title: '1️⃣ Abordagem Fria — Variante B (Pergunta, Sem Afirmar Nada)',
    tip: 'Em vez de afirmar que o WhatsApp dela vive lotado, pergunta como ela agenda hoje — abre conversa mesmo se ela já tiver alguma solução.',
    content: `Oi! Passei aqui e curti seu trabalho! ✨

Hoje, como funciona seu agendamento? É tudo marcando e remarcando pelo WhatsApp mesmo?

Se quiser, te mostro um jeito da cliente marcar sozinha, sem você precisar responder uma por uma 💕`,
  },
  {
    id: 'abordagem-agendamento-1c',
    category: 'abordagem-agendamento',
    categoryName: 'Funil Abordagem 02: Agendamento Automático',
    title: '1️⃣ Abordagem Fria — Variante C (Curiosidade, Tom Leve)',
    tip: 'Ângulo mais leve e empático, sem citar "WhatsApp lotado" diretamente.',
    content: `Oi! Seu trabalho é lindo, parabéns! 😍

Bateu uma curiosidade aqui: seu WhatsApp deve receber bastante mensagem de agendamento, né? Como você dá conta de tudo?

Posso te mostrar um jeito de deixar isso automático, se quiser 💕`,
  },
  {
    id: 'abordagem-agendamento-2',
    category: 'abordagem-agendamento',
    categoryName: 'Funil Abordagem 02: Agendamento Automático',
    title: '2️⃣ Ela Topou Ver — Apresenta o Catálogo com Agendamento ao Vivo',
    tip: 'Envie assim que ela topar ver o exemplo. Troque /lash por /nail, /estetica ou /studio conforme o nicho dela.',
    content: `Show! 😍 Olha como fica, ao vivo, no celular — a cliente agenda direto por aqui:
👉 https://studiomenu.art/c/showcase/lash

Curtiu a ideia?`,
  },
  {
    id: 'abordagem-agendamento-3',
    category: 'abordagem-agendamento',
    categoryName: 'Funil Abordagem 02: Agendamento Automático',
    title: '3️⃣ Ela Gostou — Explica a Personalização + Agenda',
    tip: 'A partir daqui o funil converge com o de anúncio.',
    content: `Que ótimo! 😍 Fica com a identidade do seu estúdio — nome, procedimentos, valores — e com sua própria agenda funcionando dentro dele.

Posso te mostrar como ficaria personalizado pra você? 💕`,
  },
  {
    id: 'abordagem-agendamento-4',
    category: 'abordagem-agendamento',
    categoryName: 'Funil Abordagem 02: Agendamento Automático',
    title: '4️⃣ Pedido das Informações (+ Horários de Atendimento)',
    tip: 'Mesmo pedido do Funil de Catálogo, só acrescenta os dias/horários — essencial pro agendamento automático. Continua aceitando qualquer formato.',
    content: `Perfeito! Me manda por aqui:

📸 Uma foto sua ou do seu espaço
📝 O nome que você quer no catálogo
💰 De 3 a 5 procedimentos com os valores
🗓️ Seus dias e horários de atendimento

Com isso já consigo montar sua prévia! ✨`,
  },
  {
    id: 'abordagem-agendamento-5',
    category: 'abordagem-agendamento',
    categoryName: 'Funil Abordagem 02: Agendamento Automático',
    title: '5️⃣ Confirmação de Recebimento',
    tip: 'Envie assim que ela mandar o material.',
    content: `Recebi tudo por aqui! 🎉

Vamos preparar com muito carinho, já pensando no seu agendamento automático. Assim que sua prévia estiver pronta eu te mando aqui! 💕`,
  },

  // ==========================================================================
  // FUNIL ABORDAGEM 03 — AGENDA — "JÁ DÁ PRA AGENDAR POR LINK?" (Google/Maps, spreadsheet Funis_StudioMenu.xlsx)
  // ==========================================================================
  {
    id: 'abordagem-03-1',
    category: 'abordagem-03',
    categoryName: `Funil Abordagem 03: Agenda — "Já dá pra agendar por link?"`,
    title: `1️⃣ Primeira Mensagem`,
    tip: `Por que está aqui: Curiosidade + a dor mais forte (responder agendamento um por um). O vídeo já desperta vontade de ver. · Dia 0 · ótimo pra studios com agenda cheia · Não precisa configurar nada no Google: ela mesma cola o link na bio e no campo 'Site'.`,
    content: `Oi, [Nome]! Tudo bem? Aqui é do StudioMenu, de Goiânia. Te achei no Google pesquisando [nail designer]. 😊

Uma curiosidade: você sabia que dá pra ter um link exclusivo seu onde a cliente vê seus serviços e já marca o horário sozinha? Você coloca na bio do Instagram e no Google, e para de responder agendamento um por um. 📅

Gravei um vídeo de 20 segundos mostrando como fica na prática. Quer dar uma olhadinha? 🎥`,
  },
  {
    id: 'abordagem-03-2',
    category: 'abordagem-03',
    categoryName: `Funil Abordagem 03: Agenda — "Já dá pra agendar por link?"`,
    title: `2️⃣ Ela Respondeu`,
    tip: `'Quero ver' / 'Manda' / 'Como assim?' · Se ela disser que já tem agenda online: 'Que ótimo! Você usa qual?' — ouça e ofereça o Catálogo (F4) como complemento. · Mande o vídeo do nicho dela, como vídeo normal (não como documento).`,
    content: `Olha aí 👇
[📹 envie o vídeo de 20s — lash ou nail]

É uma página com seu nome no link: a cliente vê seus serviços, valores e horários livres, e já marca ali. Você coloca na bio e no Google.

Se quiser mexer você mesma: https://studiomenu.art/c/showcase/lash`,
  },
  {
    id: 'abordagem-03-3',
    category: 'abordagem-03',
    categoryName: `Funil Abordagem 03: Agenda — "Já dá pra agendar por link?"`,
    title: `3️⃣ Ela Gostou do Exemplo`,
    tip: `Logo após ela reagir bem · Pouco esforço pra ela + 'ver antes de decidir' tira o risco.`,
    content: `Que bom que curtiu! Consigo montar um desse com seu nome, seus serviços e sua agenda, pra você ver pronto antes de decidir qualquer coisa. Me manda só:

• Seu @ do Instagram
• Um print com 3 a 5 serviços e valores
• Seus dias e horários de atendimento`,
  },
  {
    id: 'abordagem-03-4',
    category: 'abordagem-03',
    categoryName: `Funil Abordagem 03: Agenda — "Já dá pra agendar por link?"`,
    title: `4️⃣ Ela Mandou o Material`,
    tip: `Assim que chegar · Prazo concreto passa profissionalismo. Cumpra o prazo.`,
    content: `Recebi tudo! Te mando sua prévia com a agenda aqui até [hoje à tarde / amanhã de manhã].`,
  },
  {
    id: 'abordagem-03-5',
    category: 'abordagem-03',
    categoryName: `Funil Abordagem 03: Agenda — "Já dá pra agendar por link?"`,
    title: `5️⃣ Entrega da Prévia + Preço`,
    tip: `Quando a prévia estiver pronta · Deixa claro que ela escolhe entre os dois modelos — evita perder venda por achar que só tem a opção mais cara. Objeção? Veja o bloco no fim da aba.`,
    content: `Pronto, [Nome]! Olha como ficou o seu:
👉 [link da prévia]

Você escolhe como continuar:

📋 *Básico — R$29,90/mês*: link exclusivo com suas fotos, serviços e valores — a cliente chama você no WhatsApp pra agendar.
📅 *Plus — R$59,90/mês*: tudo isso + o agendamento automático que você viu no vídeo — a cliente marca sozinha, sem você responder uma por uma.

Nos dois você edita tudo pelo celular, sem fidelidade — paga só enquanto estiver usando.

Qual desses faz mais sentido pra você?`,
  },
  {
    id: 'abordagem-03-6',
    category: 'abordagem-03',
    categoryName: `Funil Abordagem 03: Agenda — "Já dá pra agendar por link?"`,
    title: `🔄 Follow-up 1 (Sem Resposta)`,
    tip: `+2 dias sem resposta · O vídeo chama mais atenção que link — ela vê o produto sem precisar dizer sim.`,
    content: `Oi, [Nome]! Vou deixar aqui um vídeo de 20s mostrando a agenda na prática, pra você olhar quando tiver um tempinho:
[📹 envie o vídeo de 20s — lash ou nail]`,
  },
  {
    id: 'abordagem-03-7',
    category: 'abordagem-03',
    categoryName: `Funil Abordagem 03: Agenda — "Já dá pra agendar por link?"`,
    title: `🔄 Follow-up 2 (Sem Resposta)`,
    tip: `+4 dias depois do FU1 · Duas opções, dá pra responder com 1 palavra.`,
    content: `[Nome], pergunta sincera: agendamento online não é prioridade pra você agora, ou só não deu tempo de olhar ainda? Qualquer resposta tá ótima.`,
  },
  {
    id: 'abordagem-03-8',
    category: 'abordagem-03',
    categoryName: `Funil Abordagem 03: Agenda — "Já dá pra agendar por link?"`,
    title: `🔄 Follow-up 3 (Sem Resposta)`,
    tip: `+7 dias depois do FU2 · Despedida costuma trazer resposta de quem estava adiando. Depois: status 'Sem resposta'.`,
    content: `Oi, [Nome]! Não quero ficar te incomodando, então essa é minha última mensagem. Se um dia quiser a agenda online no seu studio, é só me chamar aqui. Sucesso nos atendimentos!`,
  },

  // ==========================================================================
  // FUNIL ABORDAGEM 04 — AGENDA — "RESPONDE NA HORA?" (Google/Maps, spreadsheet Funis_StudioMenu.xlsx)
  // ==========================================================================
  {
    id: 'abordagem-04-1',
    category: 'abordagem-04',
    categoryName: `Funil Abordagem 04: Agenda — "Responde na hora?"`,
    title: `1️⃣ Primeira Mensagem`,
    tip: `Por que está aqui: Faz ela mesma perceber a dor, sem você afirmar nada. · Dia 0 · ótimo pra lash e nail (atendimentos longos) · Não fale do produto aqui. Só a pergunta.`,
    content: `Oi, [Nome]! Tudo bem? Aqui é do StudioMenu, de Goiânia. Te achei no Google pesquisando [lash designer]. 😊

Pergunta rápida: quando cliente te chama pra agendar à noite ou enquanto você tá atendendo, você consegue responder na hora ou fica pra depois? ⏰`,
  },
  {
    id: 'abordagem-04-2',
    category: 'abordagem-04',
    categoryName: `Funil Abordagem 04: Agenda — "Responde na hora?"`,
    title: `2️⃣ Ela Respondeu`,
    tip: `Qualquer resposta · Se ela disser que responde sempre na hora: elogie e ofereça o Catálogo (F4/F5) — a dor dela é outra. · Mande o vídeo do nicho dela, como vídeo normal (não como documento).`,
    content: `Super normal na correria! Pergunto porque a gente faz um link exclusivo pra studios, pra colocar na bio e no Google: a cliente vê seus horários livres e marca sozinha, até de madrugada.

Gravei um vídeo rapidinho mostrando na prática 👇
[📹 envie o vídeo de 20s — lash ou nail]

Se quiser mexer você mesma: https://studiomenu.art/c/showcase/lash`,
  },
  {
    id: 'abordagem-04-3',
    category: 'abordagem-04',
    categoryName: `Funil Abordagem 04: Agenda — "Responde na hora?"`,
    title: `3️⃣ Ela Gostou do Exemplo`,
    tip: `Logo após ela reagir bem · Pouco esforço pra ela + 'ver antes de decidir' tira o risco.`,
    content: `Que bom que curtiu! Consigo montar um desse com seu nome, seus serviços e sua agenda, pra você ver pronto antes de decidir qualquer coisa. Me manda só:

• Seu @ do Instagram
• Um print com 3 a 5 serviços e valores
• Seus dias e horários de atendimento`,
  },
  {
    id: 'abordagem-04-4',
    category: 'abordagem-04',
    categoryName: `Funil Abordagem 04: Agenda — "Responde na hora?"`,
    title: `4️⃣ Ela Mandou o Material`,
    tip: `Assim que chegar · Prazo concreto passa profissionalismo. Cumpra o prazo.`,
    content: `Recebi tudo! Te mando sua prévia com a agenda aqui até [hoje à tarde / amanhã de manhã].`,
  },
  {
    id: 'abordagem-04-5',
    category: 'abordagem-04',
    categoryName: `Funil Abordagem 04: Agenda — "Responde na hora?"`,
    title: `5️⃣ Entrega da Prévia + Preço`,
    tip: `Quando a prévia estiver pronta · Deixa claro que ela escolhe entre os dois modelos — evita perder venda por achar que só tem a opção mais cara. Objeção? Veja o bloco no fim da aba.`,
    content: `Pronto, [Nome]! Olha como ficou o seu:
👉 [link da prévia]

Você escolhe como continuar:

📋 *Básico — R$29,90/mês*: link exclusivo com suas fotos, serviços e valores — a cliente chama você no WhatsApp pra agendar.
📅 *Plus — R$59,90/mês*: tudo isso + o agendamento automático que você viu no vídeo — a cliente marca sozinha, sem você responder uma por uma.

Nos dois você edita tudo pelo celular, sem fidelidade — paga só enquanto estiver usando.

Qual desses faz mais sentido pra você?`,
  },
  {
    id: 'abordagem-04-6',
    category: 'abordagem-04',
    categoryName: `Funil Abordagem 04: Agenda — "Responde na hora?"`,
    title: `🔄 Follow-up 1 (Sem Resposta)`,
    tip: `+2 dias sem resposta · O vídeo chama mais atenção que link — ela vê o produto sem precisar dizer sim.`,
    content: `Oi, [Nome]! Sei que a agenda é corrida 😅 Deixo aqui um vídeo de 20s do que eu ia te mostrar:
[📹 envie o vídeo de 20s — lash ou nail]

É uma agenda online onde a cliente vê seus horários e marca sozinha.`,
  },
  {
    id: 'abordagem-04-7',
    category: 'abordagem-04',
    categoryName: `Funil Abordagem 04: Agenda — "Responde na hora?"`,
    title: `🔄 Follow-up 2 (Sem Resposta)`,
    tip: `+4 dias depois do FU1 · Duas opções, dá pra responder com 1 palavra.`,
    content: `[Nome], pergunta sincera: agendamento online não é prioridade pra você agora, ou só não deu tempo de olhar ainda? Qualquer resposta tá ótima.`,
  },
  {
    id: 'abordagem-04-8',
    category: 'abordagem-04',
    categoryName: `Funil Abordagem 04: Agenda — "Responde na hora?"`,
    title: `🔄 Follow-up 3 (Sem Resposta)`,
    tip: `+7 dias depois do FU2 · Despedida costuma trazer resposta de quem estava adiando. Depois: status 'Sem resposta'.`,
    content: `Oi, [Nome]! Não quero ficar te incomodando, então essa é minha última mensagem. Se um dia quiser a agenda online no seu studio, é só me chamar aqui. Sucesso nos atendimentos!`,
  },

  // ==========================================================================
  // FUNIL ABORDAGEM 05 — AGENDA — "JÁ PERDEU CLIENTE?" (Google/Maps, spreadsheet Funis_StudioMenu.xlsx)
  // ==========================================================================
  {
    id: 'abordagem-05-1',
    category: 'abordagem-05',
    categoryName: `Funil Abordagem 05: Agenda — "Já perdeu cliente?"`,
    title: `1️⃣ Primeira Mensagem`,
    tip: `Por que está aqui: Ângulo de perda: medo de perder cliente move mais que promessa de ganho. Pergunta fácil de responder. · Dia 0 · qualquer lead do Google · Não fale do produto aqui. Só a pergunta.`,
    content: `Oi, [Nome]! Tudo bem? Aqui é do StudioMenu, de Goiânia. Te achei no Google pesquisando [lash designer]. 😊

Uma curiosidade: já aconteceu de cliente te chamar pra agendar, você demorar um pouquinho pra responder e ela acabar marcando com outra? 😅`,
  },
  {
    id: 'abordagem-05-2',
    category: 'abordagem-05',
    categoryName: `Funil Abordagem 05: Agenda — "Já perdeu cliente?"`,
    title: `2️⃣ Ela Respondeu`,
    tip: `Qualquer resposta · Se ela disser que nunca aconteceu: elogie a organização e ofereça o Catálogo (F4) como complemento. · Mande o vídeo do nicho dela, como vídeo normal (não como documento).`,
    content: `Acontece com quase todo studio, né? É que a gente faz um link exclusivo pra colocar na bio e no Google: a cliente vê seus horários livres e já marca na hora, sem depender de você responder.

Gravei um vídeo rapidinho mostrando na prática 👇
[📹 envie o vídeo de 20s — lash ou nail]

Se quiser mexer você mesma: https://studiomenu.art/c/showcase/lash`,
  },
  {
    id: 'abordagem-05-3',
    category: 'abordagem-05',
    categoryName: `Funil Abordagem 05: Agenda — "Já perdeu cliente?"`,
    title: `3️⃣ Ela Gostou do Exemplo`,
    tip: `Logo após ela reagir bem · Pouco esforço pra ela + 'ver antes de decidir' tira o risco.`,
    content: `Que bom que curtiu! Consigo montar um desse com seu nome, seus serviços e sua agenda, pra você ver pronto antes de decidir qualquer coisa. Me manda só:

• Seu @ do Instagram
• Um print com 3 a 5 serviços e valores
• Seus dias e horários de atendimento`,
  },
  {
    id: 'abordagem-05-4',
    category: 'abordagem-05',
    categoryName: `Funil Abordagem 05: Agenda — "Já perdeu cliente?"`,
    title: `4️⃣ Ela Mandou o Material`,
    tip: `Assim que chegar · Prazo concreto passa profissionalismo. Cumpra o prazo.`,
    content: `Recebi tudo! Te mando sua prévia com a agenda aqui até [hoje à tarde / amanhã de manhã].`,
  },
  {
    id: 'abordagem-05-5',
    category: 'abordagem-05',
    categoryName: `Funil Abordagem 05: Agenda — "Já perdeu cliente?"`,
    title: `5️⃣ Entrega da Prévia + Preço`,
    tip: `Quando a prévia estiver pronta · Deixa claro que ela escolhe entre os dois modelos — evita perder venda por achar que só tem a opção mais cara. Objeção? Veja o bloco no fim da aba.`,
    content: `Pronto, [Nome]! Olha como ficou o seu:
👉 [link da prévia]

Você escolhe como continuar:

📋 *Básico — R$29,90/mês*: link exclusivo com suas fotos, serviços e valores — a cliente chama você no WhatsApp pra agendar.
📅 *Plus — R$59,90/mês*: tudo isso + o agendamento automático que você viu no vídeo — a cliente marca sozinha, sem você responder uma por uma.

Nos dois você edita tudo pelo celular, sem fidelidade — paga só enquanto estiver usando.

Qual desses faz mais sentido pra você?`,
  },
  {
    id: 'abordagem-05-6',
    category: 'abordagem-05',
    categoryName: `Funil Abordagem 05: Agenda — "Já perdeu cliente?"`,
    title: `🔄 Follow-up 1 (Sem Resposta)`,
    tip: `+2 dias sem resposta · O vídeo chama mais atenção que link — ela vê o produto sem precisar dizer sim.`,
    content: `Oi, [Nome]! Sei que a agenda é corrida 😅 Deixo aqui um vídeo de 20s do que eu ia te mostrar:
[📹 envie o vídeo de 20s — lash ou nail]

É um link onde a cliente vê seus horários livres e marca na hora, sem esperar resposta.`,
  },
  {
    id: 'abordagem-05-7',
    category: 'abordagem-05',
    categoryName: `Funil Abordagem 05: Agenda — "Já perdeu cliente?"`,
    title: `🔄 Follow-up 2 (Sem Resposta)`,
    tip: `+4 dias depois do FU1 · Duas opções, dá pra responder com 1 palavra.`,
    content: `[Nome], pergunta sincera: agendamento online não é prioridade pra você agora, ou só não deu tempo de olhar ainda? Qualquer resposta tá ótima.`,
  },
  {
    id: 'abordagem-05-8',
    category: 'abordagem-05',
    categoryName: `Funil Abordagem 05: Agenda — "Já perdeu cliente?"`,
    title: `🔄 Follow-up 3 (Sem Resposta)`,
    tip: `+7 dias depois do FU2 · Despedida costuma trazer resposta de quem estava adiando. Depois: status 'Sem resposta'.`,
    content: `Oi, [Nome]! Não quero ficar te incomodando, então essa é minha última mensagem. Se um dia quiser a agenda online no seu studio, é só me chamar aqui. Sucesso nos atendimentos!`,
  },

  // ==========================================================================
  // FUNIL ABORDAGEM 06 — CATÁLOGO — "LINK EXCLUSIVO DE SERVIÇOS" (Google/Maps, spreadsheet Funis_StudioMenu.xlsx)
  // ==========================================================================
  {
    id: 'abordagem-06-1',
    category: 'abordagem-06',
    categoryName: `Funil Abordagem 06: Catálogo — "Link exclusivo de serviços"`,
    title: `1️⃣ Primeira Mensagem`,
    tip: `Por que está aqui: Mesma curiosidade do F1, com o plano de entrada (R$29,90/mês) — o mais fácil de fechar. · Dia 0 · qualquer lead do Google · Se o campo 'Site' do Google dela estiver vazio, melhor ainda: é exatamente onde o link entra.`,
    content: `Oi, [Nome]! Tudo bem? Aqui é do StudioMenu, de Goiânia. Te achei no Google pesquisando [lash designer]. 😊

Uma curiosidade: você sabia que dá pra ter um link exclusivo seu, com seus serviços, fotos e valores, pra colocar na bio do Instagram e no seu Google? Quem te encontra já vê tudo antes de te chamar. ✨

Gravei um vídeo de 20 segundos mostrando como fica na prática. Quer dar uma olhadinha? 🎥`,
  },
  {
    id: 'abordagem-06-2',
    category: 'abordagem-06',
    categoryName: `Funil Abordagem 06: Catálogo — "Link exclusivo de serviços"`,
    title: `2️⃣ Ela Respondeu`,
    tip: `'Quero ver' / 'Manda' / 'Como assim?' · Troque /lash por /nail, /estetica ou /studio. Se ela perguntar como coloca: na bio é em Editar perfil → Links; no Google, Editar perfil → Contato → Site. · Mande o vídeo do nicho dela, como vídeo normal (não como documento).`,
    content: `Olha aí 👇
[📹 envie o vídeo de 20s — lash ou nail]

É um catálogo digital com o seu nome no link. Você coloca na bio e no campo "Site" do Google, e manda pras clientes quando perguntam valor.

Se quiser mexer você mesma: https://studiomenu.art/c/showcase/lash`,
  },
  {
    id: 'abordagem-06-3',
    category: 'abordagem-06',
    categoryName: `Funil Abordagem 06: Catálogo — "Link exclusivo de serviços"`,
    title: `3️⃣ Ela Gostou do Exemplo`,
    tip: `Logo após ela reagir bem · Pouco esforço pra ela + 'ver antes de decidir' tira o risco.`,
    content: `Que bom que curtiu! Consigo montar um igual com seu nome, suas fotos e seus valores, pra você ver pronto antes de decidir qualquer coisa. Me manda só:

• Seu @ do Instagram
• Um print com 3 a 5 serviços e valores`,
  },
  {
    id: 'abordagem-06-4',
    category: 'abordagem-06',
    categoryName: `Funil Abordagem 06: Catálogo — "Link exclusivo de serviços"`,
    title: `4️⃣ Ela Mandou o Material`,
    tip: `Assim que chegar · Prazo concreto passa profissionalismo. Cumpra o prazo.`,
    content: `Recebi tudo! Te mando sua prévia aqui até [hoje à tarde / amanhã de manhã].`,
  },
  {
    id: 'abordagem-06-5',
    category: 'abordagem-06',
    categoryName: `Funil Abordagem 06: Catálogo — "Link exclusivo de serviços"`,
    title: `5️⃣ Entrega da Prévia + Preço`,
    tip: `Quando a prévia estiver pronta · Deixa claro que ela escolhe entre os dois modelos — evita perder venda por achar que só tem a opção mais cara. Objeção? Veja o bloco no fim da aba.`,
    content: `Pronto, [Nome]! Olha como ficou o seu:
👉 [link da prévia]

Você escolhe como continuar:

📋 *Básico — R$29,90/mês*: link exclusivo com suas fotos, serviços e valores — a cliente chama você no WhatsApp pra agendar.
📅 *Plus — R$59,90/mês*: tudo isso + o agendamento automático que você viu no vídeo — a cliente marca sozinha, sem você responder uma por uma.

Nos dois você edita tudo pelo celular, sem fidelidade — paga só enquanto estiver usando.

Qual desses faz mais sentido pra você?`,
  },
  {
    id: 'abordagem-06-6',
    category: 'abordagem-06',
    categoryName: `Funil Abordagem 06: Catálogo — "Link exclusivo de serviços"`,
    title: `🔄 Follow-up 1 (Sem Resposta)`,
    tip: `+2 dias sem resposta · O vídeo chama mais atenção que link — ela vê o produto sem precisar dizer sim.`,
    content: `Oi, [Nome]! Deixo aqui um vídeo de 20s mostrando o catálogo na prática pra você olhar com calma:
[📹 envie o vídeo de 20s — lash ou nail]`,
  },
  {
    id: 'abordagem-06-7',
    category: 'abordagem-06',
    categoryName: `Funil Abordagem 06: Catálogo — "Link exclusivo de serviços"`,
    title: `🔄 Follow-up 2 (Sem Resposta)`,
    tip: `+4 dias depois do FU1 · Duas opções, dá pra responder com 1 palavra.`,
    content: `[Nome], pergunta sincera: catálogo digital não é prioridade pra você agora, ou só não deu tempo de olhar ainda? Qualquer resposta tá ótima.`,
  },
  {
    id: 'abordagem-06-8',
    category: 'abordagem-06',
    categoryName: `Funil Abordagem 06: Catálogo — "Link exclusivo de serviços"`,
    title: `🔄 Follow-up 3 (Sem Resposta)`,
    tip: `+7 dias depois do FU2 · Despedida costuma trazer resposta de quem estava adiando. Depois: status 'Sem resposta'.`,
    content: `Oi, [Nome]! Não quero ficar te incomodando, então essa é minha última mensagem. Se um dia quiser o catálogo do seu studio, é só me chamar aqui. Sucesso nos atendimentos!`,
  },

  // ==========================================================================
  // FUNIL ABORDAGEM 07 — CATÁLOGO — "COMO MANDA SEUS VALORES?" (Google/Maps, spreadsheet Funis_StudioMenu.xlsx)
  // ==========================================================================
  {
    id: 'abordagem-07-1',
    category: 'abordagem-07',
    categoryName: `Funil Abordagem 07: Catálogo — "Como manda seus valores?"`,
    title: `1️⃣ Primeira Mensagem`,
    tip: `Por que está aqui: Pergunta fácil de responder e sem cara de venda. A resposta dela te dá o gancho. · Dia 0 · qualquer lead do Google · Não fale do produto aqui. Só a pergunta.`,
    content: `Oi, [Nome]! Tudo bem? Aqui é do StudioMenu, de Goiânia. Te achei no Google pesquisando [lash designer]. 😊

Pergunta rápida: quando cliente nova te pede os valores, você manda print da tabela, áudio ou algum link? 💬`,
  },
  {
    id: 'abordagem-07-2',
    category: 'abordagem-07',
    categoryName: `Funil Abordagem 07: Catálogo — "Como manda seus valores?"`,
    title: `2️⃣ Ela Respondeu`,
    tip: `Qualquer resposta · Comece reagindo à resposta dela ('Print é o que a maioria faz!'). Se ela já usa link, mostre o diferencial: ela mesma edita pelo celular. · Mande o vídeo do nicho dela, como vídeo normal (não como documento).`,
    content: `Entendi! Pergunto porque a gente faz catálogo digital pra studios: em vez de print ou áudio, você tem um link exclusivo com seus serviços, fotos e valores, que abre bonito no celular — e ainda coloca na bio e no Google.

Gravei um vídeo rapidinho mostrando na prática 👇
[📹 envie o vídeo de 20s — lash ou nail]

Se quiser mexer você mesma: https://studiomenu.art/c/showcase/lash`,
  },
  {
    id: 'abordagem-07-3',
    category: 'abordagem-07',
    categoryName: `Funil Abordagem 07: Catálogo — "Como manda seus valores?"`,
    title: `3️⃣ Ela Gostou do Exemplo`,
    tip: `Logo após ela reagir bem · Pouco esforço pra ela + 'ver antes de decidir' tira o risco.`,
    content: `Que bom que curtiu! Consigo montar um igual com seu nome, suas fotos e seus valores, pra você ver pronto antes de decidir qualquer coisa. Me manda só:

• Seu @ do Instagram
• Um print com 3 a 5 serviços e valores`,
  },
  {
    id: 'abordagem-07-4',
    category: 'abordagem-07',
    categoryName: `Funil Abordagem 07: Catálogo — "Como manda seus valores?"`,
    title: `4️⃣ Ela Mandou o Material`,
    tip: `Assim que chegar · Prazo concreto passa profissionalismo. Cumpra o prazo.`,
    content: `Recebi tudo! Te mando sua prévia aqui até [hoje à tarde / amanhã de manhã].`,
  },
  {
    id: 'abordagem-07-5',
    category: 'abordagem-07',
    categoryName: `Funil Abordagem 07: Catálogo — "Como manda seus valores?"`,
    title: `5️⃣ Entrega da Prévia + Preço`,
    tip: `Quando a prévia estiver pronta · Deixa claro que ela escolhe entre os dois modelos — evita perder venda por achar que só tem a opção mais cara. Objeção? Veja o bloco no fim da aba.`,
    content: `Pronto, [Nome]! Olha como ficou o seu:
👉 [link da prévia]

Você escolhe como continuar:

📋 *Básico — R$29,90/mês*: link exclusivo com suas fotos, serviços e valores — a cliente chama você no WhatsApp pra agendar.
📅 *Plus — R$59,90/mês*: tudo isso + o agendamento automático que você viu no vídeo — a cliente marca sozinha, sem você responder uma por uma.

Nos dois você edita tudo pelo celular, sem fidelidade — paga só enquanto estiver usando.

Qual desses faz mais sentido pra você?`,
  },
  {
    id: 'abordagem-07-6',
    category: 'abordagem-07',
    categoryName: `Funil Abordagem 07: Catálogo — "Como manda seus valores?"`,
    title: `🔄 Follow-up 1 (Sem Resposta)`,
    tip: `+2 dias sem resposta · O vídeo chama mais atenção que link — ela vê o produto sem precisar dizer sim.`,
    content: `Oi, [Nome]! Sei que a rotina é corrida 😅 Deixo aqui um vídeo de 20s do que eu ia te mostrar:
[📹 envie o vídeo de 20s — lash ou nail]

É um catálogo digital pra mandar quando cliente pede valores.`,
  },
  {
    id: 'abordagem-07-7',
    category: 'abordagem-07',
    categoryName: `Funil Abordagem 07: Catálogo — "Como manda seus valores?"`,
    title: `🔄 Follow-up 2 (Sem Resposta)`,
    tip: `+4 dias depois do FU1 · Duas opções, dá pra responder com 1 palavra.`,
    content: `[Nome], pergunta sincera: catálogo digital não é prioridade pra você agora, ou só não deu tempo de olhar ainda? Qualquer resposta tá ótima.`,
  },
  {
    id: 'abordagem-07-8',
    category: 'abordagem-07',
    categoryName: `Funil Abordagem 07: Catálogo — "Como manda seus valores?"`,
    title: `🔄 Follow-up 3 (Sem Resposta)`,
    tip: `+7 dias depois do FU2 · Despedida costuma trazer resposta de quem estava adiando. Depois: status 'Sem resposta'.`,
    content: `Oi, [Nome]! Não quero ficar te incomodando, então essa é minha última mensagem. Se um dia quiser o catálogo do seu studio, é só me chamar aqui. Sucesso nos atendimentos!`,
  },

  // ==========================================================================
  // FUNIL ABORDAGEM 08 — CATÁLOGO — "SITE APONTA PRO INSTAGRAM" (Google/Maps, spreadsheet Funis_StudioMenu.xlsx)
  // ==========================================================================
  {
    id: 'abordagem-08-1',
    category: 'abordagem-08',
    categoryName: `Funil Abordagem 08: Catálogo — "Site aponta pro Instagram"`,
    title: `1️⃣ Primeira Mensagem`,
    tip: `Por que está aqui: Fato verificável do perfil dela + pergunta. Muito comum em studios pequenos. · Dia 0 · 'Site' do Google aponta pro Instagram · Confira o botão 'Site' antes de mandar.`,
    content: `Oi, [Nome]! Tudo bem? Aqui é do StudioMenu, de Goiânia. Te achei no Google pesquisando [nail designer] e vi que o botão "Site" do seu perfil leva pro Instagram. 😊

Uma curiosidade: suas clientes costumam achar os valores por lá, ou acabam te chamando pra perguntar? 🤔`,
  },
  {
    id: 'abordagem-08-2',
    category: 'abordagem-08',
    categoryName: `Funil Abordagem 08: Catálogo — "Site aponta pro Instagram"`,
    title: `2️⃣ Ela Respondeu`,
    tip: `Qualquer resposta · Adapte o começo à resposta dela. · Mande o vídeo do nicho dela, como vídeo normal (não como documento).`,
    content: `Faz sentido! No feed a cliente precisa rolar bastante até achar. A gente faz um catálogo digital que resolve isso: um link exclusivo seu, com serviços, fotos e valores, que você coloca no botão "Site" do Google e na bio.

Gravei um vídeo rapidinho mostrando na prática 👇
[📹 envie o vídeo de 20s — lash ou nail]

Se quiser mexer você mesma: https://studiomenu.art/c/showcase/lash`,
  },
  {
    id: 'abordagem-08-3',
    category: 'abordagem-08',
    categoryName: `Funil Abordagem 08: Catálogo — "Site aponta pro Instagram"`,
    title: `3️⃣ Ela Gostou do Exemplo`,
    tip: `Logo após ela reagir bem · Pouco esforço pra ela + 'ver antes de decidir' tira o risco.`,
    content: `Que bom que curtiu! Consigo montar um igual com seu nome, suas fotos e seus valores, pra você ver pronto antes de decidir qualquer coisa. Me manda só:

• Seu @ do Instagram
• Um print com 3 a 5 serviços e valores`,
  },
  {
    id: 'abordagem-08-4',
    category: 'abordagem-08',
    categoryName: `Funil Abordagem 08: Catálogo — "Site aponta pro Instagram"`,
    title: `4️⃣ Ela Mandou o Material`,
    tip: `Assim que chegar · Prazo concreto passa profissionalismo. Cumpra o prazo.`,
    content: `Recebi tudo! Te mando sua prévia aqui até [hoje à tarde / amanhã de manhã].`,
  },
  {
    id: 'abordagem-08-5',
    category: 'abordagem-08',
    categoryName: `Funil Abordagem 08: Catálogo — "Site aponta pro Instagram"`,
    title: `5️⃣ Entrega da Prévia + Preço`,
    tip: `Quando a prévia estiver pronta · Deixa claro que ela escolhe entre os dois modelos — evita perder venda por achar que só tem a opção mais cara. Objeção? Veja o bloco no fim da aba.`,
    content: `Pronto, [Nome]! Olha como ficou o seu:
👉 [link da prévia]

Você escolhe como continuar:

📋 *Básico — R$29,90/mês*: link exclusivo com suas fotos, serviços e valores — a cliente chama você no WhatsApp pra agendar.
📅 *Plus — R$59,90/mês*: tudo isso + o agendamento automático que você viu no vídeo — a cliente marca sozinha, sem você responder uma por uma.

Nos dois você edita tudo pelo celular, sem fidelidade — paga só enquanto estiver usando.

Qual desses faz mais sentido pra você?`,
  },
  {
    id: 'abordagem-08-6',
    category: 'abordagem-08',
    categoryName: `Funil Abordagem 08: Catálogo — "Site aponta pro Instagram"`,
    title: `🔄 Follow-up 1 (Sem Resposta)`,
    tip: `+2 dias sem resposta · O vídeo chama mais atenção que link — ela vê o produto sem precisar dizer sim.`,
    content: `Oi, [Nome]! Sei que a rotina é corrida 😅 Deixo aqui um vídeo de 20s do que eu ia te mostrar:
[📹 envie o vídeo de 20s — lash ou nail]

É um catálogo pra colocar no botão "Site" do seu Google.`,
  },
  {
    id: 'abordagem-08-7',
    category: 'abordagem-08',
    categoryName: `Funil Abordagem 08: Catálogo — "Site aponta pro Instagram"`,
    title: `🔄 Follow-up 2 (Sem Resposta)`,
    tip: `+4 dias depois do FU1 · Duas opções, dá pra responder com 1 palavra.`,
    content: `[Nome], pergunta sincera: catálogo digital não é prioridade pra você agora, ou só não deu tempo de olhar ainda? Qualquer resposta tá ótima.`,
  },
  {
    id: 'abordagem-08-8',
    category: 'abordagem-08',
    categoryName: `Funil Abordagem 08: Catálogo — "Site aponta pro Instagram"`,
    title: `🔄 Follow-up 3 (Sem Resposta)`,
    tip: `+7 dias depois do FU2 · Despedida costuma trazer resposta de quem estava adiando. Depois: status 'Sem resposta'.`,
    content: `Oi, [Nome]! Não quero ficar te incomodando, então essa é minha última mensagem. Se um dia quiser o catálogo do seu studio, é só me chamar aqui. Sucesso nos atendimentos!`,
  },

  // ==========================================================================
  // FUNIL ABORDAGEM 09 — JÁ TEM LINK — ELOGIO + VÍDEO (PRÉVIA SOB PEDIDO) (Google/Maps, spreadsheet Funis_StudioMenu.xlsx)
  // ==========================================================================
  {
    id: 'abordagem-09-1',
    category: 'abordagem-09',
    categoryName: `Funil Abordagem 09: Já Tem Link — Elogio + Vídeo (Prévia sob Pedido)`,
    title: `1️⃣ Primeira Mensagem`,
    tip: `Por que está aqui: ABORDAGEM PRINCIPAL pra quem já tem link. Ela já entendeu o valor de ter um link. Você só monta prévia pra quem demonstrou interesse, então consegue abordar muito mais leads. · Dia 0 · 'Possui link? = Sim' · Elogie o que ela já tem e nunca critique a ferramenta atual — ela escolheu e vai defender. Confira o link da bio antes de mandar.`,
    content: `Oi, [Nome]! Tudo bem? Aqui é do StudioMenu, de Goiânia. Te achei no Google e vi que você já tem agendamento online no link da bio, que legal! Poucas profissionais já se organizam assim. 👏

A gente faz um link parecido, mas com fotos dos seus serviços e uma capa com a sua cara. Gravei um vídeo de 20 segundos mostrando como fica. Quer dar uma olhadinha? 🎥`,
  },
  {
    id: 'abordagem-09-2',
    category: 'abordagem-09',
    categoryName: `Funil Abordagem 09: Já Tem Link — Elogio + Vídeo (Prévia sob Pedido)`,
    title: `2️⃣ Ela Quer Ver`,
    tip: `'Quero' / 'Manda' · Mande o vídeo do nicho dela, como vídeo normal (não documento).`,
    content: `Olha aí 👇
[📹 envie o vídeo de 20s — lash ou nail]

A ideia é a cliente ver o resultado de cada procedimento antes de marcar, não só o nome e o valor. O que achou?`,
  },
  {
    id: 'abordagem-09-3',
    category: 'abordagem-09',
    categoryName: `Funil Abordagem 09: Já Tem Link — Elogio + Vídeo (Prévia sob Pedido)`,
    title: `3️⃣ Ela Curtiu / Ficou Curiosa`,
    tip: `'Achei lindo' / 'Como funciona?' · Só agora você monta prévia — pra quem já demonstrou interesse.`,
    content: `Que bom que curtiu! Se quiser, monto uma prévia rapidinha com alguns dos seus serviços, pra você ver como ficaria o seu. Posso?`,
  },
  {
    id: 'abordagem-09-4',
    category: 'abordagem-09',
    categoryName: `Funil Abordagem 09: Já Tem Link — Elogio + Vídeo (Prévia sob Pedido)`,
    title: `4️⃣ Envia a Prévia (4 Serviços)`,
    tip: `Depois que ela topar · Monte com ~4 serviços: pegue nomes e valores do link atual dela e fotos do Instagram. Não precisa pedir nada pra ela.`,
    content: `Pronto! Olha como ficou o seu 👇
[link da prévia]

Coloquei alguns dos seus serviços pra você ter uma ideia. O que achou?`,
  },
  {
    id: 'abordagem-09-5',
    category: 'abordagem-09',
    categoryName: `Funil Abordagem 09: Já Tem Link — Elogio + Vídeo (Prévia sob Pedido)`,
    title: `5️⃣ Ela Gostou → Link Oficial + Valor`,
    tip: `'Amei' / 'Ficou lindo' · Se ela escolher o Plus, peça os dias/horários de atendimento junto aqui. Objeção? Veja o bloco no fim da aba.`,
    content: `Que bom que gostou! 😍 Posso deixar esse no ar como seu link oficial. Você escolhe como continuar:

📋 *Básico — R$29,90/mês*: link exclusivo com suas fotos, serviços e valores — a cliente chama você no WhatsApp pra agendar.
📅 *Plus — R$59,90/mês*: tudo isso + o agendamento automático que você viu no vídeo — a cliente marca sozinha, sem você responder uma por uma.

Nos dois você edita tudo pelo celular, sem fidelidade — paga só enquanto estiver usando.

Qual desses faz mais sentido pra você?`,
  },
  {
    id: 'abordagem-09-6',
    category: 'abordagem-09',
    categoryName: `Funil Abordagem 09: Já Tem Link — Elogio + Vídeo (Prévia sob Pedido)`,
    title: `❓ Objeção: "E os Outros Serviços?"`,
    tip: `Quando ela perguntar dos serviços que faltam · Transforma a 'falta' em vantagem: ela tem autonomia total, sem depender de ninguém.`,
    content: `Você mesma adiciona do jeito que quiser! No seu link tem o botão "Editar": é só tocar, colocar o serviço, a foto e o valor, e salvar. Já aparece na hora pras suas clientes.`,
  },
  {
    id: 'abordagem-09-7',
    category: 'abordagem-09',
    categoryName: `Funil Abordagem 09: Já Tem Link — Elogio + Vídeo (Prévia sob Pedido)`,
    title: `6️⃣ Ela Topou → Envia o Link Oficial`,
    tip: `Assim que ela confirmar · Se você cobra antes de ativar, mande o link de pagamento junto. Depois, mude o status para 'Fechou'.`,
    content: `Perfeito! Aqui está seu link oficial 🎉
👉 [link oficial]

É só colocar no botão "Agendar" do seu Linktree. Pra adicionar mais serviços, trocar fotos ou valores, toca em "Editar" dentro do link e muda do jeito que quiser.`,
  },
  {
    id: 'abordagem-09-8',
    category: 'abordagem-09',
    categoryName: `Funil Abordagem 09: Já Tem Link — Elogio + Vídeo (Prévia sob Pedido)`,
    title: `🔄 Sumiu Depois da Prévia`,
    tip: `+2 dias sem resposta após a etapa 4 · Pergunta leve, sem cobrar decisão.`,
    content: `Oi, [Nome]! Conseguiu dar uma olhada na prévia do seu studio? 👇
[link da prévia]

Se quiser mudar alguma coisa nela, é só me falar.`,
  },
  {
    id: 'abordagem-09-9',
    category: 'abordagem-09',
    categoryName: `Funil Abordagem 09: Já Tem Link — Elogio + Vídeo (Prévia sob Pedido)`,
    title: `🔄 Follow-up 1 (Sem Resposta)`,
    tip: `+2 dias sem resposta à 1ª mensagem · O vídeo chama mais atenção que texto — ela vê o produto sem precisar dizer sim.`,
    content: `Oi, [Nome]! Deixo aqui o vídeo de 20s pra você ver quando tiver um tempinho 👇
[📹 envie o vídeo de 20s — lash ou nail]

É um link com fotos dos seus serviços pra usar na sua bio.`,
  },
  {
    id: 'abordagem-09-10',
    category: 'abordagem-09',
    categoryName: `Funil Abordagem 09: Já Tem Link — Elogio + Vídeo (Prévia sob Pedido)`,
    title: `🔄 Follow-up 2 (Sem Resposta)`,
    tip: `+4 dias depois do FU1 · Duas opções, dá pra responder com 1 palavra.`,
    content: `[Nome], pergunta sincera: trocar seu link não é prioridade agora, ou só não deu tempo de olhar ainda? Qualquer resposta tá ótima.`,
  },
  {
    id: 'abordagem-09-11',
    category: 'abordagem-09',
    categoryName: `Funil Abordagem 09: Já Tem Link — Elogio + Vídeo (Prévia sob Pedido)`,
    title: `🔄 Follow-up 3 (Sem Resposta)`,
    tip: `+4 dias depois do FU2 · Depois: status 'Sem resposta'.`,
    content: `Oi, [Nome]! Não quero ficar te incomodando, então essa é minha última mensagem. Se um dia quiser seu link com fotos e capa, é só me chamar aqui. Sucesso nos atendimentos!`,
  },

  // ==========================================================================
  // FUNIL ABORDAGEM 10 — JÁ TEM LINK — PRÉVIA PRONTA (Google/Maps, spreadsheet Funis_StudioMenu.xlsx)
  // ==========================================================================
  {
    id: 'abordagem-10-1',
    category: 'abordagem-10',
    categoryName: `Funil Abordagem 10: Já Tem Link — Prévia Pronta`,
    title: `1️⃣ Primeira Mensagem`,
    tip: `Por que está aqui: Maior impacto por lead (ela compara na hora a prévia com a lista simples que usa hoje), mas exige montar a prévia antes. Use nas leads mais promissoras. · Dia 0 · com a prévia já montada · Monte antes com ~4 serviços do link atual dela + fotos do Instagram.`,
    content: `Oi, [Nome]! Tudo bem? Aqui é do StudioMenu, de Goiânia. Te achei no Google e vi que você já tem agendamento online no seu link, que legal! 👏

Fiquei curioso pra ver como seus serviços ficariam com fotos e capa, em vez de só a lista, e montei uma prévia com os seus. Quer ver como ficou? ✨`,
  },
  {
    id: 'abordagem-10-2',
    category: 'abordagem-10',
    categoryName: `Funil Abordagem 10: Já Tem Link — Prévia Pronta`,
    title: `2️⃣ Ela Respondeu`,
    tip: `'Quero ver' · Deixe a comparação acontecer sozinha — não fale mal do link atual.`,
    content: `Olha como ficou o seu 👇
[link da prévia]

Usei seus serviços e valores e algumas fotos do seu Instagram. Assim a cliente vê o resultado de cada procedimento antes de marcar. O que achou?`,
  },
  {
    id: 'abordagem-10-3',
    category: 'abordagem-10',
    categoryName: `Funil Abordagem 10: Já Tem Link — Prévia Pronta`,
    title: `3️⃣ Ela Gostou → Completo + Valor`,
    tip: `'Gostei' / 'Ficou lindo' · Deixa claro que ela escolhe entre os dois modelos.`,
    content: `Que bom que curtiu! Consigo deixar o seu completo no ar. Você escolhe como continuar:

📋 *Básico — R$29,90/mês*: link exclusivo com suas fotos, serviços e valores — a cliente chama você no WhatsApp pra agendar.
📅 *Plus — R$59,90/mês*: tudo isso + o agendamento automático que você viu no vídeo — a cliente marca sozinha, sem você responder uma por uma. É só trocar o link do botão "Agendar" do seu Linktree por esse.

Nos dois você edita tudo pelo celular, sem fidelidade — paga só enquanto estiver usando.

Se topar, me manda um print da sua tabela completa. Se escolher o Plus, manda também seus dias e horários de atendimento.`,
  },
  {
    id: 'abordagem-10-4',
    category: 'abordagem-10',
    categoryName: `Funil Abordagem 10: Já Tem Link — Prévia Pronta`,
    title: `4️⃣ Ela Quer / Mandou o Material`,
    tip: `Assim que ela confirmar · Se cobra antes de ativar, mande o link de pagamento aqui.`,
    content: `Perfeito, recebi tudo! Te mando seu link oficial aqui até [hoje à tarde / amanhã de manhã].`,
  },
  {
    id: 'abordagem-10-5',
    category: 'abordagem-10',
    categoryName: `Funil Abordagem 10: Já Tem Link — Prévia Pronta`,
    title: `5️⃣ Entrega do Link Oficial`,
    tip: `Quando estiver pronto · Mude o status para 'Fechou'.`,
    content: `Pronto, [Nome]! Seu StudioMenu está no ar 🎉
👉 [link oficial]

É só trocar o link do botão "Agendar" no seu Linktree por esse. Qualquer mudança, você edita pelo celular ou me chama aqui.`,
  },
  {
    id: 'abordagem-10-6',
    category: 'abordagem-10',
    categoryName: `Funil Abordagem 10: Já Tem Link — Prévia Pronta`,
    title: `🔄 Follow-up 1 (Sem Resposta)`,
    tip: `+2 dias sem resposta · Ver o próprio studio pronto é o que gera resposta.`,
    content: `Oi, [Nome]! Vou deixar a prévia do seu studio aqui pra você olhar com calma 👇
[link da prévia]`,
  },
  {
    id: 'abordagem-10-7',
    category: 'abordagem-10',
    categoryName: `Funil Abordagem 10: Já Tem Link — Prévia Pronta`,
    title: `🔄 Follow-up 2 (Sem Resposta)`,
    tip: `+4 dias depois do FU1 · Duas opções, dá pra responder com 1 palavra.`,
    content: `[Nome], pergunta sincera: trocar seu link não é prioridade agora, ou só não deu tempo de olhar ainda? Qualquer resposta tá ótima.`,
  },
  {
    id: 'abordagem-10-8',
    category: 'abordagem-10',
    categoryName: `Funil Abordagem 10: Já Tem Link — Prévia Pronta`,
    title: `🔄 Follow-up 3 (Sem Resposta)`,
    tip: `+4 dias depois do FU2 · Depois: status 'Sem resposta'.`,
    content: `Oi, [Nome]! Não quero ficar te incomodando, então essa é minha última mensagem. Sua prévia fica guardada, se um dia quiser é só me chamar aqui. Sucesso nos atendimentos!`,
  },

  // ==========================================================================
  // ENTREGA, PRÉVIA & PAGAMENTO (compartilhado entre os 2 funis)
  // ==========================================================================
  {
    id: 'entrega-1',
    category: 'entrega',
    categoryName: 'Entrega, Prévia & Pagamento',
    title: '1. Aviso "Estamos Finalizando" (Se Demorar)',
    tip: 'Use se passar mais que algumas horas entre o recebimento do material e a entrega.',
    content: `Oii, [NOME]! Boa tarde 😊

Estamos finalizando o seu catálogo — já já te mando! ✨`,
  },
  {
    id: 'entrega-2',
    category: 'entrega',
    categoryName: 'Entrega, Prévia & Pagamento',
    title: '2. Entrega do Catálogo Pronto (Link do App)',
    tip: 'O link entregue é o do APP — já vem com o catálogo, o link de edição e a opção de assinar, tudo dentro da mesma experiência. Nunca mande o link de pagamento separado. Os nomes dos botões citados são os reais da tela (ViewCatalogCard/EditCatalogCard) — confira se não mudaram antes de usar.',
    content: `Prontinho, [NOME]! Seu catálogo já está no ar 🎉

👉 [LINK DO APP]

Lá dentro, toque em *"Visualizar catálogo"* pra ver como ficou. Se quiser mudar algo, é só tocar em *"Editar meu catálogo"* 💕

Dá uma olhadinha e me conta o que achou!`,
  },
  {
    id: 'entrega-3',
    category: 'entrega',
    categoryName: 'Entrega, Prévia & Pagamento',
    title: '3. Ela Gostou / Perguntou do Pagamento — Funis de Catálogo',
    tip: 'Use pra quem veio pelo Funil Anúncio 01 ou Abordagem 01 (catálogo), quando ela reagir bem ou perguntar como funciona o pagamento. Só entra em cena depois da entrega, nunca antes.',
    content: `Que bom que gostou! 😍

Por esse link você já vê e compartilha seu catálogo com suas clientes. Se quiser manter tudo sempre ativo e poder editar quando quiser, é só assinar ali dentro — R$ 29,90/mês, Pix ou cartão, ativa na hora.

Qualquer dúvida me chama! 💖`,
  },
  {
    id: 'entrega-4',
    category: 'entrega',
    categoryName: 'Entrega, Prévia & Pagamento',
    title: '4. Ela Gostou / Perguntou do Pagamento — Funis de Agendamento',
    tip: 'Use pra quem veio pelo Funil Anúncio 02 ou Abordagem 02 (agendamento) — mesma lógica da versão de catálogo, mas com o agendamento automático em destaque.',
    content: `Que bom que gostou! 😍

Por esse link você já vê e compartilha seu catálogo, e sua cliente já pode agendar direto por ele. Pra manter o agendamento automático sempre ativo, é só assinar ali dentro — R$ 59,90/mês, Pix ou cartão, ativa na hora.

Qualquer dúvida me chama! 💖`,
  },
  {
    id: 'entrega-5',
    category: 'entrega',
    categoryName: 'Entrega, Prévia & Pagamento',
    title: '5. Pedido do Instagram (Opcional, Antes de Fechar a Prévia)',
    tip: 'Passo opcional visto nos exemplos reais que converteram — só use se fizer sentido vincular o Instagram dela no catálogo.',
    content: `Você tem Instagram? Se quiser, já deixo o link vinculado no seu catálogo! 📲`,
  },

  // ==========================================================================
  // QUEBRA DE OBJEÇÕES (compartilhado)
  // ==========================================================================
  {
    id: 'objecao-1',
    category: 'objecao',
    categoryName: 'Quebra de Objeções',
    title: '1. "Quanto Custa? Tem Algum Custo Pra Montar?"',
    tip: 'Antes da entrega, adia a conversa de preço pra depois — o foco agora é ela mandar os dados. NUNCA use "grátis".',
    content: `Isso a gente só conversa depois que você ver seu catálogo prontinho, sem compromisso nenhum agora 😊

Bora começar? Me manda só a foto, o nome e os procedimentos! 💕`,
  },
  {
    id: 'objecao-2',
    category: 'objecao',
    categoryName: 'Quebra de Objeções',
    title: '2. "Não Tenho Tempo de Separar Tudo Isso"',
    tip: 'Reforça que qualquer formato serve — a fricção é dela ter que organizar, não de mandar o que já tem.',
    content: `Sem problemas! Pode mandar do jeito mais fácil — um print da sua tabela já resolve, a gente organiza tudo por aqui. 🥰`,
  },
  {
    id: 'objecao-3',
    category: 'objecao',
    categoryName: 'Quebra de Objeções',
    title: '3. "Já Uso o Canva"',
    tip: 'Contrasta o PDF pesado com o catálogo interativo.',
    content: `O Canva é ótimo, mas o PDF fica pesado e a letra some no celular...

O catálogo que a gente monta abre como um app, em 1 segundo, com a sua cara. Bora comparar? ✨`,
  },
  {
    id: 'objecao-4',
    category: 'objecao',
    categoryName: 'Quebra de Objeções',
    title: '4. "Preciso Falar com Meu Marido / Sócia"',
    tip: 'Sem urgência artificial — não existe desconto por tempo limitado nesse modelo.',
    content: `Super justo! 🙏 Mostra pra ele(a) o exemplo ao vivo no celular, geralmente encanta.

Sem pressa nenhuma, fico no aguardo! 😊`,
  },
  {
    id: 'objecao-5',
    category: 'objecao',
    categoryName: 'Quebra de Objeções',
    title: '5. (Funis de Agendamento) "Meus Horários Mudam Toda Semana"',
    tip: 'Específica dos funis de agendamento (Anúncio 02 / Abordagem 02) — usa quando ela desconfiar que o agendamento automático é rígido demais.',
    content: `Sem problema! Você controla tudo: define seus dias e horários, e pode bloquear datas quando quiser, direto no seu app.

A cliente só vê o que você liberar. 📅`,
  },

  // ==========================================================================
  // FOLLOW-UP / RESGATE (compartilhado)
  // ==========================================================================
  {
    id: 'followup-1',
    category: 'followup',
    categoryName: 'Follow-up / Resgate',
    title: '1. Vácuo Antes de Mandar as Informações',
    tip: 'Envie no dia seguinte pra quem topou mas ainda não mandou nada.',
    content: `Oii! Ainda dá tempo de montar seu catálogo 😍 Pode mandar a foto, o nome e os procedimentos quando puder!`,
  },
  {
    id: 'followup-2',
    category: 'followup',
    categoryName: 'Follow-up / Resgate',
    title: '2. Vácuo Depois da Entrega (Sem Resposta)',
    tip: 'Envie se ela não reagir depois de receber o link do catálogo pronto.',
    content: `Oii, [NOME]! Conseguiu dar uma olhada no seu catálogo? Queria saber o que você achou! 🥰`,
  },
  {
    id: 'followup-3',
    category: 'followup',
    categoryName: 'Follow-up / Resgate',
    title: '3. Nudge Pós-Entrega — Sem Assinar Ainda',
    tip: 'Envie alguns dias depois da entrega pra quem recebeu o catálogo mas nunca assinou.',
    content: `Oii, [NOME]! Como tá sendo usar seu catálogo? 😍

Se quiser deixar tudo sempre ativo (ou ligar o agendamento automático), é só decidir ali dentro do seu link quando quiser. Fico à disposição! 💖`,
  },

  // ==========================================================================
  // REATIVAÇÃO LASHMENU → STUDIOMENU (TEMPORÁRIO)
  // Campanha pontual pra reabordar leads antigos do LashMenu que gostaram do
  // catálogo mas sumiram quando souberam o preço (modelo antigo, pagamento
  // único acima de R$100). Apagar essa categoria depois que a campanha
  // acabar — não faz parte do funil permanente.
  // ==========================================================================
  {
    id: 'reativacao-1',
    category: 'reativacao-lashmenu',
    categoryName: 'Reativação LashMenu (Temporário)',
    title: '1. Reabordagem — Rebranding + Novo Preço (Sem Compromisso)',
    tip: 'Use com leads antigos do LashMenu que gostaram do catálogo mas sumiram na hora do pagamento (preço antigo, acima de R$100 à vista). Não cobra explicação do sumiço dela — segue direto pro que mudou.',
    content: `Oii, [NOME]! Tudo bem? 😊

Aqui mudou bastante desde a nossa conversa: o LashMenu passou por um rebranding e virou StudioMenu ✨ Melhoramos o catálogo e agora você mesma edita tudo quando quiser (fotos, preços, etc), sem depender da gente.

E o valor ficou bem mais em conta: R$ 29,90/mês, sem compromisso — usa um mês, se curtir continua, se não quiser é só cancelar.

Agora você também tem um app exclusivo seu, com os links pra ver e editar o catálogo, tudo num só lugar:
👉 [LINK DO APP]

Dá uma olhada e me conta o que achou! 💕`,
  },
  {
    id: 'reativacao-2',
    category: 'reativacao-lashmenu',
    categoryName: 'Reativação LashMenu (Temporário)',
    title: '2. Ela Demonstrou Interesse — Explica o Pagamento',
    tip: 'Use quando ela reagir bem à reabordagem ou perguntar sobre o pagamento. Reforça sem fidelidade/multa, já que preço foi a objeção da vez passada.',
    content: `Que bom que gostou! 😍

É bem simples: dentro desse mesmo link tem a opção de assinar, Pix ou cartão, sem burocracia. Ativa na hora e já fica valendo.

Não tem fidelidade nem multa — se em algum mês não quiser continuar, é só cancelar direto por lá. Qualquer dúvida me chama! 💖`,
  },
];
