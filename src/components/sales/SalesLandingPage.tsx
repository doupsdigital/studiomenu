'use client';

import { useState, type CSSProperties } from 'react';
import { capture } from '@/lib/analytics';
import { AGENDA_PRICE } from '@/lib/pricing';
import { HeroMockup } from './HeroMockup';
import { MockupModal } from './MockupModal';
import { HowItWorksSection } from './HowItWorksSection';
import { FaqSection } from './FaqSection';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import type { LandingNicheContent } from '@/data/landing-niche-content';

/** Evento nomeado pros 3 CTAs de maior valor, além do clique "cru" que o
 *  autocapture do PostHog já pega sozinho em qualquer botão/link — nomear
 *  facilita muito montar funil de conversão depois (2026-10-13). */
function trackCta(plan: 'catalogo' | 'vitalicio' | 'anual' | 'duvida_generica', properties?: Record<string, unknown>) {
  capture('cta_click', { plan, ...properties });
}

const WHATSAPP_NUMBER = '5562991083435';

/** Estrutura e classes CSS espelham quase 1:1 `legacy/vendas/lpb/index.html`
 *  + `css/style.css` (ver `src/styles/landing-lpb.css`) — pedido explícito
 *  da usuária pra bater exatamente no layout/cores/tema original, depois
 *  de uma primeira versão em Tailwind solto ter saído com tamanhos e fonte
 *  diferentes (2026-09-23). Só mudam: copy/CTAs (StudioMenu multi-nicho,
 *  não LashMenu só-lash) e a seção de oferta (assinatura mensal real, não
 *  o pagamento único antigo). */
const AVATARS = ['/landing/avatar-lash-1.webp', '/landing/avatar-lash-2.webp', '/landing/avatar-lash-3.webp'];

const TESTIMONIALS = [
  { name: 'Mariana A.', avatar: AVATARS[0], quote: 'Coloquei o link do Menu Digital na bio do Instagram e minhas clientes amaram! Muito mais sofisticado.' },
  { name: 'Camila R.', avatar: AVATARS[1], quote: 'Ninguém mais pede desconto. O Menu Digital valorizou muito o meu studio!' },
  { name: 'Juliana S.', avatar: AVATARS[2], quote: 'Entregaram meu Menu Digital pronto no meu WhatsApp em menos de 24 horas!' },
  { name: 'Fernanda M.', avatar: AVATARS[0], quote: 'As clientes entram no link, veem as fotos e já chegam no WhatsApp sabendo exatamente o que querem agendar!' },
  { name: 'Beatriz K.', avatar: AVATARS[1], quote: 'Melhor investimento do ano pro meu studio. O Menu Digital pagou-se logo nos primeiros agendamentos!' },
];

const CHECK_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* Mesmo ícone do botão flutuante de WhatsApp (sticky bar, mais abaixo) —
 *  pedido real, 2026-10-14: deixar explícito que o CTA abre o WhatsApp. */
const WHATSAPP_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.278.444-1.157 4.226 4.326-1.134.42.259z" />
  </svg>
);

function whatsappLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/** Separa em parte inteira + centavos pro card de preço (o "R$" e o
 *  número grande são um span, os centavos outro span menor — mesmo
 *  recorte visual da `lpb` original). */
function priceParts(price: number): { whole: string; cents: string } {
  const [whole, cents] = price.toFixed(2).split('.');
  return { whole, cents };
}

// Teste de X1, 2026-10-08 (temporário, só pra essa campanha): manda os leads
// direto pra landing em vez do script de WhatsApp — por isso os preços aqui
// são valores de teste à parte, não os de verdade (`CATALOGO_PRICE`) usados
// no checkout/admin.
const TEST_CATALOGO_PRICE = 22.9;
const TEST_VITALICIO_PRICE = 197;

