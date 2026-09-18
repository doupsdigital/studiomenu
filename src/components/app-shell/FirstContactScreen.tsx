import React from 'react';
import type { Step } from 'react-joyride';
import { ViewCatalogCard } from './ViewCatalogCard';
import { EditCatalogCard } from './EditCatalogCard';
import { PlanSubscribeCard } from '@/components/billing/PlanSubscribeCard';
import { ProductTour } from '@/components/tour/ProductTour';
import type { ProfessionalOrderSummary } from '@/lib/professional-app-service';

interface FirstContactScreenProps {
  order: ProfessionalOrderSummary;
}

const FIRST_CONTACT_TOUR_STEPS: Step[] = [
  { target: '[data-tour="fc-view"]', title: 'Seu catálogo', content: 'Esse é o link que suas clientes veem — pode colocar na bio do Instagram, WhatsApp, onde quiser.' },
  { target: '[data-tour="fc-edit"]', title: 'Editar quando quiser', content: 'Aqui você atualiza fotos, preços e serviços a qualquer hora, sem precisar de ajuda.' },
  { target: '[data-tour="fc-subscribe"]', title: 'Assine pra manter tudo ativo', content: 'R$39/mês, sem compromisso — cancele quando quiser. É só preencher e pagar pelo Pix.' },
];

/** Primeira tela que a profissional vê ao abrir o link do app, antes de
 *  assinar qualquer plano — deliberadamente simples (sem `GradientHeader`,
 *  sem `BottomNav`, sem menção a "login"): só os 2 links que ela já
 *  reconhece (ver/editar catálogo) e o card de assinar o Básico. A tela
 *  cheia de hoje (Fase 19: `inicio/page.tsx`) só aparece depois que ela
 *  paga alguma coisa (`plan_tier !== 'catalog'`).
 *
 *  Tour guiado próprio (Fase 20) — primeiro contato de verdade, então
 *  explica os 3 elementos da tela em vez de pular algum. */
export const FirstContactScreen: React.FC<FirstContactScreenProps> = ({ order }) => {
  const firstName = order.client_name.split(' ')[0];

  return (
    <main className="max-w-md mx-auto px-5 pt-8 pb-6 flex flex-col gap-4">
      <div className="text-center mb-2">
        <h1 className="font-serif-pro font-bold text-2xl text-ink">Olá, {firstName}! ✨</h1>
        <p className="text-sm text-ink-soft mt-1.5">Seu catálogo digital já está pronto.</p>
      </div>

      <ViewCatalogCard slug={order.slug} dataTour="fc-view" />
      <EditCatalogCard slug={order.slug} dataTour="fc-edit" />

      <div className="mt-2" data-tour="fc-subscribe">
        <p className="text-sm text-ink-soft text-center mb-3">
          Pra manter seu catálogo no ar e continuar editando quando quiser, assine o plano abaixo — sem compromisso, cancele quando quiser.
        </p>
        <PlanSubscribeCard slug={order.slug} plan="basico" billingEmail={order.billing_email} billingCpfCnpj={order.billing_cpf_cnpj} />
      </div>

      <ProductTour tourId="primeiro-contato" slug={order.slug} steps={FIRST_CONTACT_TOUR_STEPS} enabled />
    </main>
  );
};
