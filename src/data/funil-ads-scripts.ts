// Funil de Vendas X1 WhatsApp — Exclusivo para Anúncios de Tráfego Pago (Meta Ads)
// Estrutura em 2 Funis completos (Vídeo e Imagem) otimizados para converter os leads dos anúncios do StudioMenu.
//
// Reescrito em 2026-10-01 (correção de preço) e novamente no mesmo dia (reestruturação
// completa): a versão do Antigravity tinha passos intermediários demais pra um lead que
// já chegou interessado (clicou no anúncio, já quer) — "conectar com o vídeo", "explicar
// a solução sem fricção" etc. atrasavam a conversa sem necessidade. Reescrito com base em
// 2 conversas reais de produção (uma que travou, uma que converteu) seguindo a estratégia
// de funil Front/Back: oferece sempre o Básico (R$29,90, agendamento manual via WhatsApp)
// primeiro — é o produto de entrada, mais fácil de fechar. O Plus (R$59,90, agendamento
// automático) só é oferecido de cara se a lead já pedir isso explicitamente; pro resto,
// o upsell acontece sozinho depois, dentro do app dela (card do Plus na tela Início/Config
// de quem está no Básico — mecanismo que já existe, não precisa de nada manual aqui).
//
// Achado real comparando as 2 conversas: a que travou respondeu "como faço pra obter"
// ancorando o preço do PLUS primeiro (R$69,90, com toda a explicação de agendamento) e só
// depois ofereceu o Básico como alternativa — a lead sumiu. A que converteu ofereceu o
// Básico primeiro, cada plano em 1-2 linhas com o preço colado, e fechou com "só paga se
// gostar" (reduz o medo de cobrança). Por isso duas variantes de resposta pro preço aqui —
// A (só Básico) e B (os 2 planos, Básico primeiro) — a escolha de qual mandar fica a
// critério de quem está vendendo, conforme o perfil da lead na hora.
//
// Preços centralizados em `src/lib/pricing.ts`. Catálogo é sempre grátis pra criar; o que
// é vendido é a assinatura, explicada só na entrega da prévia, paga dentro do app via Asaas
// (Pix ou cartão) — nunca por chave PIX pessoal nem pagamento único.
//
// Formatação: WhatsApp só suporta *negrito*, _itálico_ e ~tachado~ — não existe sublinhado
// de verdade no app. Negrito usado nos preços e nos CTAs de maior risco (ex: "só paga se
// gostar") pra se destacar na leitura rápida do celular.

export interface FunnelStep {
  stepNumber: number;
  title: string;
  badge: string;
  tip?: string;
  content: string;
}

export interface FunnelData {
  id: string;
  title: string;
  adOrigin: string;
  triggerMessage: string;
  badgeColor: string;
  steps: FunnelStep[];
}

/** Passos compartilhados pelos dois funis a partir da 1ª resposta — o que muda entre
 *  vídeo e imagem é só a mensagem de abertura (tema do criativo), o resto da conversa é
 *  idêntico: lead de anúncio é lead de anúncio, não importa o formato do criativo que
 *  trouxe ela.
 *
 *  Numeração: só os passos que SEMPRE acontecem (nessa ordem) levam número — abertura já
 *  está fora desta lista, então aqui começa em 2️⃣. As duas variantes de preço dividem o
 *  mesmo número (2️⃣A/2️⃣B) porque são o mesmo passo da conversa, só muda qual mandar. Os
 *  scripts marcados com ❓ são condicionais — só usa se a situação específica aparecer,
 *  não fazem parte do caminho padrão. */
