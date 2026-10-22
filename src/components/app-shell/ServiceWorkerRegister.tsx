'use client';

import { useEffect } from 'react';

/** Registra o service worker básico do PWA (`public/sw.js`) — sem UI própria.
 *  Montado dentro do layout de `/app/[slug]`, mas isso sozinho NÃO restringe
 *  o alcance do worker a essas páginas (bug real, 2026-10-22, encontrado
 *  investigando um "falha de rede" ao salvar o catálogo em `/c/[slug]`) —
 *  o alcance de um service worker é definido pelo caminho do SCRIPT
 *  (`/sw.js`, na raiz = alcance `/` por padrão, o site inteiro), não por
 *  qual componente chamou `.register()`. `scope: '/app/'` restringe de
 *  verdade — o editor do catálogo (`/c/[slug]`) nunca mais passa pelas
 *  mãos desse worker. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/app/' }).catch((err) => {
        console.error('[SW] Falha ao registrar service worker:', err);
      });
    }
  }, []);

  return null;
}
