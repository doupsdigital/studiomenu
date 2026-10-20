'use client';

import { useEffect } from 'react';
import { initPostHog, identify, reset, getDistinctId } from '@/lib/analytics';

interface AppPostHogTrackerProps {
  slug: string;
  planTier: string;
  subscriptionStatus: string;
  clientName: string;
  studioName?: string;
}

/** Analytics do app da profissional (`/app/[slug]/*`) — pedido real,
 *  2026-10-13: ela quer acompanhar a experiência de uma cliente específica
 *  desde a prévia antes de pagar (`FirstContactScreen`, dentro de `inicio`
 *  quando `plan_tier === 'catalog'`) até o app de verdade depois de pagar
 *  (início, editor, agenda, config) — tudo isso já vive dentro do mesmo
 *  `layout.tsx`, então montar aqui cobre as duas telas de uma vez, sem
 *  precisar instrumentar cada rota separadamente.
 *
 *  Diferença-chave pra landing page (`PostHogTracker.tsx`): aqui usamos
 *  `posthog.identify(slug, ...)` — amarra cada sessão/gravação a UMA
 *  cliente específica, pra dar pra filtrar "me mostra as gravações da
 *  Fulana" no PostHog, em vez de sessões anônimas soltas.
 *
 *  Máscara de e-mail/senha ligada por tipo de input (`maskInputOptions`);
 *  o campo de CPF/CNPJ (tipo "text", não cai nessas categorias) é mascarado
 *  à parte via classe `ph-mask` direto no input (`PlanSubscribeCard.tsx`) —
 *  dado sensível de uma cliente pagante não devia aparecer gravado em
 *  vídeo, mesmo só a própria dona do negócio assistindo depois. */
export function AppPostHogTracker({ slug, planTier, subscriptionStatus, clientName, studioName }: AppPostHogTrackerProps) {
  useEffect(() => {
    initPostHog({
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'always',
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: { password: true, email: true },
      },
    });

    // Bug real, 2026-10-20: testar o link de VÁRIAS clientes diferentes no
    // mesmo navegador (QA logo após criar cada catálogo) fazia a 2ª
    // cliente herdar o `distinct_id` (e as gravações) da 1ª, porque o
    // `identify` anterior nunca era limpo. Só reseta quando o slug
    // realmente muda — não a cada remount da mesma cliente.
    const currentDistinctId = getDistinctId();
    if (currentDistinctId && currentDistinctId !== slug) {
      reset();
    }

    identify(slug, {
      plan_tier: planTier,
      subscription_status: subscriptionStatus,
      client_name: clientName,
      studio_name: studioName,
    });
  }, [slug, planTier, subscriptionStatus, clientName, studioName]);

  return null;
}
