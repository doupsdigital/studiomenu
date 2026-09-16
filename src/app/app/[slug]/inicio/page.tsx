import React from 'react';
import { notFound } from 'next/navigation';
import { getOrderForProfessionalApp } from '@/lib/professional-app-service';
import { getAppointmentsForDay, getPendingAppointments } from '@/lib/scheduling/agenda-service';
import { GradientHeader } from '@/components/app-shell/GradientHeader';
import { StatCard } from '@/components/app-shell/StatCard';
import { ViewCatalogCard } from '@/components/app-shell/ViewCatalogCard';
import { EditCatalogCard } from '@/components/app-shell/EditCatalogCard';
import { PlusUpsellCard } from '@/components/app-shell/PlusUpsellCard';
import { ShareLinkButton } from '@/components/app-shell/ShareLinkButton';
import { PageTitleBar } from '@/components/app-shell/PageTitleBar';
import { CalendarDays, Clock, Share2, Crown, Home } from 'lucide-react';

interface InicioPageProps {
  params: Promise<{ slug: string }>;
}

const WEEK_DAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MONTHS_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

/** Saudação + data de hoje, sempre no fuso America/Sao_Paulo (mesmo padrão
 *  do resto do agendamento) — não o fuso do servidor. */
function getGreetingAndDate(): { greeting: string; dateLabel: string } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    hour: 'numeric',
    hour12: false,
    day: 'numeric',
    month: 'numeric',
  }).formatToParts(now);

  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 12);
  const day = Number(parts.find((p) => p.type === 'day')?.value ?? 1);
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? 1);
  const weekdayIdx = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })).getDay();

  const greeting = hour >= 5 && hour < 12 ? 'Bom dia' : hour >= 12 && hour < 18 ? 'Boa tarde' : 'Boa noite';
  const rawDate = `${WEEK_DAYS[weekdayIdx]}, ${day} de ${MONTHS_PT[month - 1]}`;
  const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  return { greeting, dateLabel };
}

function todayInSaoPaulo(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

export default async function InicioPage({ params }: InicioPageProps) {
  const { slug } = await params;
  const order = await getOrderForProfessionalApp(slug);

  if (!order) notFound();

  const isPlusAtivo = order.plan_tier === 'plus' && order.subscription_status === 'ativo';
  // Mesmo gate da Agenda: `booking_enabled` decide se o agendamento está de
  // fato funcionando pro cliente final, não o plano diretamente (pode estar
  // ligado via toggle manual do admin sem ela ser Plus — Fase 6).
  const schedulingLive = order.booking_enabled;

  const [todayAppointmentsRaw, pendingAppointments] = await Promise.all([
    getAppointmentsForDay(order.id, todayInSaoPaulo()),
    getPendingAppointments(order.id),
  ]);
  // `getAppointmentsForDay` agora inclui cancelados/recusados (pra Agenda
  // mostrar o rastro histórico do dia) — a contagem do card não deve contar
  // esses, só o que ainda está ativo (Fase 9).
  const todayAppointments = todayAppointmentsRaw.filter((a) => a.status !== 'cancelled');

  const { greeting, dateLabel } = getGreetingAndDate();
  const firstName = order.client_name.split(' ')[0];

  return (
    <>
      <PageTitleBar title="Início" icon={<Home className="w-5 h-5 text-ink-soft" />} slug={slug} />
      <main className="max-w-md mx-auto px-5 pt-6 pb-6 flex flex-col gap-4">
      <GradientHeader>
        <h1 className="font-serif-pro font-bold text-3xl">
          {greeting}, {firstName}!
        </h1>
        <p className="text-sm text-white/70 mt-1.5">{dateLabel}</p>
        {isPlusAtivo && (
          <div className="flex justify-end">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-3 rounded-full bg-white/15 backdrop-blur-sm text-xs font-bold tracking-wide">
              <Crown className="w-3.5 h-3.5" />
              PLUS
            </span>
          </div>
        )}
      </GradientHeader>

      {/* Só fazem sentido com o agendamento de fato funcionando — senão
       *  ficam sempre zerados, sem nenhuma ação possível por trás. */}
      {schedulingLive && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={CalendarDays} label="Agendamentos hoje" value={todayAppointments.length} href={`/app/${slug}/agenda`} />
          <StatCard
            icon={Clock}
            label="Aguardando confirmação"
            value={pendingAppointments.length}
            tone="amber"
            href={`/app/${slug}/agenda#pendentes`}
          />
        </div>
      )}

      <ViewCatalogCard slug={order.slug} />

      <EditCatalogCard slug={order.slug} />

      <div className="rounded-2xl p-6 bg-gradient-to-br from-rose-200 to-rose-100 border border-rose-200/60 relative overflow-hidden text-center">
        <Share2 className="absolute -top-3 -right-3 w-24 h-24 text-rose-300/50 rotate-12 pointer-events-none select-none" strokeWidth={1.25} />
        <div className="relative z-10">
          <h2 className="font-serif-pro font-bold text-xl text-rose-800 mb-1.5">Compartilhe seu Catálogo</h2>
          <p className="text-sm text-rose-800/70 mb-4 max-w-xs mx-auto">
            Envie esse link pra suas clientes verem seus serviços e preços, e agendarem sozinhas se o agendamento automático estiver ativo.
          </p>
          <ShareLinkButton slug={order.slug} />
        </div>
      </div>

      {/* Sem card nenhum aqui quando já é Plus de verdade — o badge PLUS no
       *  banner do topo já avisa disso, não precisa repetir embaixo
       *  (Fase 15). O upsell fica sempre visível pra quem não é Plus, mesmo
       *  que o agendamento já esteja ligado manualmente via admin — o
       *  objetivo é sempre incentivar a assinatura de verdade. */}
      {!isPlusAtivo && <PlusUpsellCard variant="card" slug={slug} />}
      </main>
    </>
  );
}
