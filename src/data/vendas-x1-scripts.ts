// Playbook de Vendas X1 WhatsApp — reescrito pro produto atual (StudioMenu,
// multi-nicho, catálogo grátis + assinatura recorrente via Asaas). Substitui
// a versão anterior, portada do LashMenu (catálogo pago em pagamento único,
// PIX pra telefone pessoal, domínio lashmenu.com fora do ar).

export type ScriptCategory =
  | 'funnel'
  | 'inbound'
  | 'outbound'
  | 'objecao'
  | 'entrega'
  | 'assinatura'
  | 'followup';

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
  { key: 'funnel', label: '🎯 Funil Passo a Passo (Catálogo Grátis)' },
  { key: 'inbound', label: '📩 Respostas Rápidas (Dúvidas do Anúncio)' },
  { key: 'outbound', label: '🚀 Abordagem Fria' },
  { key: 'objecao', label: '🛡️ Quebra de Objeções' },
  { key: 'entrega', label: '🎁 Entrega do Catálogo & App' },
  { key: 'assinatura', label: '💳 Assinatura StudioMenu+' },
  { key: 'followup', label: '🔄 Follow-up / Resgate' },
];

export const SCRIPTS_DATA: ScriptItem[] = [
  // 1. FUNIL PASSO A PASSO (LEAD → CATÁLOGO GRÁTIS NO AR)
  {
    id: 'funnel-1',
    category: 'funnel',
    categoryName: 'Funil Passo a Passo',
    title: '1️⃣ Passo 1: Boas-vindas + Link do Catálogo Grátis (Super Curto)',
    tip: "Envie assim que o lead mandar algo como 'Vim pelo anúncio do StudioMenu'. Um link só — ela escolhe nicho e estilo ao vivo dentro dele, sem precisar comparar modelos separados.",
    content: `Oii! Seja muito bem-vinda ao StudioMenu! 😍✨

Você cria seu catálogo digital GRÁTIS agora mesmo, escolhendo o estilo ao vivo, direto no seu celular:

👉 https://studiomenu.art/form

Leva menos de 2 minutinhos! Qualquer dúvida durante o preenchimento me chama aqui 🥰`,
  },
  {
    id: 'funnel-2',
    category: 'funnel',
    categoryName: 'Funil Passo a Passo',
    title: '2️⃣ Passo 2: Ela Travou no Meio do Preenchimento',
    tip: 'Envie se ela sumir no meio do formulário (começou mas não voltou).',
    content: `Oii! Vi que você começou a criar seu catálogo — ficou lindo até agora! 😍

Se precisar parar no meio, fica tranquila: é só voltar no mesmo link que salva tudo sozinho e continua de onde parou.

Terminou? Me manda aqui que eu já libero pra você! ✨`,
  },
  {
    id: 'funnel-3',
    category: 'funnel',
    categoryName: 'Funil Passo a Passo',
    title: '3️⃣ Passo 3: Confirmação de Recebimento (Em Revisão)',
    tip: 'Envie quando o catálogo aparecer como "Pendente" no admin e demorar um pouco mais pra aprovar.',
    content: `Recebemos seu catálogo por aqui! 🎉

Nossa equipe está revisando tudo agora (é rapidinho) pra deixar 100% redondo antes de ativar.

Assim que estiver no ar eu te aviso por aqui mesmo! 💖`,
  },

  // 2. RESPOSTAS RÁPIDAS PARA LEADS DO ANÚNCIO (INBOUND)
  {
    id: 'inbound-1',
    category: 'inbound',
    categoryName: 'Respostas Rápidas',
    title: '1. Lead Pergunta se é Grátis Mesmo / Qual a Pegadinha',
    tip: 'Use quando a lead perguntar direto sobre preço, cobrança ou desconfiar que tem pegadinha. Troque /lash por /nail, /estetica ou /studio conforme o nicho dela.',
    content: `Oii! Sem pegadinha nenhuma — o catálogo digital do StudioMenu é 100% GRÁTIS, sem mensalidade pra ter o seu no ar. 🌸✨

Você só paga se quiser ativar o agendamento automático depois (totalmente opcional, quando você quiser).

Dá uma olhadinha em como fica no celular:
👉 https://studiomenu.art/c/showcase/lash

Quer criar o seu agora? Leva 2 minutinhos! 😍`,
  },
  {
    id: 'inbound-2',
    category: 'inbound',
    categoryName: 'Respostas Rápidas',
    title: '2. Lead Pergunta Como Funciona o Agendamento Automático',
    tip: 'Explica a diferença entre o catálogo grátis (fecha pelo WhatsApp) e o StudioMenu+ (agenda de verdade dentro do catálogo).',
    content: `Ótima pergunta! No catálogo grátis, a cliente vê tudo e te chama no WhatsApp pra marcar. 💬

Se você quiser, dá pra ativar o *agendamento automático* (StudioMenu+): ela escolhe o dia e o horário sozinha, direto no catálogo, sem trocar mensagem com você. 📅

Quer criar seu catálogo grátis primeiro e conhecer o Plus depois? 🥰`,
  },
  {
    id: 'inbound-3',
    category: 'inbound',
    categoryName: 'Respostas Rápidas',
    title: '3. Lead Pergunta se Vocês Fazem Tudo ou se Ela que Preenche',
    tip: 'Explica o modelo self-service com preview ao vivo + revisão da equipe no final.',
    content: `Você mesma cria, ao vivo, vendo o resultado na hora — sem precisar mexer em Canva nem mandar print de nada! 😍

Escolhe seu nicho e seu estilo, e o catálogo já vai se montando na sua frente. No final, nossa equipe só revisa e ativa o link pra você. ✨

Bora criar o seu? 👉 https://studiomenu.art/form`,
  },

  // 3. ABORDAGEM FRIA (OUTBOUND INSTAGRAM / DIRECT / WHATSAPP)
  {
    id: 'outbound-1',
    category: 'outbound',
    categoryName: 'Abordagem Fria',
    title: '1. Elogio + Pergunta do Instagram (2 Linhas — Mais Recomendada)',
    tip: 'Envie no Direct de profissionais de beleza que postam fotos da tabela nos destaques do Instagram.',
    content: `Oii! Seus procedimentos são lindos demais, parabéns! 👏✨

Vi que você deixa seus preços nos destaques. Já conhece o StudioMenu? A gente cria um catálogo digital interativo GRÁTIS tipo aplicativo pra bio e pro WhatsApp!

Posso te mandar um exemplo ao vivo pra você dar uma olhada? 🥰`,
  },
  {
    id: 'outbound-2',
    category: 'outbound',
    categoryName: 'Abordagem Fria',
    title: '2. Dor do Atendimento na Maca (Ultra Curta)',
    tip: 'Ideal para profissionais que demoram para responder clientes porque estão atendendo.',
    content: `Oi! Imagino que seu dia a dia na maca seja super corrido entre um atendimento e outro... 💆‍♀️

Criamos o StudioMenu, um catálogo digital GRÁTIS, pra sua cliente ver seus preços e orientações sozinha no link da bio, chegando pronta pra agendar sem te tomar tempo.

Quer ver um exemplo rápido de como fica no celular? ✨`,
  },
  {
    id: 'outbound-3',
    category: 'outbound',
    categoryName: 'Abordagem Fria',
    title: '3. Substituir PDF do Canva (Curta & Direta)',
    tip: 'Aborda a dor de tabelas pesadas em imagem ou PDF que a cliente não consegue ler direito.',
    content: `Oii, tudo joia? 💕

Nós ajudamos profissionais de beleza a trocarem aquele PDF pesado do Canva por um catálogo digital GRÁTIS em link interativo que abre na hora no celular da cliente.

Posso te mandar um exemplo pra você dar uma olhadinha sem compromisso? 🥰`,
  },

  // 4. QUEBRA DE OBJEÇÕES CURTAS
  {
    id: 'objecao-1',
    category: 'objecao',
    categoryName: 'Quebra de Objeções',
    title: "1. Objeção: 'Isso é Bom Demais pra Ser Grátis, Qual é a Pegadinha?'",
    tip: 'Desconfiança comum numa oferta grátis — seja direta e transparente, sem forçar.',
    content: `Entendo super a desconfiança! 😊 Não tem pegadinha: o catálogo é grátis mesmo, sem cartão e sem compromisso.

A gente ganha depois, se você quiser ativar o agendamento automático (totalmente opcional). Até lá, você só usa e aproveita. Bora criar o seu agora? ✨`,
  },
  {
    id: 'objecao-2',
    category: 'objecao',
    categoryName: 'Quebra de Objeções',
    title: "2. Objeção: 'Não Tenho Tempo Agora'",
    tip: 'Reforça que é rápido e que a equipe termina a ativação depois.',
    content: `Relaxa, leva literalmente 2 minutos e você faz do celular mesmo, sem precisar sentar no computador! 🥰

Preenche o que der agora, o link salva sozinho — e nossa equipe ainda revisa e finaliza a ativação pra você. Só falta você começar!

👉 https://studiomenu.art/form`,
  },
  {
    id: 'objecao-3',
    category: 'objecao',
    categoryName: 'Quebra de Objeções',
    title: "3. Objeção: 'Eu Já Uso o Canva de Graça'",
    tip: 'Mostre o contraste entre o PDF do Canva e um catálogo interativo — ambos grátis, mas a experiência é bem diferente.',
    content: `O Canva é legal, mas o PDF fica com letra minúscula no celular e muita cliente nem abre porque consome dados...

O StudioMenu abre como um aplicativo em 1 segundo, e também é grátis! Só que com uma cara muito mais profissional. Vale a pena comparar? ✨`,
  },
  {
    id: 'objecao-4',
    category: 'objecao',
    categoryName: 'Quebra de Objeções',
    title: "4. Objeção: 'Preciso Falar com Meu Marido / Sócia'",
    tip: 'Sem urgência artificial — o produto é grátis, não tem motivo pra criar pressa.',
    content: `Claro, super justo conversar antes! 🙏✨

Fica tranquila que não tem nenhuma pressa — é grátis e o link fica te esperando. Só mostra pra ele(a) como fica ao vivo no celular, geralmente adoram! 😊

Qualquer dúvida que surgir, me chama! 💖`,
  },
  {
    id: 'objecao-5',
    category: 'objecao',
    categoryName: 'Quebra de Objeções',
    title: "5. Objeção: 'Depois Vou Ter Que Pagar Mensalidade?'",
    tip: 'Transparência total: o catálogo é grátis pra sempre, a assinatura é só pra quem quiser o agendamento automático.',
    content: `Não! O catálogo é grátis pra sempre, sem pegadinha nem cobrança escondida. 💖

Só existe uma assinatura opcional (StudioMenu+) se você quiser o agendamento automático — e mesmo essa você ativa e cancela quando quiser, sem multa.`,
  },

  // 5. ENTREGA DO CATÁLOGO & APRESENTAÇÃO DO APP
  {
    id: 'entrega-1',
    category: 'entrega',
    categoryName: 'Entrega do Catálogo & App',
    title: '1. Entrega do Catálogo — Foco no Agendamento Automático (Plus em Destaque)',
    tip: "Essa é a mensagem que já sai pronta pelo botão 'Aprovar & Entregar' no admin quando o catálogo está marcado pra oferecer o Plus direto — aqui fica só como referência/backup pra mandar na mão se precisar.",
    content: `Olá, [NOME]! ✨

Seu catálogo digital StudioMenu está pronto — e com ele você já pode liberar o *agendamento automático*: suas clientes escolhem o dia e o horário sozinhas, sem trocar mensagem com você. 📅

🔗 *Seu Link Exclusivo:*
👉 [LINK DO CATÁLOGO]

📌 *O que fazer agora:*
1. Abra o link no seu celular e confira seu catálogo completo.
2. Coloque este link na bio do seu Instagram e no seu perfil do WhatsApp Business.
3. Pra ativar o agendamento automático, é só assinar — te mando o acesso em seguida.

Qualquer dúvida ou ajuste que precisar, nossa equipe está à sua inteira disposição. Parabéns pelo seu novo posicionamento! 💖✨`,
  },
  {
    id: 'entrega-2',
    category: 'entrega',
    categoryName: 'Entrega do Catálogo & App',
    title: '2. Entrega do Catálogo — Padrão (Sem Destaque pro Plus)',
    tip: "Mesma mensagem automática do admin quando o catálogo NÃO está marcado pra oferecer o Plus direto.",
    content: `Olá, [NOME]! ✨

Seu catálogo digital oficial StudioMenu está pronto, calibrado e no ar! 🚀

🔗 *Seu Link Exclusivo:*
👉 [LINK DO CATÁLOGO]

📌 *O que fazer agora:*
1. Abra o link no seu celular e confira seu catálogo completo.
2. Coloque este link na bio do seu Instagram e no seu perfil do WhatsApp Business.
3. Comece a enviar para suas clientes no momento do agendamento!

Qualquer dúvida ou ajuste que precisar, nossa equipe está à sua inteira disposição. Parabéns pelo seu novo posicionamento! 💖✨`,
  },
  {
    id: 'entrega-3',
    category: 'entrega',
    categoryName: 'Entrega do Catálogo & App',
    title: '3. Apresentação do App (2ª Mensagem, Separada da Entrega)',
    tip: "Mesma mensagem automática do botão 'Enviar app por WhatsApp' no admin — envie um tempinho depois da entrega do catálogo, não junto.",
    content: `Oi, [NOME]! ✨

Agora quero te apresentar o *app do seu StudioMenu* 📱

É por ele que você:
• vê e compartilha o link do seu catálogo
• edita fotos, serviços e preços quando quiser, sem depender de ninguém
• assina o plano pra manter tudo no ar

👉 *Seu acesso ao app:*
[LINK DO APP]

📌 *Dicas:*
1. Abra pelo celular. Ao abrir, aparecem umas dicas rápidas te mostrando cada parte.
2. Esse link é só seu e já te deixa logada, então não compartilhe com ninguém.
3. Dá pra instalar na tela inicial do celular, como um app de verdade.

Qualquer dúvida é só me chamar por aqui! 💖`,
  },

  // 6. ASSINATURA STUDIOMENU+
  {
    id: 'assinatura-1',
    category: 'assinatura',
    categoryName: 'Assinatura StudioMenu+',
    title: '1. Explicar Diferença Básico x Plus',
    tip: 'Use quando ela perguntar qual a diferença entre os planos pagos.',
    content: `Boa pergunta! Os dois são assinatura mensal, sem fidelidade:

📋 *StudioMenu Básico — R$ 39,90/mês:* catálogo com assinatura, agendamento continua pelo WhatsApp (é o degrau pro Plus).

👑 *StudioMenu+ — R$ 69,90/mês:* agendamento automático de verdade — a cliente escolhe dia e horário sozinha, e você ganha uma Agenda completa dentro do app (horários, bloqueios, etc).

Quer que eu te ajude a assinar? 😍`,
  },
  {
    id: 'assinatura-2',
    category: 'assinatura',
    categoryName: 'Assinatura StudioMenu+',
    title: '2. Como Assinar (Pix ou Cartão, Direto no App)',
    tip: 'Use quando ela topar assinar — tudo acontece dentro do app dela, não precisa de link externo nem chave PIX manual.',
    content: `Show! É super simples: dentro do seu app do StudioMenu tem a opção de assinar — escolhe Pix ou cartão, confirma, e pronto, ativa na hora! 🚀

Se quiser eu abro o app junto com você e te mostro exatamente onde clicar. Pode ser? 💖`,
  },
  {
    id: 'assinatura-3',
    category: 'assinatura',
    categoryName: 'Assinatura StudioMenu+',
    title: "3. Objeção: 'Não Preciso de Agendamento Automático Agora'",
    tip: 'Sem pressão — reforça que o catálogo grátis continua funcionando normalmente, e que o Plus fica disponível quando ela quiser.',
    content: `Sem problemas! Seu catálogo grátis continua no ar normalmente, sem nenhuma mudança. 😊

Quando sentir que tá perdendo tempo respondendo agendamento no WhatsApp, é só assinar o Plus direto no app — fico à disposição quando quiser! 💖`,
  },

  // 7. FOLLOW-UP / RESGATE
  {
    id: 'followup-1',
    category: 'followup',
    categoryName: 'Follow-up / Resgate',
    title: '1. Vácuo 24h Antes de Preencher o Formulário (Lembrete Ultraleve)',
    tip: 'Envie no dia seguinte para a lead que parou de responder antes mesmo de começar o catálogo.',
    content: `Oii! Conseguiu dar uma olhadinha no link que te mandei? Leva só 2 minutinhos pra criar seu catálogo grátis! Me conta se travou em algo 🥰✨`,
  },
  {
    id: 'followup-2',
    category: 'followup',
    categoryName: 'Follow-up / Resgate',
    title: '2. Travou no Meio do Preenchimento (Sem Fricção)',
    tip: 'Use para quem começou o formulário mas não terminou.',
    content: `Maravilhosa! Vi que você começou a criar seu catálogo — ficou lindo até aqui! 😍

Se travou em alguma parte é só me falar que eu te ajudo. O link salva sozinho, então é só voltar quando puder! ✨`,
  },
  {
    id: 'followup-3',
    category: 'followup',
    categoryName: 'Follow-up / Resgate',
    title: '3. Resposta pós Mensagem Automática do WhatsApp (Curta)',
    tip: 'Use quando a primeira mensagem caiu na resposta automática do WhatsApp Business do estúdio.',
    content: `Oii! Vi que caiu a mensagem automática! 😊

Pra não atrapalhar seu atendimento, te deixei aqui o link pra você criar seu catálogo GRÁTIS quando der uma pausinha:

👉 https://studiomenu.art/form

Dá uma olhadinha depois! 🥰`,
  },
  {
    id: 'followup-4',
    category: 'followup',
    categoryName: 'Follow-up / Resgate',
    title: '4. Nudge Pós-Entrega — Foco no Valor Prático (Sem Assinar Ainda)',
    tip: 'Envie alguns dias depois da entrega pra quem já tem o catálogo grátis no ar mas nunca assinou nenhum plano.',
    content: `Oii, [NOME]! Como tá sendo usar seu catálogo? 😍

Se tiver perdendo tempo respondendo agendamento uma por uma no WhatsApp, o StudioMenu+ resolve isso: sua cliente marca sozinha, você só recebe pronto na agenda. 📅

Quer que eu te mostre como funciona? ✨`,
  },
  {
    id: 'followup-5',
    category: 'followup',
    categoryName: 'Follow-up / Resgate',
    title: '5. Nudge Pós-Entrega — Oferecer Ajuda Direta pra Assinar',
    tip: 'Use pra quem já demonstrou interesse no Plus (perguntou, olhou a tela de assinatura) mas não finalizou.',
    content: `Oi, [NOME]! Vi que você chegou a dar uma olhada no StudioMenu+ por aí 👀

Quer que eu te ajude a ativar agora? É rapidinho, dentro do seu próprio app, Pix ou cartão. Só me chama quando quiser! 💖`,
  },
];
