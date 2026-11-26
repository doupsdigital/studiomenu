'use client';

import React, { useEffect, useRef, type CSSProperties } from 'react';
import { CAKTO_ANUAL_PRICE, CAKTO_MENSAL_PRICE } from '@/lib/pricing';
import type { SelfServeOfferMode } from '@/lib/cakto-checkout';
import { firstName, trackFunnel, type CaktoPlanKey, type FunnelPreview } from './funnel';

interface SelfServeOfferProps {
  preview: FunnelPreview | null;
  /** `ambos` = as 2 opções lado a lado; `anual`/`mensal` = só aquele plano,
   *  num cartão único, sem comparação (teste A/B, 2026-11-23). */
  offer: SelfServeOfferMode;
  onCheckout: (plan: CaktoPlanKey) => void;
  onCreateFirst: () => void;
  /** "Ainda tenho dúvidas" (2026-11-26) → rola até o FAQ. */
  onShowFaq: () => void;
}

/** Garantia legal de arrependimento (CDC, art. 49) — a mesma configurada
 *  nos 2 produtos da Cakto. */
export const GUARANTEE_DAYS = 7;

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

/** Oferta da página `/lash` (2026-11-17): Anual em destaque (o que a dona
 *  quer estimular) e Mensal com "cancele quando quiser" bem visível. Os dois
 *  aceitam Pix ou cartão (2026-11-23). Com `offer` = um plano só, vira um
 *  cartão único sem "mais vantajoso"/"economize" — não há com o que
 *  comparar. Personalizada quando já existe prévia (nome; o "guardado por
 *  mais Xh" do topo saiu a pedido da dona, 2026-11-26). */
