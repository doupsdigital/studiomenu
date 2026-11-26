'use client';

import React, { useEffect, useState, type RefObject } from 'react';

type Screen = 'cover' | 'catalog' | 'instructions' | 'contact' | 'other';

interface PreviewHintsProps {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  isOpen: boolean;
}

/** Dicas animadas na borda da moldura da revelação da `/lash` (2026-11-26):
 *  "DESLIZE" na capa, "Clique nos cards" nos serviços e "Mude as cores do
 *  tema" apontando pro tema oposto ao ativo. Mesma lógica e mesmas classes
 *  (`.lp-mockup-hint*`) do `MockupModal` da página `/` — copiadas aqui de
 *  propósito, pra não mexer no modal que está no ar. O catálogo dentro do
 *  iframe (`PreviewCatalogClient`) avisa por `postMessage` a tela/tema. */
export const PreviewHints: React.FC<PreviewHintsProps> = ({ iframeRef, isOpen }) => {
  const [screen, setScreen] = useState<Screen>('cover');
  const [theme, setTheme] = useState<'rose' | 'luxury'>('rose');
  const [detailOpen, setDetailOpen] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Só o iframe DESTA moldura (a página pode ter outros).
      if (event.source !== iframeRef.current?.contentWindow) return;
      const type = event.data?.type;
      if (type === 'VITRINE_DETAIL_MODAL') return setDetailOpen(Boolean(event.data.open));
      if (type === 'VITRINE_OVERLAY_MODAL') return setOverlayOpen(Boolean(event.data.open));
      if (type === 'VITRINE_THEME_CHANGE') return setTheme(event.data.theme === 'luxury' ? 'luxury' : 'rose');
      if (type !== 'VITRINE_SCREEN_CHANGE') return;
      const label = String(event.data.label || '').toLowerCase();
      if (label.includes('capa') || label.includes('hero')) setScreen('cover');
      else if (label.includes('mosaico') || label.includes('catalogo') || label.includes('servi')) setScreen('catalog');
      else if (label.includes('orienta')) setScreen('instructions');
      else if (label.includes('contato')) setScreen('contact');
      else setScreen('other');
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [iframeRef]);

  // Atraso pra não competir com a animação de abertura; reseta ao fechar.
  useEffect(() => {
    if (!isOpen) {
      setReady(false);
      return;
    }
    const timer = window.setTimeout(() => setReady(true), 600);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  if (!ready || detailOpen || overlayOpen) return null;

  return (
    <>
      {screen !== 'other' && screen !== 'contact' && (
        <div className="lp-mockup-hint lp-mockup-hint--swipe" aria-hidden="true">
          {screen === 'catalog' ? (
            <>
              <span className="lp-left-cue-tag">Clique nos cards</span>
              <svg className="lp-left-tap-icon" width="28" height="28" viewBox="0 0 24 24" fill="#ffffff" stroke="#c84b72" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a1.5 1.5 0 0 0-3 0v7.5" />
                <path d="M11 10a1.5 1.5 0 0 0-3 0v4" />
                <path d="M8 11.5a1.5 1.5 0 0 0-3 0V15a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6v-3a1.5 1.5 0 0 0-3 0" />
              </svg>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}

      {screen === 'cover' && (
        <div
          className={`lp-mockup-hint ${theme === 'rose' ? 'lp-mockup-hint--theme-luxury' : 'lp-mockup-hint--theme-rose'}`}
          aria-hidden="true"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c84b72" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
          <span className="lp-scroll-cue-tag">Mude as cores do tema</span>
        </div>
      )}
    </>
  );
};
