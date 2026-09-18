import type { LucideIcon } from 'lucide-react';
import { KeyRound, Clock, CalendarDays } from 'lucide-react';

export interface OnboardingCardDef {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}

interface OnboardingCardDefsInput {
  slug: string;
  planTier: 'catalog' | 'basico' | 'plus';
  subscriptionStatus: 'none' | 'ativo' | 'suspenso' | 'cancelado';
  hasAccount: boolean;
}

/** Quais cards de "próximo passo" existem pra essa profissional agora — fonte
 *  única de verdade, usada tanto por `OnboardingCardStack` (renderiza os
 *  cards) quanto pelo tour guiado do Início (`InicioTour`, Fase 20), que
 *  precisa saber exatamente os mesmos passos pra apontar um balão em cada
 *  um. Duplicar essa condição nos dois lugares seria garantia de dessincronia
 *  assim que um dos dois mudasse sem o outro acompanhar. */
export function getOnboardingCardDefs({ slug, planTier, subscriptionStatus, hasAccount }: OnboardingCardDefsInput): OnboardingCardDef[] {
  const cards: OnboardingCardDef[] = [];

  // Já pagou algo (Básico ou Plus), ainda não criou login real.
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

  // Plus ativo — próximos passos pra agendamento funcionar de verdade.
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

  return cards;
}
