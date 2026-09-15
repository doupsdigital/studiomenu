'use client';

import React, { useEffect, useState } from 'react';
import { Clock, CalendarX, CreditCard } from 'lucide-react';
import { SectionCard } from '@/components/app-shell/SectionCard';
import { BusinessHoursEditor } from './BusinessHoursEditor';
import { ScheduleBlocksManager } from './ScheduleBlocksManager';
import { SubscriptionSection } from './SubscriptionSection';
import type { BusinessHoursConfigRow, ScheduleBlockConfigRow } from '@/lib/scheduling/config-service';

interface ConfigAccordionProps {
  slug: string;
  businessHours: BusinessHoursConfigRow[];
  scheduleBlocks: ScheduleBlockConfigRow[];
  planTier: 'catalog' | 'plus';
  subscriptionStatus: 'none' | 'ativo' | 'suspenso' | 'cancelado';
  billingEmail?: string;
  billingCpfCnpj?: string;
  /** Agendamento automático de fato ligado (Plus ativo ou toggle manual do
   *  admin) — sem isso, Horários e Bloqueios não têm nenhum efeito prático
   *  (a Agenda nem chega a mostrar conteúdo real), então ficam travados. */
  bookingEnabled: boolean;
}

type SectionKey = 'horarios' | 'bloqueios' | 'assinatura';

/** Acordeão da aba Config — 3 seções que já existiam (`BusinessHoursEditor`,
 *  `ScheduleBlocksManager`, `SubscriptionSection`), agora dentro de
 *  `SectionCard`. Só controla abrir/fechar; nenhum dos formulários internos
 *  mudou de comportamento. Todas começam abertas (Fase 15 — antes só
 *  "Minha assinatura" abria sozinha via `#assinatura`, link do cartão de
 *  upsell do StudioMenu+; esse comportamento continua, só que agora não
 *  muda nada já que tudo já vem aberto). */
export const ConfigAccordion: React.FC<ConfigAccordionProps> = ({
  slug,
  businessHours,
  scheduleBlocks,
  planTier,
  subscriptionStatus,
  billingEmail,
  billingCpfCnpj,
  bookingEnabled,
}) => {
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    horarios: true,
    bloqueios: true,
    assinatura: true,
  });

  useEffect(() => {
    if (window.location.hash === '#assinatura') {
      document.getElementById('assinatura')?.scrollIntoView({ block: 'start' });
    }
  }, []);

  const toggle = (key: SectionKey) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        icon={Clock}
        title="Horários de atendimento"
        isOpen={open.horarios}
        onToggle={() => toggle('horarios')}
        locked={!bookingEnabled}
        lockedHint="Disponível quando o agendamento automático (StudioMenu+) estiver ativo."
      >
        <BusinessHoursEditor slug={slug} initialHours={businessHours} />
      </SectionCard>

      <SectionCard
        icon={CalendarX}
        title="Bloqueios e folgas"
        isOpen={open.bloqueios}
        onToggle={() => toggle('bloqueios')}
        locked={!bookingEnabled}
        lockedHint="Disponível quando o agendamento automático (StudioMenu+) estiver ativo."
      >
        <ScheduleBlocksManager slug={slug} blocks={scheduleBlocks} />
      </SectionCard>

      <div id="assinatura">
        <SectionCard icon={CreditCard} title="Minha assinatura" isOpen={open.assinatura} onToggle={() => toggle('assinatura')}>
          <SubscriptionSection
            slug={slug}
            planTier={planTier}
            subscriptionStatus={subscriptionStatus}
            billingEmail={billingEmail}
            billingCpfCnpj={billingCpfCnpj}
          />
        </SectionCard>
      </div>
    </div>
  );
};
