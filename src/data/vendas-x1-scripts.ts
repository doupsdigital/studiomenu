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

Por esse link você já vê e compartilha seu catálogo com suas clientes. Se quiser manter tudo sempre ativo e poder editar quando quiser, é só assinar ali dentro — R$ 39,90/mês, Pix ou cartão, ativa na hora.

Qualquer dúvida me chama! 💖`,
  },
  {
    id: 'entrega-4',
    category: 'entrega',
    categoryName: 'Entrega, Prévia & Pagamento',
    title: '4. Ela Gostou / Perguntou do Pagamento — Funis de Agendamento',
    tip: 'Use pra quem veio pelo Funil Anúncio 02 ou Abordagem 02 (agendamento) — mesma lógica da versão de catálogo, mas com o agendamento automático em destaque.',
    content: `Que bom que gostou! 😍

Por esse link você já vê e compartilha seu catálogo, e sua cliente já pode agendar direto por ele. Pra manter o agendamento automático sempre ativo, é só assinar ali dentro — R$ 69,90/mês, Pix ou cartão, ativa na hora.

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

E o valor ficou bem mais em conta: R$ 39,90/mês, sem compromisso — usa um mês, se curtir continua, se não quiser é só cancelar.

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
