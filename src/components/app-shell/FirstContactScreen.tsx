'use client';

import React, { useMemo, useState } from 'react';
import type { Step } from 'react-joyride';
import { ViewCatalogCard } from './ViewCatalogCard';
import { EditCatalogCard } from './EditCatalogCard';
import { CatalogReadyPreview } from './CatalogReadyPreview';
import { ConfettiBurst } from './ConfettiBurst';
import { PlanSubscribeCard } from '@/components/billing/PlanSubscribeCard';
import { ProductTour } from '@/components/tour/ProductTour';
import { UrgencyTimerBanner } from './UrgencyTimerBanner';
import { PLAN_PRICING, resolveCatalogPrice } from '@/lib/pricing';
import type { ProfessionalOrderSummary } from '@/lib/professional-app-service';

interface FirstContactScreenProps {
  order: ProfessionalOrderSummary;
  isAdmin?: boolean;
}

/** Primeira tela que a profissional vê ao abrir o link do app, antes de
 *  pagar qualquer plano — deliberadamente simples (sem `GradientHeader`,
 *  sem `BottomNav`, sem menção a "login"): só os 2 links que ela já
 *  reconhece (ver/editar catálogo) e o card de pagar. A tela cheia de
 *  hoje (Fase 19: `inicio/page.tsx`) só aparece depois que ela paga alguma
 *  coisa (`plan_tier !== 'catalog'`).
 *
 *  Modelo novo (2026-10-06): não existe mais escolha entre 2 planos aqui —
 *  o padrão é sempre o Plano Catálogo (pagamento único, preço vem de
 *  `resolveCatalogPrice`, customizável por admin via `billing_price_override`).
 *  `order.first_offer_tier` (Fase 22) continua decidindo o caso especial:
 *  'plus' pula o Catálogo e mostra direto o Plano Agenda (assinatura) — pra
 *  leads que já pedem agendamento automático de cara. Diferente de antes,
 *  não existe mais botão pra ela trocar entre os dois nessa tela: a escolha
 *  agora é do admin, feita na criação do catálogo.
 *
 *  Tour guiado próprio (Fase 20) — primeiro contato de verdade, então
 *  explica os 3 elementos da tela em vez de pular algum. Texto do 3º passo
 *  muda conforme o plano ofertado (Fase 22). */
export const FirstContactScreen: React.FC<FirstContactScreenProps> = ({ order, isAdmin = false }) => {
  const isAgendaOffer = order.first_offer_tier === 'plus';
  const isCatalogoRecorrente = order.catalog_billing_mode === 'recorrente';
  const catalogPrice = resolveCatalogPrice(order.billing_price_override);
  // Mesmo preço/campo de sempre (`billing_price_override`) — só o rótulo
  // ganha "/mês" quando o admin marcou esse catálogo como recorrente (Fase
  // 27), pra bater com o que o checkout de fato vai cobrar.
  const catalogDisplayPrice = isCatalogoRecorrente
    ? { price: catalogPrice.price, label: `${catalogPrice.label}/mês` }
    : catalogPrice;
  const [highlightView, setHighlightView] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Quando o tour termina, concluído ou pulado: o último passo fica lá
  // embaixo, perto do card de assinar. Ela pediu, 2026-09-24, pra voltar o
  // foco pro topo e destacar o card de "Ver catálogo" nesse momento, já que
  // é o próximo passo natural (ver como ficou de verdade). O confete
  // (2026-10-07) dispara só aqui, depois do tour — antes disparava junto
  // com os balões de tooltip e os dois competiam por atenção.
  const handleTourFinish = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setHighlightView(true);
    setShowConfetti(true);
    setTimeout(() => setHighlightView(false), 6000);
  };

  const steps = useMemo<Step[]>(
    () => [
      { target: '[data-tour="fc-view"]', title: 'Seu catálogo', content: 'Esse é o link que suas clientes veem — pode colocar na bio do Instagram, WhatsApp, onde quiser.' },
      { target: '[data-tour="fc-edit"]', title: 'Edite quando quiser', content: 'Aqui você atualiza fotos, preços e serviços a qualquer hora, é muito fácil e intuitivo.' },
      isAgendaOffer
        ? {
            target: '[data-tour="fc-subscribe"]',
            title: 'Assine pra liberar o agendamento',
            content: `${PLAN_PRICING.plus.label}, sem compromisso — cancele quando quiser. Suas clientes escolhem o horário sozinhas, sem trocar mensagem.`,
          }
        : {
            target: '[data-tour="fc-subscribe"]',
            title: 'Pague pra manter tudo ativo',
            content: `${catalogDisplayPrice.label} — é só preencher e pagar por Pix ou cartão de crédito.`,
          },
    ],
    [isAgendaOffer, catalogDisplayPrice.label]
  );

  return (
    <main className="max-w-md mx-auto px-5 pt-8 pb-6 flex flex-col gap-4">
      {showConfetti && <ConfettiBurst />}
      <div className="text-center">
        <h1 className="font-serif-pro font-bold text-2xl text-ink">Olá, {order.client_name}! ✨</h1>
      </div>

      <CatalogReadyPreview slug={order.slug} />

      <div className="relative">
        {highlightView && (
          <span
            className="absolute -inset-1.5 rounded-[20px] ring-4 ring-rose-400 animate-pulse pointer-events-none"
            aria-hidden="true"
          />
        )}
        <ViewCatalogCard slug={order.slug} dataTour="fc-view" />
      </div>
      <EditCatalogCard slug={order.slug} dataTour="fc-edit" />

      <div className="mt-2" data-tour="fc-subscribe">
        {isAgendaOffer && (
          <p className="text-[15px] text-ink-soft text-center mb-3">
            Suas clientes agendam sozinhas, sem trocar mensagem no WhatsApp — assine o Plano Agenda e libere o agendamento automático.
          </p>
        )}

        {isAgendaOffer ? (
          <PlanSubscribeCard slug={order.slug} plan="plus" billingEmail={order.billing_email} billingCpfCnpj={order.billing_cpf_cnpj} />
        ) : (
          <PlanSubscribeCard
            slug={order.slug}
            plan="basico"
            billingEmail={order.billing_email}
            billingCpfCnpj={order.billing_cpf_cnpj}
            priceOverride={catalogDisplayPrice}
            billingMode={order.catalog_billing_mode}
          />
        )}

        <UrgencyTimerBanner createdAt={order.created_at} slug={order.slug} isAdmin={isAdmin} />
      </div>

      <ProductTour tourId="primeiro-contato" slug={order.slug} steps={steps} enabled onFinish={handleTourFinish} />
    </main>
  );
};
