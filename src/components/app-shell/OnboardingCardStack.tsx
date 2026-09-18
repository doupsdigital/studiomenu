'use client';

import React, { useEffect, useState } from 'react';
import { KeyRound, Clock, CalendarDays, type LucideIcon } from 'lucide-react';
import { OnboardingCard } from './OnboardingCard';

interface OnboardingCardStackProps {
  slug: string;
  planTier: 'catalog' | 'basico' | 'plus';
  subscriptionStatus: 'none' | 'ativo' | 'suspenso' | 'cancelado';
  hasAccount: boolean;
}

interface CardDef {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}

const storageKey = (slug: string) => `sm_onboarding_dismissed_${slug}`;

/** Cards de instrução dispensáveis, estilo "próximo passo" — aparecem só
 *  depois que a profissional já assinou algo (está "aquecida"), dois
 *  conjuntos disparados por estado do plano (Fase 19). Dismissal fica em
 *  `localStorage` (nudge de single-device, não precisa sincronizar nem o
 *  admin acompanhar quem já viu). */
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

  const cards: CardDef[] = [];

  // Conjunto 1: já pagou algo (Básico ou Plus), ainda não criou login real.
  if (planTier !== 'catalog' && !hasAccount) {
    cards.push({
      id: 'criar-conta',
      icon: KeyRound,
      title: 'Crie um acesso com senha',
      description: 'Assim você não depende só do link mágico pra entrar no seu app.',
      ctaHref: `/app/${slug}/config#conta`,
      ctaLabel: 'Criar acesso',
    });
  }

  // Conjunto 2: Plus ativo — próximos passos pra agendamento funcionar de verdade.
  if (planTier === 'plus' && subscriptionStatus === 'ativo') {
    cards.push({
      id: 'horarios',
      icon: Clock,
      title: 'Defina seus horários de atendimento',
      description: 'Sem isso, suas clientes ainda não conseguem agendar sozinhas.',
      ctaHref: `/app/${slug}/config#horarios`,
      ctaLabel: 'Configurar horários',
    });
    cards.push({
      id: 'ver-agenda',
      icon: CalendarDays,
      title: 'Conheça sua agenda',
      description: 'Veja como ficam os agendamentos confirmados e pendentes.',
      ctaHref: `/app/${slug}/agenda`,
      ctaLabel: 'Ver agenda',
    });
  }

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
          onDismiss={() => dismiss(card.id)}
        />
      ))}
    </div>
  );
};
