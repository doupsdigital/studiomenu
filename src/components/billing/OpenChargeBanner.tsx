'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CalendarClock, CheckCircle2, ExternalLink } from 'lucide-react';

interface OpenChargeBannerProps {
  slug: string;
}

interface OpenCharge {
  paymentId: string;
  value: number;
  dueDate: string | null;
  overdue: boolean;
  billingType: 'pix' | 'card';
  invoiceUrl: string | null;
}

interface QrState {
  image: string;
  payload: string;
}

const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

const formatMoney = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Aviso "pague sua mensalidade" no Início. O Pix recorrente NÃO debita
 *  sozinho: todo mês o Asaas cria uma cobrança nova e a profissional precisa
 *  pagar o Pix — sem esse aviso, ela só ficaria sabendo pelo e-mail do Asaas
 *  (Fase 21). Cartão só aparece quando a cobrança automática falhou (vencida);
 *  antes disso o Asaas cobra sozinho e não há nada pra ela fazer. Some sozinho
 *  quando não há cobrança em aberto — e qualquer erro na consulta também
 *  esconde o aviso, nunca quebra o Início. */
export const OpenChargeBanner: React.FC<OpenChargeBannerProps> = ({ slug }) => {
  const router = useRouter();
  const [charge, setCharge] = useState<OpenCharge | null>(null);
  const [qr, setQr] = useState<QrState | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [polling, setPolling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/billing/open-charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        });
        const json = await res.json();
        if (cancelled || !json.success || !json.open) return;
        setCharge({
          paymentId: json.paymentId,
          value: json.value,
          dueDate: json.dueDate,
          overdue: json.overdue,
          billingType: json.billingType,
          invoiceUrl: json.invoiceUrl,
        });
      } catch {
        // Sem aviso é melhor que Início quebrado.
      }
    })();
    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [slug]);

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setPolling(false);
  };

  const startPolling = (paymentId: string) => {
    stopPolling();
    setPolling(true);
    const startedAt = Date.now();
    pollRef.current = setInterval(async () => {
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        stopPolling();
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
          stopPolling();
          setQr(null);
          setPaid(true);
          router.refresh();
        }
      } catch {
        // Falha isolada de uma tentativa não interrompe o ciclo.
      }
    }, POLL_INTERVAL_MS);
  };

  const handlePay = async () => {
    if (!charge) return;
    setLoadingQr(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/open-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, withQr: true }),
      });
      const json = await res.json();
      if (!json.success || !json.open || !json.pixKey) {
        setError('Não foi possível gerar o Pix agora. Tente de novo em instantes.');
        return;
      }
      setQr({ image: json.pixQrCodeImage, payload: json.pixKey });
      startPolling(json.paymentId);
    } catch {
      setError('Falha na conexão.');
    } finally {
      setLoadingQr(false);
    }
  };

  const handleCopy = async () => {
    if (!qr) return;
    try {
      await navigator.clipboard.writeText(qr.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ação secundária, sem fallback
    }
  };

  if (paid) {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-800">
        <CheckCircle2 className="w-6 h-6 shrink-0" />
        <p className="text-[15px] font-bold">Pagamento confirmado. Obrigada!</p>
      </div>
    );
  }

  if (!charge) return null;
  // Cartão em dia: o Asaas cobra sozinho na data, nada pra ela fazer.
  if (charge.billingType === 'card' && !charge.overdue) return null;

  const dueLabel = charge.dueDate ? formatDate(charge.dueDate) : null;
  const Icon = charge.overdue ? AlertTriangle : CalendarClock;
  const title = charge.overdue
    ? charge.billingType === 'card'
      ? 'Não conseguimos cobrar seu cartão'
      : `Sua mensalidade venceu${dueLabel ? ` em ${dueLabel}` : ''}`
    : `Sua mensalidade vence${dueLabel ? ` em ${dueLabel}` : ''}`;

  return (
    <div
      className={`rounded-2xl border p-4 ${
        charge.overdue ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-rose-50 border-rose-200 text-rose-900'
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 shrink-0 mt-0.5 ${charge.overdue ? 'text-amber-600' : 'text-rose-600'}`} />
        <div className="min-w-0 flex-1">
          <p className="font-serif-pro font-bold text-lg leading-tight">{title}</p>
          <p className="text-[15px] mt-0.5 opacity-80">
            {charge.billingType === 'card'
              ? `${formatMoney(charge.value)} — abra a cobrança pra pagar com o cartão.`
              : `${formatMoney(charge.value)} — pague o Pix pra manter seu plano em dia.`}
          </p>
        </div>
      </div>

      {qr ? (
        <div className="flex flex-col items-center gap-3 mt-4">
          <img src={`data:image/png;base64,${qr.image}`} alt="QR Code Pix" className="w-44 h-44 rounded-xl bg-white p-2 shadow-sm" />
          <button
            type="button"
            onClick={handleCopy}
            className={`w-full h-11 rounded-xl text-[15px] font-bold transition-colors ${
              copied ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-600 text-white hover:bg-rose-700'
            }`}
          >
            {copied ? 'Copiado ✓' : 'Copiar código Pix'}
          </button>
          {polling && <p className="text-sm opacity-70">Aguardando confirmação do pagamento...</p>}
        </div>
      ) : charge.billingType === 'card' ? (
        charge.invoiceUrl && (
          <a
            href={charge.invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-bold transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir cobrança
          </a>
        )
      ) : (
        <>
          {error && <p className="text-sm text-rose-600 mt-3">{error}</p>}
          <button
            type="button"
            onClick={handlePay}
            disabled={loadingQr}
            className="mt-4 w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-bold disabled:opacity-50 transition-colors"
          >
            {loadingQr ? 'Gerando Pix...' : 'Pagar agora com Pix'}
          </button>
        </>
      )}
    </div>
  );
};
