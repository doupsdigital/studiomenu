import type { ReactNode } from 'react';

/** Conteúdo da Hero da landing de vendas que muda por nicho de anúncio —
 *  alinhado ao posicionamento de Menu Digital (2026-10-14).
 *  Cada nicho reflete a copy dos criativos ("Menu Digital com a cara do seu Studio").
 *
 *  `geral` é o fallback padrão para acessos diretos ou sem parâmetro ?nicho=.
 *
 *  `lashdesigner`/`naildesigner` (2026-10-19) — variante de Hero pra nova
 *  campanha de criativos ("Angulos Novos", `marketing/criativos/Campanha01/
 *  Imagem/Angulos Novos/`), com copy de dor/objeção (perde clientes
 *  mandando PDF/fotos soltas no WhatsApp → "não é PDF nem Canva, é site de
 *  verdade"). `lash`/`nail` continuam intocados de propósito — já rodando
 *  anúncio com a copy antiga, não mexer enquanto ainda estiver em teste. */
export type LandingNiche = 'geral' | 'lash' | 'nail' | 'lashdesigner' | 'naildesigner';

export interface LandingNicheContent {
  /** Linha pequena acima do título na Hero. */
  eyebrow: ReactNode;
  /** Título principal da Hero — alinhado aos criativos. */
  heroTitle: ReactNode;
  heroSubtitle: ReactNode;
  /** Slug de `/c/showcase/{slug}` embutido no mockup de celular da Hero. */
  showcaseSlug: string;
  /** Trecho em negrito da barra de prova social no topo ("4.9/5 · Mais de {isto} já usam"). */
  socialProofHighlight: ReactNode;
  /** 1ª pergunta do FAQ nichada. */
  faqFirstItem: { question: string; answer: string };
  /** Âncora de valor nichada (pedido real, 2026-10-15) — substitui a 2ª
   *  bullet do card "StudioMenu Anual" (`SalesLandingPage.tsx`), comparando
   *  o preço anual ao custo de 1 atendimento típico do nicho. */
  anualValueAnchor: string;
  /** Faixa decorativa no canto superior direito da Hero. */
  cornerBadge?: ReactNode;
}

