'use client';

import React, { useEffect, useState } from 'react';
import { Clock, CalendarX, CreditCard, UserCircle, Bell } from 'lucide-react';
import type { Step } from 'react-joyride';
import { SectionCard } from '@/components/app-shell/SectionCard';
import { ProductTour } from '@/components/tour/ProductTour';
import { BusinessHoursEditor } from './BusinessHoursEditor';
import { ScheduleBlocksManager } from './ScheduleBlocksManager';
import { SubscriptionSection } from './SubscriptionSection';
import { AccountSection } from './AccountSection';
import { NotificationsSection } from './NotificationsSection';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import type { BusinessHoursConfigRow, ScheduleBlockConfigRow } from '@/lib/scheduling/config-service';

interface ConfigAccordionProps {
  slug: string;
  businessHours: BusinessHoursConfigRow[];
  scheduleBlocks: ScheduleBlockConfigRow[];
  planTier: 'catalog' | 'basico' | 'plus';
  subscriptionStatus: 'none' | 'ativo' | 'suspenso' | 'cancelado';
  billingEmail?: string;
  billingCpfCnpj?: string;
  /** Agendamento automático de fato ligado (Plus ativo ou toggle manual do
   *  admin) — sem isso, Horários e Bloqueios não têm nenhum efeito prático
   *  (a Agenda nem chega a mostrar conteúdo real), então ficam travados. */
  bookingEnabled: boolean;
  /** Conta do Supabase Auth já vinculada pro login real (Fase 17) — null
   *  enquanto a profissional só entra pelo link mágico. */
  authUserId: string | null;
}

type SectionKey = 'horarios' | 'bloqueios' | 'assinatura' | 'conta' | 'notificacoes';

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
  authUserId,
}) => {
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    horarios: false,
    bloqueios: true,
    assinatura: false,
    conta: false,
    notificacoes: false,
  });

  // O card de "Notificações" some da lista quando esse dispositivo já tem
  // notificação ativada (ou quando o navegador não suporta) — nesses casos
  // não sobra nenhuma ação útil pra oferecer aqui; o sino no cabeçalho
  // continua disponível pra reativar/testar de novo quando precisar.
  const { permission: pushPermission, ready: pushReady } = usePushNotifications(slug);
  const showNotifications = pushReady && pushPermission !== 'granted' && pushPermission !== 'unsupported';

  const [tourStartHash, setTourStartHash] = useState<SectionKey | undefined>(undefined);

  // Auto-abre a seção referenciada pelo hash do link — usado pelo upsell do
  // Plus (`#assinatura`, já existia) e agora também pelos cards de
  // onboarding pós-pagamento (`#conta`, `#horarios`, Fase 19). Também guarda
  // o hash pro tour começar por ali (Fase 20) — sem isso, o tour sempre
  // começava do primeiro card e "puxava" a tela de volta, brigando com o
  // scroll que o link já tinha feito (achado testando o card "Criar acesso").
  useEffect(() => {
    const hash = window.location.hash.slice(1) as SectionKey | '';
    if (hash === 'assinatura' || hash === 'conta' || hash === 'horarios' || hash === 'bloqueios' || hash === 'notificacoes') {
      setOpen((prev) => ({ ...prev, [hash]: true }));
      document.getElementById(hash)?.scrollIntoView({ block: 'start' });
      setTourStartHash(hash);
    }
  }, []);

  const toggle = (key: SectionKey) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  // Tour guiado da Config (Fase 20) — um balão por seção. Horários/Bloqueios/
  // Notificações ficam de fora enquanto `!bookingEnabled` (Básico sem Plus):
  // são cards travados, mostrar um balão explicando algo que ela ainda não
  // pode usar só confunde (achado testando: ela via "Horários de
  // atendimento" antes mesmo de assinar o Plus).
  const tourSteps: Step[] = [
    ...(bookingEnabled
      ? [
          { id: 'horarios', target: '#horarios', title: 'Horários de atendimento', content: 'Defina os dias e horários em que você atende.' },
          { id: 'bloqueios', target: '#bloqueios', title: 'Bloqueios e folgas', content: 'Bloqueie datas específicas (férias, feriado, etc) sem mexer no seu expediente fixo.' },
          ...(showNotifications
            ? [{ id: 'notificacoes', target: '#notificacoes', title: 'Notificações', content: 'Ative avisos no seu celular pra novos agendamentos.' }]
            : []),
        ]
      : []),
    { id: 'assinatura', target: '#assinatura', title: 'Minha assinatura', content: 'Gerencie seu plano por aqui — assinar, trocar ou cancelar.' },
    { id: 'conta', target: '#conta', title: 'Minha conta', content: 'Crie um acesso com senha pra não depender só do link mágico.' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ProductTour tourId="config" slug={slug} steps={tourSteps} enabled initialStepId={tourStartHash} />
      <div id="horarios">
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
      </div>

      <div id="bloqueios">
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
      </div>

      {showNotifications && (
        <div id="notificacoes">
          <SectionCard
            icon={Bell}
            title="Notificações"
            isOpen={open.notificacoes}
            onToggle={() => toggle('notificacoes')}
            locked={!bookingEnabled}
            lockedHint="Disponível quando o agendamento automático (StudioMenu+) estiver ativo."
          >
            <NotificationsSection slug={slug} />
          </SectionCard>
        </div>
      )}

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

      <div id="conta">
        <SectionCard icon={UserCircle} title="Minha conta" isOpen={open.conta} onToggle={() => toggle('conta')}>
          <AccountSection slug={slug} hasAccount={Boolean(authUserId)} />
        </SectionCard>
      </div>
    </div>
  );
};
