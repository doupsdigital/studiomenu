'use client';

import React, { useState } from 'react';
import { ChevronDown, CreditCard, QrCode, AlertTriangle, Crown } from 'lucide-react';
import { CAKTO_CHECKOUT_URLS } from '@/lib/cakto-checkout';
import { CAKTO_ANUAL_PRICE, CAKTO_MENSAL_PRICE } from '@/lib/pricing';

interface CaktoPlanCardProps {
  plan: 'mensal' | 'anual' | null;
  status: 'none' | 'ativo' | 'suspenso' | 'cancelado';
  paidUntil: string | null;
  checkoutRef: string | null;
}

/** Mesma folga do servidor (`CAKTO_GRACE_MS`, `src/lib/cakto.ts` — arquivo
 *  server-only, por isso repetido aqui). Só decide o texto do card. */
const GRACE_MS = 3 * 24 * 60 * 60 * 1000;
const RENEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const SUPPORT_WHATSAPP = '5562991083435';
/** Portal da Cakto onde a assinante vê, altera ou cancela a assinatura
 *  sozinha, entrando com o e-mail da compra (central de ajuda da Cakto,
 *  conferido em 2026-11-18). O WhatsApp do suporte fica como reserva. */
const CAKTO_SUBSCRIPTION_PORTAL_URL = 'https://assinatura.cakto.com.br/';

function brl(value: number) {
  return value.toFixed(2).replace('.', ',');
}

function formatDate(iso: string, withYear: boolean) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    ...(withYear ? { year: 'numeric' } : {}),
  });
}

function checkoutUrl(plan: 'mensal' | 'anual', ref: string | null) {
  const url = new URL(CAKTO_CHECKOUT_URLS[plan]);
  if (ref) url.searchParams.set('sck', ref);
  return url.toString();
}

/** Card "Meu plano" do Início pra quem comprou pela Cakto (funil `/lash`,
 *  2026-11-18). A aba Config (onde fica o card de assinatura do Asaas) é
 *  escondida no produto "Catálogo apenas", então o plano e o "como
 *  cancelar" moram aqui. Renovar/reativar usa o checkout da Cakto com o
 *  `sck` do catálogo — o webhook estende o `paid_until` deste mesmo menu. */
