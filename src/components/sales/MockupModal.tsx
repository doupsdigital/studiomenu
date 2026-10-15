'use client';

import { useEffect, useRef, useState } from 'react';

interface MockupModalProps {
  showcaseSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

/** Tamanho de "design" do catálogo — mesmo valor usado pelo mockup da Hero
 *  (`.lp-testdrive-screen-scaler`). O iframe SEMPRE renderiza nesse
 *  viewport (um celular de verdade), não importa o tamanho visual da
 *  moldura — só a aparência é encolhida por `transform: scale()`. Sem
 *  isso, o site lá dentro acha que está numa tela menor que um celular e
 *  quebra o layout (textos gigantes, modal de WhatsApp cortado — achado
 *  real testando no celular, 2026-10-14). */
const DESIGN_W = 390;
const DESIGN_H = 844;

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
  const screenRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;

    function updateScale() {
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      setScale(Math.min(width / DESIGN_W, height / DESIGN_H));
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
    >
      <div className="lp-mockup-modal-phone" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="lp-mockup-modal-close" onClick={onClose} aria-label="Fechar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="lp-mockup-modal-notch" />
        <div className="lp-mockup-modal-screen" ref={screenRef}>
          <div className="lp-mockup-modal-scaler" style={{ transform: `scale(${scale})` }}>
            <iframe src={`/c/showcase/${showcaseSlug}`} title="Teste o Menu Digital StudioMenu" />
          </div>
        </div>
      </div>
    </div>
  );
}
