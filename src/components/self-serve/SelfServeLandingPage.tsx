'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { CAKTO_ANUAL_PRICE, CAKTO_MENSAL_PRICE } from '@/lib/pricing';
import type { LandingNicheContent } from '@/data/landing-niche-content';
import { PreviewGenerator } from './PreviewGenerator';
import { CreatingOverlay } from './CreatingOverlay';
import { PreviewRevealModal } from './PreviewRevealModal';
import { SelfServeOffer } from './SelfServeOffer';
import { SelfServeFaq } from './SelfServeFaq';
import {
  buildCheckoutUrl,
  clearPreview,
  guessSlug,
  loadPreview,
  savePreview,
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
}

/** Página de vendas de autosserviço do nicho Lash (`/lash`, 2026-11-17).
 *
 *  Fluxo: ela digita só o nome → animação "Criando seu menu…" → o menu DELA
 *  em tela cheia (`PreviewRevealModal`) → "Ativar meu menu" → oferta
 *  personalizada → checkout da Cakto com `sck=<código da prévia>`. Sem
 *  WhatsApp/X1 no caminho da venda (só um link discreto de dúvidas no fim).
 *
 *  Reaproveita o visual (classes `lp-*`) e o conteúdo nichado da página `/`
 *  (`LANDING_NICHE_CONTENT.lash`), sem alterar a `/`, que continua no ar
 *  rodando a campanha atual. */
export function SelfServeLandingPage({ content }: SelfServeLandingPageProps) {
  useScrollReveal();

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
  const offerVisibleRef = useRef(false);
  const generatorVisibleRef = useRef(true);

  // Prévia guardada neste aparelho (voltou à página dentro das 24h).
  useEffect(() => {
    const saved = loadPreview();
    if (saved) {
      setPreview(saved);
      setName(saved.name);
    }
  }, []);

  // Barra fixa no celular: só quando nem o gerador nem a oferta estão na tela.
  useEffect(() => {
    const generator = generatorRef.current;
    const offer = document.getElementById('oferta');
    if (!generator || !offer) return;
    const update = () => setStickyVisible(!generatorVisibleRef.current && !offerVisibleRef.current);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === generator) generatorVisibleRef.current = entry.isIntersecting;
          if (entry.target === offer) offerVisibleRef.current = entry.isIntersecting;
        }
        update();
      },
      { threshold: 0.1 }
    );
    observer.observe(generator);
    observer.observe(offer);
    return () => observer.disconnect();
  }, []);

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

  const goToOffer = useCallback((from: string) => {
    trackFunnel('activate_click', { from });
    setRevealOpen(false);
    window.setTimeout(() => document.getElementById('oferta')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
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
      trackPixel('Lead', { content_name: 'Prévia StudioMenu Lash' });
    } catch {
      setCreating(false);
      setBusy(false);
      setError('Sem conexão. Confira sua internet e tente de novo.');
      trackFunnel('preview_error', { code: 'network' });
    }
  }, [name]);

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
      trackPixel('AddToCart', { value, currency: 'BRL', content_name: `StudioMenu ${plan === 'anual' ? 'Anual' : 'Mensal'}` });
      window.location.href = buildCheckoutUrl(plan, preview?.previewCode ?? null);
    },
    [preview]
  );

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
              onActivate={() => goToOffer('generator_card')}
              onStartOver={handleStartOver}
            />
          </div>
        </section>

        {/* 3. COMO FUNCIONA */}
        <section className="lp-ss-how">
          <div className="lp-container">
            <h2 className="lp-section-title" data-reveal>
              Simples assim
            </h2>
            <ol className="lp-ss-how-steps">
              {[
                { t: 'Crie grátis com seu nome', d: 'Em 10 segundos você vê o seu menu pronto, com serviços de lash de exemplo.' },
                { t: 'Ative o seu menu', d: 'Anual no Pix ou mensal no cartão. A ativação é na hora.' },
                { t: 'Edite e divulgue', d: 'Troque pelos seus serviços e preços pelo celular e coloque o link na bio.' },
              ].map((s, i) => (
                <li key={i} data-reveal style={{ ['--reveal-delay' as string]: `${i * 0.1}s` }}>
                  <span className="lp-ss-how-num">{i + 1}</span>
                  <strong>{s.t}</strong>
                  <p>{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 4. OFERTA */}
        <SelfServeOffer preview={preview} onCheckout={handleCheckout} onCreateFirst={focusGenerator} />

        {/* 5. DÚVIDAS */}
        <SelfServeFaq />
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
          onClick={() => (preview ? goToOffer('sticky_bar') : focusGenerator())}
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
        onActivate={() => goToOffer('reveal_modal')}
        onLoaded={() => preview && setLoadedSlug(preview.slug)}
      />
    </div>
  );
}
