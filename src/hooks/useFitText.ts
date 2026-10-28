'use client';

import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react';

interface UseFitTextOptions {
  /** Tamanho "ideal" da fonte (px) — usado sempre que o texto couber nessa
   *  largura sem quebrar; nunca ultrapassado mesmo com telas enormes. */
  maxFontSize: number;
  /** Piso de legibilidade (px) — nunca encolhe além disso, mesmo que o
   *  texto ainda não caiba (nesse caso extremo ele só corta visualmente,
   *  melhor que ficar ilegível). */
  minFontSize?: number;
}

/** Encolhe a fonte de um texto de largura variável (nome digitado pela
 *  profissional, frases fixas mas compridas) até caber numa única linha
 *  dentro do elemento de referência (`boundsRef`) — pedido real, 2026-10-28:
 *  "Catálogo de procedimentos" quebrava em 2 linhas em celulares estreitos
 *  (a largura real do app é só `min(100vw, 480px)`, então nem um valor em
 *  `vw` fixo dava conta de todo tamanho de tela OU de nome). Mede a largura
 *  de verdade com `scrollWidth`/`clientWidth` (não estima por contagem de
 *  caractere) — funciona pra qualquer string, em qualquer largura.
 *
 *  `boundsRef` é intencionalmente separado do elemento de texto em si (não
 *  o `parentElement` dele): dentro de um `flex` com `align-items: flex-start`
 *  o próprio elemento de texto encolhe pro tamanho do conteúdo, então medir
 *  a largura "disponível" nele mesmo sempre daria "cabe perfeitamente" (ele
 *  é do tamanho do próprio texto). Passar um ancestral de verdade (ex: o
 *  `<header>` que ocupa 100% da largura do cartão) é o que dá a largura real
 *  disponível.
 *
 *  Importante (achado relatado de verdade, 2026-10-28, duas tentativas
 *  erradas antes dessa): o CSS do elemento já define um tamanho de base
 *  seguro via `clamp()`/`cqi` (não depende de JS, não quebra linha, some
 *  texto sumido) — esse hook só ENCOLHE um pouco mais, se precisar, ou
 *  volta pro teto `maxFontSize` quando já tem espaço de sobra. Nunca
 *  controla visibilidade (`opacity`): esconder o texto até o JS calcular
 *  trocava "ver encolhendo" por "ver um vazio antes de aparecer", mesmo
 *  problema disfarçado. Como o ponto de partida (CSS) já é seguro, o ajuste
 *  do JS tende a ser pequeno — e o `transition: font-size` no CSS absorve
 *  essa diferença suavemente em vez de "pular". */
export function useFitText<T extends HTMLElement>(
  boundsRef: RefObject<HTMLElement | null>,
  { maxFontSize, minFontSize = 12 }: UseFitTextOptions
) {
  const ref = useRef<T | null>(null);

  const fit = useCallback(() => {
    const el = ref.current;
    const bounds = boundsRef.current;
    if (!el || !bounds) return;
    el.style.fontSize = `${maxFontSize}px`;
    const available = bounds.clientWidth;
    const needed = el.scrollWidth;
    if (available > 0 && needed > available) {
      const scale = available / needed;
      el.style.fontSize = `${Math.max(minFontSize, Math.floor(maxFontSize * scale))}px`;
    }
  }, [boundsRef, maxFontSize, minFontSize]);

  useLayoutEffect(() => {
    fit();
    const bounds = boundsRef.current;
    if (!bounds || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => fit());
    ro.observe(bounds);
    return () => ro.disconnect();
  }, [fit, boundsRef]);

  return { ref, refit: fit };
}
