'use client';

import { useEffect, useRef, useState } from 'react';

interface MockupModalProps {
  showcaseSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

/** Mesmo conceito do `HeroMockup.tsx` (re-port, pedido real, 2026-10-16):
 *  o catálogo dentro do iframe avisa o pai (`postMessage`) qual tela está
 *  visível, pra decidir qual dica mostrar. Aqui no modal ninguém escutava
 *  esse aviso — o iframe é a superfície real de teste (não uma vitrine
 *  estática), mas nada sinalizava que dava pra rolar/tocar nela, então as
 *  dicas ajudam o primeiro toque. */
type MockupScreen = 'cover' | 'catalog' | 'instructions' | 'other';

/** Tamanho de "design" do catálogo — mesmo valor usado pelo mockup da Hero
 *  (`.lp-testdrive-screen-scaler`). O iframe SEMPRE renderiza nesse
 *  viewport (um celular de verdade), não importa o tamanho visual da
 *  moldura — só a aparência é encolhida por `transform: scale()`. Sem
 *  isso, o site lá dentro acha que está numa tela menor que um celular e
 *  quebra o layout (textos gigantes, modal de WhatsApp cortado — achado
 *  real testando no celular, 2026-10-14). */
const DESIGN_W = 390;
const DESIGN_H = 844;

/** Espessura da moldura (bezel) — mesmo valor do `padding` de
 *  `.lp-mockup-modal-phone` em `landing-lpb.css`. A moldura INTEIRA
 *  (bezel + tela) precisa ser escalada como um bloco rígido só, incluindo
 *  o bezel — se a moldura esticar livre em 100%/100% do espaço disponível
 *  (como era antes) ela assume a proporção da TELA do aparelho, que quase
 *  nunca bate exatamente com a proporção do design (390x844), sobrando uma
 *  faixa onde o fundo rosa de `.lp-mockup-modal-screen` aparece atrás do
 *  conteúdo escalado (bug real visto em produção, 2026-10-15). */
const BEZEL = 12;
const FRAME_W = DESIGN_W + BEZEL * 2;
const FRAME_H = DESIGN_H + BEZEL * 2;
/** Teto de tamanho em telas grandes — equivalente ao antigo `max-width:
 *  360px` da moldura. */
const MAX_SCALE = 360 / FRAME_W;

/** Modal de teste do catálogo, formato celular (pedido real, 2026-10-14) —
 *  substitui o mockup inline rolável na Hero. Dentro do modal o iframe é a
 *  ÚNICA superfície rolável visível, elimina o conflito de gesto entre
 *  rolar a página e rolar o catálogo que acontecia com o mockup embutido
 *  (visto em gravações do PostHog). Trava o scroll do body enquanto aberto;
 *  fecha pelo X, clique fora, ou Esc.
 *
 *  SEMPRE montado (`isOpen` só troca classe CSS, não some do DOM) — o
 *  iframe carrega em segundo plano assim que a Hero aparece, escondido, e
 *  já está pronto no momento em que a pessoa toca pra abrir. Sem isso, o
 *  iframe só começava a carregar NO clique, e a pessoa via ~7s de tela rosa
 *  vazia até o catálogo terminar de montar (achado real, 2026-10-14).
 *
 *  Escala calculada via `ResizeObserver` (não breakpoints fixos em CSS,
 *  como o mockup da Hero) porque a moldura aqui é fluida — se ajusta
 *  continuamente ao espaço disponível, não só em 2-3 tamanhos fixos. */
export function MockupModal({ showcaseSlug, isOpen, onClose }: MockupModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [screen, setScreen] = useState<MockupScreen>('cover');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [hintsReady, setHintsReady] = useState(false);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'VITRINE_DETAIL_MODAL') {
        // Modal de detalhe do procedimento (pedido real, 2026-10-16) — some
        // enquanto ele está por cima do card, reaparece ao fechar (ver
        // `ProcedureGrid.tsx`).
        setDetailModalOpen(Boolean(event.data.open));
        return;
      }
      if (event.data?.type !== 'VITRINE_SCREEN_CHANGE') return;
      const label = String(event.data.label || '').toLowerCase();
      if (label.includes('capa') || label.includes('hero')) {
        setScreen('cover');
      } else if (label.includes('mosaico') || label.includes('catalogo') || label.includes('servi')) {
        setScreen('catalog');
      } else if (label.includes('orienta')) {
        // Orientações (pedido real, 2026-10-16) — mostra "DESLIZE" de novo
        // (igual a capa), mas sem "Sua foto aqui" (só faz sentido na capa).
        setScreen('instructions');
      } else {
        setScreen('other');
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  /* Atraso de propósito (pedido real, 2026-10-16) — sem isso as dicas
   *  apareciam junto com a própria animação de abertura do modal,
   *  competindo com ela. Reseta ao fechar, pra reaparecer do zero (se
   *  ainda estiver na capa) da próxima vez que abrir. */
  useEffect(() => {
    if (!isOpen) {
      setHintsReady(false);
      return;
    }
    const timer = setTimeout(() => setHintsReady(true), 600);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    function updateScale() {
      if (!el) return;
      const style = getComputedStyle(el);
      const availW = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const availH = el.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      className={`lp-mockup-modal-overlay${isOpen ? ' is-open' : ''}`}
      onClick={onClose}
      aria-hidden={!isOpen}
      ref={overlayRef}
    >
      <div
        className="lp-mockup-modal-phone"
        style={{ width: FRAME_W * scale, height: FRAME_H * scale, padding: BEZEL * scale }}
        onClick={(event) => event.stopPropagation()}
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
            <iframe src={`/c/showcase/${showcaseSlug}`} title="Teste o Menu Digital StudioMenu" />
          </div>
        </div>

        {/* Dicas coladas na BORDA da moldura (pedido real, 2026-10-16, depois
         *  de feedback real — a 1ª tentativa ficava dentro da tela, por cima
         *  da foto/texto, confundindo com o conteúdo). Por isso vivem FORA
         *  do `.lp-mockup-modal-scaler` (que escala com o conteúdo) e dentro
         *  de `.lp-mockup-modal-phone` — `left`/`right` negativos penduram
         *  elas um pouco pra fora da tela, em cima do bezel/fundo escuro,
         *  igual era no mockup antigo da Hero. */}
        {hintsReady && screen !== 'other' && !detailModalOpen && (
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

        {hintsReady && screen === 'cover' && (
          <div className="lp-mockup-hint lp-mockup-hint--photo" aria-hidden="true">
            <span className="lp-scroll-cue-tag">Sua foto aqui</span>
            <div className="lp-photo-cursor-wrap">
              <svg className="lp-photo-point-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c84b72" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
