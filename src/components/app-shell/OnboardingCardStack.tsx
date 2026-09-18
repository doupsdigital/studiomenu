'use client';

import React, { useEffect, useState } from 'react';
import { OnboardingCard } from './OnboardingCard';
import { getOnboardingCardDefs } from '@/lib/onboarding-cards';

interface OnboardingCardStackProps {
  slug: string;
  planTier: 'catalog' | 'basico' | 'plus';
  subscriptionStatus: 'none' | 'ativo' | 'suspenso' | 'cancelado';
  hasAccount: boolean;
}

const storageKey = (slug: string) => `sm_onboarding_dismissed_${slug}`;

/** Cards de instrução dispensáveis, estilo "próximo passo" — aparecem só
 *  depois que a profissional já assinou algo (está "aquecida"), dois
 *  conjuntos disparados por estado do plano (Fase 19). Dismissal fica em
 *  `localStorage` (nudge de single-device, não precisa sincronizar nem o
 *  admin acompanhar quem já viu). A lista de cards vem de
 *  `getOnboardingCardDefs` (Fase 20) — mesma fonte usada pelo tour guiado do
 *  Início, pra nunca dessincronizar. */
export const OnboardingCardStack: React.FC<OnboardingCardStackProps> = ({ slug, planTier, subscriptionStatus, hasAccount }) => {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(slug));
      setDismissed(raw ? JSON.parse(raw) : []);
    } catch {
      setDismissed([]);
    }
    setHydrated(true);
  }, [slug]);

  const cards = getOnboardingCardDefs({ slug, planTier, subscriptionStatus, hasAccount });
  const visible = cards.filter((c) => !dismissed.includes(c.id));
  if (!hydrated || visible.length === 0) return null;

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    try {
      window.localStorage.setItem(storageKey(slug), JSON.stringify(next));
    } catch {
      // localStorage indisponível (modo privado, etc.) — só não persiste entre sessões.
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {visible.map((card) => (
        <OnboardingCard
          key={card.id}
          icon={card.icon}
          title={card.title}
          description={card.description}
          ctaHref={card.ctaHref}
          ctaLabel={card.ctaLabel}
          dataTour={`onboarding-${card.id}`}
          onDismiss={() => dismiss(card.id)}
        />
      ))}
    </div>
  );
};
