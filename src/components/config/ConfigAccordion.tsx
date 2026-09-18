'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  //
  // `upgrade-plus` é um hash "extra", à parte das 5 seções: fica DENTRO da
  // seção "assinatura" (só existe no DOM pra quem já é Básico ativo — ver
  // `SubscriptionSection`) e rola direto pro formulário de assinar o Plus
  // (e-mail/CPF já preenchidos, botão "Assinar por R$69,90"), em vez de
  // parar no topo do card "Básico ativo" que fica acima dele — pedido
  // explícito do usuário, o CTA de upgrade deve levar direto pra ação, não
  // só pra seção genérica.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const sectionForHash: Partial<Record<string, SectionKey>> = {
      assinatura: 'assinatura',
      'upgrade-plus': 'assinatura',
      conta: 'conta',
      horarios: 'horarios',
      bloqueios: 'bloqueios',
      notificacoes: 'notificacoes',
    };
    const key = sectionForHash[hash];
    if (key) {
      setOpen((prev) => ({ ...prev, [key]: true }));
      setTourStartHash(key);
      // Espera um tick antes de rolar — o alvo específico (`#upgrade-plus`)
      // só existe no DOM depois que a seção abre (conteúdo condicional,
      // `isOpen` acabou de virar `true` acima); sem esperar, o elemento
      // ainda não tinha sido renderizado. Cai pro id da seção como reserva
      // se o alvo específico não existir (ex: ela não é Básico ativo).
      setTimeout(() => {
        const specific = document.getElementById(hash);
        const fallback = document.getElementById(key);
        (specific || fallback)?.scrollIntoView({ block: 'start' });
      }, 50);
    }
  }, []);

  const toggle = (key: SectionKey) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  // Enquanto o tour passa por uma seção fechada, abre ela — senão o balão
  // aponta pra um cabeçalho vazio, sem o conteúdo que ele está explicando.
  // Fecha de novo ao sair (menos "Bloqueios", que já é aberta por padrão e
  // continua assim) — pedido explícito do usuário, mesmo comportamento de
  // "abre enquanto explica, fecha ao passar pra próxima" (Fase 20).
  // `useCallback` (referência estável) de propósito: essas funções entram
  // como parte dos steps do tour (ver `tourSteps` abaixo) — sem estabilidade
  // de referência, abrir uma seção mudaria `open`, o que recriaria
  // `tourSteps` inteiro com objetos novos, e o Joyride recebendo um array de
  // steps "diferente" no meio de uma transição mostrava o balão duplicado
  // (achado testando de verdade: um em cima, um repetido embaixo).
  const openSection = useCallback((key: SectionKey) => setOpen((prev) => (prev[key] ? prev : { ...prev, [key]: true })), []);
  const closeSection = useCallback((key: SectionKey) => {
    if (key === 'bloqueios') return;
    setOpen((prev) => (prev[key] ? { ...prev, [key]: false } : prev));
  }, []);

  // Vira dependência do useMemo abaixo em vez de `showNotifications` puro —
  // sem isso, `usePushNotifications` resolvendo a permissão (assíncrono,
  // acontece perto do mount, junto com o tour começando) recalculava
  // `tourSteps` inteiro (objetos novos) mesmo pra quem só tem Básico, onde
  // esse valor nem chega a entrar no resultado — mesma classe de bug do
  // comentário acima, só que disparada por outra coisa mudando (achado
  // testando: "Minha assinatura" duplicado mesmo sem mexer em nenhum
  // acordeão). Assim, fica travado em `false` sempre que `!bookingEnabled`,
  // nunca recalcula à toa.
  const includeNotifications = bookingEnabled && showNotifications;

  // Tour guiado da Config (Fase 20) — um balão por seção, de cima pra baixo.
  // Horários/Bloqueios/Notificações ficam de fora enquanto `!bookingEnabled`
  // (Básico sem Plus): são cards travados, mostrar um balão explicando algo
  // que ela ainda não pode usar só confunde (achado testando: ela via
  // "Horários de atendimento" antes mesmo de assinar o Plus). `useMemo` só
  // recalcula quando o CONJUNTO de seções disponíveis muda de verdade, não a
  // cada abrir/fechar de acordeão (ver comentário acima).
  const tourSteps = useMemo<Step[]>(() => {
    const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

    // `before`/`after` são hooks do próprio Joyride pra esperar conteúdo
    // assíncrono/dinâmico ficar pronto antes de medir a posição do balão —
    // uso certo aqui: abrir a seção MUDA a altura do card, e sem esperar um
    // instante a posição calculada fica baseada no card ainda fechado.
    const buildStep = (key: SectionKey, target: string, title: string, content: string): Step => ({
      id: key,
      target,
      title,
      content,
      before: async () => {
        openSection(key);
        await wait(220);
      },
      after: async () => {
        closeSection(key);
      },
    });

    return [
      ...(bookingEnabled
        ? [
            buildStep('horarios', '#horarios', 'Horários de atendimento', 'Defina os dias e horários em que você atende.'),
            buildStep('bloqueios', '#bloqueios', 'Bloqueios e folgas', 'Bloqueie datas específicas (férias, feriado, etc) sem mexer no seu expediente fixo.'),
            ...(includeNotifications
              ? [buildStep('notificacoes', '#notificacoes', 'Notificações', 'Ative avisos no seu celular pra novos agendamentos.')]
              : []),
          ]
        : []),
      buildStep('assinatura', '#assinatura', 'Minha assinatura', 'Gerencie seu plano por aqui — assinar, trocar ou cancelar.'),
      buildStep('conta', '#conta', 'Minha conta', 'Crie um acesso com senha pra não depender só do link mágico.'),
    ];
  }, [bookingEnabled, includeNotifications, openSection, closeSection]);

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
