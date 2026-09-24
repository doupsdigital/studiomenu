'use client';

import React, { useMemo, useState } from 'react';
import type { Step } from 'react-joyride';
import { ViewCatalogCard } from './ViewCatalogCard';
import { EditCatalogCard } from './EditCatalogCard';
import { CatalogReadyPreview } from './CatalogReadyPreview';
import { PlanSubscribeCard } from '@/components/billing/PlanSubscribeCard';
import { ProductTour } from '@/components/tour/ProductTour';
import { PLAN_PRICING, type PayablePlanTier } from '@/lib/pricing';
import type { ProfessionalOrderSummary } from '@/lib/professional-app-service';

interface FirstContactScreenProps {
  order: ProfessionalOrderSummary;
}

/** Primeira tela que a profissional vê ao abrir o link do app, antes de
 *  assinar qualquer plano — deliberadamente simples (sem `GradientHeader`,
 *  sem `BottomNav`, sem menção a "login"): só os 2 links que ela já
 *  reconhece (ver/editar catálogo) e o card de assinar. A tela cheia de
 *  hoje (Fase 19: `inicio/page.tsx`) só aparece depois que ela paga alguma
 *  coisa (`plan_tier !== 'catalog'`).
 *
 *  `order.first_offer_tier` (Fase 22) decide qual plano é o padrão aqui —
 *  'basico' pra quase todo mundo (comportamento de sempre, sem nenhuma
 *  mudança visual), 'plus' pra catálogos vendidos com o discurso de
 *  agendamento automático (ex: leads de anúncio, decisão comercial tomada
 *  na criação do catálogo pelo admin). Com 'plus', ela ainda pode trocar
 *  pro Básico por um link — nunca fica presa numa única opção, só muda
 *  qual vem em destaque. Client component só por causa desse toggle (o
 *  resto da tela continua igual ao que seria puramente estático).
 *
 *  Tour guiado próprio (Fase 20) — primeiro contato de verdade, então
 *  explica os 3 elementos da tela em vez de pular algum. Texto do 3º passo
 *  muda junto com o plano em destaque (Fase 22). */
export const FirstContactScreen: React.FC<FirstContactScreenProps> = ({ order }) => {
  const firstName = order.client_name.split(' ')[0];
  const [plan, setPlan] = useState<PayablePlanTier>(order.first_offer_tier);
  const isPlusOffer = order.first_offer_tier === 'plus';

  const steps = useMemo<Step[]>(
    () => [
      { target: '[data-tour="fc-view"]', title: 'Seu catálogo', content: 'Esse é o link que suas clientes veem — pode colocar na bio do Instagram, WhatsApp, onde quiser.' },
      { target: '[data-tour="fc-edit"]', title: 'Editar quando quiser', content: 'Aqui você atualiza fotos, preços e serviços a qualquer hora, sem precisar de ajuda.' },
      plan === 'plus'
        ? {
            target: '[data-tour="fc-subscribe"]',
            title: 'Assine pra liberar o agendamento',
            content: `${PLAN_PRICING.plus.label}, sem compromisso — cancele quando quiser. Suas clientes escolhem o horário sozinhas, sem trocar mensagem.`,
          }
        : {
            target: '[data-tour="fc-subscribe"]',
            title: 'Assine pra manter tudo ativo',
            content: `${PLAN_PRICING.basico.label}, sem compromisso — cancele quando quiser. É só preencher e pagar por Pix ou cartão de crédito.`,
          },
    ],
    [plan]
  );

  return (
    <main className="max-w-md mx-auto px-5 pt-8 pb-6 flex flex-col gap-4">
      <div className="text-center mb-2">
        <h1 className="font-serif-pro font-bold text-2xl text-ink">Olá, {firstName}! ✨</h1>
        <p className="text-[15px] text-ink-soft mt-1.5">Seu catálogo digital já está pronto.</p>
      </div>

      <CatalogReadyPreview slug={order.slug} />

      <ViewCatalogCard slug={order.slug} dataTour="fc-view" />
      <EditCatalogCard slug={order.slug} dataTour="fc-edit" />

      <div className="mt-2" data-tour="fc-subscribe">
        {plan === 'plus' ? (
          <p className="text-[15px] text-ink-soft text-center mb-3">
            Suas clientes agendam sozinhas, sem trocar mensagem no WhatsApp — assine o StudioMenu+ e libere o agendamento automático.
          </p>
        ) : (
          <p className="text-[15px] text-ink-soft text-center mb-3">
            Pra manter seu catálogo no ar e continuar editando quando quiser, assine o plano abaixo — sem compromisso, cancele quando quiser.
          </p>
        )}

        <PlanSubscribeCard slug={order.slug} plan={plan} billingEmail={order.billing_email} billingCpfCnpj={order.billing_cpf_cnpj} />

        {/* Troca entre planos só aparece pra catálogos marcados como oferta
         *  Plus (Fase 22) — pra quem já vinha vendo só o Básico, a tela
         *  continua idêntica a antes. */}
        {isPlusOffer && (
          <p className="text-[13px] text-center text-ink-faint mt-3">
            {plan === 'plus' ? (
              <button type="button" onClick={() => setPlan('basico')} className="underline underline-offset-2 font-semibold text-ink-soft">
                Prefiro começar só com o catálogo ({PLAN_PRICING.basico.label}) — o agendamento continua pelo WhatsApp
              </button>
            ) : (
              <button type="button" onClick={() => setPlan('plus')} className="underline underline-offset-2 font-semibold text-rose-700">
                ← Prefiro o agendamento automático ({PLAN_PRICING.plus.label})
              </button>
            )}
          </p>
        )}
      </div>

      <ProductTour tourId="primeiro-contato" slug={order.slug} steps={steps} enabled />
    </main>
  );
};
