import type { Metadata } from 'next';
import { NicheType } from '@/types/catalog';
import { ShowcaseClient } from './ShowcaseClient';

interface ShowcasePageProps {
  params: Promise<{ niche: string }>;
}

/** Resolve o slug da URL pro nicho real + se é a versão "Básico" (agenda via
 *  WhatsApp) ou "Plus" (agendamento automático) — pedido real, 2026-10-02:
 *  ela precisava de 2 links fixos e fáceis de reconhecer de cabeça (sem
 *  parâmetro na URL) pra mandar pra leads de anúncio, um pra cada plano.
 *  `.../lash` e `.../nail` continuam exatamente como sempre foram (Plus);
 *  `.../lashdesigner` e `.../naildesigner` são os novos, iguais em tudo
 *  menos o botão "Agendar" cair na simulação de WhatsApp. Nicho sem versão
 *  Básico (estetica/studio) só passa direto, sem mudar nada.
 *
 *  `.../lashs` e `.../nails` (pedido real, 2026-10-07): duplicatas de
 *  `lashdesigner`/`naildesigner` (mesmo plano Básico), só trocando a capa
 *  genérica pela nova capa "padronizada" do nicho — os originais continuam
 *  intocados, pra não perder os exemplos já em uso. */
const SHOWCASE_SLUGS: Record<string, { niche: NicheType; forceBasico: boolean; coverOverride?: string }> = {
  lash: { niche: 'lash', forceBasico: false },
  nail: { niche: 'nail', forceBasico: false },
  lashdesigner: { niche: 'lash', forceBasico: true },
  naildesigner: { niche: 'nail', forceBasico: true },
  lashs: { niche: 'lash', forceBasico: true, coverOverride: '/capa_lash.png' },
  nails: { niche: 'nail', forceBasico: true, coverOverride: '/capa_nail.png' },
  estetica: { niche: 'estetica', forceBasico: false },
  studio: { niche: 'studio', forceBasico: false },
};

function resolveShowcaseSlug(slug: string): { niche: NicheType; forceBasico: boolean; coverOverride?: string } {
  return SHOWCASE_SLUGS[slug] || { niche: slug as NicheType, forceBasico: false };
}

// Nomes por nicho pro título do link (plural, "venda pro nicho" — não o
// singular usado em NICHE_OPTIONS, que é pra UI de seleção).
const NICHE_METADATA_LABEL: Record<NicheType, string> = {
  lash: 'Lash Designers',
  nail: 'Nail Designers',
  estetica: 'Clínicas de Estética',
  studio: 'Studios de Beleza',
};

/** Preview do link no WhatsApp pra esse showroom — pedido real, 2026-10-01:
 *  sem isso, herdava o título/descrição genérico de venda da home (feito
 *  pra visitante institucional, não pro primeiro contato de um lead de
 *  anúncio clicando num link "olha esse exemplo"). Sem "exemplo"/"demo" no
 *  título de propósito — a palavra já está na mensagem de texto que ela
 *  manda; o card do link não precisa repetir e soar menos como algo real. */
export async function generateMetadata({ params }: ShowcasePageProps): Promise<Metadata> {
  const { niche: nicheParam } = await params;
  const { niche } = resolveShowcaseSlug(nicheParam);
  const nicheLabel = NICHE_METADATA_LABEL[niche];

  const title = nicheLabel ? `Catálogo Digital para ${nicheLabel}` : 'Catálogo Digital — StudioMenu';
  const description = 'Veja como fica, ao vivo, no seu celular — em menos de 1 minuto você já visualiza tudo funcionando.';

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function ShowcasePage({ params }: ShowcasePageProps) {
  const { niche: nicheParam } = await params;
  const { niche, forceBasico, coverOverride } = resolveShowcaseSlug(nicheParam);
  return <ShowcaseClient niche={niche} forceBasico={forceBasico} coverOverride={coverOverride} />;
}
