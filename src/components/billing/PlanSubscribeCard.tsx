'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, BookOpen, Check, CreditCard, QrCode, ExternalLink, type LucideIcon } from 'lucide-react';
import { PLAN_PRICING, type PayablePlanTier } from '@/lib/pricing';
import { formatCpfCnpj } from '@/lib/format';

interface PlanSubscribeCardProps {
  slug: string;
  plan: PayablePlanTier;
  billingEmail?: string;
  billingCpfCnpj?: string;
  /** Mostra o seletor Pix/Cartão. Escondido na troca de plano de quem já é
   *  assinante ativa (Básico → Plus): ali não tem cobrança nova, o método
   *  atual continua valendo. */
  showMethodChoice?: boolean;
}

type PaymentMethod = 'pix' | 'card';

interface QrState {
  paymentId: string;
  image: string;
  payload: string;
}

interface CardState {
  paymentId: string;
  invoiceUrl: string;
}

const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

const PLAN_COPY: Record<PayablePlanTier, { icon: LucideIcon; headline: string; subheadline: string }> = {
  basico: { icon: BookOpen, headline: 'Assine o StudioMenu Básico', subheadline: 'catálogo online + edição ilimitada' },
  plus: { icon: Crown, headline: 'Assine o StudioMenu+', subheadline: 'libere o agendamento automático' },
};

/** Copy do modal de "parabéns" pós-assinatura — mostrado tanto quando ela
 *  assina pela primeira vez (Básico, via QR/polling) quanto quando troca de
 *  plano (Básico → Plus, ativação direta, sem QR). */
const SUCCESS_COPY: Record<PayablePlanTier, { headline: string; benefits: string[] }> = {
  basico: {
    headline: 'Agora você tem o StudioMenu Básico',
    benefits: [
      'Catálogo online sempre no ar',
      'Edite fotos, preços e serviços quando quiser',
      'Link profissional pra compartilhar com suas clientes',
    ],
  },
  plus: {
    headline: 'Agora você tem o StudioMenu+',
    benefits: [
      'Clientes agendam sozinhas, a qualquer hora',
      'Agenda organizada com horários reais',
      'Menos ida e volta pelo WhatsApp',
    ],
  },
};

/** Card de assinar (form e-mail/CPF → QR Pix → polling de confirmação) —
 *  extraído de `SubscriptionSection` (Fase 19) pra ser reaproveitado tanto
 *  lá (assinar/trocar de plano em `/config`) quanto na tela de primeiro
 *  contato (`FirstContactScreen`, assinar o Básico). Não sabe nada sobre
 *  "já está ativo" — quem chama decide quando mostrar isso.
 *
 *  Sempre termina numa confirmação de sucesso (Fase 20) — nunca leva a
 *  profissional de volta pra tela seguinte em silêncio, mesmo quando não
 *  tem QR pra mostrar (troca de plano ativa na hora). */
