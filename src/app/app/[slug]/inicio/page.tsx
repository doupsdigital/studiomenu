import React from 'react';
import { notFound } from 'next/navigation';
import { getOrderForProfessionalApp } from '@/lib/professional-app-service';
import { getCatalogBySlug } from '@/lib/catalog-service';
import { getAppointmentsForDay, getPendingAppointments } from '@/lib/scheduling/agenda-service';
import { getBusinessHours } from '@/lib/scheduling/config-service';
import { GradientHeader } from '@/components/app-shell/GradientHeader';
import { StatCard } from '@/components/app-shell/StatCard';
import { ViewCatalogCard } from '@/components/app-shell/ViewCatalogCard';
import { EditCatalogCard } from '@/components/app-shell/EditCatalogCard';
import { PlusUpsellCard } from '@/components/app-shell/PlusUpsellCard';
import { ShareLinkButton } from '@/components/app-shell/ShareLinkButton';
import { PageTitleBar } from '@/components/app-shell/PageTitleBar';
import { FirstContactScreen } from '@/components/app-shell/FirstContactScreen';
import { FullCatalogOfferCard } from '@/components/app-shell/FullCatalogOfferCard';
import { OnboardingCardStack } from '@/components/app-shell/OnboardingCardStack';
import { OpenChargeBanner } from '@/components/billing/OpenChargeBanner';
import { InicioTour } from '@/components/tour/InicioTour';
import { resolveFullCatalogUpgradePrice } from '@/lib/pricing';
import { countSelfServeStepsDone, SELF_SERVE_STEP_ORDER } from '@/lib/self-serve-onboarding';
import Link from 'next/link';
import { CaktoPlanCard } from '@/components/billing/CaktoPlanCard';
import { SupportFooterCard } from '@/components/app-shell/SupportFooterCard';
import { CalendarDays, Clock, Share2, Crown, Home, ListChecks, ChevronRight } from 'lucide-react';

interface InicioPageProps {
  params: Promise<{ slug: string }>;
}

/** Saudação baseada na hora em America/Sao_Paulo (não o fuso do servidor). */
function getGreeting(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(now);

  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 12);
  return hour >= 5 && hour < 12 ? 'Bom dia' : hour >= 12 && hour < 18 ? 'Boa tarde' : 'Boa noite';
}

