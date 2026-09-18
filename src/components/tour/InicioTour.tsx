'use client';

import { useMemo } from 'react';
import type { Step } from 'react-joyride';
import { ProductTour } from './ProductTour';
import { getOnboardingCardDefs } from '@/lib/onboarding-cards';

interface InicioTourProps {
  slug: string;
  planTier: 'catalog' | 'basico' | 'plus';
  subscriptionStatus: 'none' | 'ativo' | 'suspenso' | 'cancelado';
  hasAccount: boolean;
  schedulingLive: boolean;
}

/** Tour guiado da tela Início (Fase 20) — primeiro os 2 cards de estatística
 *  (se o agendamento estiver de fato ligado), depois um balão por card de
 *  "próximo passo" no fim da tela. Pula de propósito os 3 cards de link
 *  (ver catálogo/editar/compartilhar) — ela já usou esses links pra assinar,
 *  não precisam de explicação (pedido explícito do usuário).
 *
 *  `useMemo` por precaução, mesmo padrão do tour da Config — sem estabilidade
 *  de referência no array de steps, qualquer re-render no meio do tour (por
 *  qualquer motivo, aqui ou numa mudança futura) recria os objetos e o
 *  Joyride mostra o balão duplicado (achado de verdade na Config, corrigido
 *  lá — aplicado aqui também de forma preventiva). */
export const InicioTour: React.FC<InicioTourProps> = ({ slug, planTier, subscriptionStatus, hasAccount, schedulingLive }) => {
  const steps = useMemo<Step[]>(() => {
    const list: Step[] = [];

    if (schedulingLive) {
      list.push({
        target: '[data-tour="stat-today"]',
        title: 'Agendamentos de hoje',
        content: 'Aqui você vê quantos agendamentos tem hoje.',
      });
      list.push({
        target: '[data-tour="stat-pending"]',
        title: 'Aguardando confirmação',
        content: 'E aqui os que ainda esperam sua aprovação.',
      });
    }

    for (const card of getOnboardingCardDefs({ slug, planTier, subscriptionStatus, hasAccount })) {
      list.push({
        target: `[data-tour="onboarding-${card.id}"]`,
        title: card.title,
        content: card.description,
      });
    }

    return list;
  }, [slug, planTier, subscriptionStatus, hasAccount, schedulingLive]);

  return <ProductTour tourId="inicio" slug={slug} steps={steps} enabled={planTier !== 'catalog'} />;
};
