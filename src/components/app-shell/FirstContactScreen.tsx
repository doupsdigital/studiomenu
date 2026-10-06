'use client';

import React, { useMemo, useState } from 'react';
import type { Step } from 'react-joyride';
import { ViewCatalogCard } from './ViewCatalogCard';
import { EditCatalogCard } from './EditCatalogCard';
import { CatalogReadyPreview } from './CatalogReadyPreview';
import { PlanSubscribeCard } from '@/components/billing/PlanSubscribeCard';
import { ProductTour } from '@/components/tour/ProductTour';
import { PLAN_PRICING, resolveCatalogPrice } from '@/lib/pricing';
import type { ProfessionalOrderSummary } from '@/lib/professional-app-service';

interface FirstContactScreenProps {
  order: ProfessionalOrderSummary;
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
export const FirstContactScreen: React.FC<FirstContactScreenProps> = ({ order }) => {
  const firstName = order.client_name.split(' ')[0];
  const isAgendaOffer = order.first_offer_tier === 'plus';
  const catalogPrice = resolveCatalogPrice(order.billing_price_override);
  const [highlightView, setHighlightView] = useState(false);

  // Ao CONCLUIR o tour (não ao pular — intenção diferente): o último passo
  // fica lá embaixo, perto do card de assinar. Ela pediu, 2026-09-24, pra
  // voltar o foco pro topo e destacar o card de "Ver catálogo" nesse
  // momento, já que é o próximo passo natural (ver como ficou de verdade).
  const handleTourFinish = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setHighlightView(true);
    setTimeout(() => setHighlightView(false), 6000);
  };

  const steps = useMemo<Step[]>(
    () => [
      { target: '[data-tour="fc-view"]', title: 'Seu catálogo', content: 'Esse é o link que suas clientes veem — pode colocar na bio do Instagram, WhatsApp, onde quiser.' },
      { target: '[data-tour="fc-edit"]', title: 'Editar quando quiser', content: 'Aqui você atualiza fotos, preços e serviços a qualquer hora, sem precisar de ajuda.' },
      isAgendaOffer
        ? {
            target: '[data-tour="fc-subscribe"]',
            title: 'Assine pra liberar o agendamento',
            content: `${PLAN_PRICING.plus.label}, sem compromisso — cancele quando quiser. Suas clientes escolhem o horário sozinhas, sem trocar mensagem.`,
          }
        : {
            target: '[data-tour="fc-subscribe"]',
            title: 'Pague pra manter tudo ativo',
            content: `${catalogPrice.label} — é só preencher e pagar por Pix ou cartão de crédito.`,
          },
    ],
    [isAgendaOffer, catalogPrice.label]
  );

  return (
    <main className="max-w-md mx-auto px-5 pt-8 pb-6 flex flex-col gap-4">
      <div className="text-center">
        <h1 className="font-serif-pro font-bold text-2xl text-ink">Olá, {firstName}! ✨</h1>
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
        {isAgendaOffer ? (
          <p className="text-[15px] text-ink-soft text-center mb-3">
            Suas clientes agendam sozinhas, sem trocar mensagem no WhatsApp — assine o Plano Agenda e libere o agendamento automático.
          </p>
        ) : (
          <p className="text-[15px] text-ink-soft text-center mb-3">
            Tenha um catálogo digital profissional — com fotos, preços e serviços personalizados pro seu Studio.
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
            priceOverride={catalogPrice}
          />
        )}
      </div>

      <ProductTour tourId="primeiro-contato" slug={order.slug} steps={steps} enabled onFinish={handleTourFinish} />
    </main>
  );
};
