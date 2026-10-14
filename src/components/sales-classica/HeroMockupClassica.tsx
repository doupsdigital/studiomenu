'use client';

import { useEffect, useState } from 'react';

/** Cópia de segurança de `HeroMockup.tsx` (ver `SalesLandingPageClassica.tsx`
 *  pro porquê) — mesma lógica, só classes `lp-` trocadas por `lpc-` pra usar
 *  `landing-classica.css` em vez de `landing-lpb.css`, isolada da versão em
 *  teste (2026-10-14). */
type MockupScreen = 'cover' | 'catalog' | 'other';

export function HeroMockupClassica() {
  const [screen, setScreen] = useState<MockupScreen>('cover');

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'VITRINE_SCREEN_CHANGE') {
        const label = String(event.data.label || '').toLowerCase();
        if (label.includes('capa') || label.includes('hero')) {
          setScreen('cover');
        } else if (label.includes('mosaico') || label.includes('catalogo') || label.includes('servi')) {
          setScreen('catalog');
        } else {
          setScreen('other');
        }
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="lpc-hero-phone-wrap">
      <div className="lpc-phone-interactive-container">
        <div className="lpc-testdrive-phone">
          <div className="lpc-testdrive-notch" />
          <div className="lpc-testdrive-screen">
            <div className="lpc-testdrive-screen-scaler">
              <iframe src="/c/showcase/landingpage" title="Prévia ao vivo do catálogo StudioMenu" />
            </div>
          </div>
        </div>

        {/* Lado direito: "Sua foto aqui" apontando pro mockup — só na capa */}
        <div className={`lpc-phone-scroll-indicator${screen === 'cover' ? '' : ' is-hidden'}`} aria-hidden="true">
          <span className="lpc-scroll-cue-tag">Sua foto aqui</span>
          <div className="lpc-photo-cursor-wrap">
            <svg className="lpc-photo-point-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c84b72" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </div>
        </div>

        {/* Lado esquerdo: Deslize (capa) dá lugar a Clique nos cards (procedimentos) */}
        <div
          className={`lpc-phone-left-indicator ${screen === 'catalog' ? 'lpc-phone-left-indicator--clique' : 'lpc-phone-left-indicator--deslize'}${screen === 'other' ? ' is-hidden' : ''}`}
          aria-hidden="true"
        >
          {screen === 'catalog' ? (
            <>
              <span className="lpc-left-cue-tag">Clique nos cards</span>
              <svg className="lpc-left-tap-icon" width="28" height="28" viewBox="0 0 24 24" fill="#ffffff" stroke="#c84b72" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a1.5 1.5 0 0 0-3 0v7.5" />
                <path d="M11 10a1.5 1.5 0 0 0-3 0v4" />
                <path d="M8 11.5a1.5 1.5 0 0 0-3 0V15a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6v-3a1.5 1.5 0 0 0-3 0" />
              </svg>
            </>
          ) : (
            <>
              <span className="lpc-scroll-cue-tag">DESLIZE</span>
              <div className="lpc-scroll-cursor-wrap">
                <svg className="lpc-touch-pointer-hand-svg" width="32" height="32" viewBox="0 0 24 24" fill="#ffffff" stroke="#c84b72" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13V5.5a1.5 1.5 0 0 1 3 0V12" />
                  <path d="M13 8.5a1.5 1.5 0 0 1 3 0V12" />
                  <path d="M16 9.5a1.5 1.5 0 0 1 3 0V13" />
                  <path d="M19 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-2a6 6 0 0 1-4.24-1.76l-3.52-3.52a1.5 1.5 0 0 1 2.12-2.12L10 16" />
                </svg>
                <svg className="lpc-scroll-cue-arrow-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c84b72" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
