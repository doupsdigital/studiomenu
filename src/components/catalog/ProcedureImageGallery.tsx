'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ProcedureImageGalleryProps {
  photos: string[];
  onClose: () => void;
}

/** Galeria em tela cheia do procedimento (pedido real, 2026-10-22) —
 *  empilhada sobre o `ProcedureDetailModal` já aberto, aberta pelo botão
 *  "Ver imagem". Mesmo padrão manual de modal do resto do app (sem
 *  biblioteca): scroll-lock + Escape via `useEffect`, fecha no backdrop.
 *
 *  Carrossel via CSS `scroll-snap` nativo (não há nenhuma lib de carrossel/
 *  lightbox instalada no projeto, e não é um caso que justifique adicionar
 *  uma) — o indicador de posição (dots) é calculado a partir do `scrollLeft`
 *  do próprio container no evento `onScroll`, sem `IntersectionObserver`. */
export const ProcedureImageGallery: React.FC<ProcedureImageGalleryProps> = ({ photos, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(photos.length - 1, Math.max(0, index)));
  };

  const goTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  };

  if (photos.length === 0) return null;

  // Seta pra esquerda só se não for a 1ª foto, pra direita só se não for a
  // última — na do meio (3+ fotos) aparecem as duas (pedido real,
  // 2026-10-22).
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < photos.length - 1;

  return (
    <div className="galeria-fotos" role="dialog" aria-modal="true" aria-label="Fotos do procedimento">
      <div className="galeria-fotos__backdrop" onClick={onClose} />
      <div className="galeria-fotos__card">
        <button type="button" className="galeria-fotos__fechar" aria-label="Fechar" onClick={onClose}>
          ✕
        </button>

        <div className="galeria-fotos__track" ref={trackRef} onScroll={handleScroll}>
          {photos.map((url, i) => (
            <div className="galeria-fotos__slide" key={i}>
              <img src={url} alt={`Foto ${i + 1} de ${photos.length}`} />
            </div>
          ))}
        </div>

        {canGoPrev && (
          <button type="button" className="galeria-fotos__seta galeria-fotos__seta--prev" aria-label="Foto anterior" onClick={() => goTo(activeIndex - 1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        {canGoNext && (
          <button type="button" className="galeria-fotos__seta galeria-fotos__seta--next" aria-label="Próxima foto" onClick={() => goTo(activeIndex + 1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        {photos.length > 1 && (
          <div className="galeria-fotos__dots">
            {photos.map((_, i) => (
              <span key={i} className={`galeria-fotos__dot${i === activeIndex ? ' is-active' : ''}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
