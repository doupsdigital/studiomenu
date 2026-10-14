import { SalesLandingPageClassica } from '@/components/sales-classica/SalesLandingPageClassica';
import { FbclidTracker } from '@/components/sales/FbclidTracker';
import { PostHogTracker } from '@/components/sales/PostHogTracker';

/** Cópia de segurança da landing page original (`src/app/page.tsx`), feita
 *  em 2026-10-14 — ver o comentário no topo de `SalesLandingPageClassica.tsx`
 *  pro porquê. Rota não linkada em lugar nenhum do site, só pra poder voltar
 *  rápido se as mudanças feitas na rota principal não derem certo. */
export default function StudioMenuLandingPageClassica() {
  return (
    <>
      <FbclidTracker />
      <PostHogTracker />
      <SalesLandingPageClassica />
    </>
  );
}
