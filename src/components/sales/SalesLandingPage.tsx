import Link from 'next/link';
import { BASICO_PRICE, PLUS_PRICE } from '@/lib/pricing';

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
  { name: 'Mariana A.', avatar: AVATARS[0], quote: 'Parei de mandar PDF no Canva. Minhas clientes amaram o link na bio!' },
  { name: 'Camila R.', avatar: AVATARS[1], quote: 'Ninguém mais pede desconto. Valorizou muito o meu estúdio!' },
  { name: 'Juliana S.', avatar: AVATARS[2], quote: 'Entregaram tudo pronto no meu WhatsApp em menos de 24 horas!' },
  { name: 'Fernanda M.', avatar: AVATARS[0], quote: 'As clientes leem os cuidados pós e já agendam muito mais rápido.' },
  { name: 'Beatriz K.', avatar: AVATARS[1], quote: 'Melhor investimento do ano pro meu estúdio. Pagou-se no 1º dia!' },
];

const CHECK_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
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

export function SalesLandingPage() {
  const basicoParts = priceParts(BASICO_PRICE);
  const plusParts = priceParts(PLUS_PRICE);

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
              <strong>4.9/5</strong> · Mais de <strong>350+ Estúdios de Beleza</strong> já usam
            </span>
          </div>
        </div>
      </div>

      <main>
        {/* 1. HERO */}
        <section className="lp-hero-section">
          <div className="lp-container">
            <div className="lp-hero-grid">
              <div className="lp-hero-content">
                <div className="lp-hero-brand-block">
                  <h1 className="lp-hero-brand-h1">
                    Studio<em>Menu</em>
                  </h1>
                  <p className="lp-hero-brand-tagline">Catálogo Digital para Estúdios de Beleza</p>
                </div>

                <h2 className="lp-hero-title">
                  Diga adeus ao PDF do Canva e transforme sua tabela de preços em um{' '}
                  <span className="lp-text-gradient">Catálogo Digital Interativo.</span>
                </h2>

                <p className="lp-hero-subtitle">
                  Chega de enviar tabelas em PDF pesadas que ninguém abre no celular ou digitar mensagens longas de preços. Seu catálogo pronto em poucos minutos, com seu nome, fotos e valores — pra Lash, Nails, Estética ou qualquer estúdio de beleza.
                </p>

                <div className="lp-hero-actions">
                  <Link href="/form" className="lp-btn lp-btn--primary">
                    Criar Meu Catálogo Agora
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14m-7-7 7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <p className="lp-hero-swipe-hint">👇 Teste a experiência real do catálogo rolando a tela do celular ao lado:</p>
              </div>

              {/* Mockup: catálogo real embutido */}
              <div className="lp-hero-phone-wrap">
                <div className="lp-phone-interactive-container">
                  <div className="lp-testdrive-phone">
                    <div className="lp-testdrive-notch" />
                    <div className="lp-testdrive-screen">
                      <div className="lp-testdrive-screen-scaler">
                        <iframe src="/c/showcase/lash" title="Prévia ao vivo do catálogo StudioMenu" />
                      </div>
                    </div>
                  </div>

                  <div className="lp-phone-scroll-indicator" aria-hidden="true">
                    <span className="lp-scroll-cue-tag">DESLIZE</span>
                    <div className="lp-scroll-cursor-wrap">
                      <svg className="lp-touch-pointer-hand-svg" width="32" height="32" viewBox="0 0 24 24" fill="#ffffff" stroke="#c84b72" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13V5.5a1.5 1.5 0 0 1 3 0V12" />
                        <path d="M13 8.5a1.5 1.5 0 0 1 3 0V12" />
                        <path d="M16 9.5a1.5 1.5 0 0 1 3 0V13" />
                        <path d="M19 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-2a6 6 0 0 1-4.24-1.76l-3.52-3.52a1.5 1.5 0 0 1 2.12-2.12L10 16" />
                      </svg>
                      <svg className="lp-scroll-cue-arrow-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c84b72" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <polyline points="19 12 12 19 5 12" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. MARQUEE DE PROVA SOCIAL */}
        <section className="lp-marquee-ribbon-section">
          <div className="lp-marquee-ribbon-wrap">
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

        {/* 3. ANTES x DEPOIS */}
        <section className="lp-comparison-section">
          <div className="lp-container">
            <div className="lp-section-header">
              <p className="lp-section-kicker">Evolução do Seu Atendimento</p>
              <h2 className="lp-section-title">Por que você deve parar de mandar PDF no Canva?</h2>
            </div>

            <div className="lp-vs-grid">
              <div className="lp-vs-box lp-vs-box--bad">
                <div className="lp-vs-box-head">
                  <h3>Antes: PDF do Canva / Mensagens Soltas</h3>
                </div>
                <ul className="lp-vs-bullet-list">
                  <li>
                    <svg className="lp-vs-svg-bad" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                    <span>PDF pesado que demora para carregar no 4G do celular</span>
                  </li>
                  <li>
                    <svg className="lp-vs-svg-bad" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                    <span>Letras pequenas que obrigam a cliente a ficar dando zoom</span>
                  </li>
                  <li>
                    <svg className="lp-vs-svg-bad" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>Mensagens longas e repetitivas de preços no WhatsApp</span>
                  </li>
                  <li>
                    <svg className="lp-vs-svg-bad" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span>Visual amador que abre margem para pedidos de desconto</span>
                  </li>
                </ul>
              </div>

              <div className="lp-vs-box lp-vs-box--good">
                <div className="lp-vs-box-head">
                  <h3>Depois: Seu StudioMenu Profissional</h3>
                </div>
                <ul className="lp-vs-bullet-list">
                  <li>
                    <svg className="lp-vs-svg-good" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>Abre instantaneamente igual um aplicativo de luxo</span>
                  </li>
                  <li>
                    <svg className="lp-vs-svg-good" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Fotos grandes dos seus procedimentos em alta definição</span>
                  </li>
                  <li>
                    <svg className="lp-vs-svg-good" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>Cliente escolhe a técnica e agenda em 1 segundo no WhatsApp</span>
                  </li>
                  <li>
                    <svg className="lp-vs-svg-good" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
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
        <section id="oferta" className="lp-pricing-section">
          <div className="lp-container">
            <div className="lp-pricing-header-title">
              <h2 className="lp-section-title">Escolha o Plano Ideal para o Seu Estúdio</h2>
              <p className="lp-section-subtitle">Sem contrato de fidelidade · Cancele quando quiser</p>
            </div>

            <div className="lp-pricing-tier-grid">
              {/* Básico */}
              <div className="lp-pricing-tier-card">
                <div className="lp-tier-badge lp-tier-badge--basic">📱 SEU CATÁLOGO NO AR</div>
                <h3 className="lp-tier-title">StudioMenu Básico</h3>
                <p className="lp-tier-desc">Catálogo digital com seu nome, fotos e preços, sempre no ar — edite pelo celular quando quiser.</p>

                <div className="lp-tier-price-box">
                  <div className="lp-tier-price-main">
                    <span className="lp-tier-currency">R$</span>
                    <span className="lp-tier-val">{basicoParts.whole}</span>
                    <span className="lp-tier-cents">,{basicoParts.cents}</span>
                  </div>
                  <div className="lp-tier-price-sub">por mês</div>
                </div>

                <ul className="lp-tier-bullets">
                  <li>{CHECK_ICON}<span>Catálogo online sempre no ar</span></li>
                  <li>{CHECK_ICON}<span>Link profissional pra bio do Instagram/WhatsApp</span></li>
                  <li>{CHECK_ICON}<span>Edite fotos, preços e serviços quando quiser</span></li>
                  <li>{CHECK_ICON}<span>Cliente agenda direto pelo seu WhatsApp</span></li>
                </ul>

                <Link href="/form" className="lp-btn lp-btn--whatsapp">
                  COMEÇAR NO BÁSICO
                </Link>
              </div>

              {/* Plus */}
              <div className="lp-pricing-tier-card lp-pricing-tier-card--vip">
                <div className="lp-tier-badge lp-tier-badge--vip">⭐ MAIS POPULAR</div>
                <h3 className="lp-tier-title">StudioMenu+</h3>
                <p className="lp-tier-desc">Tudo do Básico, com agendamento automático — a cliente escolhe o dia e horário sozinha.</p>

                <div className="lp-tier-price-box">
                  <div className="lp-tier-price-main">
                    <span className="lp-tier-currency">R$</span>
                    <span className="lp-tier-val">{plusParts.whole}</span>
                    <span className="lp-tier-cents">,{plusParts.cents}</span>
                  </div>
                  <div className="lp-tier-price-sub">por mês</div>
                </div>

                <ul className="lp-tier-bullets">
                  <li>{CHECK_ICON}<span><strong>Tudo do StudioMenu Básico incluso</strong></span></li>
                  <li>{CHECK_ICON}<span><strong>Clientes agendam sozinhas, a qualquer hora</strong></span></li>
                  <li>{CHECK_ICON}<span>Agenda organizada com horários reais</span></li>
                  <li>{CHECK_ICON}<span>Menos ida e volta pelo WhatsApp</span></li>
                </ul>

                <Link href="/form" className="lp-btn lp-btn--whatsapp">
                  COMEÇAR NO PLUS
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-site-footer">
        <div className="lp-container">
          <div className="lp-footer-brand">
            <span className="lp-footer-logo">
              Studio<em>Menu</em>
            </span>
            <span className="lp-footer-tagline">Catálogo Digital Interativo para Estúdios de Beleza</span>
            <span className="lp-footer-copy">© 2026 · Todos os direitos reservados</span>
          </div>
        </div>
      </footer>

      {/* Botão Flutuante de WhatsApp — contato de pré-venda genérico, não
       *  fechamento de um plano específico (o CTA de venda de verdade é o
       *  /form). */}
      <div className="lp-sticky-wa-bar">
        <a href={whatsappLink('Olá! Vi o StudioMenu no site e gostaria de saber mais informações! 😊')} target="_blank" rel="noopener noreferrer" className="lp-sticky-wa-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.278.444-1.157 4.226 4.326-1.134.42.259z" />
          </svg>
          TIRAR DÚVIDAS NO WHATSAPP
        </a>
      </div>
    </div>
  );
}
