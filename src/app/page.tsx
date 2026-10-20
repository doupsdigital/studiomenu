import { SalesLandingPage } from '@/components/sales/SalesLandingPage';
import { FbclidTracker } from '@/components/sales/FbclidTracker';
import { PostHogTracker } from '@/components/sales/PostHogTracker';
import { MetaPixelTracker } from '@/components/sales/MetaPixelTracker';
import { LANDING_NICHE_CONTENT, type LandingNiche } from '@/data/landing-niche-content';

interface StudioMenuLandingPageProps {
  searchParams: Promise<{ nicho?: string }>;
}

/** `?nicho=` troca a Hero pra falar a língua de quem clicou num anúncio
 *  nichado (ex: "Ei, Lash Designer") — ver `src/data/landing-niche-content.tsx`
 *  pro porquê. Lido aqui (Server Component), não no client, pra nunca piscar
 *  o conteúdo genérico antes de trocar pelo certo. Qualquer valor que não
 *  seja um nicho implementado cai em `geral` (a landing de sempre). */
export default async function StudioMenuLandingPage({ searchParams }: StudioMenuLandingPageProps) {
  const { nicho } = await searchParams;
  const resolvedNiche: LandingNiche = nicho && nicho in LANDING_NICHE_CONTENT ? (nicho as LandingNiche) : 'geral';
  const content = LANDING_NICHE_CONTENT[resolvedNiche];

  return (
    <>
      <MetaPixelTracker />
      <FbclidTracker />
      <PostHogTracker />
      <SalesLandingPage content={content} />
    </>
  );
}
