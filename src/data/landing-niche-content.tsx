import type { ReactNode } from 'react';

/** Conteúdo da Hero da landing de vendas que muda por nicho de anúncio —
 *  pedido real, 2026-10-14: os anúncios agora são "nichados" (ex: "Ei, Lash
 *  Designer"), e a landing genérica ("StudioMenu pra todo mundo") destoava
 *  do criativo. Em vez de uma página por nicho, um parâmetro `?nicho=` troca
 *  só a Hero (ver `src/app/page.tsx`) — resto da página (depoimentos, FAQ,
 *  preços) continua compartilhado entre todos os nichos por enquanto.
 *
 *  `geral` é o fallback de sempre — qualquer `?nicho=` ausente, digitado
 *  errado ou ainda não implementado cai aqui, pra nunca quebrar um link de
 *  anúncio antigo. */
export type LandingNiche = 'geral' | 'lash' | 'nail';

export interface LandingNicheContent {
  /** Linha pequena abaixo do nome "StudioMenu", no topo da Hero. */
  eyebrow: ReactNode;
  /** Título principal da Hero (1 frase só, pedido real 2026-10-14 — antes
   *  eram 2 linhas separadas, consolidadas numa headline única). */
  heroTitle: ReactNode;
  heroSubtitle: ReactNode;
  /** Slug de `/c/showcase/{slug}` embutido no mockup de celular da Hero —
   *  cada nicho mostra o catálogo real daquele nicho (não o genérico). */
  showcaseSlug: string;
  /** Trecho em negrito da barra de prova social no topo ("4.9/5 · Mais de
   *  {isto} já usam"). */
  socialProofHighlight: ReactNode;
  /** 1ª pergunta do FAQ — a única que falava de "todos os nichos" (o resto
   *  já é genérico o bastante pra servir qualquer nicho, sem soar fora de
   *  contexto numa página 100% dedicada a um nicho só). */
  faqFirstItem: { question: string; answer: string };
  /** Faixa diagonal decorativa no canto superior direito da Hero (pedido
   *  real, 2026-10-14 — 1ª versão era um selo circular com ícone de cílios,
   *  trocada por uma faixa tipo "oferta" com o nome do nicho) — opcional:
   *  nem todo nicho precisa ter uma. */
  cornerBadge?: ReactNode;
}

export const LANDING_NICHE_CONTENT: Record<LandingNiche, LandingNicheContent> = {
  geral: {
    eyebrow: 'Catálogo Digital para Studios de Beleza',
    heroTitle: (
      <>
        Chega de mandar Tabelas de preços e <span className="lp-text-wine">PDFs</span>.
        <span className="lp-hero-title-line2">
          Seu <span className="lp-text-gradient">Catálogo Digital Interativo</span>, pronto em minutos.
        </span>
      </>
    ),
    heroSubtitle: (
      <>
        Fotos e preços em um <strong>Link</strong> com o seu nome. Perfeito pra <strong>Lash</strong>, <strong>Nail</strong>, <strong>Estética</strong> ou qualquer Studio de Beleza.
      </>
    ),
    showcaseSlug: 'landingpage',
    socialProofHighlight: '350+ Studios de Beleza',
    faqFirstItem: {
      question: '1. Serve para o meu tipo de Studio / procedimento?',
      answer: 'Com certeza! O StudioMenu foi feito sob medida para Lash Designers, Nail Designers, Esteticistas, Micropigmentadoras, Cabeleireiras e Studios de Beleza em geral.',
    },
  },
  lash: {
    eyebrow: (
      <>
        O catálogo digital da <span className="lp-eyebrow-highlight">Lash Designer</span>
      </>
    ),
    heroTitle: 'Chega de mandar PDF e Tabelas pras suas clientes.',
    heroSubtitle: (
      <>
        <strong>Fotos e preços</strong> dos seus procedimentos em um <strong>Link interativo</strong> que valoriza seu trabalho — a cliente escolhe e já te chama pra agendar no <strong>WhatsApp</strong>.
      </>
    ),
    showcaseSlug: 'lashlanding',
    socialProofHighlight: '350+ Lash Designers',
    faqFirstItem: {
      question: '1. Só serve pra extensão de cílios ou dá pra colocar outros serviços também?',
      answer: 'Dá pra colocar qualquer serviço que você oferecer no seu studio! Fio a Fio, Volume Russo, Híbrido, Egípcio, Design de Sobrancelha, Henna — você monta o catálogo do jeitinho que atende de verdade, sem limite de categoria.',
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
        O catálogo digital da <span className="lp-eyebrow-highlight">Nail Designer</span>
      </>
    ),
    heroTitle: 'Chega de mandar PDF e Tabelas pras suas clientes.',
    heroSubtitle: (
      <>
        <strong>Fotos e preços</strong> dos seus procedimentos em um <strong>Link interativo</strong> que valoriza seu trabalho — a cliente escolhe e já te chama pra agendar no <strong>WhatsApp</strong>.
      </>
    ),
    showcaseSlug: 'nail',
    socialProofHighlight: '350+ Nail Designers',
    faqFirstItem: {
      question: '1. Só serve pra unha ou dá pra colocar outros serviços também?',
      answer: 'Dá pra colocar qualquer serviço que você oferecer no seu studio! Alongamento em Gel, Fibra de Vidro, Esmaltação em Gel, Nail Art, Spa dos Pés — você monta o catálogo do jeitinho que atende de verdade, sem limite de categoria.',
    },
    cornerBadge: (
      <div className="lp-hero-niche-ribbon-wrap" aria-hidden="true">
        <span className="lp-hero-niche-ribbon">Nail</span>
      </div>
    ),
  },
};
