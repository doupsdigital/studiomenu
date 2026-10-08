'use client';

import { useEffect, useState } from 'react';

/** Indicador de duas pontas do mockup da home (pedido real, 2026-10-08):
 *  mão de "deslize" aparece na primeira tela (capa) e, ao rolar pro
 *  catálogo, dá lugar a uma mão de "toque" do lado oposto. Existia assim
 *  no legado (`legacy/vendas/lpb/js/main.js`, `updateLeftIndicator`), mas
 *  nunca foi portado pro Next.js — só a mão de deslize (estática) migrou.
 *  O catálogo embutido no iframe (`ShowcaseClient.tsx`) manda
 *  `postMessage({ type: 'VITRINE_SCREEN_CHANGE', label })` quando sai da
 *  capa; aqui a gente escuta e troca qual mão aparece. */
type MockupScreen = 'cover' | 'catalog' | 'other';

export function HeroMockup() {
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
    <div className="lp-hero-phone-wrap">
      <div className="lp-phone-interactive-container">
        <div className="lp-testdrive-phone">
          <div className="lp-testdrive-notch" />
          <div className="lp-testdrive-screen">
            <div className="lp-testdrive-screen-scaler">
              <iframe src="/c/showcase/studiodesigner" title="Prévia ao vivo do catálogo StudioMenu" />
            </div>
          </div>
        </div>

        <div className={`lp-phone-scroll-indicator${screen === 'cover' ? '' : ' is-hidden'}`} aria-hidden="true">
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

        <div className={`lp-phone-left-indicator${screen === 'catalog' ? '' : ' is-hidden'}`} aria-hidden="true">
          <span className="lp-left-cue-tag">Clique nos cards</span>
          <svg className="lp-left-tap-icon" width="28" height="28" viewBox="0 0 24 24" fill="#ffffff" stroke="#c84b72" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9V5a1.5 1.5 0 0 0-3 0v7.5" />
            <path d="M11 10a1.5 1.5 0 0 0-3 0v4" />
            <path d="M8 11.5a1.5 1.5 0 0 0-3 0V15a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6v-3a1.5 1.5 0 0 0-3 0" />
          </svg>
        </div>
      </div>
    </div>
  );
}
