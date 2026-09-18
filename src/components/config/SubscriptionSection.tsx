'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { PLAN_PRICING, type PayablePlanTier } from '@/lib/pricing';
import { PlanSubscribeCard } from '@/components/billing/PlanSubscribeCard';

interface SubscriptionSectionProps {
  slug: string;
  planTier: 'catalog' | 'basico' | 'plus';
  subscriptionStatus: 'none' | 'ativo' | 'suspenso' | 'cancelado';
  billingEmail?: string;
  billingCpfCnpj?: string;
}

const TIER_LABEL: Record<PayablePlanTier, string> = { basico: 'StudioMenu Básico', plus: 'StudioMenu+' };

/** Card "plano X ativo" com botão de cancelar — mesmo visual pro Básico e
 *  pro Plus, só troca o rótulo/preço/texto de aviso (Fase 19: antes só
 *  existia a versão Plus, hardcoded). */
const ActivePlanCard: React.FC<{ tier: PayablePlanTier; onCancel: () => void; loading: boolean; error: string | null }> = ({
  tier,
  onCancel,
  loading,
  error,
}) => {
  const [confirming, setConfirming] = useState(false);
  const pricing = PLAN_PRICING[tier];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/60 border border-rose-200 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-600/30">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="font-serif-pro font-bold text-lg text-rose-800 leading-tight">{TIER_LABEL[tier]} ativo</p>
          <p className="text-[13px] text-rose-800/70 mt-0.5">Cobrança recorrente via Pix</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl px-4 py-3 mb-4 border border-rose-200/60">
        <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700/70 mb-0.5">Mensalidade</p>
        <p className="font-serif-pro font-bold text-lg text-rose-800 whitespace-nowrap">{pricing.label}</p>
      </div>

      {error && <p className="text-[13px] text-rose-600 mb-3">{error}</p>}

      {confirming ? (
        <div className="rounded-xl bg-surface border border-rose-200/60 p-4">
          <p className="text-[13px] text-ink-soft mb-3">
            Cancelar sua assinatura do {TIER_LABEL[tier]}?{' '}
            {tier === 'plus' ? 'Você perde acesso à agenda automática.' : 'Seu catálogo deixa de fazer parte do plano pago.'}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={loading}
              className="flex-1 h-11 rounded-xl bg-linen text-ink-soft text-sm font-bold disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold disabled:opacity-50 transition-colors"
            >
              {loading ? 'Cancelando...' : 'Sim, cancelar'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold disabled:opacity-50 transition-colors"
        >
          Cancelar assinatura
        </button>
      )}
    </div>
  );
};

/** Seção "Minha assinatura" — 3 estados possíveis (Fase 19, antes só
 *  distinguia Plus-ativo vs. resto): Plus ativo (gerenciar/cancelar),
 *  Básico ativo (gerenciar/cancelar + oferta de evoluir pro Plus, é o
 *  gatilho de troca de tier no checkout) e nenhum plano ativo (assinar,
 *  padrão Básico). */
export const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
  slug,
  planTier,
  subscriptionStatus,
  billingEmail,
  billingCpfCnpj,
}) => {
  const router = useRouter();
  const isPlusActive = planTier === 'plus' && subscriptionStatus === 'ativo';
  const isBasicoActive = planTier === 'basico' && subscriptionStatus === 'ativo';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message || 'Não foi possível cancelar.');
        return;
      }
      router.refresh();
    } catch {
      setError('Falha na conexão.');
    } finally {
      setLoading(false);
    }
  };

  if (isPlusActive) {
    return <ActivePlanCard tier="plus" onCancel={handleCancel} loading={loading} error={error} />;
  }

  if (isBasicoActive) {
    return (
      <div className="flex flex-col gap-4">
        <ActivePlanCard tier="basico" onCancel={handleCancel} loading={loading} error={error} />
        <div>
          <p className="flex items-center gap-1.5 text-sm font-bold text-ink mb-2">
            <Sparkles className="w-4 h-4 text-rose-600" /> Evolua pro StudioMenu+
          </p>
          <PlanSubscribeCard slug={slug} plan="plus" billingEmail={billingEmail} billingCpfCnpj={billingCpfCnpj} />
        </div>
      </div>
    );
  }

  // Nunca assinou, ou assinatura suspensa/cancelada — oferece assinar de
  // novo. Quem já teve o Plus antes continua sendo ofertada o Plus (não faz
  // sentido "regredir" ela pro Básico na tela de reativação); quem nunca
  // assinou nada ou só teve Básico entra pelo Básico.
  const reofferTier: PayablePlanTier = planTier === 'plus' ? 'plus' : 'basico';

  return (
    <div className="flex flex-col gap-3">
      {(subscriptionStatus === 'suspenso' || subscriptionStatus === 'cancelado') && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-700">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-[13px]">
            {subscriptionStatus === 'suspenso'
              ? 'Sua assinatura está suspensa (pagamento em atraso).'
              : 'Sua assinatura foi cancelada.'}{' '}
            Assine novamente pra reativar.
          </p>
        </div>
      )}
      <PlanSubscribeCard slug={slug} plan={reofferTier} billingEmail={billingEmail} billingCpfCnpj={billingCpfCnpj} />
    </div>
  );
};
