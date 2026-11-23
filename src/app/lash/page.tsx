import type { Metadata } from 'next';
import { LashSelfServeEntry } from '@/components/self-serve/LashSelfServeEntry';
import { parseOfferMode } from '@/lib/cakto-checkout';

export const metadata: Metadata = {
  title: 'StudioMenu — Menu Digital para Lash Designer',
  description: 'Digite seu nome e veja seu Menu Digital de Lash Designer pronto em segundos. Grátis, sem cadastro.',
  openGraph: {
    title: 'Veja o seu Menu Digital de Lash Designer pronto em segundos',
    description: 'Digite seu nome e veja como fica. Grátis, sem cadastro.',
    type: 'website',
  },
};

interface LashSelfServePageProps {
  searchParams: Promise<{ plano?: string }>;
}

/** Página de vendas de autosserviço do nicho Lash (2026-11-17). O mesmo
 *  conteúdo também é servido em `/?nicho=lash` (link do anúncio atual).
 *  `?plano=mensal|anual` mostra uma oferta só (2026-11-23). */
export default async function LashSelfServePage({ searchParams }: LashSelfServePageProps) {
  const { plano } = await searchParams;
  return <LashSelfServeEntry offer={parseOfferMode(plano)} />;
}
