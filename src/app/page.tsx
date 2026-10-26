import { SalesLandingPage } from '@/components/sales/SalesLandingPage';
import { FbclidTracker } from '@/components/sales/FbclidTracker';
import { PostHogTracker } from '@/components/sales/PostHogTracker';
import { MetaPixelTracker } from '@/components/sales/MetaPixelTracker';
import { LANDING_NICHE_CONTENT, type LandingNiche } from '@/data/landing-niche-content';
import { cookies } from 'next/headers';

interface StudioMenuLandingPageProps {
  searchParams: Promise<{ nicho?: string; v?: string }>;
}

/** `?nicho=` troca a Hero pra falar a língua de quem clicou num anúncio
 *  nichado (ex: "Ei, Lash Designer") — ver `src/data/landing-niche-content.tsx`
 *  pro porquê. Lido aqui (Server Component), não no client, pra nunca piscar
 *  o conteúdo genérico antes de trocar pelo certo. Qualquer valor que não
 *  seja um nicho implementado cai em `geral` (a landing de sempre).
 *
 *  `?v=curta` ou `?v=longa` permite forçar uma variante para testes.
 *  Se não vier na URL, confere o cookie `sm_lp_variant` para manter o visitante
 *  na mesma versão (split test 50/50 determinístico via código). */
export default async function StudioMenuLandingPage({ searchParams }: StudioMenuLandingPageProps) {
  const { nicho, v } = await searchParams;
  const resolvedNiche: LandingNiche = nicho && nicho in LANDING_NICHE_CONTENT ? (nicho as LandingNiche) : 'geral';
  const content = LANDING_NICHE_CONTENT[resolvedNiche];

  const cookieStore = await cookies();
  const savedVariant = cookieStore.get('sm_lp_variant')?.value;

  let variant: 'longa' | 'curta';
  if (v === 'curta' || v === 'longa') {
    variant = v;
  } else if (savedVariant === 'curta' || savedVariant === 'longa') {
    variant = savedVariant;
  } else {
    // Sorteio 50/50 limpo e distribuído para novos visitantes
    variant = Math.random() < 0.5 ? 'curta' : 'longa';
  }

  return (
    <>
      <MetaPixelTracker />
      <FbclidTracker />
      <PostHogTracker variant={variant} />
      <SalesLandingPage content={content} variant={variant} />
    </>
  );
}
