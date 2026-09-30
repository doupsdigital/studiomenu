// Funil de Vendas X1 WhatsApp — Exclusivo para Anúncios de Tráfego Pago (Meta Ads)
// Estrutura em 2 Funis completos (Vídeo e Imagem) otimizados para converter os leads dos anúncios do StudioMenu.

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

Fica parecido com um aplicativo próprio do seu estúdio! O que achou do visual? 💕`
      },
      {
        stepNumber: 2,
        title: '2️⃣ Conectar com o Vídeo & Identificar a Dor',
        badge: 'Qualificação',
        tip: 'Envie quando ela elogiar a prévia.',
        content: `Lindo demais, né? 😍 Como você viu no vídeo, ele foi pensado pra valorizar cada detalhe do seu trabalho e acabar de vez com a bagunça de enviar tabela em PDF pesado ou foto do papel.

Hoje você envia seus valores por foto/mensagem ou já usa algum link?`
      },
      {
        stepNumber: 3,
        title: '3️⃣ Explicar a Solução StudioMenu sem Fricção',
        badge: 'Apresentação do Produto',
        tip: 'Mostre a simplicidade e a elegância.',
        content: `Entendi! O StudioMenu resolve exatamente isso: nós criamos um link exclusivo com a sua marca, foto de capa em alta definição, seus procedimentos categorizados por fotos e botão direto pro seu WhatsApp.

E o melhor: sua cliente navega sem precisar baixar nada no celular dela! ✨`
      },
      {
        stepNumber: 4,
        title: '4️⃣ Coleta de Dados (Onboarding Express)',
        badge: 'Coleta de Informações',
        tip: 'Peça os dados pra montar o catálogo personalizado.',
        content: `Para eu montar uma prévia do seu catálogo exclusivo agora mesmo, só preciso de 3 coisas:

1️⃣ Nome do seu Estúdio/Marca
2️⃣ Sua foto de perfil ou logo
3️⃣ Um print ou foto da sua tabela de serviços e valores atual

Pode me mandar por aqui mesmo! 📲`
      },
      {
        stepNumber: 5,
        title: '5️⃣ Apresentação da Oferta & Planos (Essencial vs. VIP)',
        badge: 'Preço & Valor',
        tip: 'Apresente as duas opções com clareza.',
        content: `Que incrível! Seu catálogo vai ficar maravilhoso! 😍

Nós temos 2 opções de planos (pagamento único, sem mensalidade):

🌸 **Plano Essencial — R$ 89,00**
• Catálogo Digital Completo + Link Exclusivo + Acesso ao Editor de Preços no App.

👑 **Plano VIP — R$ 149,00**
• Tudo do Essencial + Sistema de Agendamento Automático 24h + Suporte Prioritário.

Qual das duas opções se encaixa melhor no momento do seu estúdio? 💕`
      },
      {
        stepNumber: 6,
        title: '6️⃣ Contorno de Objeções (Canva / PDF / Preço)',
        badge: 'Objeção',
        tip: 'Use caso ela relute sobre o preço ou diga que faz no Canva.',
        content: `Te entendo super! A diferença do Canva é que o PDF do Canva fica pesado, a cliente precisa baixar no celular e a tabela fica desconfigurada.

No StudioMenu, a cliente clica no seu link e abre em 0 segundos. Além disso, você altera seus preços a qualquer momento direto pelo celular! É um investimento único que se paga no primeiro atendimento do mês. ✨`
      },
      {
        stepNumber: 7,
        title: '7️⃣ Fechamento & Envio do PIX',
        badge: 'Fechamento',
        tip: 'Mande para fechar a venda.',
        content: `Excelente escolha! Vamos deixar o seu estúdio em outro patamar profissional! 🚀

Vou te enviar nossa chave PIX oficial pra confirmarmos a liberação do seu painel:

🔑 **Chave PIX**: [INSERIR_SUA_CHAVE_PIX_AQUI]
Valor: R$ 89,00 (ou R$ 149,00)

