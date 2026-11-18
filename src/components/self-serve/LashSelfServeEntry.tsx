import { SelfServeLandingPage } from '@/components/self-serve/SelfServeLandingPage';
import { FbclidTracker } from '@/components/sales/FbclidTracker';
import { PostHogTracker } from '@/components/sales/PostHogTracker';
import { MetaPixelTracker } from '@/components/sales/MetaPixelTracker';
import { LANDING_NICHE_CONTENT } from '@/data/landing-niche-content';
import { LASH_FUNNEL_PIXEL_ID } from '@/lib/cakto-checkout';

/** Página de autosserviço Lash completa (trackers + landing). Servida em
 *  `/lash` e também em `/?nicho=lash` (2026-11-18), que é o link do anúncio
 *  que já está rodando — assim não precisa mexer no Gerenciador. */
export function LashSelfServeEntry() {
  return (
    <>
      <MetaPixelTracker pixelId={LASH_FUNNEL_PIXEL_ID} />
      <FbclidTracker />
      <PostHogTracker />
      <SelfServeLandingPage content={LANDING_NICHE_CONTENT.lash} />
    </>
  );
}
