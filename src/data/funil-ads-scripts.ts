// Funil de Vendas X1 WhatsApp — Exclusivo para Anúncios de Tráfego Pago (Meta Ads)
// Estrutura em 2 Funis completos (Vídeo e Imagem) otimizados para converter os leads dos anúncios do StudioMenu.
//
// Reescrito em 2026-10-01: a versão anterior descrevia o modelo antigo do LashMenu
// (catálogo pago, pagamento único de R$89/R$149 via PIX pessoal, "liberar o painel"
// só depois do pagamento) — não bate com o produto atual. Hoje o catálogo é sempre
// grátis pra criar; o que é vendido é uma assinatura recorrente opcional (Básico ou
// Plus), explicada só na entrega da prévia, paga dentro do app via Asaas (Pix ou
// cartão), nunca por chave PIX pessoal. Mesmo modelo de preço de
// `src/data/vendas-x1-scripts.ts` — preços centralizados em `src/lib/pricing.ts`.

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
  subtitle: string;
  adOrigin: string;
  triggerMessage: string;
  badgeColor: string;
  steps: FunnelStep[];
}

export const FUNIL_ADS_DATA: FunnelData[] = [
  {
    id: 'funil-video',
    title: '🎥 Funil 01 — Lead de Vídeo',
    subtitle: 'Para leads que vieram dos Anúncios de Vídeo (StudioMenu-Lash.mp4 / StudioMenu-Nail.mp4)',
    adOrigin: 'Anúncio em Vídeo (Feed/Reels)',
    triggerMessage: 'Olá, vi o vídeo do Catálogo Digital para Lash/Nail e quero saber como funciona.',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    steps: [
      {
        stepNumber: 1,
        title: '1️⃣ Boas-Vindas + Exemplo Ao Vivo no Celular',
        badge: 'Início / Recepção',
        tip: 'Mande assim que o lead chamar. Troque /lash por /nail conforme o nicho da cliente.',
        content: `Oii! Que bom que você viu o nosso vídeo! 😍

Dá uma olhadinha de perto em como o Catálogo Digital funciona, ao vivo no celular:
👉 https://studiomenu.art/c/showcase/lash

Fica parecido com um aplicativo próprio do seu estúdio! O que achou do visual? 💕`,
      },
      {
        stepNumber: 2,
        title: '2️⃣ Conectar com o Vídeo & Identificar a Dor',
        badge: 'Qualificação',
        tip: 'Envie quando ela elogiar a prévia.',
        content: `Lindo demais, né? 😍 Como você viu no vídeo, ele foi pensado pra valorizar cada detalhe do seu trabalho e acabar de vez com a bagunça de enviar tabela em PDF pesado ou foto do papel.

Hoje você envia seus valores por foto/mensagem ou já usa algum link?`,
      },
      {
        stepNumber: 3,
        title: '3️⃣ Explicar a Solução StudioMenu sem Fricção',
        badge: 'Apresentação do Produto',
        tip: 'Deixa claro que criar o catálogo não custa nada — isso tira a resistência antes mesmo de pedir os dados.',
        content: `Entendi! O StudioMenu resolve exatamente isso: você ganha um link exclusivo com a sua marca, foto de capa em alta definição, seus procedimentos organizados com fotos e botão direto pro seu WhatsApp.

Criar o catálogo não tem nenhum custo. Se mais pra frente você quiser ativar o agendamento automático (a cliente marcando sozinha, sem trocar mensagem com você), aí sim existe uma assinatura — mas isso eu só te mostro depois, sem pressa. ✨`,
      },
      {
        stepNumber: 4,
        title: '4️⃣ Coleta de Dados (Onboarding Express)',
        badge: 'Coleta de Informações',
        tip: 'Peça os dados pra montar a prévia personalizada — sem pedir nada de pagamento aqui.',
        content: `Pra eu montar uma prévia do seu catálogo exclusivo agora mesmo, só preciso de 3 coisas:

1️⃣ Nome do seu Estúdio/Marca
2️⃣ Sua foto de perfil ou logo
3️⃣ Um print ou foto da sua tabela de serviços e valores atual

Pode me mandar por aqui mesmo, sem compromisso nenhum! 📲`,
      },
      {
        stepNumber: 5,
        title: '5️⃣ Confirmação de Recebimento',
        badge: 'Confirmação',
        tip: 'Envie assim que ela mandar o material.',
        content: `Recebi tudo por aqui! 🎉

Vamos preparar com muito carinho. Assim que sua prévia estiver pronta eu te mando aqui!`,
      },
      {
        stepNumber: 6,
        title: '6️⃣ Entrega da Prévia + Os 2 Planos',
        badge: 'Preço & Valor',
        tip: 'Só aqui o preço entra na conversa — depois que ela já viu o catálogo pronto com a marca dela. Objeção? Veja o próximo passo.',
        content: `Pronto, [Nome]! Olha como ficou o seu:
👉 [link da prévia]

Você escolhe como continuar:

📋 *Básico — R$29,90/mês*: link exclusivo com suas fotos, serviços e valores — a cliente chama você no WhatsApp pra agendar.
📅 *Plus — R$59,90/mês*: tudo isso + agendamento automático — a cliente marca sozinha, sem você responder uma por uma.

Nos dois você edita tudo pelo celular, sem fidelidade — paga só enquanto estiver usando.

Qual desses faz mais sentido pra você?`,
      },
      {
        stepNumber: 7,
        title: '7️⃣ Contorno de Objeções (Canva / PDF / Preço)',
        badge: 'Objeção',
        tip: 'Use caso ela relute sobre o preço ou diga que faz no Canva.',
        content: `Te entendo super! A diferença do Canva é que o PDF fica pesado, a cliente precisa baixar no celular e a tabela desconfigura.

No StudioMenu, ela clica no seu link e abre na hora. E você mesma troca preços e fotos quando quiser, direto pelo celular — o catálogo em si não tem custo nenhum pra manter no ar. ✨`,
      },
      {
        stepNumber: 8,
        title: '8️⃣ Entrega do Link do App (Catálogo + Edição + Assinatura)',
        badge: 'Entrega Final',
        tip: 'O link é o do APP — já vem com o catálogo, edição e a opção de assinar, tudo dentro da mesma experiência. Nunca mande chave PIX nem link de pagamento separado.',
        content: `Prontinho! Seu StudioMenu já está no ar 🎉

👉 [LINK DO APP]

Lá dentro, toque em *"Visualizar catálogo"* pra ver como ficou. Se quiser mudar algo, é só tocar em *"Editar meu catálogo"* — e se quiser ativar a assinatura, a opção já está lá dentro também.

Qualquer dúvida, estou aqui! 💕`,
      },
    ],
  },
  {
    id: 'funil-imagem',
    title: '🖼️ Funil 02 — Lead de Imagem',
    subtitle: 'Para leads que vieram dos Anúncios de Imagem (IMG - Lash 01.png / IMG - Nail 01.png)',
    adOrigin: 'Anúncio em Imagem (Feed/Stories)',
    triggerMessage: 'Olá, vi o anúncio do Catálogo Digital para Lash/Nail e quero saber como funciona.',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    steps: [
      {
        stepNumber: 1,
        title: '1️⃣ Boas-Vindas + Demonstração Visual',
        badge: 'Início / Recepção',
        tip: 'Responda reforçando a elegância do anúncio visual.',
        content: `Oii! Que ótimo ver você por aqui! 😍

O anúncio que você viu mostra exatamente a elegância do nosso Catálogo Mosaico/Clássico.

Veja como ele fica completo e interativo na tela do celular:
👉 https://studiomenu.art/c/showcase/lash

O que achou dessa apresentação profissional pro seu estúdio? 💕`,
      },
      {
        stepNumber: 2,
        title: '2️⃣ Valor Profissional & Fim das Perguntas de Preço',
        badge: 'Desejo & Autoridade',
        tip: 'Mostre como o catálogo economiza tempo no atendimento.',
        content: `Com esse catálogo na sua Bio do Instagram ou no WhatsApp, suas clientes navegam pelos seus procedimentos com fotos reais, descrição e valores sem precisar ficar perguntando "quanto é a manutenção?" toda hora.

Dá uma autoridade gigante pro seu estúdio e passa muita segurança! ✨`,
      },
      {
        stepNumber: 3,
        title: '3️⃣ Coleta Prática de Dados',
        badge: 'Onboarding Express',
        tip: 'Peça os dados pra montar o catálogo — sem pedir nada de pagamento aqui.',
        content: `Quer que eu monte uma prévia com a marca do seu estúdio?

Me envia aqui por favor:
1. O nome da sua marca/estúdio
2. Uma foto sua ou da sua logo
3. Um print ou foto dos seus preços atuais

Já coloco no sistema pra você ver como fica, sem nenhum custo! 📲`,
      },
      {
        stepNumber: 4,
        title: '4️⃣ Confirmação de Recebimento',
        badge: 'Confirmação',
        tip: 'Envie assim que ela mandar o material.',
        content: `Recebi tudo por aqui! 🎉

Vamos preparar com muito carinho. Assim que sua prévia estiver pronta eu te mando aqui!`,
      },
      {
        stepNumber: 5,
        title: '5️⃣ Entrega da Prévia + Os 2 Planos',
        badge: 'Preço & Valor',
        tip: 'Só aqui o preço entra na conversa — depois que ela já viu o catálogo pronto com a marca dela.',
        content: `Pronto, [Nome]! Olha como ficou o seu:
👉 [link da prévia]

Você escolhe como continuar:

📋 *Básico — R$29,90/mês*: link exclusivo com suas fotos, serviços e valores — a cliente chama você no WhatsApp pra agendar.
📅 *Plus — R$59,90/mês*: tudo isso + agendamento automático — a cliente marca sozinha, sem você responder uma por uma.

Nos dois você edita tudo pelo celular, sem fidelidade — paga só enquanto estiver usando.

Qual desses faz mais sentido pra você?`,
      },
      {
        stepNumber: 6,
        title: '6️⃣ Entrega do Link do App (Catálogo + Edição + Assinatura)',
        badge: 'Entrega Final',
        tip: 'O link é o do APP — já vem com o catálogo, edição e a opção de assinar, tudo dentro da mesma experiência. Nunca mande chave PIX nem link de pagamento separado.',
        content: `Prontinho! Seu catálogo digital está oficialmente no ar e pronto pra brilhar! ✨🎉

👉 [LINK DO APP]

Lá dentro, toque em *"Visualizar catálogo"* pra ver como ficou. Se quiser mudar algo, é só tocar em *"Editar meu catálogo"* — e se quiser ativar a assinatura, a opção já está lá dentro também.

Estou à disposição pra qualquer dúvida! Desejo muito sucesso e agenda lotada! 💕`,
      },
    ],
  },
];
