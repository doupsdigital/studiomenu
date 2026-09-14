'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
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
    <section>
      <h2 className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-2">Minha assinatura</h2>

      {isActive ? (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <p className="text-sm font-bold text-emerald-300">StudioMenu+ ativo</p>
          </div>
          <p className="text-xs text-slate-400 mb-3">{PLUS_PRICE_LABEL} · cobrança recorrente via Pix</p>
          {error && <p className="text-xs text-rose-400 mb-2">{error}</p>}

          {confirmingCancel ? (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3">
              <p className="text-xs text-rose-300 mb-3">
                Cancelar sua assinatura do StudioMenu+? Você perde acesso à agenda automática.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingCancel(false)}
                  disabled={loading}
                  className="flex-1 h-10 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 h-10 rounded-xl bg-rose-500 text-white text-xs font-bold disabled:opacity-50"
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
              className="w-full h-10 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold disabled:opacity-50"
            >
              Cancelar assinatura
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
          {(subscriptionStatus === 'suspenso' || subscriptionStatus === 'cancelado') && (
            <div className="flex items-start gap-2 mb-3 text-amber-400">
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
              <img src={`data:image/png;base64,${qr.image}`} alt="QR Code Pix" className="w-48 h-48 rounded-xl bg-white p-2" />
              <p className="text-[11px] text-slate-500 text-center">Escaneie o QR code ou copie o código Pix abaixo.</p>
              <button
                type="button"
                onClick={handleCopyPix}
                className={`w-full h-10 rounded-xl text-xs font-bold ${copied ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}
              >
                {copied ? 'Copiado ✓' : 'Copiar código Pix'}
              </button>
              {polling && <p className="text-[11px] text-slate-500">Aguardando confirmação do pagamento...</p>}
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <p className="text-sm text-slate-300">
                Assine o <strong className="text-white">StudioMenu+</strong> por {PLUS_PRICE_LABEL} e libere o agendamento
                automático.
              </p>
              <input
                type="email"
                required
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-white placeholder:text-slate-600"
              />
              <input
                type="text"
                required
                placeholder="CPF ou CNPJ"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                className="h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-white placeholder:text-slate-600"
              />
              {error && <p className="text-xs text-rose-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="h-11 rounded-xl bg-rose-500 text-white text-xs font-bold disabled:opacity-50"
              >
                {loading ? 'Gerando Pix...' : `Assinar por ${PLUS_PRICE_LABEL}`}
              </button>
            </form>
          )}
        </div>
      )}
    </section>
  );
};
