'use client';

import { capture } from '@/lib/analytics';
import { AGENDA_PRICE } from '@/lib/pricing';
import { HeroMockupClassica } from './HeroMockupClassica';
import { FaqSectionClassica } from './FaqSectionClassica';
import { LiveShowcaseCtaClassica } from './LiveShowcaseCtaClassica';

/** Cópia de segurança da landing page atual, feita em 2026-10-14 ANTES de
 *  começar a iterar numa versão nova pra melhorar conversão — pedido
 *  explícito da usuária: se as melhorias não surtirem efeito, dá pra voltar
 *  a usar esta versão na rota principal (`studiomenu.art`) sem precisar
 *  reconstruir nada.
 *
 *  Vive numa pasta própria (`src/components/sales-classica/`) com CSS
 *  separado (`src/styles/landing-classica.css`, classes `lpc-` em vez de
 *  `lp-`) de propósito — `landing-lpb.css` usa seletores de classe GLOBAIS
 *  (sem escopo, não aninhados sob `.lp-lashmenu`), então qualquer ajuste
 *  feito na versão nova durante os testes (`SalesLandingPage.tsx`) vazaria
 *  pra esta cópia se os dois usassem o mesmo arquivo de estilo. Montada em
 *  `/classica` (`src/app/classica/page.tsx`) — só acessível por quem sabe a
 *  URL, não linkada em lugar nenhum do site.
 *
 *  Mantida idêntica ao comportamento da `SalesLandingPage.tsx` original no
 *  momento da cópia — não reaplicar mudanças feitas aqui depois disso. */
function trackCta(plan: 'catalogo' | 'vitalicio' | 'duvida_generica') {
  capture('cta_click', { plan });
}

const WHATSAPP_NUMBER = '5562991083435';

const AVATARS = ['/landing/avatar-lash-1.webp', '/landing/avatar-lash-2.webp', '/landing/avatar-lash-3.webp'];

const TESTIMONIALS = [
  { name: 'Mariana A.', avatar: AVATARS[0], quote: 'Parei de mandar PDF no Canva. Minhas clientes amaram o link na bio!' },
  { name: 'Camila R.', avatar: AVATARS[1], quote: 'Ninguém mais pede desconto. Valorizou muito o meu studio!' },
  { name: 'Juliana S.', avatar: AVATARS[2], quote: 'Entregaram tudo pronto no meu WhatsApp em menos de 24 horas!' },
  { name: 'Fernanda M.', avatar: AVATARS[0], quote: 'Parei de mandar tabela de preço no WhatsApp. Agora é só o link e pronto!' },
  { name: 'Beatriz K.', avatar: AVATARS[1], quote: 'Melhor investimento do ano pro meu studio. Pagou-se no 1º dia!' },
];

const CHECK_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function whatsappLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function priceParts(price: number): { whole: string; cents: string } {
  const [whole, cents] = price.toFixed(2).split('.');
  return { whole, cents };
}

const TEST_CATALOGO_PRICE = 22.9;
const TEST_VITALICIO_PRICE = 197;