function buildCommonSteps(): FunnelStep[] {
  return [
    {
      stepNumber: 2,
      title: '2️⃣ A — Resposta ao "Como faço pra obter?" — Variante A: Só Básico',
      badge: 'Preço & Valor · Básico',
      tip: 'Oferta padrão — comece sempre por aqui. Use quando a lead parecer decidida ou sensível a preço, ou quando o anúncio que trouxe ela era focado em catálogo (não em agendamento).',
      content: `Funciona assim: é um link exclusivo seu, com fotos, serviços e valores — você pode colocar na Bio do Instagram. A cliente escolhe o serviço e, ao clicar em Agendar, já cai direto no seu WhatsApp com a mensagem pronta. Valor: *R$29,90/mês*.

Montamos a prévia do seu catálogo de graça. Se gostar, você recebe o link de um App exclusivo seu e assina direto por ele — *só paga se gostar*. 🥰

Quer que eu monte a sua? ✨`,
    },
    {
      stepNumber: 3,
      title: '2️⃣ B — Resposta ao "Como faço pra obter?" — Variante B: Os 2 Planos',
      badge: 'Preço & Valor · Básico + Plus',
      tip: 'Use quando quiser deixar a decisão mais aberta, ou quando a lead já parecer saber o que quer / vier de um anúncio que falava de agendamento. O Básico sempre aparece primeiro, nunca o Plus.',
      content: `Funciona assim: é um link exclusivo seu, com fotos, serviços e valores — você pode colocar na Bio do Instagram.

📋 *Básico*: a cliente escolhe o serviço e cai direto no seu WhatsApp pra combinar o horário. *R$29,90/mês*.

📅 *Plus*: a cliente agenda sozinha, escolhendo dia e horário através do seu link, sem você precisar responder no WhatsApp. Você recebe o link de um App exclusivo seu pra controlar sua Agenda. *R$59,90/mês*.

Montamos sua prévia de graça. Se gostar, você recebe o link do seu App e assina por ele — *só paga se gostar*. 🥰

Quer que eu monte a sua? ✨`,
    },
    {
      stepNumber: 4,
      title: '3️⃣ Coleta de Dados (Onboarding Express)',
      badge: 'Coleta de Informações',
      tip: 'Envie assim que ela topar fazer a prévia (em qualquer uma das variantes acima).',
      content: `Pra montarmos uma prévia do seu catálogo exclusivo agora mesmo, só preciso de 2 coisas:

1️⃣ Nome do seu Studio
2️⃣ Seu @ do Instagram

Se quiser, pode mandar também uma foto sua ou do seu espaço pra capa — mas não é obrigatório, se não mandar a gente já usa uma capa padrão.

Os serviços a gente já deixa com alguns exemplos prontos, só pra você ver funcionando — depois você troca pelos seus com calma, ou, se preferir, a gente cadastra pra você: é só mandar sua tabela ou PDF depois.

*Entregamos sua prévia em até 24 horas* (geralmente entregamos bem antes 🥰)`,
    },
    {
      stepNumber: 5,
      title: '4️⃣ Confirmação de Recebimento',
      badge: 'Confirmação',
      tip: 'Envie assim que ela de fato mandar o material (nome, foto, tabela).',
      content: `Recebi tudo por aqui! 🎉

Vamos preparar com muito carinho. Assim que sua prévia estiver pronta eu te mando aqui!`,
    },
    {
      stepNumber: 6,
      title: '5️⃣ Entrega do Link do App (Catálogo + Edição + Assinatura)',
      badge: 'Entrega Final',
      tip: 'O link é o do APP — já vem com o catálogo, edição e a opção de assinar, tudo dentro da mesma experiência. Nunca mande chave PIX nem link de pagamento separado.',
      content: `Prontinho! Seu StudioMenu já está no ar 🎉

👉 *[LINK DO APP]*

Lá dentro, toque em *"Visualizar catálogo"* pra ver como ficou. Se quiser mudar algo, é só tocar em *"Editar meu catálogo"* — e se quiser ativar a assinatura, a opção já está lá dentro também.

Os serviços que estão aí agora são só exemplos, pra você já ver tudo funcionando de verdade — você troca pelos seus quando quiser, ou, se preferir, a gente cadastra pra você: é só mandar sua tabela, PDF ou print por aqui (ou falar se já tem em algum lugar online) que a gente deixa certinho. 😊

Qualquer dúvida, estou aqui! 💕`,
    },
    {
      stepNumber: 7,
      title: '❓ FAQ — "Posso colocar outros serviços? Quantos?"',
      badge: 'Dúvida Comum',
      tip: 'Pergunta recorrente antes mesmo de chegar no preço — responda rápido e direto, sem tentar emendar pro próximo passo ainda. Só use se ela perguntar isso.',
      content: `Pode sim! Você tem acesso a um link pra *editar seu catálogo como preferir* — categorias, fotos, valores, sem limite de quantos serviços colocar. 😊`,
    },
    {
      stepNumber: 8,
      title: '❓ Objeção/Dúvida — "E o agendamento automático?"',
      badge: 'Objeção',
      tip: 'Use se ela perguntar especificamente sobre agenda automática, mesmo depois de já ter escolhido o Básico — ou se o anúncio que trouxe ela já falava de agendamento.',
      content: `Existem dois jeitos de usar: no *Básico (R$29,90)*, a cliente clica no serviço e chama você no WhatsApp pra combinar o horário. No *StudioMenu+ (R$59,90)*, ela tem um app exclusivo onde escolhe o dia e horário sozinha, sem trocar mensagem com você — sua agenda já fica organizada automaticamente.

Muita gente começa no Básico e evolui pro Plus depois que já está usando. Quer já começar com o agendamento automático?`,
    },
    {
      stepNumber: 9,
      title: '❓ Objeção — "Já uso o Canva / PDF"',
      badge: 'Objeção',
      tip: 'Use caso ela diga que já manda tabela em PDF ou faz no Canva.',
      content: `Te entendo super! A diferença do Canva é que o PDF fica pesado, a cliente precisa baixar no celular e a tabela desconfigura.

No StudioMenu, ela clica no seu link e abre na hora. E você mesma troca preços e fotos quando quiser, direto pelo celular — o catálogo em si não tem custo nenhum pra manter no ar. ✨`,
    },
    {
      stepNumber: 10,
      title: '❓ Follow-up Curto — "Se Ela Disser Que Manda Depois"',
      badge: 'Follow-up',
      tip: 'Resposta curta pra quando ela topa mas vai mandar o material em outro momento — não insista, só confirma que você vai esperar.',
      content: `Ficamos no aguardo 🙏`,
    },
    {
      stepNumber: 11,
      title: '🆘 Resgate — Catálogo Montado Sem Ela Responder',
      badge: 'Resgate',
      tip: 'Use quando a lead sumir de vez durante a coleta de dados e você decidir montar o catálogo dela mesmo assim (buscando fotos/serviços por conta própria, ex: Instagram/Google) em vez de esperar ela responder.',
      content: `Oii, [NOME]! Sei que a rotina é corrida e às vezes a gente nem consegue responder tudo 😅

Para que você consiga ver como ficaria incrível o seu Catálogo, nossa equipe criou uma prévia com o que encontramos do seu trabalho:

👉 [LINK DO APP]

Esperamos que você goste. Ah, e você consegue editar tudo depois tá bom? 😊

Se for do seu interesse adquirir o catálogo é só nos chamar aqui. 💕`,
    },
  ];
}

