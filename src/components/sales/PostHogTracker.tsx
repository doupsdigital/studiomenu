'use client';

import { useEffect } from 'react';
import { initPostHog, reset, capture } from '@/lib/analytics';

interface PostHogTrackerProps {
  variant?: 'longa' | 'curta';
}

/** Analytics da landing page de vendas (`studiomenu.art`) — pedido real,
 *  2026-10-13: reaproveita o mesmo projeto PostHog que já existia (antigo
 *  "LashAgenda", renomeado pra "StudioMenu" na conta dela), agora integrado
 *  de verdade no app Next.js (o app nunca teve PostHog — só existia um
 *  helper completo no site estático legado, `legacy/vendas/js/posthog-init.js`,
 *  que não roda mais).
 *
 *  De propósito só montado aqui (`src/app/page.tsx`), não no layout raiz —
 *  escopo inicial é só a landing page pública. Autocapture já cobre cliques
 *  em qualquer botão/link sem precisar instrumentar um por um; session
 *  recording cobre "como a pessoa navegou / onde ela travou". */
export function PostHogTracker({ variant }: PostHogTrackerProps) {
  useEffect(() => {
    initPostHog({
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'always',
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: { password: true },
      },
    });

    // Bug real, 2026-10-20: sem isso, visita à landing page no mesmo
    // navegador onde já rolou um `identify(slug)` do app (ex: teste de
    // QA logo após criar um catálogo) herdava o distinct_id da cliente —
    // a landing é sempre pública/anônima, nunca deve carregar identidade.
    reset();

    // Mantém a variante persistida no navegador por 30 dias para coerência no A/B test
    if (variant && typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)sm_lp_variant=([^;]+)/);
      if (!match || match[1] !== variant) {
        document.cookie = `sm_lp_variant=${variant}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      }
      capture('landing_variant_view', { variant });
    }
  }, [variant]);

  return null;
}
