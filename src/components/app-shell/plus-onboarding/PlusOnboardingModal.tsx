'use client';

import React, { useEffect, useState } from 'react';
import { CatalogOrderData } from '@/types/catalog';
import { PlanSubscribeCard } from '@/components/billing/PlanSubscribeCard';
import { PlusBenefitsScreen } from './PlusBenefitsScreen';
import { PlusDemoScreen } from './PlusDemoScreen';

interface PlusOnboardingModalProps {
  slug: string;
  catalog: CatalogOrderData;
  onClose: () => void;
}

type Step = 'beneficios' | 'demo' | 'cta';
const STEPS: Step[] = ['beneficios', 'demo', 'cta'];

/** Onboarding em tela cheia do StudioMenu+, aberto pelo "Conheça" do
 *  `PlusUpsellCard` — 3 telas (benefícios → demo do agendamento automático
 *  com o catálogo real da cliente → assinar), no lugar do link direto de
 *  antes pra `/config#upgrade-plus` (2026-09-24).
 *
 *  Sempre no tema "rose" (independente do `theme_variant` real do catálogo
 *  dela) — pedido explícito, 2026-09-24: a paleta do app em si (topbar,
 *  cards, menu) é sempre rose, e um modal luxury (escuro) por cima destoava
 *  do resto da tela. */
export const PlusOnboardingModal: React.FC<PlusOnboardingModalProps> = ({ slug, catalog, onClose }) => {
  const [step, setStep] = useState<Step>('beneficios');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const stepIndex = STEPS.indexOf(step);
  const goNext = () => setStep(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)]);
  const goBack = () => setStep(STEPS[Math.max(stepIndex - 1, 0)]);

  return (
    <div
      data-theme="rose"
      className="fixed inset-0 z-50 flex flex-col bg-cream"
      role="dialog"
      aria-modal="true"
      aria-label="Conheça o StudioMenu+"
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`h-1.5 rounded-full transition-all ${i === stepIndex ? 'w-6 bg-rose-600' : 'w-1.5 bg-rose-200'}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="w-9 h-9 rounded-full bg-white/80 shadow-sm flex items-center justify-center text-ink-soft"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {step === 'beneficios' && <PlusBenefitsScreen onNext={goNext} />}
        {step === 'demo' && <PlusDemoScreen catalog={catalog} onNext={goNext} />}
        {step === 'cta' && (
          <div className="px-5 pb-8 pt-2 max-w-sm mx-auto w-full">
            <button type="button" onClick={goBack} className="text-sm font-semibold text-rose-700 mb-4">
              ← Voltar
            </button>
            <PlanSubscribeCard slug={slug} plan="plus" showMethodChoice />
          </div>
        )}
      </div>
    </div>
  );
};
