import React from 'react';
import { ViewCatalogCard } from './ViewCatalogCard';
import { EditCatalogCard } from './EditCatalogCard';
import { PlanSubscribeCard } from '@/components/billing/PlanSubscribeCard';
import type { ProfessionalOrderSummary } from '@/lib/professional-app-service';

interface FirstContactScreenProps {
  order: ProfessionalOrderSummary;
}

/** Primeira tela que a profissional vê ao abrir o link do app, antes de
 *  assinar qualquer plano — deliberadamente simples (sem `GradientHeader`,
 *  sem `BottomNav`, sem menção a "login"): só os 2 links que ela já
 *  reconhece (ver/editar catálogo) e o card de assinar o Básico. A tela
 *  cheia de hoje (Fase 19: `inicio/page.tsx`) só aparece depois que ela
 *  paga alguma coisa (`plan_tier !== 'catalog'`). */
export const FirstContactScreen: React.FC<FirstContactScreenProps> = ({ order }) => {
  const firstName = order.client_name.split(' ')[0];

  return (
    <main className="max-w-md mx-auto px-5 pt-8 pb-6 flex flex-col gap-4">
      <div className="text-center mb-2">
        <h1 className="font-serif-pro font-bold text-2xl text-ink">Olá, {firstName}! ✨</h1>
        <p className="text-sm text-ink-soft mt-1.5">Seu catálogo digital já está pronto.</p>
      </div>

      <ViewCatalogCard slug={order.slug} />
      <EditCatalogCard slug={order.slug} />

      <div className="mt-2">
        <p className="text-sm text-ink-soft text-center mb-3">
          Pra manter seu catálogo no ar e continuar editando quando quiser, assine o plano abaixo — sem compromisso, cancele quando quiser.
        </p>
        <PlanSubscribeCard slug={order.slug} plan="basico" billingEmail={order.billing_email} billingCpfCnpj={order.billing_cpf_cnpj} />
      </div>
    </main>
  );
};
