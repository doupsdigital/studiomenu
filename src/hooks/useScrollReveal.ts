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
 *  (`landing-lpb.css`), não aqui — este hook só liga/desliga o atributo
 *  `data-visible`.
 *
 *  Por que `data-visible` (atributo) e não uma classe `is-visible`: bug
 *  real, 2026-10-15 — usar `classList.add` quebrava o FAQ (os cards
 *  sumiam ao fechar uma pergunta). O React controla `className` via
 *  `.lp-faq-item` por inteiro (muda a cada clique, já que `openIndex` é
 *  estado compartilhado por toda a lista) — toda vez que QUALQUER pergunta
 *  abre/fecha, React re-renderiza TODOS os itens e reescreve o
 *  `className` do zero a partir do template, apagando a classe que o
 *  observer tinha adicionado por fora do React. Um atributo `data-*`
 *  separado (que o JSX nunca declara) não entra nesse diff — React nunca
 *  encosta nele, então sobrevive a qualquer re-render. */
export function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-visible])');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute('data-visible', '');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
