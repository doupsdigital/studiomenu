import type { ReactNode } from 'react';

/** Conteúdo da Hero da landing de vendas que muda por nicho de anúncio —
 *  alinhado ao posicionamento de Menu Digital (2026-10-14).
 *  Cada nicho reflete a copy dos criativos ("Menu Digital com a cara do seu Studio").
 *
 *  `geral` é o fallback padrão para acessos diretos ou sem parâmetro ?nicho=. */
export type LandingNiche = 'geral' | 'lash' | 'nail';

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
  },
  lash: {
    eyebrow: (
      <>
        Menu Digital feito para <span className="lp-eyebrow-highlight">Lash Designer</span>
      </>
    ),
    heroTitle: (
      <>
        O Menu Digital que valoriza o{' '}
        <span className="lp-text-gradient">seu Studio de Lash</span>.
      </>
    ),
    heroSubtitle: (
      <>
        Seus procedimentos de extensão de cílios apresentados como um <strong>site profissional</strong>. Um <strong>Link exclusivo</strong> para a sua bio, onde a cliente se encanta pelas fotos e já clica para agendar direto no seu <strong>WhatsApp</strong>.
      </>
    ),
    showcaseSlug: 'lashlanding',
    socialProofHighlight: '350+ Lash Designers',
    faqFirstItem: {
      question: '1. Só serve pra extensão de cílios ou dá pra colocar outros serviços também?',
      answer: 'Dá pra colocar qualquer serviço que você oferecer no seu studio! Fio a Fio, Volume Russo, Híbrido, Egípcio, Design de Sobrancelha, Henna — você organiza o seu Menu Digital do jeitinho que atende de verdade, sem limite de categoria.',
    },
    cornerBadge: (
      <div className="lp-hero-niche-ribbon-wrap" aria-hidden="true">
        <span className="lp-hero-niche-ribbon">Lash</span>
      </div>
    ),
  },
  nail: {
    eyebrow: (
      <>
        Menu Digital feito para <span className="lp-eyebrow-highlight">Nail Designer</span>
      </>
    ),
    heroTitle: (
      <>
        O Menu Digital que valoriza o{' '}
        <span className="lp-text-gradient">seu Studio de Nail</span>.
      </>
    ),
    heroSubtitle: (
      <>
        Suas técnicas de alongamento, gel e nail art apresentadas como um <strong>site profissional</strong>. Um <strong>Link exclusivo</strong> para a sua bio, onde a cliente vê seu trabalho com sofisticação e agenda direto no seu <strong>WhatsApp</strong>.
      </>
    ),
    showcaseSlug: 'nail',
    socialProofHighlight: '350+ Nail Designers',
    faqFirstItem: {
      question: '1. Só serve pra unha ou dá pra colocar outros serviços também?',
      answer: 'Dá pra colocar qualquer serviço que você oferecer no seu studio! Alongamento em Gel, Fibra de Vidro, Esmaltação em Gel, Nail Art, Spa dos Pés, Cuticulagem — você organiza o seu Menu Digital do jeitinho que atende de verdade, sem limite de categoria.',
    },
    cornerBadge: (
      <div className="lp-hero-niche-ribbon-wrap" aria-hidden="true">
        <span className="lp-hero-niche-ribbon">Nail</span>
      </div>
    ),
  },
};
