'use client';

import { useEffect } from 'react';

const EDGE = 6;
const ANIM_MS = 650;
const SWIPE_MIN = 12;

/** Capa → Serviços com UMA deslizada, só na prévia do funil Lash
 *  (2026-11-26). No formato "Capa + Catálogo" o `scroll-snap` fica desligado
 *  (`.mosaico-app--catalog-is-last`, ver `catalog-theme.css`) porque, com o
 *  Catálogo como última tela, ele travava a rolagem da lista. Sem ele, a
 *  capa (altura de uma tela) exigia 2-3 deslizadas no celular e ~8 giros de
 *  roda no computador — visto nas gravações do PostHog.
 *
 *  Aqui o encaixe é só entre as duas: na capa, qualquer gesto pra baixo
 *  leva suave até o topo dos serviços; no topo dos serviços, um gesto pra
 *  cima volta à capa. Dentro da lista a rolagem segue livre. Ignora gestos
 *  em cima de janelas abertas (detalhe do serviço, fotos). Os menus ativos
 *  das clientes NÃO usam isto (decisão da dona: testar primeiro na prévia). */
export function useCoverToCatalogSnap(rescanKey: unknown) {
  useEffect(() => {
    const app = document.querySelector<HTMLElement>('.mosaico-app');
    if (!app) return;

    let animating = false;
    let animTimer: number | undefined;
    let touchStartY: number | null = null;
    let touchStartX = 0;
    let touchHandled = false;

    const catalogTop = (): number | null => {
      const catalog = app.querySelector<HTMLElement>('#catalogo');
      const cover = app.querySelector<HTMLElement>('#hero');
      if (!catalog || !cover) return null;
      return catalog.getBoundingClientRect().top - app.getBoundingClientRect().top + app.scrollTop;
    };

    const go = (top: number) => {
      animating = true;
      window.clearTimeout(animTimer);
      app.scrollTo({ top, behavior: 'smooth' });
      animTimer = window.setTimeout(() => {
        animating = false;
      }, ANIM_MS);
    };

    const inDialog = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest('[role="dialog"]'));

    /** Decide o encaixe pra um gesto na direção `down` (true = rolar pra
     *  baixo). Devolve true se tratou (o gesto nativo deve ser cancelado). */
    const snapFor = (down: boolean): boolean => {
      const top = catalogTop();
      if (top === null) return false;
      const y = app.scrollTop;
      if (down && y < top - EDGE) {
        go(top);
        return true;
      }
      if (!down && y > 0 && y <= top + EDGE) {
        go(0);
        return true;
      }
      return false;
    };

    /** Está numa zona onde o gesto é nosso (capa, ou topo dos serviços
     *  subindo)? Usado pra travar a rolagem nativa durante o toque. */
    const ownsGesture = (down: boolean): boolean => {
      const top = catalogTop();
      if (top === null) return false;
      const y = app.scrollTop;
      return down ? y < top - EDGE : y > 0 && y <= top + EDGE;
    };

    const onWheel = (e: WheelEvent) => {
      if (inDialog(e.target) || Math.abs(e.deltaY) < 1) return;
      if (animating) {
        if (ownsGesture(e.deltaY > 0)) e.preventDefault();
        return;
      }
      if (snapFor(e.deltaY > 0)) e.preventDefault();
    };

    const onTouchStart = (e: TouchEvent) => {
      if (inDialog(e.target) || e.touches.length !== 1) {
        touchStartY = null;
        return;
      }
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      touchHandled = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY === null) return;
      const dy = touchStartY - e.touches[0].clientY; // > 0 = rolar pra baixo
      const dx = touchStartX - e.touches[0].clientX;
      if (Math.abs(dy) < SWIPE_MIN || Math.abs(dx) > Math.abs(dy)) return;
      const down = dy > 0;
      if (animating || ownsGesture(down)) {
        e.preventDefault();
        if (!touchHandled && !animating) {
          touchHandled = snapFor(down);
        }
      }
    };

    const onTouchEnd = () => {
      touchStartY = null;
    };

    app.addEventListener('wheel', onWheel, { passive: false });
    app.addEventListener('touchstart', onTouchStart, { passive: true });
    app.addEventListener('touchmove', onTouchMove, { passive: false });
    app.addEventListener('touchend', onTouchEnd, { passive: true });
    app.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      window.clearTimeout(animTimer);
      app.removeEventListener('wheel', onWheel);
      app.removeEventListener('touchstart', onTouchStart);
      app.removeEventListener('touchmove', onTouchMove);
      app.removeEventListener('touchend', onTouchEnd);
      app.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [rescanKey]);
}
