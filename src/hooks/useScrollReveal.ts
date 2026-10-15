'use client';

import { useEffect } from 'react';

/** Ativa o efeito "scroll reveal" (fade + sobe de baixo, comum em landing
 *  pages premium — pedido real, 2026-10-15) em qualquer elemento marcado
 *  com `data-reveal` já presente na página no momento do mount. Observa
 *  todos de uma vez com um único `IntersectionObserver` (mais barato que
 *  um observer por elemento) e revela uma vez só — depois de aparecer,
 *  `unobserve` (não re-esconde ao rolar pra cima de novo, igual o padrão
 *  usado por toda landing page premium). A transição em si (opacidade +
 *  transform) e o suporte a `prefers-reduced-motion` ficam 100% no CSS
 *  (`landing-lpb.css`), não aqui — este hook só liga/desliga a classe
 *  `is-visible`. */
export function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