Assim que fizer o PIX, me manda o comprovante aqui pra eu te entregar o link de acesso imediato!`
      },
      {
        stepNumber: 8,
        title: '8️⃣ Entrega do Link do Catálogo + Painel do App',
        badge: 'Entrega Final',
        tip: 'Mande após a confirmação do pagamento.',
        content: `Parabéns! Seu StudioMenu está 100% no ar! 🎉✨

👉 **Seu Link do Catálogo para por na Bio do Instagram**:
https://studiomenu.art/c/seu-estudio

📲 **Seu Acesso para Editar Preços e Procedimentos no App**:
https://studiomenu.art/app

Qualquer dúvida que tiver, estou aqui no WhatsApp pra te ajudar! Boas vendas! 💕`
      }
    ]
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

O que achou dessa apresentação profissional pro seu estúdio? 💕`
      },
      {
        stepNumber: 2,
        title: '2️⃣ Valor Profissional & Fim das Perguntas de Preço',
        badge: 'Desejo & Autoridade',
        tip: 'Mostre como o catálogo economiza tempo no atendimento.',
        content: `Com esse catálogo na sua Bio do Instagram ou no WhatsApp, suas clientes navegam pelos seus procedimentos com fotos reais, descrição e valores sem precisar ficar perguntando "quanto é a manutenção?" toda hora.

Dá uma autoridade gigante pro seu estúdio e passa muita segurança! ✨`
      },
      {
        stepNumber: 3,
        title: '3️⃣ Coleta Prática de Dados',
        badge: 'Onboarding Express',
        tip: 'Peça os dados pra montar o catálogo.',
        content: `Quer que eu monte uma prévia com a marca do seu estúdio? 

Me envia aqui por favor:
1. O nome da sua marca/estúdio
2. Uma foto sua ou da sua logo
3. Um print ou foto dos seus preços atuais

Já coloco no sistema pra você ver como fica! 📲`
      },
      {
        stepNumber: 4,
        title: '4️⃣ Apresentação de Planos (Essencial R$ 89 vs VIP R$ 149)',
        badge: 'Preço & Planos',
        tip: 'Apresente os valores sem mensalidade.',
        content: `Perfeito! O investimento para ter o seu StudioMenu é único (sem mensalidade mensal):

🌸 **Plano Essencial**: R$ 89,00 (Catálogo Digital Completo + Editor no celular)
👑 **Plano VIP**: R$ 149,00 (Catálogo Digital + Sistema de Agendamento Automático 24h)

Qual dessas opções combina mais com o seu estúdio hoje? 💕`
      },
      {
        stepNumber: 5,
        title: '5️⃣ Fechamento & Chave PIX',
        badge: 'Fechamento',
        tip: 'Envie para receber o pagamento.',
        content: `Excelente! Seu estúdio vai ficar um luxo! 💖

Segue a nossa chave PIX oficial para liberar o seu catálogo e painel de edição:

🔑 **Chave PIX**: [INSERIR_SUA_CHAVE_PIX_AQUI]
Valor: R$ 89,00 (ou R$ 149,00)

Assim que realizar a transferência, me envia o comprovante aqui pra eu te liberar o acesso na hora!`
      },
      {
        stepNumber: 6,
        title: '6️⃣ Entrega do Link do Catálogo + Painel',
        badge: 'Entrega Final',
        tip: 'Mande após a confirmação do PIX.',
        content: `Prontinho! Seu catálogo digital está oficialmente no ar e pronto para brilhar! ✨🎉

👉 **Seu Link do Catálogo para o Instagram/WhatsApp**:
https://studiomenu.art/c/seu-estudio

📲 **Seu Acesso para Editar Preços e Serviços**:
https://studiomenu.art/app

Estou à disposição pra qualquer dúvida! Desejo muito sucesso e agenda lotada! 💕`
      }
    ]
  }
];