export const CaktoPlanCard: React.FC<CaktoPlanCardProps> = ({ plan, status, paidUntil, checkoutRef }) => {
  const [showCancel, setShowCancel] = useState(false);
  const now = Date.now();
  const paidUntilMs = paidUntil ? new Date(paidUntil).getTime() : 0;
  const lapsed = !paidUntil || paidUntilMs + GRACE_MS < now;
  const isAnual = plan === 'anual';
  const untilLabel = paidUntil ? formatDate(paidUntil, true) : '';

  const reactivateButtons = (
    <div className="flex flex-col gap-2 mt-4">
      <a
        href={checkoutUrl('anual', checkoutRef)}
        className="h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-bold flex items-center justify-center gap-2 transition-colors"
      >
        <QrCode className="w-4 h-4" />
        Anual no Pix · R$ {brl(CAKTO_ANUAL_PRICE)}
      </a>
      <a
        href={checkoutUrl('mensal', checkoutRef)}
        className="h-12 rounded-xl border-2 border-rose-600 text-rose-600 text-[15px] font-bold flex items-center justify-center gap-2"
      >
        <CreditCard className="w-4 h-4" />
        Mensal no cartão · R$ {brl(CAKTO_MENSAL_PRICE)}
      </a>
    </div>
  );

  // Fora do ar (venceu, reembolso, renovação recusada há mais de 3 dias).
  if (lapsed) {
    return (
      <div className="rounded-2xl p-5 bg-rose-50 border-2 border-rose-300">
        <p className="flex items-center gap-2 font-bold text-[17px] text-rose-800">
          <AlertTriangle className="w-5 h-5" />
          Seu menu está fora do ar
        </p>
        <p className="text-[15px] text-rose-800/80 mt-1.5 leading-relaxed">
          Suas clientes não conseguem ver seus serviços agora. Ative de novo e ele volta na hora, do jeito que você deixou.
        </p>
        {reactivateButtons}
      </div>
    );
  }

  // Renovação do cartão recusada (ainda dentro da folga).
  if (status === 'suspenso') {
    return (
      <div className="rounded-2xl p-5 bg-amber-50 border-2 border-amber-300">
        <p className="flex items-center gap-2 font-bold text-[17px] text-amber-900">
          <AlertTriangle className="w-5 h-5" />
          A renovação no cartão não passou
        </p>
        <p className="text-[15px] text-amber-900/80 mt-1.5 leading-relaxed">
          Seu menu continua no ar por mais alguns dias. Pra não sair do ar, ative de novo:
        </p>
        {reactivateButtons}
      </div>
    );
  }

  // Cancelou: continua no ar até o fim do período pago.
  if (status === 'cancelado') {
    return (
      <div className="rounded-2xl p-5 bg-surface border border-linen">
        <p className="font-bold text-[17px] text-ink">Assinatura cancelada</p>
        <p className="text-[15px] text-ink-soft mt-1.5 leading-relaxed">
          Seu menu continua no ar até <strong className="text-ink">{untilLabel}</strong>. Mudou de ideia? É só ativar de novo:
        </p>
        {reactivateButtons}
      </div>
    );
  }

  const nearEnd = isAnual && paidUntilMs - now < RENEW_WINDOW_MS;

  return (
    <div className="rounded-2xl p-5 bg-surface border border-linen">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
          <Crown className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[17px] text-ink leading-tight">
            {isAnual ? 'Plano Anual' : 'Plano Mensal'} <span className="text-emerald-600 text-sm font-bold">· ativo</span>
          </p>
          <p className="text-sm text-ink-soft mt-0.5">
            {isAnual
              ? `Seu menu está garantido até ${untilLabel}`
              : `R$ ${brl(CAKTO_MENSAL_PRICE)}/mês no cartão · renova por volta de ${paidUntil ? formatDate(paidUntil, false) : ''}`}
          </p>
        </div>
      </div>

      {nearEnd && (
        <a
          href={checkoutUrl('anual', checkoutRef)}
          className="mt-4 h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <QrCode className="w-4 h-4" />
          Renovar por mais 1 ano · R$ {brl(CAKTO_ANUAL_PRICE)}
        </a>
      )}

      {!isAnual && (
        <div className="mt-3 border-t border-linen pt-3">
          <button
            type="button"
            onClick={() => setShowCancel((v) => !v)}
            aria-expanded={showCancel}
            className="w-full flex items-center justify-between text-[14px] font-semibold text-ink-soft"
          >
            Como cancelar
            <ChevronDown className={`w-4 h-4 transition-transform ${showCancel ? 'rotate-180' : ''}`} />
          </button>
          {showCancel && (
            <div className="mt-2 text-[14px] text-ink-soft leading-relaxed">
              <p>
                Você pode cancelar quando quiser, <strong className="text-ink">sem multa e sem fidelidade</strong>. Seu menu continua no ar
                até o fim do mês que você já pagou.
              </p>
              <p className="mt-2">
                É só entrar no portal de assinaturas da Cakto com o <strong className="text-ink">e-mail que você usou na compra</strong>.
              </p>
              <a
                href={CAKTO_SUBSCRIPTION_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex h-10 px-4 rounded-xl border border-linen text-ink text-[14px] font-bold items-center"
              >
                Abrir portal de assinaturas
              </a>
              <a
                href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent('Oi! Quero cancelar a assinatura mensal do meu StudioMenu.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-[13px] font-semibold text-rose-600 underline underline-offset-2"
              >
                Não conseguiu? Fale com a gente
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