/** Plano Anual — substitui o Vitalício na oferta a partir de 2026-10-15
 *  (pedido real: mudança de estratégia de vendas, Vitalício fica comentado
 *  mais abaixo em vez de apagado, pra reverter rápido se quiser voltar).
 *  O desconto real contra 12x o Mensal (`TEST_CATALOGO_PRICE`) dá ~49,09% —
 *  fixado em 50 de propósito pro badge (decisão 2026-10-15: número redondo
 *  converte mais que "49%", que soa um cálculo estranho). Não é mais uma
 *  fórmula reativa — se qualquer um dos 2 preços mudar, decidir manualmente
 *  se o 50% continua representativo o suficiente. */
const TEST_ANUAL_PRICE = 139.9;
const ANUAL_DISCOUNT_PERCENT = 50;

interface SalesLandingPageProps {
  content: LandingNicheContent;
  variant?: 'longa' | 'curta';
}

export function SalesLandingPage({ content, variant = 'longa' }: SalesLandingPageProps) {
  const isCurta = variant === 'curta';
  const catalogoParts = priceParts(TEST_CATALOGO_PRICE);
  const vitalicioParts = priceParts(TEST_VITALICIO_PRICE);
  // Teste de plano único anual (pedido real, 2026-10-19) — quando o nicho
  // tem `singleAnnualPlanTest`, preço/âncora/CTA vêm dele; senão, os
  // valores padrão de sempre (2 planos, desconto fixo). O desconto agora é
  // sempre CALCULADO (preço vs âncora) em vez de fixo — só dá 50 "redondo"
  // por coincidência no caso padrão (139,90 vs 12x o Mensal já decidido
  // antes); no teste de plano único (199,90 → 129,90) dá 35%, de verdade.
  const singlePlanTest = content.singleAnnualPlanTest;
  const anualPrice = singlePlanTest?.price ?? TEST_ANUAL_PRICE;
  const anualParts = priceParts(anualPrice);
  const anualAnchorParts = singlePlanTest ? priceParts(singlePlanTest.anchorPrice) : null;
  const anualDiscountPercent = singlePlanTest
    ? Math.round((1 - singlePlanTest.price / singlePlanTest.anchorPrice) * 100)
    : ANUAL_DISCOUNT_PERCENT;
  const anualCtaLabel = singlePlanTest?.ctaLabel ?? 'QUERO O PLANO ANUAL';
  /* Mensagem do WhatsApp:
   *  Diferenciada por variante para rastreio direto no WhatsApp sem alterar Meta Ads:
   *  - Curta: termina com '✨' (mensagem mais direta)
   *  - Longa: termina com '😊' (mensagem clássica) */
  const anualWhatsappMessage = singlePlanTest
    ? isCurta
      ? `Oi! Vi o StudioMenu pra ${singlePlanTest.nicheLabel} e quero testar o Menu Digital no meu studio ✨`
      : `Oi! Vi a página do StudioMenu pra ${singlePlanTest.nicheLabel} e quero testar como ficaria o Menu Digital no meu studio 😊`
    : `Olá! Vi a página do StudioMenu e quero o Menu Digital Plano Anual por R$${anualParts.whole},${anualParts.cents}, pagamento único`;
  const agendaParts = priceParts(AGENDA_PRICE);
  const [mockupOpen, setMockupOpen] = useState(false);
  useScrollReveal();

  return (
    <div className="lp-lashmenu">
      {/* Barra de Anúncio / Prova Social */}
      <div className="lp-top-bar">
        <div className="lp-container">
          <div className="lp-announcement-content">
            <div className="lp-topbar-avatars">
              {AVATARS.map((src, i) => (
                <img key={i} src={src} alt="Profissional StudioMenu" className="lp-topbar-avatar" />
              ))}
            </div>
            <div className="lp-topbar-stars">★★★★★</div>
            <span className="lp-announcement-text">
              <strong>4.9/5</strong> · Mais de <strong>{content.socialProofHighlight}</strong> já usam
            </span>
          </div>
        </div>
      </div>

      <main>
        {/* 1. HERO */}
        <section className="lp-hero-section">
          {content.cornerBadge}

          <div className="lp-container">
            <div className="lp-hero-grid">
              {/* Sem `data-reveal` de propósito (pedido real, 2026-10-20) —
               *  a primeira dobra deve aparecer de imediato, sem nenhuma
               *  animação de entrada; só a partir da 2ª seção em diante
               *  (ao rolar) que o scroll reveal entra em ação. */}
              <div className="lp-hero-content">
                <div className={`lp-hero-brand-block${content.heroBrandName ? ' lp-hero-brand-block--compact' : ''}`}>
                  <h1 className="lp-hero-brand-h1">
                    {content.heroBrandName ? (
                      <>
                        {content.heroBrandName.prefix}
                        <em>{content.heroBrandName.highlight}</em>
                      </>
                    ) : (
                      <>
                        Studio<em>Menu</em>
                      </>
                    )}
                  </h1>
                  {!content.heroBrandName && <p className="lp-hero-brand-tagline">{content.eyebrow}</p>}
                </div>

                <h2 className="lp-hero-title">{content.heroTitle}</h2>

                {/* Imagem "WhatsApp bagunçado" (pedido real, 2026-10-20) —
                 *  mostra na prática a dor que a Hero descreve em texto
                 *  (tabela de preços e fotos soltas no WhatsApp, com X
                 *  vermelho). Só nichos com `whatsappPainImage` (lash/nail
                 *  por enquanto, ver `landing-niche-content.tsx`). */}
                {content.whatsappPainImage && (
                  <div className="lp-hero-pain-image-wrap">
                    <img
                      src={content.whatsappPainImage}
                      alt="Tabela de preços e fotos soltas no WhatsApp, marcadas com X"
                      className="lp-hero-pain-image"
                      fetchPriority="high"
                    />
                    {content.heroPainImageShine && <div className="lp-hero-pain-shine" aria-hidden="true" />}
                  </div>
                )}

                <p className="lp-hero-subtitle">{content.heroSubtitle}</p>

                {/* Botão "Criar Meu Catálogo Agora" removido (teste de X1,
                 *  2026-10-08) — deixado comentado, não apagado, pra
                 *  reativar rápido se quiser voltar.
                <div className="lp-hero-actions">
                  <a
                    href={whatsappLink('Olá! Quero saber como funciona o StudioMenu e criar meu catálogo digital 😊')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lp-btn lp-btn--primary"
                  >
                    Criar Meu Catálogo Agora
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14m-7-7 7 7-7 7" />
                    </svg>
                  </a>
                </div>
                */}

                <p className="lp-hero-swipe-hint lp-hero-swipe-hint--emphasis">
                  <span>Toque no celular para testar</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <polyline points="19 12 12 19 5 12" />
                  </svg>
                </p>
              </div>

              {/* Mockup: vitrine estática, abre o modal fullscreen de teste
               *  ao tocar (2026-10-14) — ver comentário em `MockupModal.tsx`. */}
              <HeroMockup
                showcaseSlug={content.showcaseSlug}
                onTap={() => {
                  capture('hero_mockup_tap');
                  setMockupOpen(true);
                }}
              />
            </div>
          </div>
        </section>

        {/* 2 e 3: Omitidos na variante 'curta' (LP de 3 dobras: Hero, Testar, Valor) */}
        {!isCurta && (
          <>
            {/* 2. ENTREGA EXPRESSA — virou seção própria com fundo rosa forte
             *  (pedido real, 2026-10-14), antes era só um badge pequeno dentro
             *  da Hero. Cria a alternância branco/rosa que ela gosta logo cedo
             *  na página. */}
            <section className="lp-delivery-highlight-section">
              <div className="lp-container" data-reveal>
                <div className="lp-delivery-highlight-header">
                  <div className="lp-delivery-highlight-icon" aria-hidden="true">⚡</div>
                  <h2 className="lp-delivery-highlight-title">Entrega Expressa</h2>
                </div>
                <p className="lp-delivery-highlight-text">
                  Deixamos o seu Menu Digital pronto em até <strong>24 horas</strong> — ou bem antes 😉
                </p>
              </div>
            </section>

            {/* 3. COMO FUNCIONA */}
            <HowItWorksSection singlePlan={Boolean(singlePlanTest)} />
          </>
        )}

        {/* 4. OFERTA */}
        <section id="oferta" className="lp-pricing-section">
          <div className="lp-container">
            <div className="lp-pricing-header-title" data-reveal>
              {/* Teste de plano único (pedido real, 2026-10-19) — "Escolha"
               *  não faz mais sentido sem um 2º plano pra escolher entre. */}
              <h2 className="lp-section-title">
                {singlePlanTest ? 'Hora de Deixar Seu Studio Mais Profissional' : 'Escolha o Plano Ideal para o Seu Studio'}
              </h2>
            </div>

            <div className={`lp-pricing-tier-grid${singlePlanTest ? ' lp-pricing-tier-grid--single' : ''}`}>
              {/* Catálogo (assinatura) — teste de X1, 2026-10-08: preço de
               *  teste 22,90/mês, "/mês" ao lado do valor (não embaixo).
               *  Escondido quando `singlePlanTest` está ativo (teste de
               *  plano único anual, pedido real, 2026-10-19 — ver
               *  `content.singleAnnualPlanTest`). Pra reativar, é só tirar
               *  esse campo do nicho em `landing-niche-content.tsx` —
               *  este card volta sozinho, sem mexer em mais nada aqui. */}
              {!singlePlanTest && (
                <div className="lp-pricing-tier-card" data-reveal>
                  <div className="lp-tier-badge lp-tier-badge--basic">🔁 ASSINATURA MENSAL</div>
                  <h3 className="lp-tier-title">StudioMenu Mensal</h3>

                  <div className="lp-tier-price-box">
                    <div className="lp-tier-price-main">
                      <span className="lp-tier-currency">R$</span>
                      <span className="lp-tier-val">{catalogoParts.whole}</span>
                      <span className="lp-tier-cents">,{catalogoParts.cents}</span>
                      <span className="lp-tier-period">/mês</span>
                    </div>
                  </div>

                  <ul className="lp-tier-bullets">
                    <li>{CHECK_ICON}<span>Seu Menu Digital online como um site, sempre no ar</span></li>
                    <li>{CHECK_ICON}<span>Link para colocar na Bio do Instagram e mandar no WhatsApp</span></li>
                    <li>{CHECK_ICON}<span>Edite serviços, fotos e preços quando quiser direto pelo celular</span></li>
                    <li>{CHECK_ICON}<span>Cliente escolhe o procedimento e agenda direto no seu WhatsApp</span></li>
                  </ul>

                  <a
                    href={whatsappLink('Olá! Vi a página do StudioMenu e quero o Menu Digital por R$22,90/mês')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lp-btn lp-btn--whatsapp"
                    onClick={() => trackCta('catalogo')}
                  >
                    {WHATSAPP_ICON}
                    QUERO MEU MENU DIGITAL
                  </a>
                </div>
              )}

              {/* Vitalício — DESATIVADO (mudança de estratégia, 2026-10-15):
               *  deixado comentado, não apagado, pra reativar rápido no
               *  lugar do card Anual abaixo se quiser voltar a oferecer.
              <div className="lp-pricing-tier-card lp-pricing-tier-card--vip">
                <div className="lp-tier-badge lp-tier-badge--vip">⭐ RECOMENDADO</div>
                <h3 className="lp-tier-title">StudioMenu Vitalício</h3>

                <div className="lp-tier-price-box">
                  <div className="lp-tier-price-main">
                    <span className="lp-tier-currency">R$</span>
                    <span className="lp-tier-val">{vitalicioParts.whole}</span>
                    <span className="lp-tier-cents">,{vitalicioParts.cents}</span>
                  </div>
                  <div className="lp-tier-price-sub">pagamento único</div>
                </div>

                <ul className="lp-tier-bullets">
                  <li>{CHECK_ICON}<span><strong>Pague uma vez só, sem nenhuma mensalidade</strong></span></li>
                  <li>{CHECK_ICON}<span>Seu Menu Digital online como um site, sempre no ar</span></li>
                  <li>{CHECK_ICON}<span>Link para colocar na Bio do Instagram e mandar no WhatsApp</span></li>
                  <li>{CHECK_ICON}<span>Edite serviços, fotos e preços quando quiser direto pelo celular</span></li>
                  <li>{CHECK_ICON}<span>Cliente escolhe o procedimento e agenda direto no seu WhatsApp</span></li>
                </ul>

                <a
                  href={whatsappLink('Olá! Vi a página do StudioMenu e quero o Menu Digital Vitalício por R$197,00, pagamento único')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lp-btn lp-btn--whatsapp"
                  onClick={() => trackCta('vitalicio')}
                >
                  {WHATSAPP_ICON}
                  QUERO O MENU VITALÍCIO
                </a>

                <p className="lp-tier-guarantee">🔒 Garantia de 7 dias — não gostou, devolvemos 100% do seu dinheiro.</p>
              </div>
              */}

              {/* Anual — no lugar do Vitalício (mudança de estratégia,
               *  2026-10-15): mesmo card --vip (borda/badge de destaque),
               *  badge virou "MAIS POPULAR" em vez de "RECOMENDADO" — some
               *  de novo no teste de plano único (`singlePlanTest`, pedido
               *  real 2026-10-19), que não tem mais um 2º plano pra ela ser
               *  "mais popular" QUE. Selo de desconto (`lp-tier-discount-seal`)
               *  é um "burst" de 16 pontas via clip-path, posicionado no
               *  canto superior direito do card — texto usa
               *  `anualDiscountPercent` (calculado acima, preço vs âncora)
               *  pra nunca ficar com um número errado. */}
              <div
                className="lp-pricing-tier-card lp-pricing-tier-card--vip"
                data-reveal
                style={{ '--reveal-delay': '0.15s' } as CSSProperties}
              >
                <div className="lp-tier-discount-seal" aria-hidden="true">
                  <span>
                    <span className="lp-tier-discount-seal-percent">{anualDiscountPercent}%</span>
                    <br />
                    OFF
                  </span>
                </div>

                {!singlePlanTest && <div className="lp-tier-badge lp-tier-badge--vip">⭐ MAIS POPULAR</div>}
                {/* Sem "Anual" no teste de plano único (pedido real,
                 *  2026-10-19) — resolve o corte visual do selo de desconto
                 *  (texto mais curto) e evita reforçar a palavra "anual"
                 *  logo no título do card; o "/ano" no preço já comunica
                 *  isso. */}
                <h3 className="lp-tier-title">{singlePlanTest ? 'StudioMenu' : 'StudioMenu Anual'}</h3>

                <div className="lp-tier-price-box">
                  {/* Âncora "de/por" (pedido real, 2026-10-19) — só no teste
                   *  de plano único, onde não existe mais um 2º plano mais
                   *  barato pra comparar; o preço "cheio" riscado cumpre
                   *  esse papel. */}
                  {anualAnchorParts && (
                    <div className="lp-tier-price-anchor">
                      De <span className="lp-tier-price-anchor-value">R$ {anualAnchorParts.whole},{anualAnchorParts.cents}</span> por
                    </div>
                  )}
                  <div className="lp-tier-price-main">
                    <span className="lp-tier-currency">R$</span>
                    <span className="lp-tier-val">{anualParts.whole}</span>
                    <span className="lp-tier-cents">,{anualParts.cents}</span>
                    <span className="lp-tier-period">/ano</span>
                  </div>
                  <div className="lp-tier-price-sub">
                    {singlePlanTest ? 'menos de R$ 10,00 por mês' : 'pagamento único'}
                  </div>
                </div>

                <ul className="lp-tier-bullets">
                  {/* Âncora de valor nichada (pedido real, 2026-10-15) — 1ª
                   *  bullet do card (pedido real, 2026-10-15: é o gancho mais
                   *  forte, deve ser a primeira coisa lida). Troca o ✓ rosa
                   *  padrão por um 🏷️ dourado e texto em negrito, pra
                   *  destacar da comparação de preço das outras bullets
                   *  (puramente informativas). */}
                  <li className="lp-tier-bullet--value-anchor">
                    <span className="lp-tier-bullet-icon" aria-hidden="true">🏷️</span>
                    <span><strong>{content.anualValueAnchor}</strong></span>
                  </li>
                  <li>{CHECK_ICON}<span><strong>Pague uma vez e use o ano todo</strong></span></li>
                  <li>{CHECK_ICON}<span>Link para colocar na Bio do Instagram e mandar no WhatsApp</span></li>
                  <li>{CHECK_ICON}<span>Edite serviços, fotos e preços quando quiser direto pelo celular</span></li>
                  <li>{CHECK_ICON}<span><strong>Te mandamos sua prévia e você só paga se gostar.</strong></span></li>
                </ul>

                <a
                  href={whatsappLink(anualWhatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lp-btn lp-btn--whatsapp lp-tier-cta-pulse"
                  onClick={() => trackCta('anual', { variant })}
                >
                  {WHATSAPP_ICON}
                  {anualCtaLabel}
                </a>

                <p className="lp-tier-guarantee">🔒 Garantia de 7 dias — não gostou, devolvemos 100% do seu dinheiro.</p>
              </div>

              {/* Agenda — removido do teste de X1 (2026-10-08), de propósito
               *  deixado comentado (não apagado) pra reativar rápido se
               *  quiser voltar: é só descomentar este bloco e tirar o
               *  modificador "--single" da div acima.
              <div className="lp-pricing-tier-card lp-pricing-tier-card--vip">
                <div className="lp-tier-badge lp-tier-badge--vip">⭐ MAIS POPULAR</div>
                <h3 className="lp-tier-title">StudioMenu Agenda</h3>
                <p className="lp-tier-desc">Tudo do Catálogo, com agendamento automático — a cliente escolhe o dia e horário sozinha.</p>

                <div className="lp-tier-price-box">
                  <div className="lp-tier-price-main">
                    <span className="lp-tier-currency">R$</span>
                    <span className="lp-tier-val">{agendaParts.whole}</span>
                    <span className="lp-tier-cents">,{agendaParts.cents}</span>
                  </div>
                  <div className="lp-tier-price-sub">por mês</div>
                </div>

                <ul className="lp-tier-bullets">
                  <li>{CHECK_ICON}<span><strong>Tudo do StudioMenu Catálogo incluso</strong></span></li>
                  <li>{CHECK_ICON}<span><strong>Clientes agendam sozinhas, a qualquer hora</strong></span></li>
                  <li>{CHECK_ICON}<span>Agenda organizada com horários reais</span></li>
                  <li>{CHECK_ICON}<span>Menos ida e volta pelo WhatsApp</span></li>
                </ul>

                <a
                  href={whatsappLink('Olá! Quero saber como funciona o StudioMenu Agenda.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lp-btn lp-btn--whatsapp"
                >
                  ATIVAR AGENDAMENTO
                </a>
              </div>
              */}
            </div>
          </div>
        </section>

        {/* 4.5, 5 e 6: Omitidos na variante 'curta' */}
        {!isCurta && (
          <>
            {/* 4.5 REFORÇO DA DOR (pedido real, 2026-10-20) — depois do preço,
             *  antes do FAQ: reforça mais uma vez a dor (conversa de WhatsApp
             *  com X vermelho) bem no momento em que a pessoa acabou de ver o
             *  valor, pra empurrar pra decisão. Só nichos com `secondPainImage`
             *  (lash por enquanto). */}
            {content.secondPainImage && (
              <section className="lp-pain-reinforce-section">
                <div className="lp-container">
                  <p className="lp-pain-reinforce-heading">{content.secondPainHeading}</p>
                  <p className="lp-pain-reinforce-text">{content.secondPainText}</p>
                  <div className="lp-pain-reinforce-images-row">
                    <div className="lp-pain-reinforce-image-wrap lp-pain-reinforce-image-wrap--bad">
                      <img
                        src={content.secondPainImage}
                        alt="Conversa de WhatsApp com tabela de preços e fotos soltas, marcada com X vermelho"
                        className="lp-pain-reinforce-image lp-pain-reinforce-image--bad"
                        loading="lazy"
                      />
                    </div>
                    {content.goodMockupImage && (
                      <div className="lp-pain-reinforce-image-wrap lp-pain-reinforce-image-wrap--good">
                        {/* Brilho prateado deslizando (pedido real, 2026-10-20) —
                         *  mesmo efeito das cápsulas da capa (`.hero__chip::after`
                         *  + `@keyframes heroChipShine` em `catalog-theme.css`),
                         *  só que varrendo a imagem inteira. `mask-image` usa a
                         *  própria imagem como máscara (via custom property, já
                         *  que cada nicho tem uma foto diferente) — sem isso, o
                         *  brilho apareceria como uma faixa reta sobre o fundo
                         *  TRANSPARENTE ao redor do celular, não só na silhueta
                         *  dele. Rotação fica nesse wrapper (não na `<img>`), pra
                         *  a máscara girar junto e continuar alinhada com a foto. */}
                        <div
                          className="lp-pain-reinforce-shine-wrap"
                          style={{ ['--good-mockup-mask' as any]: `url(${content.goodMockupImage})` }}
                        >
                          <img
                            src={content.goodMockupImage}
                            alt="Catálogo digital StudioMenu organizado, com fotos e preços de cada serviço"
                            className="lp-pain-reinforce-image lp-pain-reinforce-image--good"
                            loading="lazy"
                          />
                        </div>
                        <span className="lp-pain-reinforce-check-badge" aria-hidden="true">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* 5. DÚVIDAS FREQUENTES — antes do carrossel de prova social (pedido
             *  real, 2026-10-15; antes vinha depois). */}
            <FaqSection
              firstItem={content.faqFirstItem}
              subscriptionItemOverride={content.subscriptionFaqOverride}
              singlePlan={Boolean(singlePlanTest)}
            />

            {/* 6. MARQUEE DE PROVA SOCIAL */}
            <section className="lp-marquee-ribbon-section">
              <div className="lp-marquee-ribbon-wrap" data-reveal>
                <div className="lp-marquee-ribbon-track">
                  {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                    <div key={i} className="lp-marquee-review-card">
                      <div className="lp-mrc-header">
                        <img src={t.avatar} alt={t.name} className="lp-mrc-avatar" />
                        <div className="lp-mrc-user">
                          <span className="lp-mrc-name">{t.name}</span>
                          <span className="lp-mrc-stars">★★★★★</span>
                        </div>
                      </div>
                      <p className="lp-mrc-quote">&quot;{t.quote}&quot;</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="lp-site-footer">
        <div className="lp-container">
          <div className="lp-footer-brand">
            <span className="lp-footer-logo">
              Studio<em>Menu</em>
            </span>
            <span className="lp-footer-tagline">Menu Digital Interativo para Studios de Beleza</span>
            <span className="lp-footer-copy">© 2026 · Todos os direitos reservados</span>
          </div>
        </div>
      </footer>

      {/* Botão Flutuante de WhatsApp — só na versão longa */}
      {!isCurta && (
        <div className="lp-sticky-wa-bar">
          <a
            href={whatsappLink('Olá! Vi a página do StudioMenu e fiquei com uma dúvida sobre o Menu Digital')}
            target="_blank"
            rel="noopener noreferrer"
            className="lp-sticky-wa-btn"
            onClick={() => trackCta('duvida_generica', { variant })}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.278.444-1.157 4.226 4.326-1.134.42.259z" />
            </svg>
            TIRAR DÚVIDAS NO WHATSAPP
          </a>
        </div>
      )}

      <MockupModal showcaseSlug={content.showcaseSlug} isOpen={mockupOpen} onClose={() => setMockupOpen(false)} />
    </div>
  );
}
