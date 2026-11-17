'use client';

import React, { useEffect, useRef, useState } from 'react';
import { formatClock, useRemaining, type FunnelPreview } from './funnel';

interface PreviewRevealModalProps {
  preview: FunnelPreview | null;
  isOpen: boolean;
  onClose: () => void;
  onActivate: () => void;
  /** Avisa quando o menu dela terminou de carregar no iframe (a animação de
   *  criação espera isso antes do último ✓). */
  onLoaded?: () => void;
}

const DESIGN_W = 390;
const DESIGN_H = 844;
const BEZEL = 12;
const FRAME_W = DESIGN_W + BEZEL * 2;
const FRAME_H = DESIGN_H + BEZEL * 2;
const MAX_SCALE = 380 / FRAME_W;
/** Espaço reservado acima/abaixo do celular pra pílula do link e o botão. */
const TOP_RESERVE = 64;
const BOTTOM_RESERVE = 96;

/** Revelação da prévia em tela cheia (página `/lash`, 2026-11-17). Mesma
 *  moldura de celular do `MockupModal` (mesmas classes CSS), mas com o
 *  catálogo DELA (`/c/<slug>?embed=1`) e, por fora do celular, a pílula com
 *  o link + contagem real e o botão "Ativar meu menu". Componente à parte de
 *  propósito, pra não mexer no modal da página `/` que está no ar.
 *
 *  Fica montado assim que existe uma prévia (o iframe carrega por trás da
 *  animação de criação), igual o `MockupModal` faz com a vitrine. */
export const PreviewRevealModal: React.FC<PreviewRevealModalProps> = ({ preview, isOpen, onClose, onActivate, onLoaded }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);
  const remaining = useRemaining(preview?.expiresAt, 1000);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    function updateScale() {
      if (!el) return;
      const availW = el.clientWidth - 32;
      const availH = el.clientHeight - TOP_RESERVE - BOTTOM_RESERVE;
      if (availW <= 0 || availH <= 0) return;
      setScale(Math.min(availW / FRAME_W, availH / FRAME_H, MAX_SCALE));
    }
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!preview) return null;

  return (
    <div
      ref={overlayRef}
      className={`lp-mockup-modal-overlay lp-ss-reveal${isOpen ? ' is-open' : ''}`}
      style={{ paddingTop: TOP_RESERVE, paddingBottom: BOTTOM_RESERVE }}
      onClick={onClose}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-label="Prévia do seu menu"
    >
      <div className="lp-ss-reveal-top" onClick={(e) => e.stopPropagation()}>
        <div className="lp-ss-link-pill lp-ss-link-pill--dark">
          <span className="lp-ss-link-dot" aria-hidden="true" />
          {preview.displayUrl}
        </div>
        {remaining !== null && (
          <span className="lp-ss-reveal-timer">
            prévia: <strong>{formatClock(remaining)}</strong>
          </span>
        )}
      </div>

      <div
        className="lp-mockup-modal-phone"
        style={{ width: FRAME_W * scale, height: FRAME_H * scale, padding: BEZEL * scale }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="lp-mockup-modal-close" onClick={onClose} aria-label="Fechar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="lp-mockup-modal-notch" />
        <div className="lp-mockup-modal-screen">
          <div className="lp-mockup-modal-scaler" style={{ transform: `scale(${scale})` }}>
            <iframe
              key={preview.slug}
              src={`/c/${preview.slug}?embed=1`}
              title={`Prévia do menu de ${preview.name}`}
              onLoad={onLoaded}
            />
          </div>
        </div>
      </div>

      <div className="lp-ss-reveal-bottom" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="lp-btn lp-btn--primary lp-ss-reveal-cta lp-tier-cta-pulse" onClick={onActivate}>
          Gostou? Ativar meu menu
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </button>
        <p className="lp-ss-reveal-hint">Toque nos serviços para ver como suas clientes vão te chamar</p>
      </div>
    </div>
  );
};
