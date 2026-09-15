'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertTriangle, Crown } from 'lucide-react';
import { PLUS_PRICE_LABEL } from '@/lib/pricing';

interface SubscriptionSectionProps {
  slug: string;
  planTier: 'catalog' | 'plus';
  subscriptionStatus: 'none' | 'ativo' | 'suspenso' | 'cancelado';
  billingEmail?: string;
  billingCpfCnpj?: string;
}

interface QrState {
  paymentId: string;
  image: string;
  payload: string;
}

const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

export const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
  slug,
  planTier,
  subscriptionStatus,
  billingEmail,
  billingCpfCnpj,
}) => {
  const router = useRouter();
  const isActive = planTier === 'plus' && subscriptionStatus === 'ativo';

  const [email, setEmail] = useState(billingEmail || '');
  const [cpfCnpj, setCpfCnpj] = useState(billingCpfCnpj || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<QrState | null>(null);
  const [polling, setPolling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPolling = (paymentId: string) => {
    setPolling(true);
    const startedAt = Date.now();
    pollRef.current = setInterval(async () => {
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        if (pollRef.current) clearInterval(pollRef.current);
        setPolling(false);
        return;
      }
      try {
        const res = await fetch('/api/billing/check-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, payment_id: paymentId }),
        });
        const json = await res.json();
        if (json.active) {
          if (pollRef.current) clearInterval(pollRef.current);
          setPolling(false);
          router.refresh();
        }
      } catch {
        // Falha isolada de uma tentativa de polling não interrompe o ciclo.
      }
    }, POLL_INTERVAL_MS);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, email: email.trim(), cpf_cnpj: cpfCnpj.trim() }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message || 'Não foi possível iniciar a assinatura.');
        return;
      }
      if (json.alreadyActive) {
        router.refresh();
        return;
      }
      setQr({ paymentId: json.paymentId, image: json.pixQrCodeImage, payload: json.pixKey });
      startPolling(json.paymentId);
    } catch {
      setError('Falha na conexão.');
    } finally {
      setLoading(false);
    }
  };

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
      setConfirmingCancel(false);
    }
  };

  const handleCopyPix = async () => {
    if (!qr) return;
    try {
      await navigator.clipboard.writeText(qr.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // sem fallback, ação secundária
    }
  };

  return (
    <div>
      {isActive ? (
        <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/60 border border-rose-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-600/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="font-serif-pro font-bold text-lg text-rose-800 leading-tight">StudioMenu+ ativo</p>
              <p className="text-xs text-rose-800/70 mt-0.5">Cobrança recorrente via Pix</p>
            </div>
          </div>

          <div className="bg-surface rounded-xl px-4 py-3 mb-4 border border-rose-200/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700/70 mb-0.5">Mensalidade</p>
            <p className="font-serif-pro font-bold text-lg text-rose-800 whitespace-nowrap">{PLUS_PRICE_LABEL}</p>
          </div>

          {error && <p className="text-xs text-rose-600 mb-3">{error}</p>}

          {confirmingCancel ? (
            <div className="rounded-xl bg-surface border border-rose-200/60 p-4">
              <p className="text-xs text-ink-soft mb-3">
                Cancelar sua assinatura do StudioMenu+? Você perde acesso à agenda automática.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingCancel(false)}
                  disabled={loading}
                  className="flex-1 h-11 rounded-xl bg-linen text-ink-soft text-sm font-bold disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
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
              onClick={() => setConfirmingCancel(true)}
              disabled={loading}
              className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold disabled:opacity-50 transition-colors"
            >
              Cancelar assinatura
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-cream border border-rose-200 p-5">
          {(subscriptionStatus === 'suspenso' || subscriptionStatus === 'cancelado') && (
            <div className="flex items-start gap-2 mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-700">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs">
                {subscriptionStatus === 'suspenso'
                  ? 'Sua assinatura está suspensa (pagamento em atraso).'
                  : 'Sua assinatura foi cancelada.'}{' '}
                Assine novamente pra reativar.
              </p>
            </div>
          )}

          {qr ? (
            <div className="flex flex-col items-center gap-3">
              <img src={`data:image/png;base64,${qr.image}`} alt="QR Code Pix" className="w-48 h-48 rounded-xl bg-white p-2 shadow-sm" />
              <p className="text-[11px] text-ink-faint text-center">Escaneie o QR code ou copie o código Pix abaixo.</p>
              <button
                type="button"
                onClick={handleCopyPix}
                className={`w-full h-11 rounded-xl text-sm font-bold transition-colors ${
                  copied ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-600 text-white hover:bg-rose-700'
                }`}
              >
                {copied ? 'Copiado ✓' : 'Copiar código Pix'}
              </button>
              {polling && <p className="text-[11px] text-ink-faint">Aguardando confirmação do pagamento...</p>}
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <div className="text-center mb-1">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
                  <Crown className="w-6 h-6" />
                </div>
                <p className="font-serif-pro font-bold text-lg text-ink">Assine o StudioMenu+</p>
                <p className="text-sm text-ink-soft mt-0.5">{PLUS_PRICE_LABEL} · libere o agendamento automático</p>
              </div>
              <input
                type="email"
                required
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl bg-surface border border-linen px-3 text-sm text-ink placeholder:text-ink-faint"
              />
              <input
                type="text"
                required
                placeholder="CPF ou CNPJ"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                className="h-11 rounded-xl bg-surface border border-linen px-3 text-sm text-ink placeholder:text-ink-faint"
              />
              {error && <p className="text-xs text-rose-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold disabled:opacity-50 transition-colors"
              >
                {loading ? 'Gerando Pix...' : `Assinar por ${PLUS_PRICE_LABEL}`}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
