'use client';

import React, { useMemo, useState } from 'react';
import type { Step } from 'react-joyride';
import { CreditCard } from 'lucide-react';
import { ViewCatalogCard } from './ViewCatalogCard';
import { EditCatalogCard } from './EditCatalogCard';
import { ConfettiBurst } from './ConfettiBurst';
import { FullCatalogOfferCard } from './FullCatalogOfferCard';
import { SectionCard } from './SectionCard';
import { PlanSubscribeCard } from '@/components/billing/PlanSubscribeCard';
import { ProductTour } from '@/components/tour/ProductTour';
import { resolveAgendaPrice, resolveCatalogPrice, resolveFullCatalogPrice } from '@/lib/pricing';
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
  const isAgendaOffer = order.first_offer_tier === 'plus';
  // Oferta "Catálogo Completo" (2026-10-28): se ela já aceitou (ANTES de
  // pagar qualquer coisa — quem já paga usa a tela `/inicio`, não esta), o
  // card de assinar abaixo já cobra/mostra o preço cheio em vez do simples —
  // mesma condição usada em `fullCatalogAccepted`,
  // `src/app/api/billing/checkout/route.ts`, nunca pode divergir dali.
  const fullCatalogAccepted = !isAgendaOffer && order.full_catalog_offer_decision === 'accepted';
  const basePrice = fullCatalogAccepted
    ? resolveFullCatalogPrice(order.full_catalog_price_override)
    : resolveCatalogPrice(order.billing_price_override);
  // Mesmo preço/campo de sempre (`billing_price_override`) — só o rótulo
  // ganha "/mês" ou "/ano" quando o admin marcou esse catálogo como
  // recorrente/anual (Fase 27, + 2026-10-15), pra bater com o que o
  // checkout de fato vai cobrar.
  const catalogBillingSuffix =
    order.catalog_billing_mode === 'anual' ? '/ano' : order.catalog_billing_mode === 'recorrente' ? '/mês' : '';
  const catalogDisplayPrice = catalogBillingSuffix
    ? { price: basePrice.price, label: `${basePrice.label}${catalogBillingSuffix}` }
    : basePrice;
  const fullCatalogUpgradePrice = resolveFullCatalogPrice(order.full_catalog_price_override);
  const showFullCatalogOffer = !isAgendaOffer && order.full_catalog_offer_enabled && order.full_catalog_offer_decision === 'pending';
  // Campo PRÓPRIO do Agenda (`agenda_price_override`, 2026-10-15) — não o
  // `billing_price_override` do Catálogo, senão vaza o preço de um plano pro
  // outro (achado real testando). Rótulo já sai com "/mês" ou "/ano" certo.
  const agendaDisplayPrice = resolveAgendaPrice(order.agenda_billing_mode, order.agenda_price_override);
  const [highlightView, setHighlightView] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  // Card de pagamento vira acordeão (pedido real, 2026-10-28) — antes ficava
  // "aberto e grande" direto na tela; agora só mostra o conteúdo (formulário
  // de CPF/e-mail, Pix/cartão) quando ela clica pra expandir. Mesmo
  // componente/padrão visual do acordeão da aba Config (`SectionCard`,
  // `ConfigAccordion.tsx`). Começa fechado.
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

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
            content: `${agendaDisplayPrice.label}, sem compromisso — cancele quando quiser. Suas clientes escolhem o horário sozinhas, sem trocar mensagem.`,
          }
        : {
            target: '[data-tour="fc-subscribe"]',
            title: 'Pague pra manter tudo ativo',
            content: `${catalogDisplayPrice.label} — é só preencher e pagar por Pix ou cartão de crédito.`,
          },
    ],
    [isAgendaOffer, catalogDisplayPrice.label, agendaDisplayPrice.label]
  );

  return (
    <main className="max-w-md mx-auto px-5 pt-8 pb-6 flex flex-col gap-4">
      {showConfetti && <ConfettiBurst />}
      <div className="text-center">
        <h1 className="font-serif-pro font-bold text-2xl text-ink">Olá, {order.client_name}! ✨</h1>
      </div>

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

      <div className="mt-2">
        <SectionCard icon={CreditCard} title="Pagamento" isOpen={isPaymentOpen} onToggle={() => setIsPaymentOpen((v) => !v)} dataTour="fc-subscribe">
          {isAgendaOffer && (
            <p className="text-[15px] text-ink-soft text-center mb-3">
              Suas clientes agendam sozinhas, sem trocar mensagem no WhatsApp — assine o Plano Agenda e libere o agendamento automático.
            </p>
          )}

          {isAgendaOffer ? (
            <PlanSubscribeCard
              slug={order.slug}
              plan="plus"
              billingEmail={order.billing_email}
              billingCpfCnpj={order.billing_cpf_cnpj}
              priceOverride={agendaDisplayPrice}
              billingMode={order.agenda_billing_mode}
            />
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
        </SectionCard>
      </div>

      {showFullCatalogOffer && <FullCatalogOfferCard slug={order.slug} price={fullCatalogUpgradePrice} alreadyPaid={false} />}

      <ProductTour tourId="primeiro-contato" slug={order.slug} steps={steps} enabled onFinish={handleTourFinish} />
    </main>
  );
};
