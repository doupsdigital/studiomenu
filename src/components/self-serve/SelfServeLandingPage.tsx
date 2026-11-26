'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { CAKTO_ANUAL_PRICE, CAKTO_MENSAL_PRICE } from '@/lib/pricing';
import type { SelfServeOfferMode } from '@/lib/cakto-checkout';
import type { LandingNicheContent } from '@/data/landing-niche-content';
import { PreviewGenerator } from './PreviewGenerator';
import { CreatingOverlay } from './CreatingOverlay';
import { PreviewRevealModal } from './PreviewRevealModal';
import { SelfServeOffer } from './SelfServeOffer';
import { SelfServeFaq } from './SelfServeFaq';
import { SelfServeEditDemo } from './SelfServeEditDemo';
import { SelfServeEmailCapture } from './SelfServeEmailCapture';
import {
  buildCheckoutUrl,
  clearPreview,
  firstName,
  guessSlug,
  loadPreview,
  savePreview,
  setFunnelOffer,
  trackFunnel,
  trackPixel,
  type CaktoPlanKey,
  type FunnelPreview,
} from './funnel';

const WHATSAPP_NUMBER = '5562991083435';
const AVATARS = ['/landing/avatar-lash-1.webp', '/landing/avatar-lash-2.webp', '/landing/avatar-lash-3.webp'];
/** Se o menu demorar demais pra carregar no iframe, a animação não fica
 *  presa esperando — revela mesmo assim (ele termina de carregar visível). */
const IFRAME_LOAD_TIMEOUT_MS = 7000;

interface SelfServeLandingPageProps {
  content: LandingNicheContent;
  /** `?plano=` (2026-11-23): uma oferta só (mensal ou anual) ou as duas. */
  offer: SelfServeOfferMode;
}

/** Âncoras que, abertas direto (ex.: faixa da prévia no catálogo aponta
 *  pra `/lash#oferta`), já liberam a página inteira. */
const UNLOCK_HASHES = ['#oferta', '#como-editar', '#faq'];

/** Página de vendas de autosserviço do nicho Lash (`/lash`, 2026-11-17).
 *
 *  Fluxo: ela digita só o nome → animação "Criando seu menu…" → o menu DELA
 *  em tela cheia (`PreviewRevealModal`) → "Ativar meu menu" → oferta
 *  personalizada → checkout da Cakto com `sck=<código da prévia>`. Sem
 *  WhatsApp/X1 no caminho da venda (só um link discreto de dúvidas no fim).
 *
 *  Reaproveita o visual (classes `lp-*`) e o conteúdo nichado da página `/`
 *  (`LANDING_NICHE_CONTENT.lash`), sem alterar a `/`, que continua no ar
 *  rodando a campanha atual.
 *
 *  Revelação em etapas (2026-11-26): quem chega do anúncio vê só a Hero e o
 *  gerador. O "Ativar meu menu" libera (`unlocked`) o resto, nesta ordem:
 *  vídeo da edição → preço (com garantia) → dúvidas (com CTA no fim). As
 *  gravações mostravam: cria → "Ativar" → vê o preço → sai, sem nada
 *  respondendo "vou conseguir editar sozinha?". */