export function SalesLandingPageClassica() {
  const catalogoParts = priceParts(TEST_CATALOGO_PRICE);
  const vitalicioParts = priceParts(TEST_VITALICIO_PRICE);
  const agendaParts = priceParts(AGENDA_PRICE);

  return (
    <div className="lpc-lashmenu">
      {/* Barra de Anúncio / Prova Social */}
      <div className="lpc-top-bar">
        <div className="lpc-container">
          <div className="lpc-announcement-content">
            <div className="lpc-topbar-avatars">
              {AVATARS.map((src, i) => (
                <img key={i} src={src} alt="Profissional StudioMenu" className="lpc-topbar-avatar" />
              ))}
            </div>
            <div className="lpc-topbar-stars">★★★★★</div>
            <span className="lpc-announcement-text">
              <strong>4.9/5</strong> · Mais de <strong>350+ Studios de Beleza</strong> já usam
            </span>
          </div>
        </div>
      </div>

      <main>
        {/* 1. HERO */}
        <section className="lpc-hero-section">
          <div className="lpc-container">
            <div className="lpc-hero-grid">
              <div className="lpc-hero-content">
                <div className="lpc-hero-brand-block">
                  <h1 className="lpc-hero-brand-h1">
                    Studio<em>Menu</em>
                  </h1>
                  <p className="lpc-hero-brand-tagline">Catálogo Digital para Studios de Beleza</p>
                </div>

                <h2 className="lpc-hero-title">
                  Chega de mandar Tabelas de preços e <span className="lpc-text-wine">PDFs</span>.
                  <span className="lpc-hero-title-line2">
                    Seu <span className="lpc-text-gradient">Catálogo Digital Interativo</span>, pronto em minutos.
                  </span>
                </h2>

                <p className="lpc-hero-subtitle">
                  Fotos e preços em um <strong>Link</strong> com o seu nome. Perfeito pra <strong>Lash</strong>, <strong>Nail</strong>, <strong>Estética</strong> ou qualquer Studio de Beleza.
                </p>

                <p className="lpc-hero-swipe-hint lpc-hero-swipe-hint--emphasis">👇 Teste a experiência real do catálogo rolando a tela do celular:</p>
              </div>

              {/* Mockup: catálogo real embutido */}
              <HeroMockupClassica />
            </div>

            <div className="lpc-hero-delivery-badge-wrap">
              <div className="lpc-hero-delivery-badge">
                <span>⚡ <strong>Entrega Expressa:</strong> Montamos seu Catálogo em até 24h (ou bem antes 😉)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. MARQUEE DE PROVA SOCIAL */}
        <section className="lpc-marquee-ribbon-section">
          <div className="lpc-marquee-ribbon-wrap">
            <div className="lpc-marquee-ribbon-track">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                <div key={i} className="lpc-marquee-review-card">
                  <div className="lpc-mrc-header">
                    <img src={t.avatar} alt={t.name} className="lpc-mrc-avatar" />
                    <div className="lpc-mrc-user">
                      <span className="lpc-mrc-name">{t.name}</span>
                      <span className="lpc-mrc-stars">★★★★★</span>
                    </div>
                  </div>
                  <p className="lpc-mrc-quote">&quot;{t.quote}&quot;</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. ANTES x DEPOIS */}
        <section className="lpc-comparison-section">
          <div className="lpc-container">
            <div className="lpc-section-header">
              <p className="lpc-section-kicker">Evolução do Seu Atendimento</p>
              <h2 className="lpc-section-title">Por que você deve parar de mandar Tabelas e PDFs?</h2>
            </div>

            <div className="lpc-vs-grid">
              <div className="lpc-vs-box lpc-vs-box--bad">
                <span className="lpc-vs-ribbon lpc-vs-ribbon--bad">Antes</span>
                <div className="lpc-vs-box-head">
                  <h3>PDFs estáticos /{' '}Mensagens Soltas</h3>
                </div>
                <ul className="lpc-vs-bullet-list">
                  <li>
                    <svg className="lpc-vs-svg-bad" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                    <span>PDF pesado que demora para carregar no 4G do celular</span>
                  </li>
                  <li>
                    <svg className="lpc-vs-svg-bad" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                    <span>Letras pequenas que obrigam a cliente a ficar dando zoom</span>
                  </li>
                  <li>
                    <svg className="lpc-vs-svg-bad" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>Mensagens longas e repetitivas de preços no WhatsApp</span>
                  </li>
                  <li>
                    <svg className="lpc-vs-svg-bad" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span>Visual amador que abre margem para pedidos de desconto</span>
                  </li>
                </ul>
              </div>

              <div className="lpc-vs-box lpc-vs-box--good">
                <span className="lpc-vs-ribbon lpc-vs-ribbon--good">Depois</span>
                <div className="lpc-vs-box-head">
                  <h3>Seu StudioMenu{' '}Profissional</h3>
                </div>
                <ul className="lpc-vs-bullet-list">
                  <li>
                    <svg className="lpc-vs-svg-good" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>Um Link com seu nome que abre instantaneamente</span>
                  </li>
                  <li>
                    <svg className="lpc-vs-svg-good" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Fotos grandes dos seus procedimentos em alta definição</span>
                  </li>
                  <li>
                    <svg className="lpc-vs-svg-good" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>Cliente escolhe a técnica e agenda em 1 segundo no WhatsApp</span>
                  </li>
                  <li>
                    <svg className="lpc-vs-svg-good" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span>Transmite autoridade imediata e valoriza o seu preço</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. OFERTA */}
        <section id="oferta" className="lpc-pricing-section">
          <div className="lpc-container">
            <div className="lpc-pricing-header-title">
              <h2 className="lpc-section-title">Escolha o Plano Ideal para o Seu Studio</h2>
            </div>

            <div className="lpc-pricing-tier-grid">
              <div className="lpc-pricing-tier-card">
                <div className="lpc-tier-badge lpc-tier-badge--basic">🔁 ASSINATURA MENSAL</div>
                <h3 className="lpc-tier-title">StudioMenu Catálogo</h3>
                <p className="lpc-tier-desc">Catálogo digital com seu nome, fotos e preços, sempre no ar — edite pelo celular quando quiser.</p>

                <div className="lpc-tier-price-box">
                  <div className="lpc-tier-price-main">
                    <span className="lpc-tier-currency">R$</span>
                    <span className="lpc-tier-val">{catalogoParts.whole}</span>
                    <span className="lpc-tier-cents">,{catalogoParts.cents}</span>
                    <span className="lpc-tier-period">/mês</span>
                  </div>
                </div>

                <ul className="lpc-tier-bullets">
                  <li>{CHECK_ICON}<span>Catálogo online sempre no ar</span></li>
                  <li>{CHECK_ICON}<span>Link profissional pra bio do Instagram/WhatsApp</span></li>
                  <li>{CHECK_ICON}<span>Edite fotos, preços e serviços quando quiser</span></li>
                  <li>{CHECK_ICON}<span>Cliente agenda direto pelo seu WhatsApp</span></li>
                </ul>

                <a
                  href={whatsappLink('Olá! Vi a página do StudioMenu e quero o Plano Catálogo por R$22,90/mês')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lpc-btn lpc-btn--whatsapp"
                  onClick={() => trackCta('catalogo')}
                >
                  QUERO MEU CATÁLOGO
                </a>
              </div>

              <div className="lpc-pricing-tier-card lpc-pricing-tier-card--vip">
                <div className="lpc-tier-badge lpc-tier-badge--vip">⭐ RECOMENDADO</div>
                <h3 className="lpc-tier-title">StudioMenu Vitalício</h3>
                <p className="lpc-tier-desc">Tudo do Catálogo, pagando uma vez só — sem mensalidade.</p>

                <div className="lpc-tier-price-box">
                  <div className="lpc-tier-price-main">
                    <span className="lpc-tier-currency">R$</span>
                    <span className="lpc-tier-val">{vitalicioParts.whole}</span>
                    <span className="lpc-tier-cents">,{vitalicioParts.cents}</span>
                  </div>
                  <div className="lpc-tier-price-sub">pagamento único</div>
                </div>

                <ul className="lpc-tier-bullets">
                  <li>{CHECK_ICON}<span><strong>Pague uma vez só, sem mensalidade</strong></span></li>
                  <li>{CHECK_ICON}<span>Catálogo online sempre no ar</span></li>
                  <li>{CHECK_ICON}<span>Edite fotos, preços e serviços quando quiser</span></li>
                  <li>{CHECK_ICON}<span>Link profissional pra bio do Instagram/WhatsApp</span></li>
                </ul>

                <a
                  href={whatsappLink('Olá! Vi a página do StudioMenu e quero o Plano Vitalício por R$197,00, pagamento único')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lpc-btn lpc-btn--whatsapp"
                  onClick={() => trackCta('vitalicio')}
                >
                  QUERO O VITALÍCIO
                </a>

                <p className="lpc-tier-guarantee">🔒 Garantia de 7 dias — não gostou, devolvemos 100% do seu dinheiro.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. DÚVIDAS FREQUENTES */}
        <FaqSectionClassica />

        {/* 6. SEÇÃO MATADORA (CTA SHOWCASE AO VIVO) */}
        <LiveShowcaseCtaClassica />
      </main>

      <footer className="lpc-site-footer">
        <div className="lpc-container">
          <div className="lpc-footer-brand">
            <span className="lpc-footer-logo">
              Studio<em>Menu</em>
            </span>
            <span className="lpc-footer-tagline">Catálogo Digital Interativo para Studios de Beleza</span>
            <span className="lpc-footer-copy">© 2026 · Todos os direitos reservados</span>
          </div>
        </div>
      </footer>

      <div className="lpc-sticky-wa-bar">
        <a
          href={whatsappLink('Olá! Vi a página do StudioMenu e fiquei com uma dúvida antes de assinar')}
          target="_blank"
          rel="noopener noreferrer"
          className="lpc-sticky-wa-btn"
          onClick={() => trackCta('duvida_generica')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.278.444-1.157 4.226 4.326-1.134.42.259z" />
          </svg>
          TIRAR DÚVIDAS NO WHATSAPP
        </a>
      </div>
    </div>
  );
}
