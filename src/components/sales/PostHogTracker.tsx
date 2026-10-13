'use client';

import { useEffect } from 'react';
import { initPostHog } from '@/lib/analytics';

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
export function PostHogTracker() {
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
  }, []);

  return null;
}
