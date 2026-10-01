import type { Metadata } from 'next';
import { NicheType } from '@/types/catalog';
import { ShowcaseClient } from './ShowcaseClient';

interface ShowcasePageProps {
  params: Promise<{ niche: string }>;
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
  const niche = nicheParam as NicheType;
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
  return <ShowcaseClient niche={nicheParam as NicheType} />;
}
