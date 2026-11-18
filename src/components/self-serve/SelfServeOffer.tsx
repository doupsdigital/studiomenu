'use client';

import React, { type CSSProperties } from 'react';
import { CAKTO_ANUAL_PRICE, CAKTO_MENSAL_PRICE } from '@/lib/pricing';
import { firstName, formatHoursMinutes, useRemaining, type CaktoPlanKey, type FunnelPreview } from './funnel';

interface SelfServeOfferProps {
  preview: FunnelPreview | null;
  onCheckout: (plan: CaktoPlanKey) => void;
  onCreateFirst: () => void;
}

function brl(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

const CHECK = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ANNUAL_PER_MONTH = CAKTO_ANUAL_PRICE / 12;
const ANNUAL_SAVINGS = CAKTO_MENSAL_PRICE * 12 - CAKTO_ANUAL_PRICE;

/** Oferta da página `/lash` (2026-11-17): Anual no Pix em destaque (o que a
 *  dona quer estimular) e Mensal no cartão com "cancele quando quiser" bem
 *  visível. Personalizada quando já existe prévia (nome + tempo restante). */
export const SelfServeOffer: React.FC<SelfServeOfferProps> = ({ preview, onCheckout, onCreateFirst }) => {
  const remaining = useRemaining(preview?.expiresAt, 30_000);
  const [annualWhole, annualCents] = brl(CAKTO_ANUAL_PRICE).split(',');
  const [monthlyWhole, monthlyCents] = brl(CAKTO_MENSAL_PRICE).split(',');

  return (
    <section id="oferta" className="lp-pricing-section lp-ss-offer">
      <div className="lp-container">
        <div className="lp-pricing-header-title" data-reveal>
          {preview ? (
            <>
              <p className="lp-ss-offer-kicker">
                {remaining !== null && remaining > 0
                  ? `Seu menu está guardado por mais ${formatHoursMinutes(remaining)}`
                  : 'Seu menu está guardado'}
              </p>
              <h2 className="lp-section-title">
                {firstName(preview.name)}, ative seu menu e comece a usar hoje
              </h2>
              <div className="lp-ss-link-pill lp-ss-link-pill--center">
                <span className="lp-ss-link-dot" aria-hidden="true" />
                {preview.displayUrl}
              </div>
            </>
          ) : (
            <h2 className="lp-section-title">Ative seu Menu Digital</h2>
          )}
        </div>

        <div className="lp-pricing-tier-grid lp-ss-tier-grid">
          {/* Anual — destaque */}
          <div className="lp-pricing-tier-card lp-pricing-tier-card--vip" data-reveal>
            <div className="lp-tier-badge lp-tier-badge--vip">⭐ MAIS VANTAJOSO</div>
            <h3 className="lp-tier-title">Anual no Pix</h3>
            <div className="lp-tier-price-box">
              <div className="lp-tier-price-main">
                <span className="lp-tier-currency">R$</span>
                <span className="lp-tier-val">{annualWhole}</span>
                <span className="lp-tier-cents">,{annualCents}</span>
                <span className="lp-tier-period">/ano</span>
              </div>
              <div className="lp-tier-price-sub">= R$ {brl(ANNUAL_PER_MONTH)} por mês</div>
            </div>
            <p className="lp-ss-savings">Economize R$ {brl(ANNUAL_SAVINGS)} no ano</p>
            <ul className="lp-tier-bullets">
              <li>{CHECK}<span><strong>Pague uma vez no Pix, sem mensalidade</strong></span></li>
              <li>{CHECK}<span>Seu menu no ar por 12 meses</span></li>
              <li>{CHECK}<span>Edite serviços, fotos e preços pelo celular</span></li>
              <li>{CHECK}<span>Ativação na hora, assim que o Pix cair</span></li>
            </ul>
            <button type="button" className="lp-btn lp-btn--primary lp-ss-btn-block lp-tier-cta-pulse" onClick={() => onCheckout('anual')}>
              ATIVAR COM PIX
            </button>
          </div>

          {/* Mensal */}
          <div className="lp-pricing-tier-card" data-reveal style={{ '--reveal-delay': '0.12s' } as CSSProperties}>
            <div className="lp-tier-badge lp-tier-badge--basic">🔁 MENSAL</div>
            <h3 className="lp-tier-title">Mensal no cartão</h3>
            <div className="lp-tier-price-box">
              <div className="lp-tier-price-main">
                <span className="lp-tier-currency">R$</span>
                <span className="lp-tier-val">{monthlyWhole}</span>
                <span className="lp-tier-cents">,{monthlyCents}</span>
                <span className="lp-tier-period">/mês</span>
              </div>
            </div>
            <div className="lp-ss-cancel-box">
              <strong>Cancele quando quiser</strong>
              <span>Sem fidelidade · sem multa</span>
            </div>
            <ul className="lp-tier-bullets">
              <li>{CHECK}<span>Pague pouco por mês para testar com suas clientes</span></li>
              <li>{CHECK}<span>Edite serviços, fotos e preços pelo celular</span></li>
              <li>{CHECK}<span>Ativação na hora</span></li>
            </ul>
            <button type="button" className="lp-btn lp-btn--primary lp-ss-btn-block" onClick={() => onCheckout('mensal')}>
              ATIVAR NO CARTÃO
            </button>
          </div>
        </div>

        {!preview && (
          <p className="lp-ss-offer-nudge">
            Quer ver como fica com o seu nome antes?{' '}
            <button type="button" className="lp-ss-text-link" onClick={onCreateFirst}>
              Criar minha prévia grátis
            </button>
          </p>
        )}

        <div className="lp-ss-after" data-reveal>
          <h3 className="lp-ss-after-title">O que acontece depois de pagar</h3>
          <ol className="lp-ss-after-steps">
            <li>
              <span className="lp-ss-after-num">1</span>
              <div>
                <strong>Seu menu é ativado na hora</strong>
                <p>O mesmo link que você acabou de ver passa a ser seu.</p>
              </div>
            </li>
            <li>
              <span className="lp-ss-after-num">2</span>
              <div>
                <strong>Você entra no seu app</strong>
                <p>Um passo a passo mostra exatamente onde tocar para editar.</p>
              </div>
            </li>
            <li>
              <span className="lp-ss-after-num">3</span>
              <div>
                <strong>Coloca seus serviços e preços</strong>
                <p>Depois é só colocar o link na bio do Instagram e mandar no WhatsApp.</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
};