export const SelfServeOffer: React.FC<SelfServeOfferProps> = ({ preview, offer, onCheckout, onCreateFirst, onShowFaq }) => {
  const sectionRef = useRef<HTMLElement>(null);

  // `offer_view` uma vez, quando os preços entram na tela (2026-11-26).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        trackFunnel('offer_view');
        observer.disconnect();
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const [annualWhole, annualCents] = brl(CAKTO_ANUAL_PRICE).split(',');
  const [monthlyWhole, monthlyCents] = brl(CAKTO_MENSAL_PRICE).split(',');
  const single = offer !== 'ambos';

  const annualCard = (
    <div className="lp-pricing-tier-card lp-pricing-tier-card--vip" data-reveal>
      <div className="lp-tier-badge lp-tier-badge--vip">{single ? '⭐ 1 ANO DE ACESSO' : '⭐ MAIS VANTAJOSO'}</div>
      <h3 className="lp-tier-title">{single ? 'StudioMenu Anual' : 'Anual'}</h3>
      <div className="lp-tier-price-box">
        <div className="lp-tier-price-main">
          <span className="lp-tier-currency">R$</span>
          <span className="lp-tier-val">{annualWhole}</span>
          <span className="lp-tier-cents">,{annualCents}</span>
          <span className="lp-tier-period">/ano</span>
        </div>
        <div className="lp-tier-price-sub">= R$ {brl(ANNUAL_PER_MONTH)} por mês</div>
      </div>
      {!single && <p className="lp-ss-savings">Economize R$ {brl(ANNUAL_SAVINGS)} no ano</p>}
      <ul className="lp-tier-bullets">
        <li>{CHECK}<span><strong>Pague uma vez, sem mensalidade</strong></span></li>
        {/* Âncora de valor (2026-11-26): saiu do topo da seção e veio pra cá. */}
        <li className="lp-tier-bullet--value-anchor">{CHECK}<span><strong>Uma cliente a mais já paga o ano</strong></span></li>
        <li>{CHECK}<span>Pix ou cartão de crédito</span></li>
        <li>{CHECK}<span>Seu menu no ar por 12 meses</span></li>
        <li>{CHECK}<span>Edite serviços, fotos e preços pelo celular</span></li>
        <li>{CHECK}<span>Ativação na hora</span></li>
      </ul>
      <button type="button" className="lp-btn lp-btn--primary lp-ss-btn-block lp-tier-cta-pulse" onClick={() => onCheckout('anual')}>
        {single ? 'ATIVAR MEU MENU' : 'ATIVAR ANUAL'}
      </button>
    </div>
  );

  const monthlyCard = (
    <div
      className={`lp-pricing-tier-card${single ? ' lp-pricing-tier-card--vip' : ''}`}
      data-reveal
      style={single ? undefined : ({ '--reveal-delay': '0.12s' } as CSSProperties)}
    >
      <div className={`lp-tier-badge ${single ? 'lp-tier-badge--vip' : 'lp-tier-badge--basic'}`}>
        {single ? '🔁 ASSINATURA MENSAL' : '🔁 MENSAL'}
      </div>
      <h3 className="lp-tier-title">{single ? 'StudioMenu Mensal' : 'Mensal'}</h3>
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
        {/* Âncora de valor (2026-11-26): saiu do topo da seção e veio pra cá. */}
        <li className="lp-tier-bullet--value-anchor">{CHECK}<span><strong>Custa menos que uma manutenção</strong></span></li>
        <li>{CHECK}<span>Pix automático ou cartão de crédito</span></li>
        <li>{CHECK}<span>Pague pouco por mês para testar com suas clientes</span></li>
        <li>{CHECK}<span>Edite serviços, fotos e preços pelo celular</span></li>
        <li>{CHECK}<span>Ativação na hora</span></li>
      </ul>
      <button
        type="button"
        className={`lp-btn lp-btn--primary lp-ss-btn-block${single ? ' lp-tier-cta-pulse' : ''}`}
        onClick={() => onCheckout('mensal')}
      >
        {single ? 'ATIVAR MEU MENU' : 'ATIVAR MENSAL'}
      </button>
    </div>
  );

  return (
    <section id="oferta" className="lp-pricing-section lp-ss-offer" ref={sectionRef}>
      <div className="lp-container">
        <div className="lp-pricing-header-title" data-reveal>
          {preview ? (
            <>
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

        <div className={`lp-pricing-tier-grid lp-ss-tier-grid${single ? ' lp-pricing-tier-grid--single' : ''}`}>
          {offer !== 'mensal' && annualCard}
          {offer !== 'anual' && monthlyCard}
        </div>

        <div className="lp-ss-guarantee" data-reveal>
          <span className="lp-ss-guarantee-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </span>
          <div>
            <strong>Garantia de {GUARANTEE_DAYS} dias</strong>
            <span>Se não gostar, devolvemos 100% do valor. Sem perguntas.</span>
          </div>
        </div>

        <p className="lp-ss-offer-doubts">
          <button
            type="button"
            className="lp-ss-text-link"
            onClick={() => {
              trackFunnel('faq_jump_click');
              onShowFaq();
            }}
          >
            Ainda tenho dúvidas
          </button>
        </p>

        {!preview && (
          <p className="lp-ss-offer-nudge">
            Quer ver como fica com o seu nome antes?{' '}
            <button type="button" className="lp-ss-text-link" onClick={onCreateFirst}>
              Criar minha prévia grátis
            </button>
          </p>
        )}

        {/* "Depois de pagar" (2026-11-26): mostra o caminho REAL pós-compra —
            ativação na hora (`/ativando` loga sozinho), e-mail de acesso
            (webhook da Cakto), passo a passo (Primeiros passos) e suporte
            pelo WhatsApp (card no Início do app). Passa segurança de que
            ela não fica sozinha depois de pagar. */}
        <div className="lp-ss-after" data-reveal>
          <h3 className="lp-ss-after-title">Como funciona depois de pagar</h3>
          <ol className="lp-ss-after-steps">
            {[
              { t: 'Acesso no seu e-mail', d: 'Pagou, recebe na hora o seu acesso.' },
              { t: 'Seu app exclusivo', d: 'É nele que você edita o seu menu, pelo celular.' },
              { t: 'Passo a passo guiado', d: 'Troque serviços, preços e fotos em minutos.' },
              { t: 'Link na bio', d: 'Suas clientes escolhem e chamam no seu WhatsApp.' },
            ].map((step, i) => (
              <li key={step.t}>
                <span className="lp-ss-after-num">{i + 1}</span>
                <div>
                  <strong>{step.t}</strong>
                  <p>{step.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="lp-ss-after-support">💬 Suporte pelo WhatsApp em até 24h</p>
        </div>
      </div>
    </section>
  );
};