export const LANDING_NICHE_CONTENT: Record<LandingNiche, LandingNicheContent> = {
  geral: {
    eyebrow: 'Menu Digital Interativo para Studios de Beleza',
    heroTitle: (
      <>
        O Menu Digital que valoriza o{' '}
        <span className="lp-text-gradient">seu Studio</span>.
      </>
    ),
    heroSubtitle: (
      <>
        Seu menu online como um <strong>site profissional</strong>, sempre no ar. Fotos, procedimentos e valores em um <strong>Link exclusivo</strong> para a bio do seu Instagram e WhatsApp.
      </>
    ),
    showcaseSlug: 'landingpage',
    socialProofHighlight: '350+ Studios de Beleza',
    faqFirstItem: {
      question: '1. Serve para o meu tipo de Studio / procedimento?',
      answer: 'Com certeza! O StudioMenu foi desenvolvido sob medida para Lash Designers, Nail Designers, Esteticistas, Micropigmentadoras, Cabeleireiras e Studios de Beleza em geral.',
    },
    anualValueAnchor: 'Sai por menos que 1 atendimento do seu studio',
  },
  lash: {
    // Copy do Hero atualizada pra bater com a nova campanha de criativos
    // (pedido real, 2026-10-19 — ela testou `lashdesigner` em localhost,
    // gostou mais e pediu pra aplicar na página oficial também, não só na
    // nova). Idêntica à de `lashdesigner` abaixo de propósito.
    eyebrow: (
      <>
        Feito para <span className="lp-eyebrow-highlight">Lash Designer</span>
      </>
    ),
    heroTitle: (
      <>
        Você já tem um <span className="lp-text-gradient">Studio Incrível</span>. Mas ainda
        manda Tabela de <span className="lp-text-wine">preços e fotos do seu trabalho</span>{' '}
        soltas no WhatsApp?
      </>
    ),
    heroSubtitle: (
      <>
        Conheça o <strong className="lp-text-gradient">StudioMenu</strong>.{' '}
        <strong className="lp-text-wine">Não é PDF nem Canva</strong>: é seu
        próprio <strong className="lp-text-gradient">Site/Menu Digital interativo</strong>.
      </>
    ),
    showcaseSlug: 'lashlanding',
    socialProofHighlight: '350+ Lash Designers',
    faqFirstItem: {
      question: '1. Só serve pra extensão de cílios ou dá pra colocar outros serviços também?',
      answer: 'Dá pra colocar qualquer serviço que você oferecer no seu studio! Fio a Fio, Volume Russo, Híbrido, Egípcio, Design de Sobrancelha, Henna — você organiza o seu Menu Digital do jeitinho que atende de verdade, sem limite de categoria.',
    },
    anualValueAnchor: 'Sai por menos que 1 aplicação de Volume Brasileiro',
    cornerBadge: (
      <div className="lp-hero-niche-ribbon-wrap" aria-hidden="true">
        <span className="lp-hero-niche-ribbon">Lash</span>
      </div>
    ),
  },
  nail: {
    // Copy do Hero atualizada pra bater com a nova campanha de criativos
    // (pedido real, 2026-10-19 — ver comentário equivalente em `lash`
    // acima). Idêntica à de `naildesigner` abaixo de propósito.
    eyebrow: (
      <>
        Feito para <span className="lp-eyebrow-highlight">Nail Designer</span>
      </>
    ),
    heroTitle: (
      <>
        Você já tem um <span className="lp-text-gradient">Studio Incrível</span>. Mas ainda
        manda Tabela de <span className="lp-text-wine">preços e fotos do seu trabalho</span>{' '}
        soltas no WhatsApp?
      </>
    ),
    heroSubtitle: (
      <>
        Conheça o <strong className="lp-text-gradient">StudioMenu</strong>.{' '}
        <strong className="lp-text-wine">Não é PDF nem Canva</strong>: é seu
        próprio <strong className="lp-text-gradient">Site/Menu Digital interativo</strong>.
      </>
    ),
    // 'naildesigner', não 'nail' — o slug 'nail' cai no agendamento automático
    // (Plus), mas a copy acima promete "agenda direto no WhatsApp" (igual
    // lash); 'naildesigner' é a versão Básico (WhatsApp) do mesmo nicho
    // (bug real em produção, 2026-10-15).
    showcaseSlug: 'naildesigner',
    socialProofHighlight: '350+ Nail Designers',
    faqFirstItem: {
      question: '1. Só serve pra unha ou dá pra colocar outros serviços também?',
      answer: 'Dá pra colocar qualquer serviço que você oferecer no seu studio! Alongamento em Gel, Fibra de Vidro, Esmaltação em Gel, Nail Art, Spa dos Pés, Cuticulagem — você organiza o seu Menu Digital do jeitinho que atende de verdade, sem limite de categoria.',
    },
    anualValueAnchor: 'Sai por menos que 1 alongamento em Gel',
    cornerBadge: (
      <div className="lp-hero-niche-ribbon-wrap" aria-hidden="true">
        <span className="lp-hero-niche-ribbon">Nail</span>
      </div>
    ),
  },
  // lashdesigner/naildesigner (2026-10-19) — ver comentário de
  // `LandingNiche` acima. Hero com copy de dor/objeção, mesma frase nos 2
  // nichos (os criativos novos usam o MESMO texto de dor/quebra de
  // objeção pra lash e nail, só badge/fotos do mockup mudam) — o resto do
  // conteúdo (faqFirstItem, anualValueAnchor, cornerBadge) reaproveita
  // exatamente o que já existe pra `lash`/`nail`.
  lashdesigner: {
    eyebrow: (
      <>
        Feito para <span className="lp-eyebrow-highlight">Lash Designer</span>
      </>
    ),
    heroTitle: (
      <>
        Você já tem um <span className="lp-text-gradient">Studio Incrível</span>. Mas ainda
        manda Tabela de <span className="lp-text-wine">preços e fotos do seu trabalho</span>{' '}
        soltas no WhatsApp?
      </>
    ),
    heroSubtitle: (
      <>
        Conheça o <strong className="lp-text-gradient">StudioMenu</strong>.{' '}
        <strong className="lp-text-wine">Não é PDF nem Canva</strong>: é seu
        próprio <strong className="lp-text-gradient">Site/Menu Digital interativo</strong>.
      </>
    ),
    showcaseSlug: 'lashlanding',
    socialProofHighlight: '350+ Lash Designers',
    faqFirstItem: {
      question: '1. Só serve pra extensão de cílios ou dá pra colocar outros serviços também?',
      answer: 'Dá pra colocar qualquer serviço que você oferecer no seu studio! Fio a Fio, Volume Russo, Híbrido, Egípcio, Design de Sobrancelha, Henna — você organiza o seu Menu Digital do jeitinho que atende de verdade, sem limite de categoria.',
    },
    anualValueAnchor: 'Sai por menos que 1 aplicação de Volume Brasileiro',
    cornerBadge: (
      <div className="lp-hero-niche-ribbon-wrap" aria-hidden="true">
        <span className="lp-hero-niche-ribbon">Lash</span>
      </div>
    ),
  },
  naildesigner: {
    eyebrow: (
      <>
        Feito para <span className="lp-eyebrow-highlight">Nail Designer</span>
      </>
    ),
    heroTitle: (
      <>
        Você já tem um <span className="lp-text-gradient">Studio Incrível</span>. Mas ainda
        manda Tabela de <span className="lp-text-wine">preços e fotos do seu trabalho</span>{' '}
        soltas no WhatsApp?
      </>
    ),
    heroSubtitle: (
      <>
        Conheça o <strong className="lp-text-gradient">StudioMenu</strong>.{' '}
        <strong className="lp-text-wine">Não é PDF nem Canva</strong>: é seu
        próprio <strong className="lp-text-gradient">Site/Menu Digital interativo</strong>.
      </>
    ),
    showcaseSlug: 'naildesigner',
    socialProofHighlight: '350+ Nail Designers',
    faqFirstItem: {
      question: '1. Só serve pra unha ou dá pra colocar outros serviços também?',
      answer: 'Dá pra colocar qualquer serviço que você oferecer no seu studio! Alongamento em Gel, Fibra de Vidro, Esmaltação em Gel, Nail Art, Spa dos Pés, Cuticulagem — você organiza o seu Menu Digital do jeitinho que atende de verdade, sem limite de categoria.',
    },
    anualValueAnchor: 'Sai por menos que 1 alongamento em Gel',
    cornerBadge: (
      <div className="lp-hero-niche-ribbon-wrap" aria-hidden="true">
        <span className="lp-hero-niche-ribbon">Nail</span>
      </div>
    ),
  },
};