export const PlanSubscribeCard: React.FC<PlanSubscribeCardProps> = ({ slug, plan, billingEmail, billingCpfCnpj, showMethodChoice = true }) => {
  const router = useRouter();
  const copy = PLAN_COPY[plan];
  const pricing = PLAN_PRICING[plan];
  const successCopy = SUCCESS_COPY[plan];

  const [email, setEmail] = useState(billingEmail || '');
  const [cpfCnpj, setCpfCnpj] = useState(formatCpfCnpj(billingCpfCnpj || ''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<QrState | null>(null);
  const [card, setCard] = useState<CardState | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [checking, setChecking] = useState(false);
  const [polling, setPolling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setPolling(false);
  };

  /** Consulta o pagamento uma vez; se confirmado, encerra o polling e mostra
   *  o modal de sucesso. Devolve se está ativo. */
  const checkPayment = async (paymentId: string): Promise<boolean> => {
    const res = await fetch('/api/billing/check-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, payment_id: paymentId }),
    });
    const json = await res.json();
    if (!json.active) return false;
    stopPolling();
    setQr(null);
    setCard(null);
    // NÃO chama router.refresh() aqui — faria o Next re-renderizar a
    // rota (`/inicio`) com dado fresco na hora, trocando `plan_tier`
    // e desmontando esse componente (e o modal de sucesso junto)
    // antes dela sequer ver o banner (achado testando: o refresh
    // adiantado "engolia" a comemoração). O refresh acontece só
    // quando ela mesma escolhe sair, no clique de "Ir para o Início".
    setSuccess(true);
    return true;
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
        await checkPayment(paymentId);
      } catch {
        // Falha isolada de uma tentativa de polling não interrompe o ciclo.
      }
    }, POLL_INTERVAL_MS);
  };

  /** "Já paguei" do cartão — o pagamento acontece em outra aba, então ela
   *  pode conferir na hora (ou depois que o polling automático expirou). */
  const handleCheckNow = async () => {
    if (!card) return;
    setChecking(true);
    setError(null);
    try {
      const active = await checkPayment(card.paymentId);
      if (!active) {
        setError('Ainda não recebemos a confirmação. Conclua o pagamento na página segura e tente de novo.');
        if (!pollRef.current || !polling) startPolling(card.paymentId);
      }
    } catch {
      setError('Falha na conexão.');
    } finally {
      setChecking(false);
    }
  };

  const handleChangeMethod = () => {
    stopPolling();
    setQr(null);
    setCard(null);
    setError(null);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, email: email.trim(), cpf_cnpj: cpfCnpj.trim(), plan, method: showMethodChoice ? method : undefined }),
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
      if (json.upgraded) {
        // Sem QR pra mostrar (troca de plano ativa na hora, sem cobrança
        // nova nesse instante — ver checkout/route.ts). Mesmo motivo do
        // polling acima: sem refresh adiantado, só no clique do botão.
        setSuccess(true);
        return;
      }
      if (json.method === 'card') {
        setCard({ paymentId: json.paymentId, invoiceUrl: json.invoiceUrl });
        startPolling(json.paymentId);
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

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-br from-rose-700 via-rose-600 to-rose-500 text-white text-center p-7 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
            <copy.icon className="w-7 h-7" />
          </div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-white/70 mb-1">Parabéns</p>
          <h3 className="font-serif-pro font-bold text-2xl mb-3">{successCopy.headline}</h3>
          <ul className="text-left mx-auto max-w-[230px] flex flex-col gap-1.5 mb-6">
            {successCopy.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-[13px] text-white/90 leading-snug">
                <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-300" />
                {benefit}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              router.push(`/app/${slug}/inicio`);
              router.refresh();
            }}
            className="w-full py-3 rounded-xl bg-white text-rose-700 text-sm font-bold shadow-sm hover:bg-rose-50 transition-colors"
          >
            Ir para o Início
          </button>
        </div>
      </div>
    );
  }

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
          {showMethodChoice && (
            <button type="button" onClick={handleChangeMethod} className="text-[13px] font-semibold text-rose-700 underline underline-offset-2">
              Trocar forma de pagamento
            </button>
          )}
        </div>
      ) : card ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <p className="font-serif-pro font-bold text-lg text-ink">Finalize o pagamento</p>
          <p className="text-[13px] text-ink-soft">
            Você vai digitar o cartão numa página segura do Asaas. Quando terminar, volte aqui — a confirmação aparece sozinha.
          </p>
          <a
            href={card.invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir pagamento seguro
          </a>
          {polling && <p className="text-[13px] text-ink-faint">Aguardando confirmação do pagamento...</p>}
          {error && <p className="text-[13px] text-rose-600">{error}</p>}
          <button
            type="button"
            onClick={handleCheckNow}
            disabled={checking}
            className="w-full h-11 rounded-xl bg-surface border border-rose-200 text-rose-700 text-sm font-bold disabled:opacity-50 transition-colors"
          >
            {checking ? 'Verificando...' : 'Já paguei, verificar agora'}
          </button>
          <button type="button" onClick={handleChangeMethod} className="text-[13px] font-semibold text-rose-700 underline underline-offset-2">
            Trocar forma de pagamento
          </button>
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
            className="h-12 rounded-xl bg-surface border border-linen px-3 text-base text-ink placeholder:text-ink-faint"
          />
          <input
            type="text"
            inputMode="numeric"
            required
            placeholder="CPF ou CNPJ"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
            maxLength={18}
            className="h-12 rounded-xl bg-surface border border-linen px-3 text-base text-ink placeholder:text-ink-faint"
          />
          {showMethodChoice && (
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Forma de pagamento">
              {(
                [
                  { key: 'pix', label: 'Pix', hint: 'Recomendado', Icon: QrCode },
                  { key: 'card', label: 'Cartão', hint: 'Crédito', Icon: CreditCard },
                ] as const
              ).map(({ key, label, hint, Icon }) => {
                const selected = method === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setMethod(key)}
                    className={`relative flex flex-col items-center gap-0.5 rounded-xl border-2 px-3 py-3 transition-colors ${
                      selected
                        ? 'border-rose-600 bg-rose-600 text-white shadow-md shadow-rose-600/30'
                        : 'border-linen bg-surface text-ink-faint'
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white text-rose-600 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </span>
                    )}
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-bold">{label}</span>
                    <span
                      className={`text-[11px] ${
                        selected ? 'font-semibold text-white/90' : key === 'pix' ? 'font-bold text-emerald-600' : 'text-ink-faint'
                      }`}
                    >
                      {hint}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {error && <p className="text-[13px] text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold disabled:opacity-50 transition-colors"
          >
            {loading
              ? showMethodChoice && method === 'card'
                ? 'Preparando pagamento...'
                : 'Gerando Pix...'
              : showMethodChoice && method === 'card'
                ? 'Continuar pro pagamento seguro'
                : `Assinar por ${pricing.label}`}
          </button>
        </form>
      )}
    </div>
  );
};
