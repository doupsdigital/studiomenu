'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { FunnelPreview } from './funnel';
import { PreviewHints } from './PreviewHints';

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
const MAX_SCALE = 400 / FRAME_W;
/** Celular + botão formam UM bloco, centralizado na vertical (2026-11-26).
 *  Antes o botão ficava preso no rodapé da tela e o celular centralizado no
 *  resto: em telas altas (onde o celular é limitado pela LARGURA) sobrava um
 *  vão grande entre os dois. O tamanho do celular é calculado com a altura
 *  real do botão — a moldura mantém SEMPRE a proporção de um celular de
 *  verdade (390×844 + bezel) e nunca é achatada. */
/** O "X" NÃO fica acima da moldura aqui (fica na lateral, ver
 *  `.lp-ss-reveal .lp-mockup-modal-close`): acima dela, com só 18px de
 *  margem, ele era cortado pela barra de endereço do Chrome no Android
 *  (achado real, 2026-11-18). */
const PAD_TOP = 18;
const PAD_SIDE = 14;
/** Espaço entre o celular e o botão (igual ao `margin-top` do CSS). */
const CTA_GAP = 14;

/** Revelação da prévia em tela cheia (página `/lash`, 2026-11-17). Mesma
 *  moldura de celular do `MockupModal` (mesmas classes CSS), mas com o
 *  catálogo DELA (`/c/<slug>?embed=1`) e, por baixo do celular, só o botão
 *  "Gostei! Ver como funciona" (link/contagem por cima foram tirados a pedido
 *  da dona: tomavam altura e deixavam o celular "quadrado"). Componente à parte de
 *  propósito, pra não mexer no modal da página `/` que está no ar.
 *
 *  Fica montado assim que existe uma prévia (o iframe carrega por trás da
 *  animação de criação), igual o `MockupModal` faz com a vitrine. */
export const PreviewRevealModal: React.FC<PreviewRevealModalProps> = ({ preview, isOpen, onClose, onActivate, onLoaded }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.8);
  const hasPreview = Boolean(preview);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    function updateScale() {
      if (!el) return;
      // Padding de baixo vem do CSS (inclui a área segura do iPhone).
      const padBottom = parseFloat(getComputedStyle(el).paddingBottom) || 0;
      const ctaH = (ctaRef.current?.offsetHeight || 56) + CTA_GAP;
      const availW = el.clientWidth - PAD_SIDE * 2;
      const availH = el.clientHeight - PAD_TOP - padBottom - ctaH;
      if (availW <= 0 || availH <= 0) return;
      setScale(Math.min(availW / FRAME_W, availH / FRAME_H, MAX_SCALE));
    }
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    if (ctaRef.current) observer.observe(ctaRef.current);
    return () => observer.disconnect();
    // `hasPreview` (bug real, 2026-11-26): sem prévia o componente devolve
    // `null` e o overlay não existe — com `[]` o cálculo nunca rodava depois
    // que a prévia aparecia e o celular ficava preso no 0.8 inicial.
  }, [hasPreview]);

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
      style={{ paddingTop: PAD_TOP, paddingLeft: PAD_SIDE, paddingRight: PAD_SIDE }}
      onClick={onClose}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-label="Prévia do seu menu"
    >
      <div
        className="lp-mockup-modal-phone"
        style={{ width: FRAME_W * scale, height: FRAME_H * scale, padding: BEZEL * scale, flexShrink: 0 }}
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
              ref={iframeRef}
              key={preview.slug}
              src={`/c/${preview.slug}?embed=1`}
              title={`Prévia do menu de ${preview.name}`}
              onLoad={onLoaded}
            />
          </div>
        </div>
        <PreviewHints iframeRef={iframeRef} isOpen={isOpen} />
      </div>

      <div className="lp-ss-reveal-bottom" ref={ctaRef} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="lp-btn lp-btn--primary lp-ss-reveal-cta lp-tier-cta-pulse" onClick={onActivate}>
          Gostei! Ver como funciona
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};