type AdType = 'video' | 'imagem';
type Niche = 'lash' | 'nail';

const NICHE_LABEL: Record<Niche, string> = { lash: 'Lash', nail: 'Nail' };
const AD_TYPE_LABEL: Record<AdType, string> = { video: 'vídeo', imagem: 'anúncio' };
const AD_TYPE_TITLE: Record<AdType, string> = { video: 'Vídeo', imagem: 'Imagem' };
const AD_TYPE_ICON: Record<AdType, string> = { video: '🎥', imagem: '🖼️' };
const AD_TYPE_ORIGIN: Record<AdType, string> = {
  video: 'Anúncio em Vídeo (Feed/Reels)',
  imagem: 'Anúncio em Imagem (Feed/Stories)',
};
const AD_TYPE_BADGE_COLOR: Record<AdType, string> = {
  video: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  imagem: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

/** 1 funil por combinação anúncio × nicho — o lead que veio de Lash precisa do
 *  link `/c/showcase/lash`, o de Nail do `/c/showcase/nail`; antes disso era um
 *  único funil "Lash/Nail" genérico, errado pra copiar rápido (pedido real,
 *  2026-10-01: ela roda 4 campanhas hoje — vídeo e imagem, pra cada nicho). */
function buildFunnel(adType: AdType, niche: Niche, numero: number): FunnelData {
  return {
    id: `funil-${adType}-${niche}`,
    title: `${AD_TYPE_ICON[adType]} Funil ${String(numero).padStart(2, '0')} — ${AD_TYPE_TITLE[adType]} ${NICHE_LABEL[niche]}`,
    adOrigin: `${AD_TYPE_ORIGIN[adType]} — ${NICHE_LABEL[niche]}`,
    triggerMessage: `Olá, vi o ${AD_TYPE_LABEL[adType]} do Catálogo Digital para ${NICHE_LABEL[niche]} e quero saber como funciona.`,
    badgeColor: AD_TYPE_BADGE_COLOR[adType],
    steps: [
      {
        stepNumber: 1,
        title: '1️⃣ Boas-Vindas + Exemplo Ao Vivo + Escalar Desejo',
        badge: 'Início / Recepção',
        tip: 'Mande assim que o lead chamar. A frase final já veio de conversa real que converteu — projeta ela no resultado em vez de pedir opinião técnica.',
        content: `Oii! Que bom que você se interessou! 😍

Dá uma olhadinha nesse exemplo do Catálogo Digital, pra você ver funcionando na prática:

👉 https://studiomenu.art/c/showcase/${niche}

*Já imaginou seu studio com esse catálogo?* Suas clientes iriam amar a experiência. 💗

Depois me conta o que achou, que eu te explico como funciona pra ter o seu. 🥰`,
      },
      ...buildCommonSteps(),
    ],
  };
}

export const FUNIL_ADS_DATA: FunnelData[] = [
  buildFunnel('video', 'lash', 1),
  buildFunnel('imagem', 'lash', 2),
  buildFunnel('video', 'nail', 3),
  buildFunnel('imagem', 'nail', 4),
];
