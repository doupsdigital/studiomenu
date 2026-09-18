'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, BookOpen, type LucideIcon } from 'lucide-react';
import { PLAN_PRICING, type PayablePlanTier } from '@/lib/pricing';

interface PlanSubscribeCardProps {
  slug: string;
  plan: PayablePlanTier;
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

const PLAN_COPY: Record<PayablePlanTier, { icon: LucideIcon; headline: string; subheadline: string }> = {
  basico: { icon: BookOpen, headline: 'Assine o StudioMenu Básico', subheadline: 'catálogo online + edição ilimitada' },
  plus: { icon: Crown, headline: 'Assine o StudioMenu+', subheadline: 'libere o agendamento automático' },
};

/** Card de assinar (form e-mail/CPF → QR Pix → polling de confirmação) —
 *  extraído de `SubscriptionSection` (Fase 19) pra ser reaproveitado tanto
 *  lá (assinar/trocar de plano em `/config`) quanto na tela de primeiro
 *  contato (`FirstContactScreen`, assinar o Básico). Não sabe nada sobre
 *  "já está ativo" — quem chama decide quando mostrar isso. */
export const PlanSubscribeCard: React.FC<PlanSubscribeCardProps> = ({ slug, plan, billingEmail, billingCpfCnpj }) => {
  const router = useRouter();
  const copy = PLAN_COPY[plan];
  const pricing = PLAN_PRICING[plan];

  const [email, setEmail] = useState(billingEmail || '');
  const [cpfCnpj, setCpfCnpj] = useState(billingCpfCnpj || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<QrState | null>(null);
  const [polling, setPolling] = useState(false);
  const [copied, setCopied] = useState(false);
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
        body: JSON.stringify({ slug, email: email.trim(), cpf_cnpj: cpfCnpj.trim(), plan }),
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
    <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-cream border border-rose-200 p-5">
      {qr ? (
        <div className="flex flex-col items-center gap-3">
          <img src={`data:image/png;base64,${qr.image}`} alt="QR Code Pix" className="w-48 h-48 rounded-xl bg-white p-2 shadow-sm" />
          <p className="text-[13px] text-ink-faint text-center">Escaneie o QR code ou copie o código Pix abaixo.</p>
          <button
            type="button"
            onClick={handleCopyPix}
            className={`w-full h-11 rounded-xl text-sm font-bold transition-colors ${
              copied ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-600 text-white hover:bg-rose-700'
            }`}
          >
            {copied ? 'Copiado ✓' : 'Copiar código Pix'}
          </button>
          {polling && <p className="text-[13px] text-ink-faint">Aguardando confirmação do pagamento...</p>}
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
          <div className="text-center mb-1">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
              <copy.icon className="w-6 h-6" />
            </div>
            <p className="font-serif-pro font-bold text-lg text-ink">{copy.headline}</p>
            <p className="text-sm text-ink-soft mt-0.5">{pricing.label} · {copy.subheadline}</p>
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
          {error && <p className="text-[13px] text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold disabled:opacity-50 transition-colors"
          >
            {loading ? 'Gerando Pix...' : `Assinar por ${pricing.label}`}
          </button>
        </form>
      )}
    </div>
  );
};