export function SelfServeLandingPage({ content, offer }: SelfServeLandingPageProps) {
  const [unlocked, setUnlocked] = useState(false);
  /** Seção pra rolar assim que ela existir na página (depois de liberar). */
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);
  useScrollReveal(unlocked);

  useEffect(() => {
    setFunnelOffer(offer);
  }, [offer]);

  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<FunnelPreview | null>(null);
  const [creating, setCreating] = useState(false);
  const [creatingUrl, setCreatingUrl] = useState('');
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);
  const [revealOpen, setRevealOpen] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const generatorRef = useRef<HTMLElement>(null);

  // Prévia guardada neste aparelho (voltou à página dentro das 24h): ela já
  // passou pela revelação, então a página vem inteira.
  useEffect(() => {
    const saved = loadPreview();
    if (saved) {
      setPreview(saved);
      setName(saved.name);
      setUnlocked(true);
    }
    const hash = window.location.hash;
    if (UNLOCK_HASHES.includes(hash)) {
      setUnlocked(true);
      setPendingScroll(hash.slice(1));
    }
  }, []);

  // Rola até a seção pedida depois que ela renderizou.
  useEffect(() => {
    if (!unlocked || !pendingScroll) return;
    const id = window.setTimeout(() => {
      document.getElementById(pendingScroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPendingScroll(null);
    }, 80);
    return () => window.clearTimeout(id);
  }, [unlocked, pendingScroll]);

  // Barra fixa no celular: só com a página liberada e quando nenhum outro
  // botão de ativar está na tela — gerador, vídeo, oferta, o CTA do fim do
  // FAQ e o rodapé (2026-11-26: aparecia junto com o botão do FAQ, 2 botões
  // iguais empilhados, e cobria o rodapé).
  useEffect(() => {
    const generator = generatorRef.current;
    if (!unlocked || !generator) {
      setStickyVisible(false);
      return;
    }
    const watched = [
      generator,
      document.getElementById('como-editar'),
      document.getElementById('oferta'),
      document.querySelector<HTMLElement>('.lp-ss-faq-cta'),
      document.getElementById('guardar'),
      document.querySelector<HTMLElement>('.lp-site-footer'),
    ].filter((el): el is HTMLElement => Boolean(el));
    const visible = new Map<Element, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target, entry.isIntersecting);
        setStickyVisible(![...visible.values()].some(Boolean));
      },
      { threshold: 0.1 }
    );
    watched.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [unlocked]);

  // Rede de segurança: não prender a animação se o iframe demorar.
  useEffect(() => {
    if (!creating || !preview || loadedSlug === preview.slug) return;
    const t = window.setTimeout(() => setLoadedSlug(preview.slug), IFRAME_LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [creating, preview, loadedSlug]);

  const focusGenerator = useCallback(() => {
    generatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 450);
  }, []);

  /** "Ativar meu menu" (revelação / card do gerador): libera a página e
   *  leva ao vídeo da edição — não mais direto ao preço. */
  const goToDemo = useCallback((from: string) => {
    trackFunnel('activate_click', { from });
    setRevealOpen(false);
    setUnlocked(true);
    setPendingScroll('como-editar');
  }, []);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleSubmit = useCallback(async () => {
    const clean = name.trim().replace(/\s+/g, ' ');
    if (clean.replace(/[^\p{L}]/gu, '').length < 2) {
      setError('Digite seu nome profissional, por exemplo: Fernanda Lima.');
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setBusy(true);
    setCreatingUrl(`${guessSlug(clean) || 'seunome'}.studiomenu.art`);
    setCreating(true);
    trackFunnel('preview_submit');

    try {
      const res = await fetch('/api/preview/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clean }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setCreating(false);
        setBusy(false);
        setError(json?.message || 'Não conseguimos criar sua prévia agora. Tente de novo em instantes.');
        trackFunnel('preview_error', { code: json?.code || res.status });
        return;
      }
      const created: FunnelPreview = {
        name: clean,
        slug: json.slug,
        previewCode: json.previewCode,
        expiresAt: json.expiresAt,
        displayUrl: json.displayUrl,
        publicUrl: json.publicUrl,
      };
      setCreatingUrl(created.displayUrl);
      setPreview(created); // monta o iframe por trás da animação
      savePreview(created);
      trackFunnel('preview_created', { reused: Boolean(json.reused) });
      trackPixel('Lead', { content_name: 'Prévia StudioMenu Lash', content_category: offer });
    } catch {
      setCreating(false);
      setBusy(false);
      setError('Sem conexão. Confira sua internet e tente de novo.');
      trackFunnel('preview_error', { code: 'network' });
    }
  }, [name, offer]);

  const handleCreatingDone = useCallback(() => {
    setCreating(false);
    setBusy(false);
    setRevealOpen(true);
    trackFunnel('preview_reveal_open', { from: 'creation' });
  }, []);

  const handleCheckout = useCallback(
    (plan: CaktoPlanKey) => {
      const value = plan === 'anual' ? CAKTO_ANUAL_PRICE : CAKTO_MENSAL_PRICE;
      trackFunnel('checkout_click', { plan, has_preview: Boolean(preview) });
      trackPixel('AddToCart', {
        value,
        currency: 'BRL',
        content_name: `StudioMenu ${plan === 'anual' ? 'Anual' : 'Mensal'}`,
        content_category: offer,
      });
      window.location.href = buildCheckoutUrl(plan, preview?.previewCode ?? null);
    },
    [preview, offer]
  );

  /** Botão no fim das dúvidas: com um plano só, vai direto ao checkout;
   *  com os dois, volta pra escolha. */
  const handleFaqActivate = useCallback(() => {
    trackFunnel('faq_cta_click');
    if (offer === 'ambos') scrollToSection('oferta');
    else handleCheckout(offer);
  }, [offer, handleCheckout, scrollToSection]);

  const handleStartOver = useCallback(() => {
    clearPreview();
    setPreview(null);
    setLoadedSlug(null);
    setName('');
    setError(null);
    trackFunnel('preview_start_over');
    window.setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const openReveal = useCallback(() => {
    setRevealOpen(true);
    trackFunnel('preview_reveal_open', { from: 'page' });
  }, []);

  return (
    <div className="lp-lashmenu lp-ss">
      <div className="lp-top-bar">
        <div className="lp-container">
          <div className="lp-announcement-content">
            <div className="lp-topbar-avatars">
              {AVATARS.map((src, i) => (
                <img key={i} src={src} alt="" className="lp-topbar-avatar" />
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
        {/* 1. HERO — mesma copy da página de Lash de hoje */}
        <section className="lp-hero-section">
          {content.cornerBadge}
          <div className="lp-container">
            <div className="lp-hero-grid lp-ss-hero-grid--single">
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
                </div>
                <h2 className="lp-hero-title">{content.heroTitle}</h2>
                {content.heroTagline && <p className="lp-hero-tagline">{content.heroTagline}</p>}
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
              </div>
              {/* Sem o celular de exemplo (2026-11-18): a primeira vez que ela
                  vê um menu completo é o DELA, na revelação depois do nome. */}
            </div>
          </div>
        </section>

        {/* 2. GERADOR */}
        <section id="criar" className="lp-ss-gen-section" ref={generatorRef}>
          <div className="lp-container">
            <PreviewGenerator
              ref={inputRef}
              preview={preview}
              name={name}
              onNameChange={(v) => {
                setName(v);
                if (error) setError(null);
              }}
              onSubmit={handleSubmit}
              busy={busy}
              error={error}
              onOpenPreview={openReveal}
              onActivate={() => goToDemo('generator_card')}
              onStartOver={handleStartOver}
            />
          </div>
        </section>

        {/* 3–5. Só depois do "Ativar" (ou de volta com a prévia guardada). */}
        {unlocked && (
          <>
            <SelfServeEditDemo
              firstName={preview ? firstName(preview.name) : null}
              onContinue={() => {
                trackFunnel('demo_cta_click');
                scrollToSection('oferta');
              }}
            />
            <SelfServeOffer
              preview={preview}
              offer={offer}
              onCheckout={handleCheckout}
              onCreateFirst={focusGenerator}
              onShowFaq={() => scrollToSection('faq')}
            />
            <SelfServeFaq offer={offer} onActivate={handleFaqActivate} />
            {/* Só pra quem tem prévia (o envio exige o cookie dela). */}
            {preview && <SelfServeEmailCapture offer={offer} />}
          </>
        )}
      </main>

      <footer className="lp-site-footer">
        <div className="lp-container">
          <div className="lp-footer-brand">
            <span className="lp-footer-logo">
              Studio<em>Menu</em>
            </span>
            <span className="lp-footer-tagline">Menu Digital Interativo para Lash Designers</span>
            <a
              className="lp-ss-footer-help"
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Oi! Estou na página do StudioMenu e fiquei com uma dúvida')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackFunnel('help_whatsapp_click')}
            >
              Ficou com dúvida? Fale com a gente
            </a>
            <span className="lp-footer-copy">© 2026 · Todos os direitos reservados</span>
          </div>
        </div>
      </footer>

      {/* Barra fixa (celular) */}
      <div className={`lp-ss-sticky${stickyVisible && !creating && !revealOpen ? ' is-visible' : ''}`} aria-hidden={!stickyVisible}>
        <button
          type="button"
          className="lp-btn lp-btn--primary lp-ss-btn-block"
          onClick={() => {
            if (!preview) return focusGenerator();
            trackFunnel('sticky_bar_click');
            scrollToSection('oferta');
          }}
          tabIndex={stickyVisible ? 0 : -1}
        >
          {preview ? 'Ativar meu menu' : '✨ Criar meu menu grátis'}
        </button>
      </div>

      <CreatingOverlay
        open={creating}
        displayUrl={creatingUrl}
        ready={Boolean(preview && loadedSlug === preview.slug)}
        onDone={handleCreatingDone}
      />

      <PreviewRevealModal
        preview={preview}
        isOpen={revealOpen}
        onClose={() => setRevealOpen(false)}
        onActivate={() => goToDemo('reveal_modal')}
        onLoaded={() => preview && setLoadedSlug(preview.slug)}
      />
    </div>
  );
}