function todayInSaoPaulo(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

export default async function InicioPage({ params }: InicioPageProps) {
  const { slug } = await params;
  const order = await getOrderForProfessionalApp(slug);

  if (!order) notFound();

  // Nunca assinou nada ainda — tela de primeiro contato, deliberadamente
  // simples (Fase 19). Permanece assim até ela pagar Básico ou Plus; não
  // regride de volta aqui mesmo se cancelar depois (ver `SubscriptionSection`).
  // Sem `PageTitleBar` aqui de propósito (2026-09-24): ela ainda nem está
  // "no app" de verdade, só conhecendo o catálogo — uma barra com título
  // "Início" e botão de instalar não fazia sentido ainda. Volta normalmente
  // assim que ela assina (branch abaixo, que já tem a sua própria).
  if (order.plan_tier === 'catalog') {
    return <FirstContactScreen order={order} />;
  }

  const isPlusAtivo = order.plan_tier === 'plus' && order.subscription_status === 'ativo';
  // Mesmo gate da Agenda: `booking_enabled` decide se o agendamento está de
  // fato funcionando pro cliente final, não o plano diretamente (pode estar
  // ligado via toggle manual do admin sem ela ser Plus — Fase 6).
  const schedulingLive = order.booking_enabled;
  // Mesma condição de exibição do card de upsell logo abaixo — só busca o
  // catálogo completo (com procedures) quando ele de fato vai aparecer, pra
  // não pagar essa consulta extra em quem já é Plus.
  // Produto "Catálogo apenas" (2026-10-27): com Agenda/Config inacessíveis
  // (`show_full_app === false`), não faz sentido anunciar o Plus/Agenda aqui.
  const showPlusUpsell = order.show_full_app !== false && !isPlusAtivo && order.subscription_status !== 'suspenso';
  // Oferta "Catálogo Completo" (2026-10-28) — pra quem já paga o Catálogo
  // simples (plan_tier 'basico', ativo); quem ainda não pagou nada vê a
  // versão dessa mesma oferta em `FirstContactScreen`, não aqui.
  const showFullCatalogOffer =
    order.plan_tier === 'basico' &&
    order.subscription_status === 'ativo' &&
    order.full_catalog_offer_enabled &&
    order.full_catalog_offer_decision !== 'declined';

  const [todayAppointments, pendingAppointments, businessHours, plusUpsellCatalog] = await Promise.all([
    getAppointmentsForDay(order.id, todayInSaoPaulo()),
    getPendingAppointments(order.id),
    // Só o checklist de "próximos passos" do Plus usa isso (item de horários).
    isPlusAtivo ? getBusinessHours(order.id) : Promise.resolve([]),
    showPlusUpsell ? getCatalogBySlug(slug) : Promise.resolve(null),
  ]);
  const hoursDone = businessHours.length > 0;

  // Funil `/lash` (Cakto, 2026-11-18): enquanto o checklist "Primeiros
  // passos" não termina, um card no topo leva ela de volta pra lá.
  const selfServeTotal = SELF_SERVE_STEP_ORDER.length;
  const selfServeDone = countSelfServeStepsDone(order.onboarding_steps, Boolean(order.auth_user_id));
  const showSelfServeContinue = order.billing_provider === 'cakto' && selfServeDone < selfServeTotal;

  // Card "Meu plano" da Cakto: no topo quando precisa de ação (fora do ar,
  // renovação recusada, cancelada), senão no fim da tela.
  const isCakto = order.billing_provider === 'cakto';
  const caktoNeedsAttention =
    isCakto && (order.subscription_status !== 'ativo' || !order.paid_until || new Date(order.paid_until).getTime() < Date.now());
  const caktoPlanCard = isCakto ? (
    <CaktoPlanCard
      plan={order.cakto_plan}
      status={order.subscription_status}
      paidUntil={order.paid_until}
      checkoutRef={order.cakto_checkout_ref}
    />
  ) : null;

  const greeting = getGreeting();
  const firstName = order.client_name.split(' ')[0];

  return (
    <>
      <PageTitleBar title="Início" icon={<Home className="w-5 h-5 text-ink-soft" />} slug={slug} />
      <main className="max-w-md mx-auto px-5 pt-6 pb-6 flex flex-col gap-4">
      {/* pt-5 pb-5 (em vez do p-6 padrão do GradientHeader, que também é
       *  usado no cabeçalho da Agenda — não dava pra reduzir ali sem afetar
       *  essa outra tela) + badge PLUS mais compacto (mt-2/py-1 em vez de
       *  mt-3/py-1.5): pedido pra diminuir a altura desse cartão, 2026-09-23. */}
      <GradientHeader tone="light" className="pt-5 pb-5">
        <h1 className="font-serif-pro font-bold text-3xl">
          {greeting}, {firstName}!
        </h1>
        <p className="text-[15px] text-rose-800/70 mt-1.5 italic">Bem-vinda ao seu Studio! ✨</p>
        {isPlusAtivo && (
          <div className="flex justify-end">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-rose-600 text-white text-[13px] font-bold tracking-wide">
              <Crown className="w-3.5 h-3.5" />
              AGENDA
            </span>
          </div>
        )}
      </GradientHeader>

      <OpenChargeBanner slug={slug} />

      {caktoNeedsAttention && caktoPlanCard}

      {showSelfServeContinue && (
        <Link
          href={`/app/${slug}/primeiros-passos`}
          className="flex items-center gap-4 rounded-2xl p-4 bg-surface border-2 border-rose-300 shadow-sm transition-transform active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <ListChecks className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[16px] text-ink leading-tight">Continue de onde parou</p>
            <p className="text-sm text-ink-soft mt-0.5">
              Primeiros passos: {selfServeDone} de {selfServeTotal} feitos
            </p>
            <div className="h-1.5 rounded-full bg-linen mt-2 overflow-hidden">
              <div className="h-full rounded-full bg-rose-600" style={{ width: `${(selfServeDone / selfServeTotal) * 100}%` }} />
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-ink-faint shrink-0" />
        </Link>
      )}

      {/* Só fazem sentido com o agendamento de fato funcionando — senão
       *  ficam sempre zerados, sem nenhuma ação possível por trás. Também só
       *  com a Agenda acessível (`show_full_app`, 2026-10-27) — senão os
       *  cards linkariam pra uma rota que redireciona de volta pro Início. */}
      {schedulingLive && order.show_full_app !== false && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={CalendarDays} label="Agendamentos hoje" value={todayAppointments.length} href={`/app/${slug}/agenda`} dataTour="stat-today" />
          <StatCard
            icon={Clock}
            label="Aguardando confirmação"
            value={pendingAppointments.length}
            tone="amber"
            href={`/app/${slug}/agenda#pendentes`}
            dataTour="stat-pending"
          />
        </div>
      )}

      <ViewCatalogCard slug={order.slug} />

      <EditCatalogCard slug={order.slug} />

      <div className="rounded-2xl p-6 bg-gradient-to-br from-rose-200 to-rose-100 border border-rose-200/60 relative overflow-hidden text-center">
        <Share2 className="absolute -top-3 -right-3 w-24 h-24 text-rose-300/50 rotate-12 pointer-events-none select-none" strokeWidth={1.25} />
        <div className="relative z-10">
          <h2 className="font-serif-pro font-bold text-xl text-rose-800 mb-1.5">Compartilhe seu Catálogo</h2>
          <p className="text-[15px] text-rose-800/70 mb-4 max-w-xs mx-auto">
            {schedulingLive
              ? 'Envie esse link pra suas clientes verem seus serviços e preços, e agendarem sozinhas.'
              : 'Coloque esse link na Bio do seu Instagram ou compartilhe pelo WhatsApp pra suas clientes verem seus serviços e preços.'}
          </p>
          <ShareLinkButton slug={order.slug} />
        </div>
      </div>

      {/* Sem card nenhum aqui quando já é Plus de verdade — o badge PLUS no
       *  banner do topo já avisa disso, não precisa repetir embaixo
       *  (Fase 15). O upsell fica sempre visível pra quem não é Plus, mesmo
       *  que o agendamento já esteja ligado manualmente via admin — o
       *  objetivo é sempre incentivar a assinatura de verdade. */}
      {/* Suspensa (mensalidade em atraso): oferecer "Assinar o Plus" aqui só
       *  confunde — o que ela precisa é pagar a cobrança em aberto, que já
       *  aparece no aviso lá no topo (Fase 21). */}
      {showPlusUpsell && (
        <PlusUpsellCard
          variant="card"
          slug={slug}
          catalog={plusUpsellCatalog}
          billingEmail={order.billing_email}
          billingCpfCnpj={order.billing_cpf_cnpj}
          hasRealSubscription={order.has_real_subscription}
        />
      )}

      {showFullCatalogOffer && (
        <FullCatalogOfferCard
          slug={order.slug}
          price={resolveFullCatalogUpgradePrice(order.full_catalog_upgrade_price_override)}
          alreadyPaid
        />
      )}

      {isCakto && !caktoNeedsAttention && caktoPlanCard}

      <OnboardingCardStack slug={slug} planTier={order.plan_tier} subscriptionStatus={order.subscription_status} hasAccount={Boolean(order.auth_user_id)} hoursDone={hoursDone} />

      <InicioTour
        slug={slug}
        planTier={order.plan_tier}
        subscriptionStatus={order.subscription_status}
        hasAccount={Boolean(order.auth_user_id)}
        hoursDone={hoursDone}
        schedulingLive={schedulingLive}
      />

      {/* Suporte no fim do Início só pra quem NÃO vê a Config (produto
       *  "Catálogo apenas", ex: Cakto) — quem tem a Config já tem a seção
       *  "Suporte e dúvidas" lá. */}
      {order.show_full_app === false && <SupportFooterCard name={order.client_name} slug={slug} />}
      </main>
    </>
  );
}
