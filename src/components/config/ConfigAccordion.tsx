'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clock, CalendarX, PauseCircle, CreditCard, UserCircle, Bell } from 'lucide-react';
import type { Step } from 'react-joyride';
import { SectionCard } from '@/components/app-shell/SectionCard';
import { ProductTour } from '@/components/tour/ProductTour';
import { BusinessHoursEditor } from './BusinessHoursEditor';
import { ScheduleBlocksManager } from './ScheduleBlocksManager';
import { AgendaPauseSection } from './AgendaPauseSection';
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
  paymentMethod: 'pix' | 'card' | null;
  /** Agendamento automático de fato ligado (Plus ativo ou toggle manual do
   *  admin) — sem isso, Horários e Bloqueios não têm nenhum efeito prático
   *  (a Agenda nem chega a mostrar conteúdo real), então ficam travados. */
  bookingEnabled: boolean;
  /** Ela mesma pausou o agendamento automático temporariamente (Fase 23). */
  agendaPaused: boolean;
  /** Conta do Supabase Auth já vinculada pro login real (Fase 17) — null
   *  enquanto a profissional só entra pelo link mágico. */
  authUserId: string | null;
}

type SectionKey = 'horarios' | 'bloqueios' | 'pausar' | 'assinatura' | 'conta' | 'notificacoes';

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
  paymentMethod,
  bookingEnabled,
  agendaPaused,
  authUserId,
}) => {
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    horarios: false,
    bloqueios: true,
    pausar: false,
    assinatura: false,
    conta: false,
    notificacoes: false,
  });

  // O card de "Notificações" fica sempre na lista (mostra "Notificações
  // ativas!" quando já está ligado, com link pra testar de novo) — só some
  // quando o navegador não suporta push. Antes sumia também quando já
  // ativado; mudou depois que a confirmação "ativas" ficou clara.
  const { permission: pushPermission, ready: pushReady } = usePushNotifications(slug);
  const showNotifications = pushReady && pushPermission !== 'unsupported';

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
      pausar: 'pausar',
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

  // Vira dependência do useMemo abaixo em vez de `showNotifications` puro —
  // sem isso, `usePushNotifications` resolvendo a permissão (assíncrono,
  // acontece perto do mount, junto com o tour começando) recalculava
  // `tourSteps` inteiro (objetos novos) mesmo pra quem só tem Básico, onde
  // esse valor nem chega a entrar no resultado. Assim, fica travado em
  // `false` sempre que `!bookingEnabled`, nunca recalcula à toa.
  const includeNotifications = bookingEnabled && showNotifications;
  const hasAccount = Boolean(authUserId);

  // Tour guiado da Config (Fase 20) — um balão por seção, de cima pra baixo,
  // sempre apontando pro CABEÇALHO de cada card (não pro card inteiro, nem
  // abrindo/fechando a seção durante o tour como numa versão anterior) — o
  // cabeçalho tem altura fixa, então a posição do balão nunca pula
  // dependendo do quanto de conteúdo está aberto (achado testando de
  // verdade: "Horários de atendimento" é um card grande, e ele fazia o
  // balão ficar impossível de ver quando abria durante o próprio tour).
  // Horários/Bloqueios/Notificações ficam de fora enquanto `!bookingEnabled`
  // (Básico sem Plus): são cards travados, mostrar um balão explicando algo
  // que ela ainda não pode usar só confunde. O texto de "Minha conta" muda
  // depois que o acesso já foi criado — apontar pra "crie um acesso" quando
  // ela já criou não faz sentido.
  const tourSteps = useMemo<Step[]>(() => {
    const buildStep = (key: SectionKey, title: string, content: string): Step => ({
      id: key,
      target: `[data-tour="${key}-header"]`,
      title,
      content,
    });

    return [
      ...(bookingEnabled
        ? [
            buildStep('horarios', 'Horários de atendimento', 'Defina os dias e horários em que você atende.'),
            buildStep('bloqueios', 'Bloqueios e folgas', 'Bloqueie datas específicas (férias, feriado, etc) sem mexer no seu expediente fixo.'),
            buildStep('pausar', 'Desligar Agenda', 'Pause o agendamento automático quando precisar — suas clientes voltam a combinar horário pelo WhatsApp.'),
            ...(includeNotifications
              ? [buildStep('notificacoes', 'Notificações', 'Ative avisos no seu celular pra novos agendamentos.')]
              : []),
          ]
        : []),
      buildStep('assinatura', 'Minha assinatura', 'Gerencie seu plano por aqui — assinar, trocar ou cancelar.'),
      buildStep(
        'conta',
        'Minha conta',
        hasAccount
          ? 'Aqui você pode sair desse dispositivo, se precisar.'
          : 'Crie um acesso com senha pra não depender só do link mágico.'
      ),
    ];
  }, [bookingEnabled, includeNotifications, hasAccount]);

  return (
    <div className="flex flex-col gap-4">
      {/* `enabled={pushReady}`: até o navegador responder sobre notificações, a lista
       *  de passos ainda não é a definitiva (o passo "Notificações" entra/sai
       *  depois) — começar antes disso usava uma chave de "já vi" diferente da
       *  que fica gravada no fim, e o tour reaparecia a cada visita (bug). */}
      <ProductTour tourId="config" slug={slug} steps={tourSteps} enabled={pushReady} initialStepId={tourStartHash} />
      <div id="horarios">
        <SectionCard
          icon={Clock}
          title="Horários de atendimento"
          isOpen={open.horarios}
          onToggle={() => toggle('horarios')}
          locked={!bookingEnabled}
          lockedHint="Disponível quando o agendamento automático (StudioMenu+) estiver ativo."
          dataTour="horarios-header"
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
          dataTour="bloqueios-header"
        >
          <ScheduleBlocksManager slug={slug} blocks={scheduleBlocks} />
        </SectionCard>
      </div>

      <div id="pausar">
        <SectionCard
          icon={PauseCircle}
          title="Desligar Agenda"
          isOpen={open.pausar}
          onToggle={() => toggle('pausar')}
          locked={!bookingEnabled}
          lockedHint="Disponível quando o agendamento automático (StudioMenu+) estiver ativo."
          dataTour="pausar-header"
        >
          <AgendaPauseSection slug={slug} initialPaused={agendaPaused} />
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
            dataTour="notificacoes-header"
          >
            <NotificationsSection slug={slug} />
          </SectionCard>
        </div>
      )}

      <div id="assinatura">
        <SectionCard
          icon={CreditCard}
          title="Minha assinatura"
          isOpen={open.assinatura}
          onToggle={() => toggle('assinatura')}
          dataTour="assinatura-header"
        >
          <SubscriptionSection
            slug={slug}
            planTier={planTier}
            subscriptionStatus={subscriptionStatus}
            billingEmail={billingEmail}
            billingCpfCnpj={billingCpfCnpj}
            paymentMethod={paymentMethod}
          />
        </SectionCard>
      </div>

      <div id="conta">
        <SectionCard
          icon={UserCircle}
          title="Minha conta"
          isOpen={open.conta}
          onToggle={() => toggle('conta')}
          dataTour="conta-header"
        >
          <AccountSection slug={slug} hasAccount={hasAccount} />
        </SectionCard>
      </div>
    </div>
  );
};
