import type { Metadata } from 'next';
import { SelfServeLandingPage } from '@/components/self-serve/SelfServeLandingPage';
import { FbclidTracker } from '@/components/sales/FbclidTracker';
import { PostHogTracker } from '@/components/sales/PostHogTracker';
import { MetaPixelTracker } from '@/components/sales/MetaPixelTracker';
import { LANDING_NICHE_CONTENT } from '@/data/landing-niche-content';
import { LASH_FUNNEL_PIXEL_ID } from '@/lib/cakto-checkout';

export const metadata: Metadata = {
  title: 'StudioMenu — Menu Digital para Lash Designer',
  description: 'Digite seu nome e veja seu Menu Digital de Lash Designer pronto em segundos. Grátis, sem cadastro.',
  openGraph: {
    title: 'Veja o seu Menu Digital de Lash Designer pronto em segundos',
    description: 'Digite seu nome e veja como fica. Grátis, sem cadastro.',
    type: 'website',
  },
};

/** Página de vendas de autosserviço do nicho Lash (2026-11-17) — ver
 *  `SelfServeLandingPage.tsx`. Separada da `/` de propósito: a `/` continua
 *  no ar com a campanha atual até a dona trocar o link do anúncio pra cá. */
export default function LashSelfServePage() {
  return (
    <>
      <MetaPixelTracker pixelId={LASH_FUNNEL_PIXEL_ID} />
      <FbclidTracker />
      <PostHogTracker />
      <SelfServeLandingPage content={LANDING_NICHE_CONTENT.lash} />
    </>
  );
}
